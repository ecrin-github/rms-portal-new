import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { DtpService } from 'src/app/_rms/services/entities/dtp/dtp.service';
import { ProcessLookupService } from 'src/app/_rms/services/entities/process-lookup/process-lookup.service';
import KTWizard from '../../../../../assets/js/components/wizard'
import { CommonModalComponent } from '../../common-modal/common-modal.component';
import { ConfirmationWindow1Component } from '../../confirmation-window1/confirmation-window1.component';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { AddModalComponent } from '../../add-modal/add-modal.component';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {RedirectService} from './redirect-service';

@Component({
  selector: 'app-upsert-dtp',
  templateUrl: './upsert-dtp.component.html',
  styleUrls: ['./upsert-dtp.component.scss']
})
export class UpsertDtpComponent implements OnInit {
  form: UntypedFormGroup;
  preReqForm: UntypedFormGroup;
  objectEmbargoForm: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  organizationList:[] = [];
  statusList:[] = [];
  id: any;
  dtpData: any;
  @ViewChild('wizard', { static: true }) el: ElementRef;
  wizard: any;
  currentStatus: number = 2;
  associatedStudies = [];
  associatedObject = [];
  associatedUser = [];
  todayDate: any;
  submitted:boolean = false;
  nextStep: number;
  buttonClick: any;
  showStatus: boolean = false;
  showVariations: boolean = false;
  preRequTypes: [] = [];
  preRequisitData = [];
  accessTypes: [] = [];
  isEmbargoRequested = [];
  sticky: boolean = false;
  showButton: boolean = true;
  selectedSdSid: [] = [];
  accessStatusTypes: [] = [];
  dtpArr: any;
  studyList: [] = [];
  objectList: [] = [];
  role: any;
  showUploadButton: boolean = false;
  instanceArray = [];

  constructor( private router: Router, private fb: UntypedFormBuilder, private dtpService: DtpService, private spinner: NgxSpinnerService, private toastr: ToastrService,
    private activatedRoute: ActivatedRoute, private modalService: NgbModal, private commonLookup: CommonLookupService, private processLookup: ProcessLookupService,
    private listService: ListService, private pdfGeneratorService: PdfGeneratorService, private jsonGenerator: JsonGeneratorService,
               private dataObjectService: DataObjectService, private oidcSecurityService: OidcSecurityService, private http: HttpClient,
               private redirectService: RedirectService) {
    this.form = this.fb.group({
      orgId: ['', Validators.required],
      displayName: ['', Validators.required],
      statusId: '',
      initialContactDate: null,
      setUpCompleted: null,
      mdAccessGranted: null,
      mdCompleteDate: null,
      dtaAgreedDate: null,
      uploadAccessRequested: null,
      uploadAccessConfirmed: null,
      uploadsComplete: null,
      qcChecksCompleted: null,
      mdIntegratedWithMdr: null,
      availabilityRequested: null,
      availabilityConfirmed: null,
      conformsToDefaultChange: false,
      variations: '',
      dtaFilePath: '',
      repoSignatory1: '',
      repoSignatory2: '',
      providerSignatory1: '',
      providerSignatory2: '',
      notes: this.fb.array([])
    });
    this.preReqForm = this.fb.group({
      preRequisite: this.fb.array([])
    });
    this.objectEmbargoForm = this.fb.group({
      embargo: this.fb.array([])
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
    if(localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
    } 
    const todayDate = new Date();
    this.todayDate = {year: todayDate.getFullYear(), month: todayDate.getMonth()+1, day: todayDate.getDate()};
    this.getOrganization();
    this.getStatus();
    this.getStudyList();
    this.getObjectList();
    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;
    if (this.isEdit || this.isView) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getDtpPeople(this.id);
      this.getDtpById(this.id);
    }
    if (this.router.url.includes('add')) {
      this.form.patchValue({
        initialContactDate: this.todayDate
      })
    }
  }
  ngAfterViewInit() {
    this.wizard = new KTWizard(this.el.nativeElement, {
      startStep: 2,
      clickableSteps: false,
      navigation:true
    });
    //checing if all the dates are entered in the current phase before going to the next phase
    this.wizard.on('change', (wizardObj) => {
      this.nextStep = this.buttonClick === 'next' ? wizardObj.getStep() + 1 : wizardObj.getStep() - 1;
      if (!this.isView && this.buttonClick === 'next') {
        if (this.nextStep - 1 === 1) {
          if (this.form.value.initialContactDate === null || this.form.value.initialContactDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase')
          }
        }
        if (this.nextStep - 1 === 2) {
          if (this.form.value.setUpCompleted === null || this.form.value.setUpCompleted === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase')
          }
        }
        if (this.nextStep - 1 === 3) {
          if (this.form.value.mdAccessGranted === null || this.form.value.mdAccessGranted === '' || this.form.value.mdCompleteDate === null || this.form.value.mdCompleteDate === '' || this.form.value.dtaAgreedDate === null || this.form.value.dtaAgreedDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase')
          }
        }
        if (this.nextStep - 1 === 4) {
          if (this.form.value.uploadAccessRequested === null || this.form.value.uploadAccessRequested === '' ||
            this.form.value.uploadAccessConfirmed === null || this.form.value.uploadAccessConfirmed === '' || this.form.value.uploadsComplete === null || this.form.value.uploadsComplete === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase')
          }
        }
        if (this.nextStep - 1 === 5) {
          if (this.form.value.qcChecksCompleted === null || this.form.value.qcChecksCompleted === '' || this.form.value.mdIntegratedWithMdr === null || this.form.value.mdIntegratedWithMdr === ''
            || this.form.value.availabilityRequested === '' || this.form.value.availabilityRequested === null || this.form.value.availabilityConfirmed === '' || this.form.value.availabilityConfirmed === null) {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase')
          }
        }
      }
    });
  }
  notes(): UntypedFormArray {
   return this.form.get('notes') as UntypedFormArray;
  }
  newDtpNote(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      text: '',
      alreadyExist: false
    })
  }
  addDtpNote() {
    this.notes().push(this.newDtpNote());
  }
  patchNote(notes) {
    this.form.setControl('notes', this.patchNoteArray(notes));
  }
  patchNoteArray(notes): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    notes.forEach(note => {
      formArray.push(this.fb.group({
        id: note.id,
        text: note.text,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  getDtpNotes(id) {
    this.spinner.show();
    this.dtpService.getDtpNotes(id).subscribe((res:any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.patchNote(res.data);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  deleteDtpNote(i) {
    if (this.notes().value[i].alreadyExist) {
      this.spinner.show();
      this.dtpService.deleteDtpNote(this.notes().value[i].id, this.id).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 204) {
          this.toastr.success('Note deleted successfully');
          this.getDtpNotes(this.id);
        } else {
          this.toastr.error(res.messages[0])
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      this.notes().removeAt(i);
    }
  }
  saveDtpNote(note) {
    if (note.value.alreadyExist) {
      this.spinner.show();
      this.dtpService.editDtpNote(note.value.id, this.id, note.value).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Note updated successfully');
        } else {
          this.toastr.error(res.messages[0])
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      this.spinner.show();
      const payload = note.value;
      delete payload.id;
      this.dtpService.addDtpNote(this.id, 400002, payload).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Note added successfully');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
  }
  preReqs(): UntypedFormArray {
    return this.preReqForm.get('preRequisite') as UntypedFormArray
  }
  newPreReq(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      preRequisiteNotes: '',
      preRequisiteTypeId: '',
      sdOid: ''
    })
  }
 
  addPreReq() {
    const addModal = this.modalService.open(AddModalComponent, { size: 'lg', backdrop: 'static'});
    addModal.componentInstance.title = 'Add Pre-Requisite';
    addModal.componentInstance.dtpId = this.id;
    addModal.componentInstance.type = 'dtpPrereq';
    addModal.result.then((data) => {
      if (data) {
        this.getDtpById(this.id, 'isPreReq');
      }
    }, error => {})
  }
  patchPreReq(preReqs) {
    this.preReqForm.setControl('preRequisite', this.patchPreReqArray(preReqs));
  }
  patchPreReqArray(preReqs): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    preReqs.forEach(preReq => {
      formArray.push(this.fb.group({
        id: preReq.id,
        preRequisiteNotes: preReq.preRequisiteNotes,
        preRequisiteTypeId: preReq.preRequisiteTypeId,
        sdOid: preReq.sdOid
      }))
    });
    return formArray;
  }
  editPreReq(preReqsObject) {
    const payload = preReqsObject.value;
    this.spinner.show();
    this.dtpService.editDtpObjectPrereq(payload.id, payload.sdOid, this.id, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Pre-Requisite updated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  removePreReq(i) {
    const removeModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
    removeModal.componentInstance.type = 'objectPreReqDtp';
    removeModal.componentInstance.id = this.preReqs().value[i].id;
    removeModal.componentInstance.sdOid = this.preReqs().value[i].sdOid;
    removeModal.componentInstance.dtpId = this.id;
    removeModal.result.then((data) => {
      if (data) {
        this.getDtpById(this.id, 'isPreReq');
      }
    }, error => {})
  }
  embargos(): UntypedFormArray {
    return this.objectEmbargoForm.get('embargo') as UntypedFormArray
  }
  newEmbargo(): UntypedFormGroup{
    return this.fb.group({
      accessCheckStatusId: '',
      accessCheckBy: '',
      accessDetails: '',
      accessCheckDate: '',
      accessTypeId: '',
      downloadAllowed: '',
      dtpId: '',
      embargoRegime: '',
      embargoRequested: '',
      embargoStillApplies: '',
      id: '',
      sdOid: ''
    })
  }
  addEmbargo() {
    const embargoModal = this.modalService.open(AddModalComponent, {size: 'lg', backdrop: 'static'});
    embargoModal.componentInstance.title = 'Add Access details';
    embargoModal.componentInstance.dtpId = this.id;
    embargoModal.componentInstance.type = 'dtpEmbargo';
    embargoModal.result.then((data) => {
      if (data) {
        this.getDtpById(this.id, 'isEmbargo');
      }
    }, error => {})
  }
  patchEmbargo(embargos) {
    this.objectEmbargoForm.setControl('embargo', this.patchEmbargoArray(embargos))
  }
  patchEmbargoArray(embargos): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    embargos.forEach((embargo, index) => {
      formArray.push(this.fb.group({
        accessCheckStatusId: embargo.accessCheckStatusId,
        accessCheckBy: embargo.accessCheckBy,
        accessDetails: embargo.accessDetails,
        accessCheckDate: this.stringTodate(embargo.accessCheckDate),
        accessTypeId: embargo.accessTypeId,
        downloadAllowed: embargo.downloadAllowed,
        dtpId: embargo.dtpId,
        embargoRegime: embargo.embargoRegime,
        embargoRequested: embargo.embargoRequested,
        embargoStillApplies: embargo.embargoStillApplies,
        id: embargo.id,
        sdOid: embargo.sdOid
      }))
      this.isEmbargoRequested[index] = embargo.embargoRequested ? true : false;
    });
    return formArray;
  }
  onEmbargoChange(index) {
    this.isEmbargoRequested[index] = !this.isEmbargoRequested[index];
  }
  editEmbargo(embargoObject) {
    const payload = embargoObject.value;
    payload.accessCheckDate = this.dateToString(payload.accessCheckDate);
    this.spinner.show();
    this.dtpService.editDtpObject(payload.id, this.id, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Embargo updated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  removeEmbargo(i) {
    const removeModal = this.modalService.open(ConfirmationWindowComponent, {size:'lg', backdrop: 'static'});
    removeModal.componentInstance.type = 'objectEmbargo';
    removeModal.componentInstance.id = this.embargos().value[i].id;
    removeModal.componentInstance.dtpId = this.id;
    removeModal.result.then((data) => {
      if (data) {{
        this.getDtpById(this.id, 'isEmbargo');
      }}
    }, error => {});
  }
  getAccessType() {
    const getAccessType$ = this.processLookup.getRepoAccessTypes().subscribe((res: any) => {
      if(res.data) {
        this.accessTypes = res.data;
        this.getDtpById(this.id, 'isEmbargo');
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }

  get g() { return this.form.controls; }
  getOrganization() {
    this.spinner.show();
    this.commonLookup.getOrganizationList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.organizationList = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getStatus() {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.processLookup.getDtpStatusTypes().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.statusList = res.data;
        const arr: any = this.statusList.filter((item: any) => item.name === 'Set up');
        if (arr && arr.length) {
          this.form.patchValue({
            statusId: arr[0].id
          })
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getPrereqTypes() {
    this.processLookup.getPrereqTypes().subscribe((res: any) => {
      if (res) {
        this.preRequTypes = res.data;
        this.getDtpById(this.id, 'isPreReq');
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  getAccessCheckStauts() {
    this.processLookup.getObjectAccessTypes().subscribe((res: any) => {
      if (res) {
        this.accessStatusTypes = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findPrereqType(id) {
    const arr: any = this.preRequTypes.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : 'None';
  }
  findAccessType(id) {
    const arr: any = this.accessTypes.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : 'None';
  }
  findCheckSatus(id) {
    const arr: any = this.accessStatusTypes.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : 'None';
  }
  onClickControllTab() {
    this.getPrereqTypes();
  }
  onClickObjectAccessTab() {
    this.getAccessType();
    this.getAccessCheckStauts();
  }
  dateToString(date) {
    if (date) {
      if (date.month<10) {
        date.month = '0'+ date.month
      }
      if (date.day < 10) {
        date.day = '0' + date.day
      }
      const dateString =  date.year + '-' + date.month + '-' + date.day;
      return new Date(dateString).toISOString();
    } else {
      return null
    }
  }
  stringTodate(date) {
    const dateArray = new Date(date);
    return date ? { year: dateArray.getFullYear(), month: dateArray. getMonth()+1, day: dateArray. getDate()} : null;
  }
  viewDate(date) {
    const dateArray = new Date(date);
    return date ? dateArray.getFullYear() + '/' + (dateArray.getMonth()+1) + '/' + (dateArray.getDate()+1) : 'No Date Provided';
  }
  onSave() {
    //setting local storage to reload the dashboard page when adding or editing the dtp
    if (localStorage.getItem('updateDtpList')) {
      localStorage.removeItem('updateDtpList');
    }
    const payload = JSON.parse(JSON.stringify(this.form.value));
    payload.initialContactDate = this.dateToString(payload.initialContactDate);
    payload.setUpCompleted = this.dateToString(payload.setUpCompleted);
    payload.mdAccessGranted = this.dateToString(payload.mdAccessGranted);
    payload.mdCompleteDate = this.dateToString(payload.mdCompleteDate);
    payload.dtaAgreedDate = this.dateToString(payload.dtaAgreedDate);
    payload.uploadAccessRequested = this.dateToString(payload.uploadAccessRequested);
    payload.uploadAccessConfirmed = this.dateToString(payload.uploadAccessConfirmed);
    payload.uploadsComplete = this.dateToString(payload.uploadsComplete);
    payload.qcChecksCompleted = this.dateToString(payload.qcChecksCompleted);
    payload.mdIntegratedWithMdr = this.dateToString(payload.mdIntegratedWithMdr);
    payload.availabilityRequested = this.dateToString(payload.availabilityRequested);
    payload.availabilityConfirmed = this.dateToString(payload.availabilityConfirmed);
    //dynamically updating the status based on the filled in dates
    let status = ''
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '') {
      status = 'set up';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompleted !== null && this.form.value.setUpCompleted !== '') {
      status = 'preparation';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompleted !== null && this.form.value.setUpCompleted !== '' && this.form.value.mdAccessGranted !== null && this.form.value.mdAccessGranted !== '' && this.form.value.mdCompleteDate !== null && this.form.value.mdCompleteDate !== '' && this.form.value.dtaAgreedDate !== null && this.form.value.dtaAgreedDate !== '') {
      status = 'transfer';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompleted !== null && this.form.value.setUpCompleted !== '' && this.form.value.mdAccessGranted !== null && this.form.value.mdAccessGranted !== '' && this.form.value.mdCompleteDate !== null && this.form.value.mdCompleteDate !== '' && this.form.value.dtaAgreedDate !== null && this.form.value.dtaAgreedDate !== '' && this.form.value.uploadAccessRequested !== null && this.form.value.uploadAccessRequested !== '' &&
          this.form.value.uploadAccessConfirmed !== null && this.form.value.uploadAccessConfirmed !== '' && this.form.value.uploadsComplete !== null && this.form.value.uploadsComplete !== '') {
      status = 'checking';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompleted !== null && this.form.value.setUpCompleted !== '' && this.form.value.mdAccessGranted !== null && this.form.value.mdAccessGranted !== '' && this.form.value.mdCompleteDate !== null && this.form.value.mdCompleteDate !== '' && this.form.value.dtaAgreedDate !== null && this.form.value.dtaAgreedDate !== '' && this.form.value.uploadAccessRequested !== null && this.form.value.uploadAccessRequested !== '' &&
      this.form.value.uploadAccessConfirmed !== null && this.form.value.uploadAccessConfirmed !== '' && this.form.value.uploadsComplete !== null && this.form.value.uploadsComplete !== '' && this.form.value.qcChecksCompleted !== null && this.form.value.qcChecksCompleted !== '' && this.form.value.mdIntegratedWithMdr !== null && this.form.value.mdIntegratedWithMdr !== '' && this.form.value.availabilityRequested !== '' && this.form.value.availabilityRequested !== null && this.form.value.availabilityConfirmed !== '' && this.form.value.availabilityRequested !== null) {
      status = 'complete';
    }
    payload.statusId = this.getStatusByName(status);
    //checking if the entered dates are greater than the previous ones
    if (payload.initialContactDate > payload.setUpCompleted) {
      this.toastr.error('Initial contact date cannot be greater than Set Up completed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.setUpCompleted > payload.mdAccessGranted) {
      this.toastr.error('set Up completed date cannot be greater than MD Access Granted date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.mdAccessGranted > payload.mdCompleteDate) {
      this.toastr.error('MD Access Granted date cannot be greater than MD Completed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.mdCompleteDate > payload.dtaAgreedDate) {
      this.toastr.error('MD Completed date cannot be greater than DTA agreed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.dtaAgreedDate > payload.uploadAccessRequested) {
      this.toastr.error('DTA Agreed date cannot be greater than Upload Access Requested date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.uploadAccessRequested > payload.uploadAccessConfirmed) {
      this.toastr.error('Upload Access Requested date cannot be greater than Upload Access Confirmed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.uploadAccessConfirmed > payload.uploadsComplete) {
      this.toastr.error('Upload Confirmed date cannot be greater than Upload Completed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.uploadsComplete > payload.qcChecksCompleted) {
      this.toastr.error('Upload completed date cannot be greater than QC Checks Completed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.qcChecksCompleted > payload.mdIntegratedWithMdr) {
      this.toastr.error('QC Checks completed date cannot be greater than MD integrated with MDR date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.mdIntegratedWithMdr > payload.availabilityRequested) {
      this.toastr.error('MD integrated with MDR date cannot be greater than availability requested date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    if (payload.availabilityRequested > payload.availabilityConfirmed) {
      this.toastr.error('Availability Reuested date cannot be greater than Availability Confirmed date. Dates entered in one phase should not normally be before dtes in an earlier phase');
      return
    }
    this.submitted = true;
    if (this.form.valid) {
      if (this.isEdit) {
        this.spinner.show();
        payload.id = this.id;
        const editCoreDtp$ = this.dtpService.editDtp(this.id, payload);
        const editDta$ = this.dtpData.dtas.length ? this.dtpService.editDta(this.id, payload) : this.dtpService.addDta(this.id, payload);
        delete payload.notes;
        const combine$ = combineLatest([editCoreDtp$, editDta$]).subscribe(([coreDtpRes, dtaRes] : [any, any]) => {
          this.spinner.hide();
          if (coreDtpRes.statusCode === 200 && dtaRes.statusCode === 200) {
            this.toastr.success('DTP updated successfully');
            localStorage.setItem('updateDtpList', 'true');
            this.getDtpById(this.id);
            this.showStatus = false;
          } else {
            if (coreDtpRes.statusCode !== 200) {
              this.toastr.error(coreDtpRes.messages[0]);
            }
            if (dtaRes.statusCode !== 200) {
              this.toastr.error(dtaRes.messages[0])
            }
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);;
        })
      } else {
        this.spinner.show();
        this.dtpService.addDtp(payload).subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.toastr.success('DTP added successfully');
            localStorage.setItem('updateDtpList', 'true');
            setTimeout(() => {
              window.close();
            }, 1000);
            this.showStatus = false;
          } else {
            this.toastr.error(res.messages[0]);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      }
    }
  }
  getStatusByName(name) {
    const arr: any = this.statusList.filter((item: any) => item.name.toLowerCase() === name);
    return arr[0].id;
  }
  getDtpById(id, type?) {
    setTimeout(() => {
     this.spinner.show();; 
    });
    this.dtpService.getFullDtpById(id).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dtpData = res.data[0];
        this.patchForm(this.dtpData);
        if (type === 'isPreReq') {
          const preReqArray = (this.dtpData.dtpPrereqs.sort((a, b) => (a.sdOid > b.sdOid ? 1 : -1)))
          this.patchPreReq(preReqArray);
        }
        if (type === 'isEmbargo') {
          this.patchEmbargo(this.dtpData.dtpObjects)
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(data) {
    this.form.patchValue({
      orgId: data.coreDtp.orgId,
      displayName: data.coreDtp.displayName,
      statusId: data.coreDtp.statusId,
      initialContactDate: this.stringTodate(data.coreDtp.initialContactDate),
      setUpCompleted: this.stringTodate(data.coreDtp.setUpCompleted),
      mdAccessGranted: this.stringTodate(data.coreDtp.mdAccessGranted),
      mdCompleteDate: this.stringTodate(data.coreDtp.mdCompleteDate),
      dtaAgreedDate: this.stringTodate(data.coreDtp.dtaAgreedDate),
      uploadAccessRequested: this.stringTodate(data.coreDtp.uploadAccessRequested),
      uploadAccessConfirmed: this.stringTodate(data.coreDtp.uploadAccessConfirmed),
      uploadsComplete: this.stringTodate(data.coreDtp.uploadsComplete),
      qcChecksCompleted: this.stringTodate(data.coreDtp.qcChecksCompleted),
      mdIntegratedWithMdr: this.stringTodate(data.coreDtp.mdIntegratedWithMdr),
      availabilityRequested: this.stringTodate(data.coreDtp.availabilityRequested),
      availabilityConfirmed: this.stringTodate(data.coreDtp.availabilityConfirmed),
      conformsToDefaultChange: data.dtas[0]?.conformsToDefault,
      variations: data.dtas[0]?.variations,
      dtaFilePath: data.dtas[0]?.dtaFilePath,
      repoSignatory1: data.dtas[0]?.repoSignatory1,
      repoSignatory2: data.dtas[0]?.repoSignatory2,
      providerSignatory1: data.dtas[0]?.providerSignatory1,
      providerSignatory2: data.dtas[0]?.providerSignatory2
    });
    this.patchNote(data.dtpNotes);
    const arr: any = this.statusList.filter((item: any) => item.id === this.dtpData.coreDtp.statusId);
    if (arr && arr.length) {
      this.currentStatus = arr[0].name.toLowerCase() === 'creation' ? 1 : arr[0].name.toLowerCase() === 'set up' ? 2 : arr[0].name.toLowerCase() === 'preparation' ? 3 : arr[0].name.toLowerCase() === 'transfer' ? 4 : arr[0].name.toLowerCase() === 'checking' ? 5 : arr[0].name.toLowerCase() === 'complete' ? 6 : 1;
      this.wizard.goTo(this.currentStatus);
    }
    this.showVariations = data.dtas[0]?.conformsToDefault ? true : false;
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompleted !== null && this.form.value.setUpCompleted !== '' && this.form.value.mdAccessGranted !== null && this.form.value.mdAccessGranted !== '' && this.form.value.mdCompleteDate !== null && this.form.value.mdCompleteDate !== '' && this.form.value.dtaAgreedDate !== null && this.form.value.dtaAgreedDate !== '' && this.form.value.uploadAccessRequested !== null && this.form.value.uploadAccessRequested !== '' &&
      this.form.value.uploadAccessConfirmed !== null && this.form.value.uploadAccessConfirmed !== '' && this.form.value.uploadsComplete !== null && this.form.value.uploadsComplete !== '' && this.form.value.qcChecksCompleted !== null && this.form.value.qcChecksCompleted !== '' && this.form.value.mdIntegratedWithMdr !== null && this.form.value.mdIntegratedWithMdr !== '' && this.form.value.availabilityRequested !== '' && this.form.value.availabilityRequested !== null && this.form.value.availabilityConfirmed !== '' && this.form.value.availabilityRequested !== null) {
        this.showUploadButton = this.role === 'User' ? true : false;
    }

  }
  findOrganization(id) {
    const organizationArray: any = this.organizationList.filter((type: any) => type.orgId === id);
    return organizationArray && organizationArray.length ? organizationArray[0].name : ''
  }
  findStatus(id) {
    const statusArray: any = this.statusList.filter((type: any) => type.id === id);
    return statusArray && statusArray.length ? statusArray[0].name : '';
  }
  close() {
    // this.patchForm(this.dtpData);
    window.close();
  }
  addStudy() {
    const studyModal = this.modalService.open(CommonModalComponent, { size: 'xl', backdrop: 'static' });
    studyModal.componentInstance.title = 'Add Study';
    studyModal.componentInstance.type = 'study';
    studyModal.componentInstance.dtpId = this.id;
    if (this.associatedStudies.length) {
      const sdSidArray = [];
      this.associatedStudies.map((item: any) => {
        sdSidArray.push(item.sdSid);
      })
      studyModal.componentInstance.sdSidArray = sdSidArray.toString();
    }
    studyModal.result.then((data) => {
      if (data) {
        this.selectedSdSid = data;
        this.spinner.show();
        setTimeout(() => {
          this.spinner.hide();
          this.getDtpStudies(this.id);
          this.getDtpObjects(this.id);
        }, 3000);
      }
    }, error => {})
  }
  getDtpStudies(id) {
    this.dtpService.getDtpStudiesWfkn(id).subscribe((res: any) => {
      if (res) {
        this.associatedStudies = res.data ? res.data : [];
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  removeDtpStudy(id, sdSid) {
    this.commonLookup.objectInvolvement(sdSid).subscribe((res: any) => {
      if (res && res.data) {
        this.dtpArr = res.data.filter((item: any) => item.statType === 'DtpTotal');
      }
      if (this.dtpArr.length && this.dtpArr[0].statValue > 0) {
        this.toastr.error(`Objects linked to this study is linked to this DTP. So, delete the objects before deleting this study`);
      } else {
        this.dtpService.deleteDtpStudy(id, this.id).subscribe((res: any) => {
          this.toastr.success('Study has been disassociated successfully');
          this.getDtpStudies(this.id);
        }, error => {
          this.toastr.error(error.error.title);
        })
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDataObject() {
    const dataModal = this.modalService.open(CommonModalComponent, {size: 'xl', backdrop: 'static'});
    dataModal.componentInstance.title = 'Add Data Object';
    dataModal.componentInstance.type = 'dataObject';
    dataModal.componentInstance.dtpId = this.id;
    if (this.associatedStudies.length) {
      const sdSidArray = [];
      this.associatedStudies.map((item: any) => {
        sdSidArray.push(item.sdSid);
      })
      dataModal.componentInstance.sdSidArray = sdSidArray.toString();
    }
    dataModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.spinner.hide();
          this.getDtpObjects(this.id);
        }, 3000);
      }
    }, error => {});
  }
  getDtpObjects(id) {
    this.dtpService.getDtpObjectsWfkn(id).subscribe((res: any) => {
      if (res) {
        this.associatedObject = res.data ? res.data : [];
        this.associatedObject.map( (item, index) => {
          this.dataObjectService.getObjectInstances(item.sdOid).subscribe((res:any) => {
            console.log('object instances', res);
            this.instanceArray[index] = res.data;
            console.log('instarr', this.instanceArray);
          }, error => {
            this.toastr.error(error.error.title);
          })
        })
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  removeDtpObject(id) {
    this.dtpService.deleteDtpObject(id, this.id).subscribe((res: any) => {
      this.toastr.success('Data object has been disassociated successfully');
      this.getDtpObjects(this.id);
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addUser() {
    const userModal = this.modalService.open(CommonModalComponent, {size: 'xl', backdrop: 'static'});
    userModal.componentInstance.title = 'Add User';
    userModal.componentInstance.type = 'user';
    userModal.componentInstance.dtpId = this.id;
    userModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDtpPeople(this.id);
          this.spinner.hide();
        }, 3000);
      }
    }, error => {});
  }
  getDtpPeople(id) {
    this.dtpService.getDtpPeopleWfkn(id).subscribe((res: any) => {
      if (res) {
        this.associatedUser = res.data ? res.data : [];
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findPeopleById(id) {
    const arr: any = this.associatedUser.filter((item: any) => item.personId === id);
    return arr && arr.length ? arr[0].personName : 'None';
  }
  removeDtpUser(id) {
    this.dtpService.deleteDtpPerson(id, this.id).subscribe((res: any) => {
      this.toastr.success('User has been disassociated successfully');
      this.getDtpPeople(this.id);
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  printDocument() {
    const payload = JSON.parse(JSON.stringify(this.dtpData));
    payload.coreDtp.orgId = this.findOrganization(payload.coreDtp.orgId);
    payload.coreDtp.statusId = this.findStatus(payload.coreDtp.statusId);
    payload.coreDtp.initialContactDate = this.viewDate(payload.coreDtp.initialContactDate);
    payload.coreDtp.setUpCompleted = this.viewDate(payload.coreDtp.setUpCompleted);
    payload.coreDtp.mdAccessGranted = this.viewDate(payload.coreDtp.mdAccessGranted);
    payload.coreDtp.mdCompleteDate = this.viewDate(payload.coreDtp.mdCompleteDate);
    payload.coreDtp.dtaAgreedDate = this.viewDate(payload.coreDtp.dtaAgreedDate);
    payload.coreDtp.uploadAccessRequested = this.viewDate(payload.coreDtp.uploadAccessRequested);
    payload.coreDtp.uploadAccessConfirmed = this.viewDate(payload.coreDtp.uploadAccessConfirmed);
    payload.coreDtp.uploadsComplete = this.viewDate(payload.coreDtp.uploadsComplete);
    payload.coreDtp.qcChecksCompleted = this.viewDate(payload.coreDtp.qcChecksCompleted);
    payload.coreDtp.mdIntegratedWithMdr = this.viewDate(payload.coreDtp.mdIntegratedWithMdr);
    payload.coreDtp.availabilityRequested = this.viewDate(payload.coreDtp.availabilityRequested);
    payload.coreDtp.availabilityConfirmed = this.viewDate(payload.coreDtp.availabilityConfirmed);
    payload.dtas[0].repoSignatory1 = this.findPeopleById(payload.dtas[0].repoSignatory1);
    payload.dtas[0].repoSignatory2 = this.findPeopleById(payload.dtas[0].repoSignatory2);
    payload.dtas[0].providerSignatory1 = this.findPeopleById(payload.dtas[0].providerSignatory1);
    payload.dtas[0].providerSignatory2 = this.findPeopleById(payload.dtas[0].providerSignatory2);
    payload.dtpNotes.map(item => {
      item.author = this.findPeopleById(item.author);
      item.createdOn = this.viewDate(item.createdOn);
    })
    payload.dtpStudies.map(item => {
      item.studyName = this.findStudyById(item.sdSid);
    })
    payload.dtpObjects.map(item => {
      item.objectName  =  this.findObjectById(item.sdOid);
      item.accessTypeId = this.findAccessType(payload.accessTypeId);
      item.accessCheckStatusId = this.findCheckSatus(item.accessCheckStatusId);
      item.accessCheckBy = this.findPeopleById(item.accessCheckBy);
    });
    this.pdfGeneratorService.dtpPdfGenerator(payload, this.associatedUser);
  }
  jsonExport() {
    const payload = JSON.parse(JSON.stringify(this.dtpData));
    payload.coreDtp.orgId = this.findOrganization(payload.coreDtp.orgId);
    payload.coreDtp.statusId = this.findStatus(payload.coreDtp.statusId);
    payload.coreDtp.initialContactDate = this.viewDate(payload.coreDtp.initialContactDate);
    payload.coreDtp.setUpCompleted = this.viewDate(payload.coreDtp.setUpCompleted);
    payload.coreDtp.mdAccessGranted = this.viewDate(payload.coreDtp.mdAccessGranted);
    payload.coreDtp.mdCompleteDate = this.viewDate(payload.coreDtp.mdCompleteDate);
    payload.coreDtp.dtaAgreedDate = this.viewDate(payload.coreDtp.dtaAgreedDate);
    payload.coreDtp.uploadAccessRequested = this.viewDate(payload.coreDtp.uploadAccessRequested);
    payload.coreDtp.uploadAccessConfirmed = this.viewDate(payload.coreDtp.uploadAccessConfirmed);
    payload.coreDtp.uploadsComplete = this.viewDate(payload.coreDtp.uploadsComplete);
    payload.coreDtp.qcChecksCompleted = this.viewDate(payload.coreDtp.qcChecksCompleted);
    payload.coreDtp.mdIntegratedWithMdr = this.viewDate(payload.coreDtp.mdIntegratedWithMdr);
    payload.coreDtp.availabilityRequested = this.viewDate(payload.coreDtp.availabilityRequested);
    payload.coreDtp.availabilityConfirmed = this.viewDate(payload.coreDtp.availabilityConfirmed);
    payload.dtas[0].repoSignatory1 = this.findPeopleById(payload.dtas[0].repoSignatory1);
    payload.dtas[0].repoSignatory2 = this.findPeopleById(payload.dtas[0].repoSignatory2);
    payload.dtas[0].providerSignatory1 = this.findPeopleById(payload.dtas[0].providerSignatory1);
    payload.dtas[0].providerSignatory2 = this.findPeopleById(payload.dtas[0].providerSignatory2);
    payload.dtpNotes.map(item => {
      item.author = this.findPeopleById(item.author);
      item.createdOn = this.viewDate(item.createdOn);
    })
    payload.dtpStudies.map(item => {
      item.studyName = this.findStudyById(item.sdSid);
    })
    payload.dtpObjects.map(item => {
      item.objectName  =  this.findObjectById(item.sdOid);
      item.accessTypeId = this.findAccessType(payload.accessTypeId);
      item.accessCheckStatusId = this.findCheckSatus(item.accessCheckStatusId);
      item.accessCheckBy = this.findPeopleById(item.accessCheckBy);
    });
    this.jsonGenerator.jsonGenerator(payload, 'dtp');
  }
  resetAll() {
    const modal = this.modalService.open(ConfirmationWindow1Component, {size: 'lg', backdrop:'static'});
    modal.result.then((data) => {
      if (data) {
        this.showStatus = true;
      }
    }, error => {})
  }
  onChange() {
    //resetting the value when the status is changed
    const status = this.findStatus(parseInt(this.form.value.statusId));
    if (status.toLowerCase() === 'creation') {
      this.form.patchValue({
        setUpCompleted: null,
        mdAccessGranted: null,
        mdCompleteDate: null,
        dtaAgreedDate: null,
        uploadAccessRequested: null,
        uploadAccessConfirmed: null,
        uploadsComplete: null,
        qcChecksCompleted: null,
        mdIntegratedWithMdr: null,
        availabilityRequested: null,
        availabilityConfirmed: null,
      })
    }
    if (status.toLowerCase() === 'set up') {
      this.form.patchValue({
        setUpCompleted: null,
        mdAccessGranted: null,
        mdCompleteDate: null,
        dtaAgreedDate: null,
        uploadAccessRequested: null,
        uploadAccessConfirmed: null,
        uploadsComplete: null,
        qcChecksCompleted: null,
        mdIntegratedWithMdr: null,
        availabilityRequested: null,
        availabilityConfirmed: null,
      })
    }
    if (status.toLowerCase() === 'preparation') {
      this.form.patchValue({
        mdAccessGranted: null,
        mdCompleteDate: null,
        dtaAgreedDate: null,
        uploadAccessRequested: null,
        uploadAccessConfirmed: null,
        uploadsComplete: null,
        qcChecksCompleted: null,
        mdIntegratedWithMdr: null,
        availabilityRequested: null,
        availabilityConfirmed: null,
      })
    }
    if (status.toLowerCase() === 'transfer') {
      this.form.patchValue({
        uploadAccessRequested: null,
        uploadAccessConfirmed: null,
        uploadsComplete: null,
        qcChecksCompleted: null,
        mdIntegratedWithMdr: null,
        availabilityRequested: null,
        availabilityConfirmed: null,
      })
    }
    if (status.toLowerCase() === 'checking') {
      this.form.patchValue({
        qcChecksCompleted: null,
        mdIntegratedWithMdr: null,
        availabilityRequested: null,
        availabilityConfirmed: null,
      })
    }
    this.currentStatus = status.toLowerCase() === 'creation' ? 1 : status.toLowerCase() === 'set up' ? 2 : status.toLowerCase() === 'preparation' ? 3 : status.toLowerCase() === 'transfer' ? 4 : status.toLowerCase() === 'checking' ? 5 : status.toLowerCase() === 'complete' ? 6 : 1;
    this.wizard.goTo(this.currentStatus);
  }
  conformsToDefaultChange() {
    this.showVariations = this.form.value.conformsToDefaultChange ? true : false
  }
  getStudyList() {
    this.listService.getStudyList().subscribe((res: any) => {
      if (res && res.data) {
        this.studyList = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  getObjectList() {
    this.listService.getObjectList().subscribe((res: any) => {
      if (res && res.data) {
        this.objectList = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findStudyById(sdSid) {
    const arr: any = this.studyList.filter((item: any) => item.sdSid === sdSid);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  findObjectById(sdOid) {
    const arr: any = this.objectList.filter((item: any) => item.sdOid === sdOid);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  goToTsd(instance) {
    const userToken = this.oidcSecurityService.getAccessToken();

    const headers = new HttpHeaders();
    headers.set('Authorization', userToken);

    this.http.get(`https://api-v2.ecrin-rms.org/api/data-objects/${instance.sdOid}`, {headers}).subscribe(res => {
      // @ts-ignore
      const objectId = res['data'][0].id;
      this.redirectService.postRedirect(instance.id, objectId, userToken);
    });
  }
  goToDo(object) {
    console.log(object);
    this.router.navigate([`/data-objects/${object.sdOid}/edit`]);
  }

  protected readonly window = window;
}
