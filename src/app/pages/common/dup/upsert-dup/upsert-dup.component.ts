import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { combineLatest } from 'rxjs';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { ProcessLookupService } from 'src/app/_rms/services/entities/process-lookup/process-lookup.service';
import KTWizard from '../../../../../assets/js/components/wizard'
import { AddModalComponent } from '../../add-modal/add-modal.component';
import { CommonModalComponent } from '../../common-modal/common-modal.component';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { ConfirmationWindow1Component } from '../../confirmation-window1/confirmation-window1.component';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-upsert-dup',
  templateUrl: './upsert-dup.component.html',
  styleUrls: ['./upsert-dup.component.scss']
})
export class UpsertDupComponent implements OnInit {
  form: UntypedFormGroup;
  preReqForm: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  organizationList:[] = [];
  statusList:[] = [];
  id: any;
  dupData: any;
  @ViewChild('wizard', { static: true }) el: ElementRef;
  wizard: any;
  currentStatus: number = 2;
  associatedStudies: [] = [];
  associatedObjects: [] = [];
  associatedUser: [] = [];
  todayDate: any;
  submitted: boolean = false;
  nextStep: number;
  buttonClick: any;
  showStatus: boolean = false;
  showVariations: boolean = false;
  preRequTypes: [] = [];
  sticky: boolean = false;
  showButton: boolean = true;
  dupArr: any;
  studyList: [] = [];
  objectList: [] = [];
  role: any;
  showUploadButton: boolean = false;
  pageSize: Number = 10000;
  duaData: any;
  dupNotes: any;
  prereqs: any;

  constructor(private statesService: StatesService,
              private location: Location, 
              private router: Router, 
              private fb: UntypedFormBuilder, 
              private dupService: DupService, 
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService,
              private activatedRoute: ActivatedRoute, 
              private modalService: NgbModal, 
              private reuseService: ReuseService,
              private commonLookup: CommonLookupService, 
              private processLookup: ProcessLookupService, 
              private pdfGeneratorService: PdfGeneratorService,
              private jsonGenerator: JsonGeneratorService, 
              private listService: ListService) {
    this.form = this.fb.group({
      organisation: ['', Validators.required],
      displayName: ['', Validators.required],
      status: '',
      initialContactDate: null,
      setUpCompletedDate: null,
      prereqsMetDate: null,
      duaAgreedDate: null,
      availabilityRequestedDate: null,
      availabilityConfirmedDate: null,
      accessConfirmedDate: null,
      conformsToDefault: false,
      variations: '',
      repoIsProxyProvider: false,
      duaFilePath: '',
      repoSignatory1: '',
      repoSignatory2: '',
      providerSignatory1: '',
      providerSignatory2: '',
      requesterSignatory1: '',
      requesterSignatory2: '',
      notes: this.fb.array([])
    });
    this.preReqForm = this.fb.group({
      preRequisite: this.fb.array([])
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
    this.role = this.statesService.currentAuthRole;
    const todayDate = new Date();
    this.todayDate = {year: todayDate.getFullYear(), month: todayDate.getMonth()+1, day: todayDate.getDate()};
    this.getOrganization();
    this.getStatus();
    this.getStudyList();
    this.getObjectList();
    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;
    if(this.isEdit || this.isView) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getDupById(this.id);
      this.getDupPeople(this.id);
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
      navigation: true
    });
    this.wizard.on('change', (wizardObj) => {
      this.nextStep = this.buttonClick === 'next' ? wizardObj.getStep() + 1 : wizardObj.getStep() -1;
      if (!this.isView && this.buttonClick === 'next') {
        if (this.nextStep - 1 === 1) {
          if (this.form.value.initialContactDate === null || this.form.value.initialContactDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase');
          }
        }
        if (this.nextStep - 1 === 2) {
          if (this.form.value.setUpCompletedDate === null || this.form.value.setUpCompletedDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase');
          }
        }
        if (this.nextStep - 1 === 3) {
          if (this.form.value.prereqsMetDate === null || this.form.value.prereqsMetDate === '' || this.form.value.duaAgreedDate === null || this.form.value.duaAgreedDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase');
          }
        }
        if (this.nextStep - 1 === 4) {
          if (this.form.value.availabilityRequestedDate === null || this.form.value.availabilityRequestedDate === '' || this.form.value.availabilityConfirmedDate === null || this.form.value.availabilityConfirmedDate === '') {
            this.wizard.stop();
            this.toastr.error('Complete all the fields to go to the next phase');
          }
        }
      }
    })
  }
  notes(): UntypedFormArray {
    return this.form.get('notes') as UntypedFormArray;
  }
  newDupNote(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      dupId: '',
      text: '',
      alreadyExist: false
    })
  }
  addDupNote() {
    this.notes().push(this.newDupNote());
  }
  patchNote(notes) {
    this.form.setControl('notes', this.patchNoteArray(notes));
  }
  patchNoteArray(notes): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    notes.forEach(note => {
      formArray.push(this.fb.group({
        id: note.id,
        dupId: note.dupId,
        text: note.text,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  getDupNotes(id) {
    this.spinner.show();
    this.dupService.getDupNotes(id).subscribe((res:any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.patchNote(res.results);
        this.dupNotes = res.results;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  deleteDupNote(i) {
    if (this.notes().value[i].alreadyExist) {
      this.spinner.show();
      this.dupService.deleteDupNote(this.notes().value[i].id, this.id).subscribe((res: any) => {
        this.spinner.hide();
        // if(res.statusCode === 204) {
          this.toastr.success('Note deleted successfully');
          this.getDupNotes(this.id);
        // } else {
        //   this.toastr.error(res.messages[0]);
        // }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      this.notes().removeAt(i);
    }
  }
  saveDupNote(note) {
    if (note.value.alreadyExist) {
      this.spinner.show();
      this.dupService.editDupNote(note.value.id, this.id, note.value).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Note updated successfully');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      this.spinner.show();
      const payload = note.value;
      payload.dupId = this.id;
      this.dupService.addDupNote(this.id, payload).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 201) {
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
  getPrereqTypes() {
    this.processLookup.getPrereqTypes(this.pageSize).subscribe((res: any) => {
      if (res) {
        this.preRequTypes = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findPrereqType(id) {
    const arr: any = this.preRequTypes.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].name : '';
  }
  onClickControllTab() {
    this.getPrereqTypes();
    this.getDupById(this.id, 'isPreReq');
  }
  preReqs(): UntypedFormArray {
    return this.preReqForm.get('preRequisite') as UntypedFormArray;
  }
  newPreReq(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      prereqType: '',
      prereqNotes: '',
      prereqMet: '',
      notes: '',
      objectId: ''
    })
  }
  addPreReq() {
    const addModal = this.modalService.open(AddModalComponent, { size: 'lg', backdrop: 'static' });
    addModal.componentInstance.title = 'Add Pre-Requisite';
    addModal.componentInstance.dupId = this.id;
    addModal.componentInstance.type = 'dupPrereq';
    addModal.result.then((data) => {
      if (data) {
        this.getDupById(this.id, 'isPreReq');
      }
    }, error => { })
  }
  patchPreReq(preReqs) {
    this.preReqForm.setControl('preRequisite', this.patchPreReqArray(preReqs))
  }
  patchPreReqArray(preReqs): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    preReqs.forEach(preReq => {
      formArray.push(this.fb.group({
        id: preReq.id,
        prereqType: preReq.prereqType ? preReq.prereqType.id : null,
        prereqNotes: preReq.prereqNotes,
        prereqMet: this.stringTodate(preReq.prereqMet),
        notes: preReq.notes,
        objectId: preReq.objectId
      }))
    });
    return formArray;
  }
  editPreReq(preReqsObject) {
    const payload = preReqsObject.value;
    payload.prereqMet = this.dateToString(payload.prereqMet);
    this.spinner.show();
    this.dupService.editDupObjectPrereq(payload.id, this.id, payload).subscribe((res: any) => {
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
    removeModal.componentInstance.type = 'objectPreReqDup';
    removeModal.componentInstance.id = this.preReqs().value[i].id;
    removeModal.componentInstance.objectId = this.preReqs().value[i].objectId;
    removeModal.componentInstance.dupId = this.id;
    removeModal.result.then((data) => {
      if (data) {
        this.getDupById(this.id, 'isPreReq');
      }
    }, error => {})
  }
  get g() { return this.form.controls; }

  getOrganization() {
    this.spinner.show();
    this.commonLookup.getOrganizationList(this.pageSize).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.organizationList = res.results;
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
    this.processLookup.getDupStatusTypes().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.statusList = res.results;
        const arr: any = this.statusList.filter((item: any) => item.name === 'Set up');
        if (arr && arr.length) {
          this.form.patchValue({
            status: arr[0].id
          })
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
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
    if (localStorage.getItem('updateDupList')) {
      localStorage.removeItem('updateDupList');
    }
    const payload = JSON.parse(JSON.stringify(this.form.value));
    payload.initialContactDate = this.dateToString(payload.initialContactDate);
    payload.setUpCompletedDate = this.dateToString(payload.setUpCompletedDate);
    payload.prereqsMetDate = this.dateToString(payload.prereqsMetDate);
    payload.duaAgreedDate = this.dateToString(payload.duaAgreedDate);
    payload.availabilityRequestedDate = this.dateToString(payload.availabilityRequestedDate);
    payload.availabilityConfirmedDate = this.dateToString(payload.availabilityConfirmedDate);
    payload.accessConfirmedDate = this.dateToString(payload.accessConfirmedDate);
    let status = '';
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '') {
      status = 'set up';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompletedDate !== null && this.form.value.setUpCompletedDate !== '') {
      status = 'preparation';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompletedDate !== null && this.form.value.setUpCompletedDate !== '' && this.form.value.prereqsMetDate !== null && this.form.value.prereqsMetDate !== '' && 
    this.form.value.duaAgreedDate !== null && this.form.value.duaAgreedDate !== '') {
      status = 'checking';
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompletedDate !== null && this.form.value.setUpCompletedDate !== '' && this.form.value.prereqsMetDate !== null && this.form.value.prereqsMetDate !== '' &&
    this.form.value.duaAgreedDate !== null && this.form.value.duaAgreedDate !== '' && this.form.value.availabilityRequestedDate !== null && this.form.value.availabilityRequestedDate !== '' && this.form.value.availabilityConfirmedDate !== null && this.form.value.availabilityConfirmedDate !== '') {
      status = 'complete';
    }
    payload.status = this.getStatusByName(status);
    if (payload.initialContactDate > payload.setUpCompletedDate) {
      this.toastr.error('Initial Contact Date cannot be greater than Set Up Completed date');
      return;
    }
    if (payload.setUpCompletedDate > payload.prereqsMetDate) {
      this.toastr.error('Set Up Completed date cannot be greater than PreRequest Met date');
      return;
    }
    if (payload.prereqsMetDate > payload.duaAgreedDate) {
      this.toastr.error('Prereqs Met date cannot be greater than DUA Agreed date');
      return;
    }
    if (payload.duaAgreedDate > payload.availabilityRequestedDate) {
      this.toastr.error('DUA Agreed date cannot be greater than Availability Requested date');
      return;
    }
    if (payload.availabilityRequestedDate > payload.availabilityConfirmedDate) {
      this.toastr.error('Availability Reuested date cannot be greater than Availability Confirmed');
      return;
    }
    if (payload.availabilityConfirmedDate > payload.accessConfirmedDate) {
      this.toastr.error('Availability Confirmed date cannot be greater than Access Confirmed date');
      return;
    }
    this.submitted = true;
    if (this.form.valid) {
      if (this.isEdit) {
        payload.dupId = this.id;
        this.spinner.show();
        const editCoreDup$ = this.dupService.editDup(this.id, payload);
        const editDua$ = this.duaData?.length ? this.dupService.editDua(this.id, this.duaData[0].id, payload) : this.dupService.addDua(this.id, payload);
        delete payload.notes;
        const combine$ = combineLatest([editCoreDup$, editDua$]).subscribe(([coreDupRes, duaRes] : [any, any]) => {
          this.spinner.hide();
          if (coreDupRes.statusCode === 200 && duaRes.statusCode === 200) {
            this.toastr.success('DUP updated successfully');
            localStorage.setItem('updateDupList', 'true');
            this.getDupById(this.id);
            this.showStatus = false;
            this.reuseService.notifyComponents();
            this.back();
          } else {
            if (coreDupRes.statusCode !== 200) {
              this.toastr.error(coreDupRes.messages[0]);
            }
            if (duaRes.statusCode !== 200) {
              this.toastr.error(duaRes.messages[0]);
            }
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      } else {
        this.spinner.show();
        this.dupService.addDup(payload).subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 201) {
            this.toastr.success('DUP added successfully');
            localStorage.setItem('updateDupList', 'true');
            this.showStatus = false;
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
    }
  }
  getStatusByName(name) {
    const arr: any = this.statusList.filter((item: any) => item.name.toLowerCase() === name);
    return arr[0].id;
  }
  getDupById(id, type?) {
    setTimeout(() => {
     this.spinner.show(); 
    });
    this.dupService.getDupById(id).subscribe((res: any) => {
      this.spinner.hide();
      if (res) {
        this.dupData = res;
        this.patchForm(this.dupData);
        this.getDupNotes(res.id);
        this.dupService.getDua(res.id).subscribe((res: any) => {
          if (res && res.results) {
            this.duaData = res.results;
            this.patchDua(this.duaData);
          }
        }, error => {
          console.log('error', error);
        })
        if (type === 'isPreReq') {
          this.dupService.getDupObjectPrereqs(res.id).subscribe((res: any) => {
            if (res && res.results) {
              this.prereqs = res.results;
              const preReqArray = (this.prereqs.sort((a, b) => (a.objectId > b.objectId ? 1 : -1)))
              this.patchPreReq(preReqArray);    
            }
          }, error => {
            console.log('error', error);
          })
        }
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(data) {
    this.form.patchValue({
      organisation: data.organisation ? data.organisation.id : null,
      displayName: data.displayName,
      status: data.status ? data.status.id : null,
      initialContactDate: this.stringTodate(data.initialContactDate),
      setUpCompletedDate: this.stringTodate(data.setUpCompletedDate),
      prereqsMetDate: this.stringTodate(data.prereqsMetDate),
      duaAgreedDate: this.stringTodate(data.duaAgreedDate),
      availabilityRequestedDate: this.stringTodate(data.availabilityRequestedDate),
      availabilityConfirmedDate: this.stringTodate(data.availabilityConfirmedDate),
      accessConfirmedDate: this.stringTodate(data.accessConfirmedDate),
    });
    // this.patchNote(data.dupNotes);
    const arr: any = this.statusList.filter((item: any) => item.id === this.dupData.status.id);
    if (arr && arr.length) {
      this.currentStatus = arr[0].name.toLowerCase() === 'creation' ? 1 : arr[0].name.toLowerCase() === 'set up' ? 2 : arr[0].name.toLowerCase() === 'preparation' ? 3 : arr[0].name.toLowerCase() === 'checking' ? 4 : arr[0].name.toLowerCase() === 'complete' ? 5 : 1;
      this.wizard.goTo(this.currentStatus);
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompletedDate !== null && this.form.value.setUpCompletedDate !== '' && this.form.value.prereqsMetDate !== null && this.form.value.prereqsMetDate !== '' &&
    this.form.value.duaAgreedDate !== null && this.form.value.duaAgreedDate !== '' && this.form.value.availabilityRequestedDate !== null && this.form.value.availabilityRequestedDate !== '' && this.form.value.availabilityConfirmedDate !== null && this.form.value.availabilityConfirmedDate !== '') {
      this.showUploadButton = this.role === 'User' ? true : false;
    }
  }
  patchDua(data) {
    this.form.patchValue({
      variations: data[0]?.variations,
      conformsToDefault: data[0]?.conformsToDefault,
      repoIsProxyProvider: data[0]?.repoIsProxyProvider,
      duaFilePath: data[0]?.duaFilePath,
      repoSignatory1: data[0]?.repoSignatory1?.id,
      repoSignatory2: data[0]?.repoSignatory2?.id,
      providerSignatory1: data[0]?.providerSignatory1?.id,
      providerSignatory2: data[0]?.providerSignatory2?.id,
      requesterSignatory1: data[0]?.requesterSignatory1?.id,
      requesterSignatory2: data[0]?.requesterSignatory2?.id,
    });
    this.showVariations = data[0]?.conformsToDefault ? true : false;
  }
  findOrganization(id) {
    const organizationArray: any = this.organizationList.filter((type: any) => type.id === id);
    return organizationArray && organizationArray.length ? organizationArray[0].defaultName : 'None'
  }
  findStatus(id) {
    const statusArray: any = this.statusList.filter((type: any) => type.id === id);
    return statusArray && statusArray.length ? statusArray[0].name : 'None';
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
  addStudy() {
    const studyModal = this.modalService.open(CommonModalComponent, { size: 'xl', backdrop: 'static' });
    studyModal.componentInstance.title = 'Add Study';
    studyModal.componentInstance.type = 'study';
    studyModal.componentInstance.dupId = this.id;
    if (this.associatedStudies.length) {
      const sdSidArray = [];
      this.associatedStudies.map((item: any) => {
        sdSidArray.push(item.studyId);
      })
      studyModal.componentInstance.sdSidArray = sdSidArray.toString();
    }
    studyModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDupStudies(this.id);
          this.getDupObjects(this.id);
          this.spinner.hide();
        }, 3000);
      }
    }, error => {});
  }
  getDupStudies(id) {
    this.dupService.getDupStudies(id).subscribe((res: any) => {
      if (res) {
        this.associatedStudies = res.results ? res.results : [];
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  removeDupStudy(id, sdSid) {
    this.commonLookup.objectInvolvementDup(this.id, sdSid).subscribe((res: any) => {
      if (res.studyAssociated && res.objectsAssociated) {
        this.toastr.error(`Objects linked to this study is linked to this DUP. So, delete the objects before deleting this study`)
      } else {
        this.dupService.deleteDupStudy(id, this.id).subscribe((res: any) => {
          this.toastr.success('Study has been disassociated successfully');
          this.getDupStudies(this.id);
        }, error => {
          this.toastr.error(error.error.title);
        })
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDataObject() {
    const dataModal = this.modalService.open(CommonModalComponent, { size: 'xl', backdrop: 'static' });
    dataModal.componentInstance.title = 'Add Data Object';
    dataModal.componentInstance.type = 'dataObject';
    dataModal.componentInstance.dupId = this.id;
    if (this.associatedStudies.length) {
      const sdSidArray = [];
      this.associatedStudies.map((item: any) => {
        sdSidArray.push(item.studyId);
      })
      dataModal.componentInstance.sdSidArray = sdSidArray.toString();
    }
    dataModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDupObjects(this.id);
          this.spinner.hide();
        }, 3000);
      }
    }, error => { })
  }
  getDupObjects(id) {
    this.dupService.getDupObjects(id).subscribe((res: any) => {
      if (res) {
        this.associatedObjects = res.results ? res.results : [];
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  removeDupObject(id) {
    this.dupService.deleteDupObject(id, this.id).subscribe((res: any) => {
      this.toastr.success('Data object has been disassociated successfully');
      this.getDupObjects(this.id);
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addUser() {
    const userModal = this.modalService.open(CommonModalComponent, {size: 'xl', backdrop: 'static'});
    userModal.componentInstance.title = 'Add User';
    userModal.componentInstance.type = 'user';
    userModal.componentInstance.dupId = this.id;
    userModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDupPeople(this.id);
          this.spinner.hide();
        }, 3000);
      }
    }, error => {})
  }
  getDupPeople(id) {
    this.dupService.getDupPeople(id).subscribe((res: any) => {
      if (res) {
        this.associatedUser = res.results ? res.results : [];
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findPeopleById(id) {
    const arr: any = this.associatedUser.filter((item: any) => item.person?.id === id);
    return arr && arr.length ? arr[0].person?.firstName + ' ' + arr[0].person.lastName : 'None';
  }
  removeDupUser(id) {
    this.dupService.deleteDupPerson(id, this.id).subscribe((res: any) => {
      this.toastr.success('User has been disassociated successfully');
      this.getDupPeople(this.id);
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  resetAll() {
    const modal = this.modalService.open(ConfirmationWindow1Component, {size: 'lg', backdrop:'static'});
    modal.result.then((data) => {
      if (data) {
        this.showStatus = true;
      }
    }, error => {});
  }
  onChange() {
    const status = this.findStatus(parseInt(this.form.value.status));
    if (status.toLowerCase() === 'creation') {
      this.form.patchValue({
        setUpCompletedDate: null,
        prereqsMetDate: null,
        duaAgreedDate: null,
        availabilityRequestedDate: null,
        availabilityConfirmedDate: null,
        accessConfirmedDate: null,
      })
    }
    if (status.toLowerCase() === 'set up') {
      this.form.patchValue({
        setUpCompletedDate: null,
        prereqsMetDate: null,
        duaAgreedDate: null,
        availabilityRequestedDate: null,
        availabilityConfirmedDate: null,
        accessConfirmedDate: null,
      })
    }
    if (status.toLowerCase() === 'preparation') {
      this.form.patchValue({
        prereqsMetDate: null,
        duaAgreedDate: null,
        availabilityRequestedDate: null,
        availabilityConfirmedDate: null,
        accessConfirmedDate: null,
      })
    }
    if (status.toLowerCase() === 'checking') {
      this.form.patchValue({
        availabilityRequestedDate: null,
        availabilityConfirmedDate: null,
        accessConfirmedDate: null,
      })
    }
    if (status.toLowerCase() === 'complete') {
      this.form.patchValue({
        accessConfirmedDate: null,
      })
    }
    this.currentStatus = status.toLowerCase() === 'creation' ? 1 : status.toLowerCase() === 'set up' ? 2 : status.toLowerCase() === 'preparation' ? 3 : status.toLowerCase() === 'checking' ? 4 : status.toLowerCase() === 'complete' ? 5 : 1;
    this.wizard.goTo(this.currentStatus);
  }
  conformsToDefaultChange() {
    this.showVariations = this.form.value.conformsToDefault ? true : false
  }
  printDocument() {
    const payload = JSON.parse(JSON.stringify(this.dupData));
    payload.coreDup.organisation = this.findOrganization(payload.coreDup.organisation);
    payload.coreDup.status = this.findStatus(payload.coreDup.status);
    payload.coreDup.initialContactDate = this.viewDate(payload.coreDup.initialContactDate);
    payload.coreDup.setUpCompletedDate = this.viewDate(payload.coreDup.setUpCompletedDate);
    payload.coreDup.prereqsMetDate = this.viewDate(payload.coreDup.prereqsMetDate);
    payload.coreDup.duaAgreedDate = this.viewDate(payload.coreDup.duaAgreedDate);
    payload.coreDup.availabilityRequestedDate = this.viewDate(payload.coreDup.availabilityRequestedDate);
    payload.coreDup.availabilityConfirmedDate = this.viewDate(payload.coreDup.availabilityConfirmedDate);
    payload.coreDup.accessConfirmedDate = this.viewDate(payload.coreDup.accessConfirmedDate);
    payload.duas[0].repoSignatory1 = this.findPeopleById(payload.duas[0].repoSignatory1);
    payload.duas[0].repoSignatory2 = this.findPeopleById(payload.duas[0].repoSignatory2);
    payload.duas[0].providerSignatory1 = this.findPeopleById(payload.duas[0].providerSignatory1);
    payload.duas[0].providerSignatory2 = this.findPeopleById(payload.duas[0].providerSignatory2);
    payload.duas[0].requesterSignatory1 = this.findPeopleById(payload.duas[0].requesterSignatory1);
    payload.duas[0].requesterSignatory2 = this.findPeopleById(payload.duas[0].requesterSignatory2);

    payload.dupNotes.map(item => {
      item.author = this.findPeopleById(item.author);
      item.createdOn = this.viewDate(item.createdOn);
    });
    payload.dupObjects.map(item => {
      item.objectName = this.findObjectById(item.objectId);
    });
    payload.dupStudies.map(item => {
      item.studyName = this.findStudyById(item.sdSid);
    });
    this.pdfGeneratorService.dupPdfGenerator(payload, this.associatedUser);
  }
  jsonExport() {
    const payload = JSON.parse(JSON.stringify(this.dupData));
    payload.coreDup.organisation = this.findOrganization(payload.coreDup.organisation);
    payload.coreDup.status = this.findStatus(payload.coreDup.status);
    payload.coreDup.initialContactDate = this.viewDate(payload.coreDup.initialContactDate);
    payload.coreDup.setUpCompletedDate = this.viewDate(payload.coreDup.setUpCompletedDate);
    payload.coreDup.prereqsMetDate = this.viewDate(payload.coreDup.prereqsMetDate);
    payload.coreDup.duaAgreedDate = this.viewDate(payload.coreDup.duaAgreedDate);
    payload.coreDup.availabilityRequestedDate = this.viewDate(payload.coreDup.availabilityRequestedDate);
    payload.coreDup.availabilityConfirmedDate = this.viewDate(payload.coreDup.availabilityConfirmedDate);
    payload.coreDup.accessConfirmedDate = this.viewDate(payload.coreDup.accessConfirmedDate);
    payload.duas[0].repoSignatory1 = this.findPeopleById(payload.duas[0].repoSignatory1);
    payload.duas[0].repoSignatory2 = this.findPeopleById(payload.duas[0].repoSignatory2);
    payload.duas[0].providerSignatory1 = this.findPeopleById(payload.duas[0].providerSignatory1);
    payload.duas[0].providerSignatory2 = this.findPeopleById(payload.duas[0].providerSignatory2);
    payload.duas[0].requesterSignatory1 = this.findPeopleById(payload.duas[0].requesterSignatory1);
    payload.duas[0].requesterSignatory2 = this.findPeopleById(payload.duas[0].requesterSignatory2);

    payload.dupNotes.map(item => {
      item.author = this.findPeopleById(item.author);
      item.createdOn = this.viewDate(item.createdOn);
    });
    payload.dupObjects.map(item => {
      item.objectName = this.findObjectById(item.objectId);
    });
    payload.dupStudies.map(item => {
      item.studyName = this.findStudyById(item.sdSid);
    });
    this.jsonGenerator.jsonGenerator(payload, 'dup');
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
  findStudyById(studyId) {
    const arr: any = this.studyList.filter((item: any) => item.studyId === studyId);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  findObjectById(objectId) {
    const arr: any = this.objectList.filter((item: any) => item.objectId === objectId);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  goToTsd() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.tsd.usit.no/', '_blank'); });
}

}
