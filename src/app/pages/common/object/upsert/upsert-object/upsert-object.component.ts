import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subscription } from 'rxjs';
import { DataObjectInterface } from 'src/app/_rms/interfaces/data-object/data-object.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';

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
  studyList: [] = [];
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
  isSubmitted: boolean = false;
  isBrowsing: boolean = false;

  constructor(private fb: UntypedFormBuilder, private router: Router, private commonLookupService: CommonLookupService, private objectLookupService: ObjectLookupService, private objectService: DataObjectService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private activatedRoute: ActivatedRoute, private listService: ListService, private pdfGenerator: PdfGeneratorService, private jsonGenerator: JsonGeneratorService) {
    this.objectForm = this.fb.group({
      SdSid: ['', Validators.required],
      doi: '',
      displayTitle: ['', Validators.required],
      version: '',
      objectClassId: null,
      objectTypeId: null,
      publicationYear: null,
      langCode: 'en',
      managingOrg: '',
      accessTypeId: null,
      accessDetails: '',
      accessDetailsUrl: '',
      eoscCategory: 0,
      objectDatasets: this.fb.group({
        recordKeysTypeId: null,
        recordKeysDetails: '',
        deidentTypeId: null,
        deidentDirect: false,
        deidentHipaa: false,
        deidentDates: false,
        deidentNonarr: false,
        deidentKanon: false,
        deidentDetails: '',
        consentTypeId: null,
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
    if (localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
    }
    if (localStorage.getItem('organisationId')) {
      this.orgId = localStorage.getItem('organisationId');
    }
    if (this.role === 'User') {
      this.objectForm.get('objectTypeId').setValidators(Validators.required);
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
    if (this.isView || this.isEdit) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getObjectById(this.id);
    }
  }
  get g() { return this.objectForm.controls; }
  getStudyList() {
    this.spinner.show();
    if (this.role === 'User') {
      this.listService.getStudyListByOrg(this.orgId).subscribe((res: any) => {
        this.spinner.hide();
        if (res && res.data) {
          this.studyList = res.data;
        }
      }, error => {
        this.toastr.error(error.error.title);
        this.spinner.hide();
      })
    } else {
      const getStudyList$ = this.isBrowsing ? this.listService.getBrowsingStudyList() : this.listService.getStudyList();
      getStudyList$.subscribe((res: any) => {
        this.spinner.hide();
        if (res && res.data) {
          this.studyList = res.data;
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
    return item.sdSid.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle.toLocaleLowerCase().indexOf(term) > -1;
  }
  getObjectClass() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    const getObjectClass$ = this.isBrowsing ? this.objectLookupService.getBrowsingObjectClasses() : this.objectLookupService.getObjectClasses()
    getObjectClass$.subscribe((res: any) => {
      this.spinner.hide();
      if(res.data) {
        this.objectClass = res.data;
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
    const getObjectType$ = this.isBrowsing ? this.objectLookupService.getBrowsingObjectTitleTypes() : this.objectLookupService.getObjectTypes();
    getObjectType$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.objectType = res.data;
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
    const getAccessType$ = this.isBrowsing ? this.objectLookupService.getBrowsingAccessTypes() : this.objectLookupService.getAccessTypes();
    getAccessType$.subscribe((res: any) => {
      this.spinner.hide();
      if(res.data) {
        this.accessType = res.data;
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
    const getKeyType$ = this.isBrowsing ? this.objectLookupService.getBrowsingRecordKeyTypes() : this.objectLookupService.getRecordKeyTypes();
    getKeyType$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.keyType = res.data;
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
    const getDeidentificationType$ = this.isBrowsing ? this.objectLookupService.getBrowsingDeidentificationTypes() : this.objectLookupService.getDeidentificationTypes();
    getDeidentificationType$.subscribe((res: any) => {
      this.spinner.hide();
      if (res.data) {
        this.deidentificationType = res.data
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
    const getConsentType$ = this.isBrowsing ? this.objectLookupService.getBrowsingConsentTypes() : this.objectLookupService.getConsentTypes();
    getConsentType$.subscribe((res:any) => {
      this.spinner.hide();
      if(res.data) {
        this.consentType = res.data;
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
    const getLanguageCodes$ = this.isBrowsing ? this.commonLookupService.getBrowsingLanguageCodes('en') : this.commonLookupService.getLanguageCodes('en');
    getLanguageCodes$.subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.languageCode = res.data;
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
    const getDataObjectById$ = this.isBrowsing ? this.objectService.getBrowsingDataObjectById(id) : this.objectService.getDataObjectById(id);
    getDataObjectById$.subscribe((res: any) => {
      this.spinner.hide();
      if(res && res.data && res.data.length) {
        this.objectData = res.data[0];
        this.patchObjectForm();
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchObjectForm() {
    const arr: any = this.objectClass.filter((item:any) => item.name === 'Dataset');
    this.showDatasetKey = this.objectData.coreObject.objectClassId === arr[0].id ? true : false;
    const arrType: any = this.objectType.filter((item: any) => item.name.toLowerCase() === 'publication list' || item.name.toLowerCase() === 'journal article' || item.name.toLowerCase() === 'working paper / pre-print');
    arrType.map(item => {
      if (item.id === this.objectData.coreObject.objectTypeId) {
        this.showTopic = true;
        return;
      }
    });
    const arrAccessType: any = this.accessType.filter((item: any) => item.name === 'Public on-screen access and download');
    this.showAccessDetails =  this.objectData.coreObject.accessTypeId === arrAccessType[0].id ? false : true;
    this.objectForm.patchValue({
      SdSid: this.objectData.coreObject.sdSid,
      doi: this.objectData.coreObject.doi,
      displayTitle: this.objectData.coreObject.displayTitle,
      version: this.objectData.coreObject.version,
      objectClassId: this.objectData.coreObject.objectClassId,
      objectTypeId: this.objectData.coreObject.objectTypeId,
      publicationYear: this.objectData.coreObject.publicationYear ? new Date(`01/01/${this.objectData.coreObject.publicationYear}`) : '',
      langCode: this.objectData.coreObject.langCode,
      managingOrg: this.objectData.coreObject.managingOrg,
      accessTypeId: this.objectData.coreObject.accessTypeId,
      accessDetails: this.objectData.coreObject.accessDetails,
      accessDetailsUrl: this.objectData.coreObject.accessDetailsUrl,
      eoscCategory: this.objectData.coreObject.eoscCategory,
      objectDatasets: {
        recordKeysTypeId: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].recordKeysTypeId :null,
        recordKeysDetails: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].recordKeysDetails :'',
        deidentTypeId: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentTypeId :null,
        deidentDirect: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDirect : false,
        deidentHipaa: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentHipaa : false,
        deidentDates: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDates : false,
        deidentNonarr: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentNonarr : false,
        deidentKanon: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentKanon : false,
        deidentDetails: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].deidentDetails :'',
        consentTypeId: this.objectData.objectDatasets[0] ? this.objectData.objectDatasets[0].consentTypeId :null,
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
    })
  }
  onSave() {
    if (localStorage.getItem('updateObjectList')) {
      localStorage.removeItem('updateObjectList');
    }
    this.isSubmitted = true;
    if (this.objectForm.valid) {
      const payload = JSON.parse(JSON.stringify(this.objectForm.value));
      payload.objectTypeId = payload.objectTypeId ? payload.objectTypeId : null;
      payload.objectClassId = payload.objectClassId ? payload.objectClassId : null;
      payload.accessTypeId = payload.accessTypeId ? payload.accessTypeId : null;
      payload.accessTypeId = payload.accessTypeId ? payload.accessTypeId : null;
      payload.publicationYear = this.objectForm.value.publicationYear ? this.objectForm.value.publicationYear.getFullYear() : null;
      const datasetPayload = JSON.parse(JSON.stringify(this.objectForm.value));
      datasetPayload.objectDatasets.deidentDirect = datasetPayload.objectDatasets.deidentDirect;
      datasetPayload.objectDatasets.deidentHipaa = datasetPayload.objectDatasets.deidentHipaa;
      datasetPayload.objectDatasets.deidentDates = datasetPayload.objectDatasets.deidentDates;
      datasetPayload.objectDatasets.deidentNonarr = datasetPayload.objectDatasets.deidentNonarr;
      datasetPayload.objectDatasets.deidentKanon = datasetPayload.objectDatasets.deidentKanon;
      datasetPayload.objectDatasets.consentNoncommercial = datasetPayload.objectDatasets.consentNoncommercial;
      datasetPayload.objectDatasets.consentGeogRestrict = datasetPayload.objectDatasets.consentGeogRestrict;
      datasetPayload.objectDatasets.consentResearchType = datasetPayload.objectDatasets.consentResearchType;
      datasetPayload.objectDatasets.consentGeneticOnly = datasetPayload.objectDatasets.consentGeneticOnly;
      datasetPayload.objectDatasets.consentNoMethods = datasetPayload.objectDatasets.consentNoMethods;
      datasetPayload.objectDatasets.recordKeysTypeId = datasetPayload.objectDatasets.recordKeysTypeId ? datasetPayload.objectDatasets.recordKeysTypeId : null;
      datasetPayload.objectDatasets.deidentTypeId = datasetPayload.objectDatasets.deidentTypeId ? datasetPayload.objectDatasets.deidentTypeId : null;
      datasetPayload.objectDatasets.consentTypeId = datasetPayload.objectDatasets.consentTypeId ? datasetPayload.objectDatasets.consentTypeId : null;
      if (this.isEdit) {
        payload.id = this.objectData.id;
        payload.sdOid = this.id;
        if (this.objectData.objectDatasets.length > 0) {
          datasetPayload.objectDatasets['id'] = this.objectData.objectDatasets[0].id;
          datasetPayload.objectDatasets['sdOid'] = this.objectData.objectDatasets[0].sdOid;
        }
        const editDataObject$ = this.objectService.editDataObject(this.id, payload);
        const editDataset$ = this.objectData.objectDatasets.length > 0 ? this.objectService.editObjecDataset(this.objectData.objectDatasets[0].id, this.id, datasetPayload.objectDatasets) : this.objectService.addObjectDatasete(this.id, datasetPayload);
        this.spinner.show();
        const combine$ = combineLatest([editDataObject$, editDataset$]).subscribe(([editRes, datasetRes] : [any, any]) => {
          this.spinner.hide();
          if (editRes.statusCode === 200 && datasetRes.statusCode === 200) {
            this.toastr.success('Data Object updated successfully');
          }
          localStorage.setItem('updateObjectList', 'true');
          this.getObjectById(this.id);
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      } else {
        this.objectService.addDataObject(payload.SdSid, payload).subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.objectService.addObjectDatasete(res.data[0].sdOid, datasetPayload.objectDatasets).subscribe((res: any) => {
              if (res.statusCode === 200) {
                // this.toastr.success('Dataset added successfully');
              }
            }, error => {
              this.toastr.error(res.messages[0]);
            })
            this.toastr.success('Data Object added successfully and this window will close shortly.');
            localStorage.setItem('updateObjectList', 'true');
            setTimeout(() => {
              this.close();
            }, 3000);
          } else {
            this.toastr.error(res.messages[0]);
          }
        }, error => {
          console.log(error.error.title)
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      }
    } else {
      this.gotoTop();
    }
    this.count = 0;
  }
  findObjectClass(id) {
    const objectClassArray: any = this.objectClass.filter((type: any) => type.id === id);
    return objectClassArray && objectClassArray.length ? objectClassArray[0].name : '';
  }
  findobjectType(id) {
    const objectTypeArray: any = this.objectType.filter((type: any) => type.id === id);
    return objectTypeArray && objectTypeArray.length ? objectTypeArray[0].name : '';
  }
  findAccessType(id) {
    const accessTypeArray: any = this.accessType.filter((type: any) => type.id === id);
    return accessTypeArray && accessTypeArray.length ? accessTypeArray[0].name : '';
  }
  findKeyType(id) {
    const keyTypeArray: any = this.keyType.filter((type: any) => type.id === id);
    return keyTypeArray && keyTypeArray.length ? keyTypeArray[0].name : 'None';
  }
  findDeidentificationType(id) {
    const deidentificationArray: any = this.deidentificationType.filter((type: any) => type.id === id);
    return deidentificationArray && deidentificationArray.length ? deidentificationArray[0].name : 'None';
  }
  findConsentType(id) {
    const consentTypeArray: any = this.consentType.filter((type: any) => type.id === id);
    return consentTypeArray && consentTypeArray.length ?consentTypeArray[0].name : 'None';
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  close() {
    window.close();
  }
  onChange() {
    const arr: any = this.objectClass.filter((item:any) => item.name.toLowerCase() === 'dataset');
    this.showDatasetKey = parseInt(this.objectForm.value.objectClassId) === arr[0].id ? true : false;
  }
  onTypeChange() {
    this.showTopic = false;
    const arrType: any = this.objectType.filter((item: any) => item.name.toLowerCase() === 'publication list' || item.name.toLowerCase() === 'journal article' || item.name.toLowerCase() === 'working paper / pre-print');
    arrType.map(item => {
      if (item.id === parseInt(this.objectForm.value.objectTypeId)) {
        this.showTopic = true;
        return
      }
    });
  }
  printPdf() {
    const payload = JSON.parse(JSON.stringify(this.objectData));
    payload.coreObject.objectClassId = this.findObjectClass(payload.coreObject.objectClassId);
    payload.coreObject.objectTypeId = this.findobjectType(payload.coreObject.objectTypeId);
    payload.coreObject.accessTypeId = this.findAccessType(payload.coreObject.accessTypeId);
    if (payload.objectDatasets.length > 0) {
      payload.objectDatasets[0].recordKeysTypeId = this.findKeyType(payload.objectDatasets[0].recordKeysTypeId);
      payload.objectDatasets[0].deidentTypeId = this.findDeidentificationType(payload.objectDatasets[0].deidentTypeId);
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
      payload.objectDatasets[0].consentTypeId = this.findConsentType(payload.objectDatasets[0].consentTypeId);
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
    payload.coreObject.objectClassId = this.findObjectClass(payload.coreObject.objectClassId);
    payload.coreObject.objectTypeId = this.findobjectType(payload.coreObject.objectTypeId);
    payload.coreObject.accessTypeId = this.findAccessType(payload.coreObject.accessTypeId);
    if (payload.objectDatasets.length > 0) {
      payload.objectDatasets[0].recordKeysTypeId = this.findKeyType(payload.objectDatasets[0].recordKeysTypeId);
      payload.objectDatasets[0].deidentTypeId = this.findDeidentificationType(payload.objectDatasets[0].deidentTypeId);
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
      payload.objectDatasets[0].consentTypeId = this.findConsentType(payload.objectDatasets[0].consentTypeId);
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
    const getSizeUnit$ = this.isBrowsing ? this.objectLookupService.getBrowsingSizeUnits() : this.objectLookupService.getSizeUnits();
    getSizeUnit$.subscribe((res: any) => {
      if(res.data) {
        this.sizeUnit = res.data;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getResourceType() {
    const getResourceType$ = this.isBrowsing ? this.objectLookupService.getBrowsingResourceTypes() : this.objectLookupService.getResourceTypes();
    getResourceType$.subscribe((res: any) => {
      if (res.data) {
        this.resourceType = res.data;
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
    const getTitleType$ = this.isBrowsing ? this.objectLookupService.getBrowsingObjectTitleTypes() : this.objectLookupService.getObjectTitleTypes();
    getTitleType$.subscribe((res:any) => {
      if(res.data) {
        this.titleType = res.data;
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
    const getDateTypes$ = this.isBrowsing ? this.objectLookupService.getBrowsingDateTypes() : this.objectLookupService.getDateTypes();
    getDateTypes$.subscribe((res: any) => {
      if(res.data) {
        this.dateType = res.data
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
    const getTopicTypes$ = this.isBrowsing ? this.commonLookupService.getBrowsingTopicTypes() : this.commonLookupService.getTopicTypes();
    getTopicTypes$.subscribe((res: any) => {
      if(res.data) {
        this.topicType = res.data;
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
    const getIdentifierTypes$ = this.isBrowsing ? this.objectLookupService.getBrowsingObjectIdentifierTypes() : this.objectLookupService.getObjectIdentifierTypes();
    getIdentifierTypes$.subscribe((res:any) => {
      if(res.data) {
        this.identifierType = res.data;
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
    const getDescriptionTypes$ = this.isBrowsing ? this.objectLookupService.getBrowsingDescriptionTypes() : this.objectLookupService.getDescriptionTypes();
    getDescriptionTypes$.subscribe((res: any) => {
      if(res.data) {
        this.descriptionType = res.data;
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
    this.showAccessDetails = parseInt(this.objectForm.value.accessTypeId) === arr[0].id ? false : true;
  }
  goToParentStudy(sdSid) {
    if (this.isBrowsing) {
      this.router.navigate([])
      .then(result => { window.open(`/browsing/studies/${sdSid}/view`, '_blank'); });
    } else {
      this.router.navigate([])
      .then(result => { window.open(`/studies/${sdSid}/view`, '_blank'); });  
    }
  }
  gotoTop() {
    window.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }
}
