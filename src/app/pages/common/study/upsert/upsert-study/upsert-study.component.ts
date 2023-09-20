import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subscription } from 'rxjs';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { StudyLookupService } from 'src/app/_rms/services/entities/study-lookup/study-lookup.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';

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
  trialRegistries: [] = [];
  subscription: Subscription = new Subscription();
  isSubmitted: boolean = false;
  id: any;
  studyData: StudyInterface;
  studyFull: any;
  studyTypeView: any;
  studyStatusView: any;
  studyGenderView: any;
  studyMinAgeView: any;
  studyMaxAgeView: any;
  count = 0;
  publicTitle: string = '';
  monthValues = [{id:'1', name:'January'}, {id:'2', name:'February'}, {id:'3', name: 'March'}, {id:'4', name: 'April'}, {id:'5', name: 'May'}, {id:'6', name: 'June'}, {id:'7', name: 'July'}, {id:'8', name: 'August'}, {id:'9', name: 'September'}, {id:'10', name: 'October'}, {id:'11', name:'November'}, {id:'12', name: 'December'}];
  sticky: boolean = false;
  studyType: string = '';
  addType: string;
  registryId: number;
  trialId: string;
  identifierTypes: [] = [];
  titleType: [] = [];
  featureTypes: [] = [];
  featureValuesAll: [] = [];
  topicTypes: [] = [];
  controlledTerminology: [] = [];
  relationshipType: [] = [];
  isBrowsing: boolean = false;
  role: any;
  associatedObjects: any;

  constructor(private fb: UntypedFormBuilder, private router: Router, private studyLookupService: StudyLookupService, private studyService: StudyService, private activatedRoute: ActivatedRoute,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private pdfGenerator: PdfGeneratorService, private jsonGenerator: JsonGeneratorService, private commonLookupService: CommonLookupService, private listService: ListService) {
    this.studyForm = this.fb.group({
      sdSid: 'RMS-',
      displayTitle: ['', Validators.required],
      briefDescription: '',
      dataSharingStatement: '',
      studyTypeId: null,
      studyStatusId: null,
      studyGenderEligId: null,
      studyEnrolment: '',
      studyStartMonth: null,
      studyStartYear: null,
      minAge: null,
      minAgeUnitsId: null,
      maxAge: null,
      maxAgeUnitsId: null,
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
    if (localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
    }
    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;
    this.isAdd = this.router.url.includes('add') ? true : false;
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    if (this.role === 'User') {
      this.studyForm.get('studyTypeId').setValidators(Validators.required);
      this.studyForm.get('studyStatusId').setValidators(Validators.required);
      this.studyForm.get('studyStartYear').setValidators(Validators.required);
    }
    if (this.isAdd) {
      this.studyForm.get('sdSid').setValidators(Validators.pattern(/^(RMS-)(?=[^0-9]*[0-9])/));
    }
    this.getStudyType();
    this.getStudyStatus();
    this.getGenderEligibility();
    this.getTimeUnits();
    this.getIdentifierType();
    this.getTitleType();
    this.getFeature();
    this.getTopicType();
    this.getTopicVocabulary();
    this.getRelationshipType();

    if (this.isEdit || this.isView) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getStudyById(this.id);
      this.getAssociatedObject(this.id);
    }
    this.activatedRoute.queryParams.subscribe(params => {
      this.addType = params.type;
    })
    if (this.addType === 'usingTrialId') {
      this.getTrialRegistries();
    }
  }
  get g() { return this.studyForm.controls; }
  getStudyType() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const getStudyType$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyTypes() : this.studyLookupService.getStudyTypes();
    getStudyType$.subscribe((res:any) => {
      this.spinner.hide();
      if(res.data) {
        this.studyTypes = res.data;
      }
      if (this.isView) {
        setTimeout(() => {
          this.studyTypeView = this.findStudyTypeById(this.studyForm.value.studyTypeId);
        });
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
    // this.subscription.add(getStudyType$);
  }
  getStudyStatus() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const getStudyStatus$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyStatuses() : this.studyLookupService.getStudyStatuses();
    getStudyStatus$.subscribe((res: any) => {
      this.spinner.hide();
      if(res.data) {
        this.studyStatuses = res.data;
      }
      if (this.isView) {
        setTimeout(() => {
          this.studyStatusView = this.findStudyStatusById(this.studyData.studyStatusId);
        });
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getGenderEligibility() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const getGenderEligibility$ = this.isBrowsing ? this.studyLookupService.getBrowsingGenderEligibilities() : this.studyLookupService.getGenderEligibilities();
    getGenderEligibility$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.genderEligibility = res.data;
      }
      if (this.isView) {
        setTimeout(() => {
          this.studyGenderView = this.findGenderEligibilityId(this.studyForm.value.studyGenderEligId);
        });
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getTimeUnits() {
    setTimeout(() => {
      this.spinner.show(); 
    });
    const getTimeUnits$ = this.isBrowsing ? this.studyLookupService.getBrowsingTimeUnits() : this.studyLookupService.getTimeUnits();
    getTimeUnits$.subscribe((res: any) => {
      this.spinner.hide();
      if(res.data) {
        this.timeUnits = res.data;
      }
      if (this.isView) {
        setTimeout(() => {
          this.studyMinAgeView = this.findTimeUnitsById(this.studyForm.value.minAgeUnitsId);
          this.studyMaxAgeView = this.findTimeUnitsById(this.studyForm.value.maxAgeUnitsId);
        });
      }
      if (this.isAdd) {
        const arr: any = this.timeUnits.filter((item: any) => item.name.toLowerCase() === "years");
        this.studyForm.patchValue({
          minAgeUnitsId: arr[0].id,
          maxAgeUnitsId: arr[0].id
        })
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getStudyById(id) {
    setTimeout(() => {
     this.spinner.show(); 
    });
    const fullStudy$ = this.isBrowsing ? this.studyService.getBrowsingFullStudyById(id) : this.studyService.getFullStudyById(id);
    fullStudy$.subscribe((res: any) => {
      console.log('data', res);
      this.spinner.hide();
      if (res && res.data && res.data.length) {
        this.studyFull = res.data[0];
        this.studyData = res.data[0].coreStudy;
        this.patchStudyForm();
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findStudyStatusById(id) {
    const statusArray = this.studyStatuses.filter((type: any) => type.id === id);
    return statusArray && statusArray.length ? statusArray[0] : { name: '' }
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
  getTrialRegistries() {
    this.studyLookupService.getTrialRegistries().subscribe((res: any) => {
      if (res && res.data) {
        this.trialRegistries = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  patchStudyForm() {
    this.studyForm.patchValue({
      displayTitle: this.studyData.displayTitle,
      briefDescription: this.studyData.briefDescription,
      dataSharingStatement: this.studyData.dataSharingStatement,
      studyTypeId: this.studyData.studyTypeId,
      studyStatusId: this.studyData.studyStatusId,
      studyGenderEligId: this.studyData.studyGenderEligId,
      studyEnrolment: this.studyData.studyEnrolment,
      studyStartYear: this.studyData.studyStartYear ? new Date(`01/01/${this.studyData.studyStartYear}`) : '',
      studyStartMonth: this.studyData.studyStartMonth,
      minAge: this.studyData.minAge,
      minAgeUnitsId: this.studyData.minAgeUnitsId,
      maxAge: this.studyData.maxAge,
      maxAgeUnitsId: this.studyData.maxAgeUnitsId,
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
        maxAgeUnitsId: this.studyForm.value.maxAge === '' || null ? null : this.studyForm.value.maxAgeUnitsId,
        minAgeUnitsId: this.studyForm.value.minAge === '' || null ? null : this.studyForm.value.minAgeUnitsId
      })
      if (this.studyForm.valid) {
        const payload = JSON.parse(JSON.stringify(this.studyForm.value));
        this.spinner.show();
        if (this.isEdit) {
          payload.id = this.studyData.id;
          payload.sdSid = this.id;
          payload.studyStartYear = this.studyForm.value.studyStartYear ? this.studyForm.value.studyStartYear.getFullYear() : null;
          this.studyService.editStudy(this.id, payload).subscribe((res: any) => {
            this.spinner.hide();
            if (res.statusCode === 200) {
              this.toastr.success('Study Details updated successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.getStudyById(this.id);
            } else {
              this.toastr.error(res.messages[0]);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        } else {
          payload.studyStartYear = this.studyForm.value.studyStartYear ? this.studyForm.value.studyStartYear.getFullYear() : null;
          this.studyService.addStudy(payload.sdSid, payload).subscribe((res: any) => {
            this.spinner.hide();
            if (res.statusCode === 200) {
              this.toastr.success('Study Detail added successfully');
              localStorage.setItem('updateStudyList', 'true');
              this.close();
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
          this.toastr.success('Study imported successfully. you will be redirected shortly');
          localStorage.setItem('updateStudyList', 'true');
          setTimeout(() => {
            this.spinner.hide();
            window.close();
            this.router.navigate([]).then((result) => {
              window.open(`studies/${res?.data[0]?.coreStudy?.sdSid}/edit`, '_blank');
            });
          }, 2000);
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
  close() {
    window.close();
  }
  onChange() {
    this.publicTitle = this.studyForm.value.displayTitle;
  }
  studyTypeChange() {
    const arrInterventional:any = this.studyTypes.filter((item: any) => item.name.toLowerCase() === 'interventional');
    const arrObservational:any = this.studyTypes.filter((item: any) => item.name.toLowerCase() === 'observational');
    this.studyType = parseInt(this.studyForm.value.studyTypeId) === arrInterventional[0].id ? 'interventional' : parseInt(this.studyForm.value.studyTypeId) === arrObservational[0].id ? 'observational': ''
  }
  print() {
    this.studyService.getFullStudyById(this.id).subscribe((res: any) => {
      if (res && res.data) {
        const payload = JSON.parse(JSON.stringify(res.data[0]));
        payload.coreStudy.studyStatusId = this.findStudyStatusById(payload.coreStudy.studyStatusId);
        payload.coreStudy.studyTypeId = this.findStudyTypeById(payload.coreStudy.studyTypeId);
        payload.coreStudy.studyGenderEligId = this.findGenderEligibilityId(payload.coreStudy.studyGenderEligId);
        payload.coreStudy.minAgeUnitsId = this.findTimeUnitsById(payload.coreStudy.minAgeUnitsId);
        payload.coreStudy.maxAgeUnitsId = this.findTimeUnitsById(payload.coreStudy.maxAgeUnitsId);
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
        payload.coreStudy.studyStatusId = this.findStudyStatusById(payload.coreStudy.studyStatusId);
        payload.coreStudy.studyTypeId = this.findStudyTypeById(payload.coreStudy.studyTypeId);
        payload.coreStudy.studyGenderEligId = this.findGenderEligibilityId(payload.coreStudy.studyGenderEligId);
        payload.coreStudy.minAgeUnitsId = this.findTimeUnitsById(payload.coreStudy.minAgeUnitsId);
        payload.coreStudy.maxAgeUnitsId = this.findTimeUnitsById(payload.coreStudy.maxAgeUnitsId);
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
  // code to get values for id for generating pdf 

  getIdentifierType() {
    const identifierType$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyIdentifierTypes() : this.studyLookupService.getStudyIdentifierTypes();
    identifierType$.subscribe((res: any) => {
      if(res && res.data) {
        this.identifierTypes = res.data;
      }
      this.spinner.hide();
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  findIdentifierType(id) {
    const identifierTypeArray:any = this.identifierTypes.filter((type: any) => type.id === id);
    return identifierTypeArray && identifierTypeArray.length ? identifierTypeArray[0].name : ''
  }
  getTitleType() {
    const titleType$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyTitleTypes() : this.studyLookupService.getStudyTitleTypes();
    titleType$.subscribe((res:any) => {
      if(res.data) {
        this.titleType = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  findTitleType(id) {
    const titleTypeArray: any = this.titleType.filter((type: any) => type.id === id);
    return titleTypeArray && titleTypeArray.length ? titleTypeArray[0].name : '';
  }
  getFeature() {
    const getFeatureType$ = this.isBrowsing ? this.studyLookupService.getBrowsingFeatureTypes() : this.studyLookupService.getFeatureTypes();
    const getFeatureValue$ = this.isBrowsing ?  this.studyLookupService.getBrowsingFeatureValues() : this.studyLookupService.getFeatureValues();
    const combine$ = combineLatest([getFeatureType$, getFeatureValue$]).subscribe(([featureType, featureValue] : [any, any]) => {
      if (featureType.data) {
        this.featureTypes = featureType.data;
      }
      if (featureValue.data) {
        this.featureValuesAll = featureValue.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findFeatureType(id) {
    const featureTypeArray: any = this.featureTypes.filter((type: any) => type.id === id);
    return featureTypeArray && featureTypeArray.length ? featureTypeArray[0].name : '';
  }
  findFeatureValue(id) {
    const featureValueArray: any = this.featureValuesAll.filter((type: any) => type.id === id);
    return featureValueArray && featureValueArray.length ? featureValueArray[0].name : '';
  }
  getTopicType() {
    const topicType$ = this.isBrowsing ? this.commonLookupService.getBrowsingTopicTypes() : this.commonLookupService.getTopicTypes();
    topicType$.subscribe((res: any) => {
      if (res.data) {
        this.topicTypes = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  findTopicType(id) {
    const topicArray: any = this.topicTypes.filter((type: any) => type.id === id);
    return topicArray && topicArray.length ? topicArray[0].name : '';
  }
  getTopicVocabulary() {
    const topicVocabularies$ = this.isBrowsing ? this.commonLookupService.getBrowsingTopicVocabularies() : this.commonLookupService.getTopicVocabularies();
    topicVocabularies$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.controlledTerminology = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findTopicVocabulary(id) {
    const arr: any = this.controlledTerminology.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : 'None';
  }
  getRelationshipType() {
    const relationshipType$ = this.isBrowsing ? this.studyLookupService.getBrowsingStudyRelationshipTypes() : this.studyLookupService.getStudyRelationshipTypes();
    relationshipType$.subscribe((res: any) => {
      if(res.data) {
        this.relationshipType = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  findRelationshipType(id) {
    const relationArray: any = this.relationshipType.filter((type: any) => type.id === id);
    return relationArray && relationArray.length ? relationArray[0].name : '';
  }
  gotoTop() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
  getAssociatedObject(id) {
    this.listService.getBrowsingObjectByMultiStudies(id).subscribe((res: any) => {
      this.associatedObjects = res.data;
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  goToObject(sdOid) {
    if (this.isBrowsing) {
      this.router.navigate([])
      .then(result => { window.open(`/browsing/data-objects/${sdOid}/view`, '_blank'); });
    } else {
      this.router.navigate([])
      .then(result => { window.open(`/data-objects/${sdOid}/view`, '_blank'); });  
    }
  }
}
