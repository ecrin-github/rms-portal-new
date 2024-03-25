import { Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subscription } from 'rxjs';
import { DataObjectInterface } from 'src/app/_rms/interfaces/data-object/data-object.interface';
import { StudyDataInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-upsert-object',
  templateUrl: './upsert-object.component.html',
  styleUrls: ['./upsert-object.component.scss']
})
export class UpsertObjectComponent implements OnInit {
  public isCollapsed: boolean = true;
  objectForm: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  isAdd: boolean = false;
  objectClass: [] = [];
  objectType: [] = [];
  accessType: [] = [];
  keyType: [] = [];
  deidentificationType: [] = [];
  consentType: [] = [];
  languageCode: [] = [];
  organizationList: [] = [];
  id: any;
  objectData: DataObjectInterface;
  subscription: Subscription = new Subscription();
  initiateEmit: boolean = false;
  count = 0;
  showDatasetKey: boolean = false;
  showTopic: boolean = false;
  showIdentifier: boolean = false;
  showDescription: boolean = false;
  sticky: boolean = false;
  EoscCategory = ['0', '1', '2', '3'];
  studyList: StudyDataInterface[] = [];
  resourceType: [] = [];
  sizeUnit: [] = [];
  titleType: [] = [];
  dateType: [] = [];
  topicType: [] = [];
  identifierType: [] = [];
  descriptionType: [] = [];
  showAccessDetails: boolean = true;
  role: any;
  orgId: any;
  isOrgIdValid: boolean;
  isSubmitted: boolean = false;
  isBrowsing: boolean = false;
  pageSize: Number = 10000;

  constructor(private statesService: StatesService,
              private location: Location, 
              private fb: UntypedFormBuilder, 
              private router: Router, 
              private commonLookupService: CommonLookupService, 
              private objectLookupService: ObjectLookupService, 
              private objectService: DataObjectService, 
              private spinner: NgxSpinnerService,
              private toastr: ToastrService, 
              private activatedRoute: ActivatedRoute, 
              private listService: ListService, 
              private reuseService: ReuseService,
              private pdfGenerator: PdfGeneratorService, 
              private jsonGenerator: JsonGeneratorService) {
    this.objectForm = this.fb.group({
      linkedStudy: null,
      doi: '',
      displayTitle: ['', Validators.required],
      version: '',
      objectClass: null,
      objectType: null,
      publicationYear: null,
      langCode: '',
      managingOrg: '',
      accessType: null,
      accessDetails: '',
      accessDetailsUrl: '',
      eoscCategory: 0,
      objectDatasets: this.fb.group({
        recordkeyType: null,
        recordkeyDetails: '',
        deidentType: null,
        deidentDirect: false,
        deidentHipaa: false,
        deidentDates: false,
        deidentNonarr: false,
        deidentKanon: false,
        deidentDetails: '',
        consentType: null,
        consentNoncommercial: false,
        consentGeogRestrict: false,
        consentResearchType: false,
        consentGeneticOnly: false,
        consentNoMethods: false,
        consentDetails: '',
      }),
      objectInstances: [],
      objectTitles: [],
      objectDates: [],
      objectContributors: [],
      objectTopics: [],
      objectIdentifiers: [],
      objectDescriptions: [],
      objectRights: [],
      objectRelationships: [],
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
    this.isAdd = this.router.url.includes('add') ? true : false;
    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;

    this.role = this.statesService.currentAuthRole;
    this.orgId = this.statesService.currentAuthOrgId;
    this.isOrgIdValid = this.statesService.isOrgIdValid();
    if (this.role === 'User') {
      this.objectForm.get('objectType').setValidators(Validators.required);
    }
    this.getStudyList();
    this.getObjectClass();
    this.getObjectType();
    this.getAccessType();
    this.getKeyType();
    this.getDeidentificationType();
    this.getConsentType();
    this.getLanguageCode();
    this.getResourceType();
    this.getSizeUnit();
    this.getTitleType();
    this.getDateType();
    this.getTopicType();
    this.getIdentifierType();
    this.getDescriptionType();
    this.getOrganization();
    if (this.isView || this.isEdit) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getObjectById(this.id);
    }
  }
  get g() { return this.objectForm.controls; }
  getStudyList() {
    this.spinner.show();
    if (this.role === 'User' && this.isOrgIdValid) {
      this.listService.getStudyListByOrg(this.orgId).subscribe((res: any) => {
        this.spinner.hide();
        if (res) {
          this.studyList = res;
        }
      }, error => {
        this.toastr.error(error.error.title);
        this.spinner.hide();
      })
    } else {
      this.listService.getStudyList(this.pageSize, '').subscribe((res: any) => {
        this.spinner.hide();
        if (res?.results) {
          this.studyList = res.results;
        }
      }, error => {
        this.toastr.error(error.error.title);
        this.spinner.hide();
      })
    }
  }
  findStudyById(sdSid) {
    const arr: any = this.studyList.filter((item: any) => item.sdSid === sdSid);
    return arr && arr.length ? arr[0].displayTitle+'('+arr[0].sdSid+')' : ''
  }
  customSearchFn(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.sdSid?.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle.toLocaleLowerCase().indexOf(term) > -1;
  }
  getObjectClass() {
    setTimeout(() => {
      this.spinner.show();
    });
    this.objectLookupService.getObjectClasses(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res.results) {
        this.objectClass = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getObjectType() {
    setTimeout(() => {
      this.spinner.show();
    });
    this.objectLookupService.getObjectTypes(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res.results) {
        this.objectType = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getAccessType() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.objectLookupService.getAccessTypes(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if(res.results) {
        this.accessType = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getKeyType() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.objectLookupService.getRecordKeyTypes(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res.results) {
        this.keyType = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getDeidentificationType() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.objectLookupService.getDeidentificationTypes(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res.results) {
        this.deidentificationType = res.results
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getConsentType() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.objectLookupService.getConsentTypes(this.pageSize).subscribe((res:any) => {
      this.spinner.hide();
      if(res.results) {
        this.consentType = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
  }
  getLanguageCode() {
    setTimeout(() => {
      this.spinner.show();
    });
    this.commonLookupService.getLanguageCodes(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.languageCode = res.results;
        if (this.isAdd) {
          this.objectForm.patchValue({
            langCode: this.findLangCode('English')
          })
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getOrganization() {
    this.spinner.show();
    this.commonLookupService.getOrganizationList(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.organizationList = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getObjectById(id) {
    setTimeout(() => {
     this.spinner.show();
    });
    this.objectService.getDataObjectById(id).subscribe((res: any) => {
      this.spinner.hide();
      if(res) {
        this.objectData = res;
        this.patchObjectForm();
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchObjectForm() {
    const arr: any = this.objectClass.filter((item:any) => item.name === 'Dataset');
    if (this.objectData.objectClass) {
      this.showDatasetKey = this.objectData.objectClass.id === arr[0].id ? true : false;
    }
    const arrType: any = this.objectType.filter((item: any) => item.name.toLowerCase() === 'publication list' || item.name.toLowerCase() === 'journal article' || item.name.toLowerCase() === 'working paper / pre-print');
    if(this.objectData.objectType) {
      arrType.map(item => {
        if (item.id === this.objectData.objectType.id) {
          this.showTopic = true;
          return;
        }
      });
    }
    const arrAccessType: any = this.accessType.filter((item: any) => item.name === 'Public on-screen access and download');
    if (this.objectData.accessType) {
      this.showAccessDetails =  this.objectData.accessType.id === arrAccessType[0].id ? false : true;
    }
    this.objectForm.patchValue({
      linkedStudy: this.objectData.linkedStudy ? this.objectData.linkedStudy : null,
      doi: this.objectData.doi,
      displayTitle: this.objectData.displayTitle,
      version: this.objectData.version,
      objectClass: this.objectData.objectClass ? this.objectData.objectClass.id : null,
      objectType: this.objectData.objectType ? this.objectData.objectType.id : null,
      publicationYear: this.objectData.publicationYear ? new Date(`01/01/${this.objectData.publicationYear}`) : '',
      langCode: this.objectData.langCode ? this.objectData.langCode.id : null,
      managingOrg: this.objectData.managingOrg ? this.objectData.managingOrg.id : null,
      accessType: this.objectData.accessType ? this.objectData.accessType.id : null,
      accessDetails: this.objectData.accessDetails,
      accessDetailsUrl: this.objectData.accessDetailsUrl,
      eoscCategory: this.objectData.eoscCategory,
      objectDatasets: {
        recordkeyType: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].recordkeyType ? this.objectData.objectDatasets[0].recordkeyType.id : null :null,
        recordkeyDetails: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].recordkeyDetails :'',
        deidentType: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentType ? this.objectData.objectDatasets[0].deidentType.id : null :null,
        deidentDirect: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDirect : false,
        deidentHipaa: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentHipaa : false,
        deidentDates: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDates : false,
        deidentNonarr: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentNonarr : false,
        deidentKanon: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentKanon : false,
        deidentDetails: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDetails :'',
        consentType: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentType ? this.objectData.objectDatasets[0].consentType.id :null :null,
        consentNoncommercial: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentNoncommercial : false,
        consentGeogRestrict: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentGeogRestrict : false,
        consentResearchType: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentResearchType : false,
        consentGeneticOnly: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentGeneticOnly : false,
        consentNoMethods: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentNoMethods : false,
        consentDetails: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentDetails :'',
      },
      objectInstances: this.objectData.objectInstances ? this.objectData.objectInstances : [],
      objectTitles: this.objectData.objectTitles ? this.objectData.objectTitles : [],
      objectDates: this.objectData.objectDates ? this.objectData.objectDates : [],
      objectContributors: this.objectData.objectContributors ? this.objectData.objectContributors : [],
      objectTopics: this.objectData.objectTopics ? this.objectData.objectTopics : [],
      objectIdentifiers: this.objectData.objectIdentifiers ? this.objectData.objectIdentifiers : [],
      objectDescriptions: this.objectData.objectDescriptions ? this.objectData.objectDescriptions : [],
      objectRights: this.objectData.objectRights ? this.objectData.objectRights : [],
      objectRelationships: this.objectData.objectRelationships ? this.objectData.objectRelationships : []
    });
  }
  onSave() {
    if (localStorage.getItem('updateObjectList')) {
      localStorage.removeItem('updateObjectList');
    }
    this.isSubmitted = true;
    if (this.objectForm.valid) {
      const payload = {
        sdOid: this.id,
        displayTitle: this.objectForm.value.displayTitle,
        version: this.objectForm.value.version,
        doi: this.objectForm.value.doi,
        publicationYear: this.objectForm.value.publicationYear ? this.objectForm.value.publicationYear.getFullYear() : null,
        accessDetails: this.objectForm.value.accessDetails,
        accessDetailsUrl: this.objectForm.value.accessDetailsUrl,
        urlLastChecked: this.objectForm.value.urlLastChecked,
        addStudyContributors: true,
        addStudyTopics: true,
        linkedStudy: this.objectForm.value.linkedStudy ? this.objectForm.value.linkedStudy.id : null,
        objectClass: this.objectForm.value.objectClass ? this.objectForm.value.objectClass : null,
        objectType: this.objectForm.value.objectType ? this.objectForm.value.objectType : null,
        managingOrg: this.objectForm.value.managingOrg ? this.objectForm.value.managingOrg : null,
        langCode: this.objectForm.value.langCode,
        accessType: this.objectForm.value.accessType ? this.objectForm.value.accessType : null
      }
      const datasetPayload = {
        recordkeyType: this.objectForm.value.objectDatasets.recordkeyType,
        recordkeyDetails: this.objectForm.value.objectDatasets.recordkeyDetails,
        deidentType: this.objectForm.value.objectDatasets.deidentType,
        deidentDirect: this.objectForm.value.objectDatasets.deidentDirect,
        deidentHipaa: this.objectForm.value.objectDatasets.deidentHipaa,
        deidentDates: this.objectForm.value.objectDatasets.deidentDates,
        deidentNonarr: this.objectForm.value.objectDatasets.deidentNonarr,
        deidentKanon: this.objectForm.value.objectDatasets.deidentKanon,
        deidentDetails: this.objectForm.value.objectDatasets.deidentDetails,
        consentType: this.objectForm.value.objectDatasets.consentType,
        consentNoncommercial: this.objectForm.value.objectDatasets.consentNoncommercial,
        consentGeogRestrict: this.objectForm.value.objectDatasets.consentGeogRestrict,
        consentResearchType: this.objectForm.value.objectDatasets.consentResearchType,
        consentGeneticOnly: this.objectForm.value.objectDatasets.consentGeneticOnly,
        consentNoMethods: this.objectForm.value.objectDatasets.consentNoMethods,
        consentDetails: this.objectForm.value.objectDatasets.consentDetails,
        objectId: this.id
      }
      if (this.isEdit) {
        if (payload.linkedStudy === null || payload.linkedStudy === undefined){
          this.spinner.hide();
          this.toastr.error("You have to specify linked study");
        }else{
          const editDataObject$ = this.objectService.editDataObject(this.id, payload);
          const editDataset$ = this.objectData.objectDatasets.length > 0 ? this.objectService.editObjecDataset(this.objectData.objectDatasets[0].id, this.id, datasetPayload) : this.objectService.addObjectDatasete(this.id, datasetPayload);
          this.spinner.show();
          const combine$ = combineLatest([editDataObject$, editDataset$]).subscribe(([editRes, datasetRes] : [any, any]) => {
            this.spinner.hide();
            if (editRes.statusCode === 200 && datasetRes.statusCode === 200) {
              this.toastr.success('Data Object updated successfully');
              localStorage.setItem('updateObjectList', 'true');
              this.getObjectById(this.id);
              this.reuseService.notifyComponents();
              this.back();
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        }
      } else {
        if (payload.linkedStudy === null || payload.linkedStudy === undefined){
          this.spinner.hide();
          this.toastr.error("You have to specify linked study");
        }
        else
        {
          this.objectService.addDataObject(payload).subscribe((res: any) => {
            this.spinner.hide();
            if (res.statusCode === 201) {
              this.objectService.addObjectDatasete(res.id, datasetPayload).subscribe((res: any) => {
                if (res.statusCode === 201) {
                }
              }, error => {
                this.toastr.error(res.messages[0]);
              })
              this.toastr.success('Data Object added successfully.');
              localStorage.setItem('updateObjectList', 'true');
              this.reuseService.notifyComponents();
              this.back();
            } else {
              this.toastr.error(res.messages[0]);
            }
          }, error => {
            console.log(error.error.title)
            this.spinner.hide();
            this.toastr.error(error.error.title);
          })
        }
      }
    } else {
      this.gotoTop();
    }
    this.count = 0;
  }
  // findObjectClass(id) {
  //   const objectClassArray: any = this.objectClass.filter((type: any) => type.id === id);
  //   return objectClassArray && objectClassArray.length ? objectClassArray[0].name : '';
  // }
  // findobjectType(id) {
  //   const objectTypeArray: any = this.objectType.filter((type: any) => type.id === id);
  //   return objectTypeArray && objectTypeArray.length ? objectTypeArray[0].name : '';
  // }
  // findAccessType(id) {
  //   const accessTypeArray: any = this.accessType.filter((type: any) => type.id === id);
  //   return accessTypeArray && accessTypeArray.length ? accessTypeArray[0].name : '';
  // }
  // findKeyType(id) {
  //   const keyTypeArray: any = this.keyType.filter((type: any) => type.id === id);
  //   return keyTypeArray && keyTypeArray.length ? keyTypeArray[0].name : 'None';
  // }
  // findDeidentificationType(id) {
  //   const deidentificationArray: any = this.deidentificationType.filter((type: any) => type.id === id);
  //   return deidentificationArray && deidentificationArray.length ? deidentificationArray[0].name : 'None';
  // }
  findConsentType(id) {
    const consentTypeArray: any = this.consentType.filter((type: any) => type.id === id);
    return consentTypeArray && consentTypeArray.length ?consentTypeArray[0].name : 'None';
  }
  findLangCode(languageCode) {
    setTimeout(() => {
      const langArr: any = this.languageCode.filter((type: any) => type.languageCode === languageCode);
      return langArr && langArr.length? langArr[0].id : '';
    }, 2000);
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
    const arr: any = this.objectClass.filter((item:any) => item.name.toLowerCase() === 'dataset');
    this.showDatasetKey = this.objectForm.value.objectClass === arr[0].id ? true : false;
  }
  onTypeChange() {
    this.showTopic = false;
    const arrType: any = this.objectType.filter((item: any) => item.name.toLowerCase() === 'publication list' || item.name.toLowerCase() === 'journal article' || item.name.toLowerCase() === 'working paper / pre-print');
    arrType.map(item => {
      if (item.id === this.objectForm.value.objectType) {
        this.showTopic = true;
        return
      }
    });
  }
  printPdf() {
    const payload = JSON.parse(JSON.stringify(this.objectData));
    //remembber to include commented fields
    // payload.coreObject.objectClass = this.findObjectClass(payload.coreObject.objectClass);
    // payload.coreObject.objectType = this.findobjectType(payload.coreObject.objectType);
    // payload.coreObject.accessType = this.findAccessType(payload.coreObject.accessType);
    if (payload.objectDatasets.length > 0) {
      // payload.objectDatasets[0].recordkeyType = this.findKeyType(payload.objectDatasets[0].recordkeyType);
      // payload.objectDatasets[0].deidentType = this.findDeidentificationType(payload.objectDatasets[0].deidentType);
      payload.objectDatasets[0].deidentDirect = payload.objectDatasets[0].deidentDirect ? payload.objectDatasets[0].deidentDirect : false;
      payload.objectDatasets[0].deidentHipaa = payload.objectDatasets[0].deidentHipaa ? payload.objectDatasets[0].deidentHipaa : false;
      payload.objectDatasets[0].deidentDates = payload.objectDatasets[0].deidentDates ? payload.objectDatasets[0].deidentDates : false;
      payload.objectDatasets[0].deidentNonarr = payload.objectDatasets[0].deidentNonarr ? payload.objectDatasets[0].deidentNonarr : false;
      payload.objectDatasets[0].deidentKanon = payload.objectDatasets[0].deidentKanon ? payload.objectDatasets[0].deidentKanon : false;
      payload.objectDatasets[0].consentNoncommercial = payload.objectDatasets[0].consentNoncommercial ? payload.objectDatasets[0].consentNoncommercial : false;
      payload.objectDatasets[0].consentGeogRestrict = payload.objectDatasets[0].consentGeogRestrict ? payload.objectDatasets[0].consentGeogRestrict : false;
      payload.objectDatasets[0].consentResearchType = payload.objectDatasets[0].consentResearchType ? payload.objectDatasets[0].consentResearchType : false;
      payload.objectDatasets[0].consentGeneticOnly = payload.objectDatasets[0].consentGeneticOnly ? payload.objectDatasets[0].consentGeneticOnly : false;
      payload.objectDatasets[0].consentNoMethods = payload.objectDatasets[0].consentNoMethods ? payload.objectDatasets[0].consentNoMethods : false;
      payload.objectDatasets[0].consentType = this.findConsentType(payload.objectDatasets[0].consentType);
    }
    payload.objectInstances.map(item => {
      item.resourceTypeId = this.findResourceType(item.resourceTypeId);
      item.resourceSizeUnits = this.findSizeUnit(item.resourceSizeUnits);
    });
    payload.objectTitles.map(item => {
      item.titleTypeId = this.findTitleType(item.titleTypeId);
    });
    payload.objectDates.map(item => {
      item.dateTypeId = this.findDateType(item.dateTypeId);
    });
    payload.objectTopics.map(item => {
      item.topicTypeId = this.findTopicType(item.topicTypeId);
    });
    payload.objectIdentifiers.map(item => {
      item.identifierTypeId = this.findIdentifierTyepe(item.identifierTypeId);
    });
    payload.objectDescriptions.map(item => {
      item.descriptionTypeId = this.findDescriptionType(item.descriptionTypeId);
    });
    this.pdfGenerator.objectPdfGenerator(payload);
  }
  jsonExport() {
    const payload = JSON.parse(JSON.stringify(this.objectData));
    // remember to include commented fields
    // payload.coreObject.objectClass = this.findObjectClass(payload.coreObject.objectClass);
    // payload.coreObject.objectType = this.findobjectType(payload.coreObject.objectType);
    // payload.coreObject.accessType = this.findAccessType(payload.coreObject.accessType);
    if (payload.objectDatasets.length > 0) {
      // payload.objectDatasets[0].recordkeyType = this.findKeyType(payload.objectDatasets[0].recordkeyType);
      // payload.objectDatasets[0].deidentType = this.findDeidentificationType(payload.objectDatasets[0].deidentType);
      payload.objectDatasets[0].deidentDirect = payload.objectDatasets[0].deidentDirect ? payload.objectDatasets[0].deidentDirect : false;
      payload.objectDatasets[0].deidentHipaa = payload.objectDatasets[0].deidentHipaa ? payload.objectDatasets[0].deidentHipaa : false;
      payload.objectDatasets[0].deidentDates = payload.objectDatasets[0].deidentDates ? payload.objectDatasets[0].deidentDates : false;
      payload.objectDatasets[0].deidentNonarr = payload.objectDatasets[0].deidentNonarr ? payload.objectDatasets[0].deidentNonarr : false;
      payload.objectDatasets[0].deidentKanon = payload.objectDatasets[0].deidentKanon ? payload.objectDatasets[0].deidentKanon : false;
      payload.objectDatasets[0].consentNoncommercial = payload.objectDatasets[0].consentNoncommercial ? payload.objectDatasets[0].consentNoncommercial : false;
      payload.objectDatasets[0].consentGeogRestrict = payload.objectDatasets[0].consentGeogRestrict ? payload.objectDatasets[0].consentGeogRestrict : false;
      payload.objectDatasets[0].consentResearchType = payload.objectDatasets[0].consentResearchType ? payload.objectDatasets[0].consentResearchType : false;
      payload.objectDatasets[0].consentGeneticOnly = payload.objectDatasets[0].consentGeneticOnly ? payload.objectDatasets[0].consentGeneticOnly : false;
      payload.objectDatasets[0].consentNoMethods = payload.objectDatasets[0].consentNoMethods ? payload.objectDatasets[0].consentNoMethods : false;
      payload.objectDatasets[0].consentType = this.findConsentType(payload.objectDatasets[0].consentType);
    }
    payload.objectInstances.map(item => {
      item.resourceTypeId = this.findResourceType(item.resourceTypeId);
      item.resourceSizeUnits = this.findSizeUnit(item.resourceSizeUnits);
    });
    payload.objectTitles.map(item => {
      item.titleTypeId = this.findTitleType(item.titleTypeId);
    });
    payload.objectDates.map(item => {
      item.dateTypeId = this.findDateType(item.dateTypeId);
    });
    payload.objectTopics.map(item => {
      item.topicTypeId = this.findTopicType(item.topicTypeId);
    });
    payload.objectIdentifiers.map(item => {
      item.identifierTypeId = this.findIdentifierTyepe(item.identifierTypeId);
    });
    payload.objectDescriptions.map(item => {
      item.descriptionTypeId = this.findDescriptionType(item.descriptionTypeId);
    });
    this.jsonGenerator.jsonGenerator(this.objectData, 'Object');
  }

// code to get values for id for generating pdf and json
  getSizeUnit() {
    this.objectLookupService.getSizeUnits(this.pageSize).subscribe((res: any) => {
      if(res.data) {
        this.sizeUnit = res.results;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getResourceType() {
    this.objectLookupService.getResourceTypes(this.pageSize).subscribe((res: any) => {
      if (res.results) {
        this.resourceType = res.results;
      }
    }, error => {
      console.log('error',error);
    });
  }
  findResourceType(id) {
    const resourceArray: any = this.resourceType.filter((type: any) => type.id === id);
    return resourceArray && resourceArray.length ? resourceArray[0].name : '';
  }
  findSizeUnit(id) {
    const sizeArray: any = this.sizeUnit.filter((type: any) => type.id === parseInt(id));
    return sizeArray && sizeArray.length ? sizeArray[0].name : '';
  }
  getTitleType() {
    this.objectLookupService.getObjectTitleTypes(this.pageSize).subscribe((res:any) => {
      if(res.results) {
        this.titleType = res.results;
      }
    }, error => {
      console.log('error', error);
    });
  }
  findTitleType(id) {
    const titleTypeArray: any = this.titleType.filter((type: any) => type.id === id);
    return titleTypeArray && titleTypeArray.length ? titleTypeArray[0].name : ''
  }
  getDateType() {
    this.objectLookupService.getDateTypes(this.pageSize).subscribe((res: any) => {
      if(res.results) {
        this.dateType = res.results
      }
    }, error => {
      console.log('error', error);
    })
  }
  findDateType(id) {
    const dateTypeArray: any = this.dateType.filter((type: any) => type.id === id);
    return dateTypeArray && dateTypeArray.length ? dateTypeArray[0].name : '';
  }
  getTopicType() {
    this.commonLookupService.getTopicTypes(this.pageSize).subscribe((res: any) => {
      if (res.results) {
        this.topicType = res.results;
      }
    }, error => {
      console.log('error', error);
    });
  }
  findTopicType(id) {
    const topicTypeArrray: any = this.topicType.filter((type: any) => type.id === id);
    return topicTypeArrray && topicTypeArrray.length ? topicTypeArrray[0].name : '';
  }
  getIdentifierType() {
    this.objectLookupService.getObjectIdentifierTypes(this.pageSize).subscribe((res:any) => {
      if(res.results) {
        this.identifierType = res.results;
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  findIdentifierTyepe(id) {
    const identifierTypeArray: any = this.identifierType.filter((type: any) => type.id === id);
    return identifierTypeArray && identifierTypeArray.length ? identifierTypeArray[0].name : '';
  }
  getDescriptionType() {
    this.objectLookupService.getDescriptionTypes(this.pageSize).subscribe((res: any) => {
      if(res.results) {
        this.descriptionType = res.results;
      }
    }, error => {
      console.log('error', error);
    });
  }
  findDescriptionType(id) {
    const descriptionArray: any = this.descriptionType.filter((type: any) => type.id === id);
    return descriptionArray && descriptionArray.length ? descriptionArray[0].name : '';
  }
  onChangeAccessType() {
    const arr: any = this.accessType.filter((item: any) => item.name === 'Public on-screen access and download');
    this.showAccessDetails = parseInt(this.objectForm.value.accessType) === arr[0].id ? false : true;
  }
  goToParentStudy(sdSid) {
    if (this.isBrowsing) {
      this.router.navigate([`/browsing/studies/${sdSid}/view`]);
    } else {
      this.router.navigate([`/studies/${sdSid}/view`]);
    }
  }
  compareStudies(s1: StudyDataInterface, s2: StudyDataInterface): boolean {
    console.log(`compareStudies, s1: ${s1?.id}, s2: ${s2?.id}`);
    return s1?.id == s2?.id;
  }
  gotoTop() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
}
