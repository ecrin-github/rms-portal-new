import { Location } from '@angular/common';
import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { StudyLookupService } from 'src/app/_rms/services/entities/study-lookup/study-lookup.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-upsert-study',
  templateUrl: './upsert-study.component.html',
  styleUrls: ['./upsert-study.component.scss']
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
  id: any;
  studyData: StudyInterface;
  studyFull: any;
  count = 0;
  publicTitle: string = '';
  monthValues = [{id:'1', name:'January'}, {id:'2', name:'February'}, {id:'3', name: 'March'}, {id:'4', name: 'April'}, {id:'5', name: 'May'}, {id:'6', name: 'June'}, {id:'7', name: 'July'}, {id:'8', name: 'August'}, {id:'9', name: 'September'}, {id:'10', name: 'October'}, {id:'11', name:'November'}, {id:'12', name: 'December'}];
  sticky: boolean = false;
  studyType: string = '';
  addType: string;
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
  role: any;
  associatedObjects: any;
  pageSize: Number = 10000;
  orgId: string;
  isOrgIdValid: boolean;
  canEdit: boolean = false;

  constructor(private statesService: StatesService,
              private location: Location, 
              private fb: UntypedFormBuilder, 
              private router: Router, 
              private studyLookupService: StudyLookupService, 
              private studyService: StudyService, 
              private reuseService: ReuseService,
              private activatedRoute: ActivatedRoute,
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService, 
              private pdfGenerator: PdfGeneratorService, 
              private jsonGenerator: JsonGeneratorService, 
              private commonLookupService: CommonLookupService, 
              private listService: ListService) {
    this.studyForm = this.fb.group({
      sdSid: 'RMS-',
      displayTitle: ['', Validators.required],
      briefDescription: '',
      dataSharingStatement: '',
      studyType: null,
      studyStatus: null,
      studyGenderElig: null,
      studyEnrollment: '',
      studyStartMonth: null,
      studyStartYear: null,
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
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const navbar = document.getElementById('navbar');
    const sticky = navbar.offsetTop;
    if (window.pageYOffset >= sticky) {
      navbar.classList.add('sticky');
      this.sticky = true;
    } else {
      navbar.classList.remove('sticky');
      this.sticky = false;
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.show(); 
    });

    this.orgId = this.statesService.currentAuthOrgId;
    this.role = this.statesService.currentAuthRole;
    this.isOrgIdValid = this.statesService.isOrgIdValid();
    this.isEdit = this.router.url.includes('edit');
    this.isView = this.router.url.includes('view');
    this.isAdd = this.router.url.includes('add');
    this.isBrowsing = this.router.url.includes('browsing');
    if (this.role === 'User') {
      this.studyForm.get('studyType').setValidators(Validators.required);
      this.studyForm.get('studyStatus').setValidators(Validators.required);
      this.studyForm.get('studyStartYear').setValidators(Validators.required);
    }
    if (this.isAdd) {
      this.studyForm.get('sdSid').setValidators(Validators.pattern(/^(RMS-)(?=[^0-9]*[0-9])/));
    }

    let queryFuncs: Array<Observable<object>> = [
      this.getStudyTypes(),
      this.getGenderEligibility(),
      this.getStudyStatuses(),
      this.getTimeUnits(),
      this.getIdentifierTypes(),
      this.getTitleTypes(),
      this.getFeatureTypes(),
      this.getFeatureValues(),
      this.getTopicTypes(),
      this.getTopicVocabularies(),
      this.getRelationshipTypes(),
    ];
    if (this.isEdit || this.isView) {
      this.id = this.activatedRoute.snapshot.params.id;
      queryFuncs.push(this.getStudyById(this.id));
      queryFuncs.push(this.getAssociatedObjects(this.id));
    }

    let obsArr: Array<Observable<any>> = [];
    queryFuncs.forEach((funct) => {
      obsArr.push(funct.pipe(catchError(error => of(this.toastr.error(error.error.title)))));
    });

    combineLatest(obsArr).subscribe(res => {
      this.setStudyTypes(res[0].results);
      this.setGenderEligibility(res[1].results);
      this.setStudyStatuses(res[2].results);
      this.setTimeUnits(res[3].results);
      this.setIdentifierTypes(res[4].results);
      this.setTitleTypes(res[5].results);
      this.setFeatureTypes(res[6].data);
      this.setFeatureValues(res[7].data);
      this.setTopicTypes(res[8].data);
      this.setTopicVocabularies(res[9].results);
      this.setRelationshipTypes(res[10].results);
      if (this.isEdit || this.isView) {
        this.setStudyById(res[11]);
        this.setAssociatedObjects(res[12].data);
      }

      // Show/hide edit button
      if (this.isOrgIdValid) {
        console.log(Object(this.studyData.studyContributors[0]));
        this.studyData.studyContributors.some((contributor) => {
          console.log(`${this.orgId} ${contributor.organisation.id}`);
          if (this.orgId === contributor.organisation.id) {
            this.canEdit = true;
            return this.canEdit;
          }
        });
      }

      // TODO: still too early
      setTimeout(() => {
        console.log("spinner hide");
        this.spinner.hide(); 
      });
    });

    this.activatedRoute.queryParams.subscribe(params => {
      this.addType = params.type;
    })
    if (this.addType === 'usingTrialId') {
      this.getTrialRegistries();
    }
  }
  get g() { return this.studyForm.controls; }
  getStudyTypes() {
    return this.studyLookupService.getStudyTypes(this.pageSize);
    // this.subscription.add(getStudyType$);
  }
  setStudyTypes(studyTypes) {
    if (studyTypes) {
      this.studyTypes = studyTypes;
    }
  }
  getStudyStatuses() {
    return this.studyLookupService.getStudyStatuses(this.pageSize);
  }
  setStudyStatuses(studyStatuses) {
    if (studyStatuses) {
      this.studyStatuses = studyStatuses;
    }
  }
  getGenderEligibility() {
    return this.studyLookupService.getGenderEligibilities(this.pageSize);
  }
  setGenderEligibility(genderEligibility) {
    if (genderEligibility) {
      this.genderEligibility = genderEligibility;
    }
  }
  getTimeUnits() {
    return this.studyLookupService.getTimeUnits(this.pageSize);
  }
  setTimeUnits(timeUnits) {
    if (timeUnits) {
      this.timeUnits = timeUnits;
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
    if (identifierTypes) {
      this.identifierTypes = identifierTypes;
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
    if (titleTypes) {
      this.titleTypes = titleTypes;
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
    if (featureTypes) {
      this.featureTypes = featureTypes;
    }
  }
  setFeatureValues(featureValues) {
    if (featureValues) {
      this.featureValuesAll = featureValues;
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
    if (topicTypes) {
      this.topicTypes = topicTypes;
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
    if (controlledTerminology) {
      this.controlledTerminology = controlledTerminology;
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
    if (relationshipTypes) {
      this.relationshipTypes = relationshipTypes;
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
    if (associatedObjects) {
      this.associatedObjects = associatedObjects;
    }
  }
  getTrialRegistries() {
    // this.studyLookupService.getTrialRegistries(this.pageSize).subscribe((res: any) => {
    //   if (res && res.results) {
    //     this.trialRegistries = res.results;
    //   }
    // }, error => {
    //   this.toastr.error(error.error.title);
    // })
    this.trialRegistries = [
      {id: '100116', name: 'Australian / New Zealand Clinical Trials Registry'},
      {id: '100117', name: 'Registro Brasileiro de Ensaios Clínicos'},
      {id: '100118', name: 'Chinese Clinical Trial Register'},
      {id: '100119', name: 'Clinical Research Information Service (S Korea)'},
      {id: '100120', name: 'ClinicalTrials.gov'},
      {id: '100121', name: 'Clinical Trials Registry - India'},
      {id: '100122', name: 'Registro Público Cubano de Ensayos Clínicos'},
      {id: '100123', name: 'EU Clinical Trials Register / EMA CTIS'},
      {id: '100124', name: 'Deutschen Register Klinischer Studien'},
      {id: '100125', name: 'Iranian Registry of Clinical Trials'},
      {id: '100126', name: 'ISRCTN'},
      {id: '100127', name: 'Japan Primary Registries Network'},
      {id: '100128', name: 'Pan-African Clinical Trials Registry'},
      {id: '100129', name: 'Registro Peruano de Ensayos Clínicos'},
      {id: '100130', name: 'Sri Lanka Clinical Trials Registry'},
      {id: '100131', name: 'Thai Clinical Trials Register'},
      {id: '100132', name: 'The Netherlands National Trial Register'},
      {id: '100135', name: 'PubMed'},
      {id: '101405', name: 'CSDR*'},
      {id: '101900', name: 'BioLINCC (NIH)'},
      {id: '101901', name: 'Yoda'},
      {id: '101940', name: 'Vivli*'},
      {id: '101989', name: 'Lebenon Clinical Trial Registry'},
      {id: '109108', name: 'International Traditional Medicine Clinical Trial Registry'},
      {id: '110426', name: 'BBMRI-ERIC'}

    ]
  }
  patchStudyForm() {
    this.studyForm.patchValue({
      displayTitle: this.studyData.displayTitle,
      briefDescription: this.studyData.briefDescription,
      dataSharingStatement: this.studyData.dataSharingStatement,
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
    this.studyTypeChange();
  }
  onSave() {
    if (localStorage.getItem('updateStudyList')) {
      localStorage.removeItem('updateStudyList');
    }
    if (this.addType === 'manual') {
      this.isSubmitted = true;
      console.log('payload', this.studyForm);
      this.studyForm.patchValue({
        maxAgeUnit: this.studyForm.value.maxAge === '' || null ? null : this.studyForm.value.maxAgeUnit,
        minAgeUnit: this.studyForm.value.minAge === '' || null ? null : this.studyForm.value.minAgeUnit
      })
      if (this.studyForm.valid) {
        const payload = JSON.parse(JSON.stringify(this.studyForm.value));
        this.spinner.show();
        if (this.isEdit) {
          delete payload.sdSid;
          payload.studyStartYear = this.studyForm.value.studyStartYear ? this.studyForm.value.studyStartYear.getFullYear() : null;
          this.studyService.editStudy(this.id, payload).subscribe((res: any) => {
            this.spinner.hide();
            if (res.statusCode === 200) {
              this.toastr.success('Study Details updated successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.reuseService.notifyComponents();
              this.getStudyById(this.id);
              this.back();
            } else {
              this.toastr.error(res.messages[0]);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        } else {
          payload.studyStartYear = this.studyForm.value.studyStartYear ? this.studyForm.value.studyStartYear.getFullYear() : null;
          this.studyService.addStudy(payload).subscribe((res: any) => {
            this.spinner.hide();
            if (res.statusCode === 201) {
              this.toastr.success('Study Detail added successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.reuseService.notifyComponents();
              this.back();
            } else {
              this.toastr.error(res.messages[0]);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        }
      } else {
        this.gotoTop();
      }
      this.count = 0;
    }
    if (this.addType === 'usingTrialId') {
      this.spinner.show();
      this.studyService.getFullStudyFromMdr(this.registryId, this.trialId).subscribe((res: any) => {
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
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  back(): void {
    const state: { [k: string]: any; } = this.location.getState();
    // navigationId counts the number of pages visited for the current site
    if (typeof state == 'object' && state != null && 'navigationId' in state && (parseInt(state['navigationId'], 10) > 1)) {
      this.location.back();
    } else {
      if (this.role) {
        const regex = new RegExp(/(?<=^[\/\\])[^\/\\]+/);  // matches the string between the first two slashes
        const match = regex.exec(this.router.url);
        if (match) {
          this.router.navigate(match);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.router.navigate(['/browsing']);
      }
    }
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
    this.studyService.getFullStudyById(this.id).subscribe((res: any) => {
      if (res && res.data) {
        const payload = JSON.parse(JSON.stringify(res.data[0]));
        payload.coreStudy.studyStatus = this.findStudyStatusById(payload.coreStudy.studyStatus);
        payload.coreStudy.studyType = this.findStudyTypeById(payload.coreStudy.studyType);
        payload.coreStudy.studyGenderElig = this.findGenderEligibilityId(payload.coreStudy.studyGenderElig);
        payload.coreStudy.minAgeUnit = this.findTimeUnitsById(payload.coreStudy.minAgeUnit);
        payload.coreStudy.maxAgeUnit = this.findTimeUnitsById(payload.coreStudy.maxAgeUnit);
        payload.studyIdentifiers.map(item => {
          item.identifierTypeId = this.findIdentifierType(item.identifierTypeId);
        });
        payload.studyTitles.map (item => {
          item.titleTypeId = this.findTitleType(item.titleTypeId);
        });
        payload.studyFeatures.map(item => {
          item.featureTypeId = this.findFeatureType(item.featureTypeId);
          item.featureValueId = this.findFeatureValue(item.featureValueId);
        });
        payload.studyTopics.map(item => {
          item.topicTypeId = this.findTopicType(item.topicTypeId);
          item.originalCtId = this.findTopicVocabulary(item.originalCtId);
        });
        payload.studyRelationships.map(item => {
          item.relationshipTypeId = this.findRelationshipType(item.relationshipTypeId);
        });
        this.pdfGenerator.studyPdfGenerator(payload);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  jsonExport() {
    this.studyService.getFullStudyById(this.id).subscribe((res: any) => {
      if (res && res.data) {
        const payload = JSON.parse(JSON.stringify(res.data[0]));
        payload.coreStudy.studyStatus = this.findStudyStatusById(payload.coreStudy.studyStatus);
        payload.coreStudy.studyType = this.findStudyTypeById(payload.coreStudy.studyType);
        payload.coreStudy.studyGenderElig = this.findGenderEligibilityId(payload.coreStudy.studyGenderElig);
        payload.coreStudy.minAgeUnit = this.findTimeUnitsById(payload.coreStudy.minAgeUnit);
        payload.coreStudy.maxAgeUnit = this.findTimeUnitsById(payload.coreStudy.maxAgeUnit);
        payload.studyIdentifiers.map(item => {
          item.identifierTypeId = this.findIdentifierType(item.identifierTypeId);
        });
        payload.studyTitles.map (item => {
          item.titleTypeId = this.findTitleType(item.titleTypeId);
        });
        payload.studyFeatures.map(item => {
          item.featureTypeId = this.findFeatureType(item.featureTypeId);
          item.featureValueId = this.findFeatureValue(item.featureValueId);
        });
        payload.studyTopics.map(item => {
          item.topicTypeId = this.findTopicType(item.topicTypeId);
          item.originalCtId = this.findTopicVocabulary(item.originalCtId);
        });
        payload.studyRelationships.map(item => {
          item.relationshipTypeId = this.findRelationshipType(item.relationshipTypeId);
        });
        this.jsonGenerator.jsonGenerator(res.data[0], 'study');
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  gotoTop() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
  goToObject(sdOid) {
    if (this.isBrowsing) {
      this.router.navigate([`/browsing/data-objects/${sdOid}/view`]);
    } else {
      this.router.navigate([`/data-objects/${sdOid}/view`]);
    }
  }
}
