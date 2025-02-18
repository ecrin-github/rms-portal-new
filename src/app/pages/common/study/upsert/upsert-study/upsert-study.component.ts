import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, mergeMap } from 'rxjs/operators';
import { OrganisationInterface } from 'src/app/_rms/interfaces/organisation/organisation.interface';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { BackService } from 'src/app/_rms/services/back/back.service';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { StudyLookupService } from 'src/app/_rms/services/entities/study-lookup/study-lookup.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';

@Component({
  selector: 'app-upsert-study',
  templateUrl: './upsert-study.component.html',
  styleUrls: ['./upsert-study.component.scss'],
  providers: [ScrollService]
})
export class UpsertStudyComponent implements OnInit {
  public isCollapsed: boolean = false;
  studyForm: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  isAdd: boolean = false;
  studyTypes: [] = [];
  studyStatuses: [] = [];
  genderEligibility: [] = [];
  timeUnits: [] =[];
  trialRegistries: any;
  subscription: Subscription = new Subscription();
  isSubmitted: boolean = false;
  id: string;
  sdSid: string;
  organisationName: string;
  organisations: Array<OrganisationInterface>;
  studyData: StudyInterface;
  studyFull: any;
  count = 0;
  publicTitle: string = '';
  monthValues = [{id:'1', name:'January'}, {id:'2', name:'February'}, {id:'3', name: 'March'}, {id:'4', name: 'April'}, {id:'5', name: 'May'}, {id:'6', name: 'June'}, {id:'7', name: 'July'}, {id:'8', name: 'August'}, {id:'9', name: 'September'}, {id:'10', name: 'October'}, {id:'11', name:'November'}, {id:'12', name: 'December'}];
  sticky: boolean = false;
  studyType: string = '';
  addType: string = '';
  registryId: number;
  trialId: string;
  identifierTypes: [] = [];
  titleTypes: [] = [];
  featureTypes: [] = [];
  featureValuesAll: [] = [];
  topicTypes: [] = [];
  controlledTerminology: [] = [];
  relationshipTypes: [] = [];
  isBrowsing: boolean = false;
  isManager: any;
  orgId: string;
  associatedObjects: any;
  pageSize: Number = 10000;
  showEdit: boolean = false;

  constructor(private statesService: StatesService,
              private fb: UntypedFormBuilder, 
              private router: Router, 
              private studyLookupService: StudyLookupService, 
              private studyService: StudyService, 
              private reuseService: ReuseService,
              private scrollService: ScrollService,
              private activatedRoute: ActivatedRoute,
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService, 
              private pdfGenerator: PdfGeneratorService, 
              private jsonGenerator: JsonGeneratorService, 
              private commonLookupService: CommonLookupService, 
              private listService: ListService,
              private backService: BackService) {
    this.studyForm = this.fb.group({
      sdSid: '',
      displayTitle: ['', Validators.required],
      briefDescription: '',
      dataSharingStatement: ['', Validators.required],
      organisation: null,
      studyType: [null, Validators.required],
      studyStatus: [null, Validators.required],
      studyGenderElig: null,
      studyEnrollment: '',
      studyStartMonth: null,
      studyStartYear: [null, Validators.required],
      minAge: null,
      minAgeUnit: null,
      maxAge: null,
      maxAgeUnit: null,
      studyIdentifiers: [],
      studyTitles: [],
      studyFeatures: [],
      studyTopics: [],
      studyRelationships: [],
      studyContributors: []
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.show();
    });

    this.isManager = this.statesService.isManager();
    this.orgId = this.statesService.currentAuthOrgId;
    this.sdSid = this.activatedRoute.snapshot.params.id;

    this.isEdit = this.router.url.includes('edit');
    this.isView = this.router.url.includes('view');
    this.isAdd = this.router.url.includes('add');
    this.isBrowsing = this.router.url.includes('browsing');
    if (!this.isManager) {
      this.studyForm.get('studyType').setValidators(Validators.required);
      this.studyForm.get('studyStatus').setValidators(Validators.required);
      this.studyForm.get('studyStartYear').setValidators(Validators.required);
    }
    
    this.activatedRoute.queryParams.subscribe(params => {
      this.addType = params.type;
    
      let queryFuncs: Array<Observable<any>> = [];

      // Note: be careful if you add new observables because of the way their result is retrieved later (combineLatest + pop)
      // The code is built like this because in the version of RxJS used here combineLatest does not handle dictionaries
      if (this.isAdd) {
        if (this.addType === 'usingTrialId') {
          queryFuncs.push(this.getTrialRegistries());
        }
        queryFuncs.push(this.getOrganisation(this.orgId));
        // Getting new study ID if manual add
        queryFuncs.push(this.getQueryParams());
      }
      if ((this.isEdit || this.isAdd) && this.isManager) {
        queryFuncs.push(this.getOrganisations());
      }

      // Need to pipe both getStudy and getAssociatedObjects because they need to be completed in order
      if (this.isEdit || this.isView) {
        queryFuncs.push(this.getStudyById(this.sdSid).pipe(
          mergeMap((res: StudyInterface) => {
            if (res) {
              this.setStudyById(res);
            }
            return this.getAssociatedObjects(this.id);
          })
        ));
      }

      if (this.isView) {
        this.scrollService.handleScroll([`/studies/${this.sdSid}/view`, `/browsing/studies/${this.sdSid}/view`]);
      }
      // Queries required even for view because of pdf/json exports
      queryFuncs.push(this.getStudyTypes());
      queryFuncs.push(this.getGenderEligibility());
      queryFuncs.push(this.getStudyStatuses());
      queryFuncs.push(this.getTimeUnits());
      queryFuncs.push(this.getIdentifierTypes());
      queryFuncs.push(this.getTitleTypes());
      queryFuncs.push(this.getFeatureTypes());
      queryFuncs.push(this.getFeatureValues());
      queryFuncs.push(this.getTopicTypes());
      queryFuncs.push(this.getTopicVocabularies());
      queryFuncs.push(this.getRelationshipTypes());

      let obsArr: Array<Observable<any>> = [];
      queryFuncs.forEach((funct) => {
        obsArr.push(funct.pipe(catchError(error => of(this.toastr.error(error.error.title)))));
      });

      combineLatest(obsArr).subscribe(res => {
        this.setRelationshipTypes(res.pop());
        this.setTopicVocabularies(res.pop());
        this.setTopicTypes(res.pop());
        this.setFeatureValues(res.pop());
        this.setFeatureTypes(res.pop());
        this.setTitleTypes(res.pop());
        this.setIdentifierTypes(res.pop());
        this.setTimeUnits(res.pop());
        this.setStudyStatuses(res.pop());
        this.setGenderEligibility(res.pop());
        this.setStudyTypes(res.pop());

        if (this.isEdit || this.isView) {
          // setStudyById not used here, see above
          this.setAssociatedObjects(res.pop());
        }
        if ((this.isEdit || this.isAdd) && this.isManager) {
          this.setOrganisations(res.pop());
        }
        if (this.isAdd) {
          this.setStudySdSid(res.pop());
          this.setOrganisation(res.pop());
          if (this.addType === 'usingTrialId') {
            this.setTrialRegistries(res.pop());
          }
        }

        setTimeout(() => {
          this.spinner.hide();
        });
      });
    });
  }

  get g() { return this.studyForm.controls; }

  getQueryParams() {
    return this.activatedRoute.queryParams.pipe(
      mergeMap(params => {
        if (params.type) {
          this.addType = params.type;
          if (this.addType.toLowerCase() === 'manual') {
            return this.getNextStudySdSid();
          }
        }
        return of({});
      })
    );
  }

  getNextStudySdSid() {
    return this.studyService.getNextStudySdSid();
  }

  setStudySdSid(sdSidRes) {
    if ('sdSid' in sdSidRes) {
      this.sdSid = sdSidRes['sdSid'];
      this.studyForm.patchValue({
        'sdSid': sdSidRes['sdSid']
      });
    }
  }

  getStudyTypes() {
    return this.studyLookupService.getStudyTypes(this.pageSize);
  }

  setStudyTypes(studyTypes) {
    if (studyTypes?.results) {
      this.studyTypes = studyTypes.results;
      this.studyTypeChange();
    }
  }

  getStudyStatuses() {
    return this.studyLookupService.getStudyStatuses(this.pageSize);
  }

  setStudyStatuses(studyStatuses) {
    if (studyStatuses?.results) {
      this.studyStatuses = studyStatuses.results;
    }
  }

  getGenderEligibility() {
    return this.studyLookupService.getGenderEligibilities(this.pageSize);
  }

  setGenderEligibility(genderEligibility) {
    if (genderEligibility?.results) {
      this.genderEligibility = genderEligibility.results;
    }
  }

  getTimeUnits() {
    return this.studyLookupService.getTimeUnits(this.pageSize);
  }

  setTimeUnits(timeUnits) {
    if (timeUnits?.results) {
      this.timeUnits = timeUnits.results;
      if (this.isAdd) {
        const arr: any = this.timeUnits.filter((item: any) => item.name.toLowerCase() === "years");
        this.studyForm.patchValue({
          minAgeUnit: arr[0].id,
          maxAgeUnit: arr[0].id
        });
      }
    }
  }

  getStudyById(id) {
    return this.studyService.getStudyById(id);
  }

  setStudyById(studyData) {
    if (studyData) {
      this.studyData = studyData;
      this.organisationName = studyData.organisation?.defaultName;
      this.studyType = studyData.studyType?.name.toLowerCase();
      this.id = studyData.id;
      // Check if user allowed to edit the study, in which case edit button is shown (for view)
      if (this.isView && studyData.organisation?.id === this.orgId) {
        this.showEdit = true;
      }
      this.patchStudyForm();
    }
  }

  findStudyStatusById(id) {
    const statusArray = this.studyStatuses.filter((type: any) => type.id === id);
    return statusArray && statusArray.length ? statusArray : { name: '' }
  }

  findStudyTypeById(id) {
    const studyArray = this.studyTypes.filter((type: any) => type.id === id);
    return studyArray && studyArray.length ? studyArray[0] : { name: '' };
  }

  findGenderEligibilityId(id) {
    const genderArray = this.genderEligibility.filter((type: any) => type.id === id);
    return genderArray && genderArray.length ? genderArray[0] : { name: '' };
  }

  findTimeUnitsById(id) {
    const ageArray = this.timeUnits.filter((type: any) => type.id === id);
    return ageArray && ageArray.length ? ageArray[0] : { name: '' };
  }
  // code to get values for id for generating pdf 

  getIdentifierTypes() {
    return this.studyLookupService.getStudyIdentifierTypes(this.pageSize);
  }

  setIdentifierTypes(identifierTypes) {
    if (identifierTypes?.results) {
      this.identifierTypes = identifierTypes.results;
    }
  }

  findIdentifierType(id) {
    const identifierTypeArray:any = this.identifierTypes.filter((type: any) => type.id === id);
    return identifierTypeArray && identifierTypeArray.length ? identifierTypeArray[0].name : ''
  }

  getTitleTypes() {
    return this.studyLookupService.getStudyTitleTypes(this.pageSize);
  }

  setTitleTypes(titleTypes) {
    if (titleTypes?.results) {
      this.titleTypes = titleTypes.results;
    }
  }

  findTitleType(id) {
    const titleTypeArray: any = this.titleTypes.filter((type: any) => type.id === id);
    return titleTypeArray && titleTypeArray.length ? titleTypeArray[0].name : '';
  }

  getFeatureTypes() {
    return this.studyLookupService.getFeatureTypes(this.pageSize);
  }

  getFeatureValues() {
    return this.studyLookupService.getFeatureValues(this.pageSize);
  }

  setFeatureTypes(featureTypes) {
    if (featureTypes?.data) {
      this.featureTypes = featureTypes.data;
    }
  }

  setFeatureValues(featureValues) {
    if (featureValues?.data) {
      this.featureValuesAll = featureValues.data;
    }
  }

  findFeatureType(id) {
    const featureTypeArray: any = this.featureTypes.filter((type: any) => type.id === id);
    return featureTypeArray && featureTypeArray.length ? featureTypeArray[0].name : '';
  }

  findFeatureValue(id) {
    const featureValueArray: any = this.featureValuesAll.filter((type: any) => type.id === id);
    return featureValueArray && featureValueArray.length ? featureValueArray[0].name : '';
  }

  getTopicTypes() {
    return this.commonLookupService.getTopicTypes(this.pageSize);
  }

  setTopicTypes(topicTypes) {
    if (topicTypes?.data) {
      this.topicTypes = topicTypes.data;
    }
  }

  findTopicType(id) {
    const topicArray: any = this.topicTypes.filter((type: any) => type.id === id);
    return topicArray && topicArray.length ? topicArray[0].name : '';
  }
  
  getTopicVocabularies() {
    return this.commonLookupService.getTopicVocabularies(this.pageSize);
  }

  setTopicVocabularies(controlledTerminology) {
    if (controlledTerminology?.results) {
      this.controlledTerminology = controlledTerminology.results;
    }
  }

  findTopicVocabulary(id) {
    const arr: any = this.controlledTerminology.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : 'None';
  }

  getRelationshipTypes() {
    return this.studyLookupService.getStudyRelationshipTypes(this.pageSize);
  }

  setRelationshipTypes(relationshipTypes) {
    if (relationshipTypes?.results) {
      this.relationshipTypes = relationshipTypes.results;
    }
  }

  findRelationshipType(id) {
    const relationArray: any = this.relationshipTypes.filter((type: any) => type.id === id);
    return relationArray && relationArray.length ? relationArray[0].name : '';
  }

  getAssociatedObjects(id) {
    return this.listService.getObjectByMultiStudies(id);
  }

  setAssociatedObjects(associatedObjects) {
    if (associatedObjects?.data) {
      this.associatedObjects = associatedObjects.data;
    }
  }

  getOrganisation(orgId) {
    return this.commonLookupService.getOrganizationById(orgId);
  }

  setOrganisation(organisation: OrganisationInterface) {
    if (organisation) {
      this.organisationName = organisation.defaultName;
      this.studyForm.patchValue({
        organisation: organisation,
      });
    }
  }

  getOrganisations() {
    return this.commonLookupService.getOrganizationList(this.pageSize);
  }

  setOrganisations(organisations) {
    if (organisations?.results) {
      this.organisations = organisations.results;
    }
  }

  getTrialRegistries() {
    return this.studyLookupService.getTrialRegistries(this.pageSize);
  }

  setTrialRegistries(regs) {
    if (regs?.results) {
      this.trialRegistries = regs.results;
    }
  }

  patchStudyForm() {
    this.studyForm.patchValue({
      displayTitle: this.studyData.displayTitle,
      briefDescription: this.studyData.briefDescription,
      dataSharingStatement: this.studyData.dataSharingStatement,
      organisation: this.studyData.organisation,
      studyType: this.studyData.studyType ? this.studyData.studyType.id : null,
      studyStatus: this.studyData.studyStatus ? this.studyData.studyStatus.id : null,
      studyGenderElig: this.studyData.studyGenderElig ? this.studyData.studyGenderElig.id : null,
      studyEnrollment: this.studyData.studyEnrollment,
      studyStartYear: this.studyData.studyStartYear ? new Date(`01/01/${this.studyData.studyStartYear}`) : '',
      studyStartMonth: this.studyData.studyStartMonth,
      minAge: this.studyData.minAge,
      minAgeUnit: this.studyData.minAgeUnit ? this.studyData.minAgeUnit.id : null,
      maxAge: this.studyData.maxAge,
      maxAgeUnit: this.studyData.maxAgeUnit ? this.studyData.maxAgeUnit.id : null,
      studyIdentifiers: this.studyData.studyIdentifiers ? this.studyData.studyIdentifiers : [],
      studyTitles: this.studyData.studyTitles ? this.studyData.studyTitles : [],
      studyFeatures: this.studyData.studyFeatures ? this.studyData.studyFeatures : [],
      studyTopics: this.studyData.studyTopics ? this.studyData.studyTopics : [],
      studyRelationships: this.studyData.studyRelationships ? this.studyData.studyRelationships : [],
      studyContributors: this.studyData.studyContributors ? this.studyData.studyContributors : [],
    });
  }

  onSave() {
    this.spinner.show();
    if (localStorage.getItem('updateStudyList')) {
      localStorage.removeItem('updateStudyList');
    }
    if (this.addType === 'manual' || this.isEdit) {
      this.isSubmitted = true;
      if (this.studyForm.valid) {
        this.studyForm.patchValue({
          maxAgeUnit: this.studyForm.value.maxAge === '' || null ? null : this.studyForm.value.maxAgeUnit,
          minAgeUnit: this.studyForm.value.minAge === '' || null ? null : this.studyForm.value.minAgeUnit,
          organisation: this.studyForm.value.organisation ? this.studyForm.value.organisation.id : null,
        });

        const payload = JSON.parse(JSON.stringify(this.studyForm.value));

        payload.studyStartYear = this.studyForm.value.studyStartYear ? this.studyForm.value.studyStartYear.getFullYear() : null;
        if (this.isEdit) {
          delete payload.sdSid;
          this.studyService.editStudy(this.id, payload).subscribe((res: any) => {
            if (res.statusCode === 200) {
              this.toastr.success('Study updated successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.reuseService.notifyComponents();
              this.spinner.hide();
              this.router.navigate([`/studies/${this.sdSid}/view`]);
            } else {
              this.toastr.error(res.messages[0]);
              this.spinner.hide();
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        } else {  // this.isAdd
          this.studyService.addStudy(payload).pipe(
            finalize(() => this.spinner.hide())
          ).subscribe((res: any) => {
            if (res.statusCode === 201) {
              this.toastr.success('Study added successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.reuseService.notifyComponents();
              if (res.sdSid) {
                this.router.navigate([`/studies/${res.sdSid}/view`]);
              } else {
                this.back();
              }
            } else {
              this.toastr.error(res.message, "Study adding error");
            }
          }, error => {
            this.toastr.error(error.message, 'Error adding study');
          })
        }
      } else {
        this.spinner.hide();
        this.gotoTop();
        this.toastr.error("Please correct the errors in the form's fields.");
      }
      this.count = 0;
    }
    if (this.addType === 'usingTrialId') {
      // TODO
      this.spinner.show();
      this.studyService.getStudyFromMdr(this.registryId, this.trialId).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Study imported successfully.');
          localStorage.setItem('updateStudyList', 'true');
          this.router.navigate([`studies/${res?.id}/edit`]);
        } else {
          this.spinner.hide();
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
    this.spinner.hide()
  }

  back(): void {
    this.backService.back();
  }

  onChange() {
    this.publicTitle = this.studyForm.value.displayTitle;
  }

  studyTypeChange() {
    const arrInterventional:any = this.studyTypes.filter((item: any) => item.name.toLowerCase() === 'interventional');
    const arrObservational:any = this.studyTypes.filter((item: any) => item.name.toLowerCase() === 'observational');
    this.studyType = this.studyForm.value.studyType === arrInterventional[0].id ? 'interventional' : this.studyForm.value.studyType === arrObservational[0].id ? 'observational': ''
  }

  print() {
    this.studyService.getStudyById(this.id).subscribe((res: any) => {
      if (res) {
        const payload = JSON.parse(JSON.stringify(res));
        payload.studyFeatures = payload.studyFeatures.filter((item: any) => item.featureType?.context?.toLowerCase() === payload.studyType?.name?.toLowerCase());
        this.pdfGenerator.studyPdfGenerator(payload);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }

  cleanJSON(obj) {
    const keysToDel = ['lastEditedBy', 'deidentType', 'deidentDirect', 'deidentHipaa', 'deidentDates', 'deidentKanon', 'deidentNonarr', 'deidentDetails'];
    for (let key in obj) {
      if (keysToDel.includes(key)) {
        delete obj[key];
      } else if (key === 'person' && obj[key] !== null) { // Removing most user info
        obj[key] = {'userProfile': obj['person']['userProfile'], 
                    'firstName': obj['person']['firstName'],
                    'lastName': obj['person']['lastName'],
                    'email': obj['person']['email']};
      } else if (key === 'id') {  // Deleting all internal IDs
        delete obj[key];
      } else {
        if (key === 'studyFeatures') { // Filtering studyFeatures to match studyType
          obj[key] = obj[key].filter(feature => {
            const cond = feature.featureType?.context?.toLowerCase() === obj.studyType?.name?.toLowerCase();
            if (cond) {
              delete feature['lastEditedBy'];
            }
            return cond;
          });
        }
        if (typeof obj[key] === 'object') {
          if (Array.isArray(obj[key])) {
            // loop through array
            for (let i = 0; i < obj[key].length; i++) {
              this.cleanJSON(obj[key][i]);
            }
          } else {
            // call function recursively for object
            this.cleanJSON(obj[key]);
          }
        }
      }
    }
  }

  jsonExport() {
    this.studyService.getStudyById(this.id).subscribe((res: any) => {
      if (res) {
        const payload = JSON.parse(JSON.stringify(res));
        this.cleanJSON(payload);
        this.jsonGenerator.jsonGenerator(payload, 'study');
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }

  customSearchFn(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.defaultName.toLocaleLowerCase().indexOf(term) > -1;
  }

  compareOrganisations(o1: OrganisationInterface, o2: OrganisationInterface): boolean {
    return o1?.id == o2?.id;
  }

  gotoTop() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  ngOnDestroy() {
    this.scrollService.unsubscribeScroll();
    this.subscription.unsubscribe();
  }
}
