import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, combineLatest, of } from 'rxjs';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { JsonGeneratorService } from 'src/app/_rms/services/entities/json-generator/json-generator.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PdfGeneratorService } from 'src/app/_rms/services/entities/pdf-generator/pdf-generator.service';
import { ProcessLookupService } from 'src/app/_rms/services/entities/process-lookup/process-lookup.service';
import KTWizard from '../../../../../assets/js/components/wizard'
import { CommonModalComponent } from '../../common-modal/common-modal.component';
import { ConfirmationWindow1Component } from '../../confirmation-window1/confirmation-window1.component';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';
import { BackService } from 'src/app/_rms/services/back/back.service';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { catchError, finalize, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-upsert-dup',
  templateUrl: './upsert-dup.component.html',
  styleUrls: ['./upsert-dup.component.scss'],
  providers: [ScrollService]
})
export class UpsertDupComponent implements OnInit {
  form: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  organizationList:[] = [];
  statusList:[] = [];
  id: any;
  dupData: any;
  @ViewChild('wizard', { static: true }) el: ElementRef;
  wizard: any;
  currentStatus: number = 2;
  sliceLength = 100;
  associatedStudies: any = [];
  associatedObjects: any = [];
  associatedUsers: any = [];
  todayDate: any;
  submitted: boolean = false;
  nextStep: number;
  buttonClick: any;
  showStatus: boolean = false;
  showVariations: boolean = false;
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
  prereqs: any[] = [];
  dataObjectIds: any;

  constructor(private statesService: StatesService,
              private backService: BackService,
              private scrollService: ScrollService,
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
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.show(); 
    });

    this.role = this.statesService.currentAuthRole;
    this.id = this.activatedRoute.snapshot.params.id;
    const todayDate = new Date();
    this.todayDate = {year: todayDate.getFullYear(), month: todayDate.getMonth()+1, day: todayDate.getDate()};

    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;

    if (this.isView) {
      this.scrollService.handleScroll([`/data-use/${this.id}/view`]);
    }
    if (this.router.url.includes('add')) {
      this.form.patchValue({
        initialContactDate: this.todayDate
      });
    }

    let queryFuncs: Array<Observable<any>> = [];

    // Note: be careful if you add new observables because of the way their result is retrieved later (combineLatest + pop)
    // The code is built like this because in the version of RxJS used here combineLatest does not handle dictionaries
    if (this.isEdit || this.isView) {
      queryFuncs.push(this.getDupObjectsAndPrereqs(this.id));
      queryFuncs.push(this.getDupNotes(this.id));
      queryFuncs.push(this.getDupPeople(this.id));
      queryFuncs.push(this.getDupStudies(this.id));
      queryFuncs.push(this.getDua(this.id));
      queryFuncs.push(this.getDupById(this.id));
    }

    queryFuncs.push(this.getObjectList());
    queryFuncs.push(this.getStudyList());
    queryFuncs.push(this.getStatus());
    queryFuncs.push(this.getOrganisation());

    let obsArr: Array<Observable<any>> = [];
    queryFuncs.forEach((funct) => {
      obsArr.push(funct.pipe(catchError(error => of(this.toastr.error(error.error.title)))));
    });

    combineLatest(obsArr).subscribe(res => {
      this.setOrganisation(res.pop());
      this.setStatus(res.pop());
      this.setStudyList(res.pop());
      this.setObjectList(res.pop());

      if (this.isEdit || this.isView) {
        this.setDupById(res.pop());
        this.setDua(res.pop());
        this.setDupStudies(res.pop());
        this.setDupPeople(res.pop());
        this.setDupNotes(res.pop());
        // getDupObjectsAndPrereqs doesn't return a value
      }

      setTimeout(() => {
        this.spinner.hide(); 
      });
    });
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
      dupId: '',
      text: '',
      alreadyExist: false,
      author: this.statesService.currentUser,
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
        alreadyExist: true,
        author: note.author
      }))
    });
    return formArray;
  }

  getDupNotes(id) {
    return this.dupService.getDupNotes(id);
  }

  setDupNotes(res) {
    if (res?.results) {
      this.patchNote(res.results);
      this.dupNotes = res.results;
    }
  }

  deleteDupNote(i) {
    if (this.notes().value[i].alreadyExist) {
      this.spinner.show();
      this.dupService.deleteDupNote(this.notes().value[i].id, this.id).subscribe((res: any) => {
        this.getDupNotes(this.id).subscribe((res) => {
          this.setDupNotes(res);
          this.toastr.success('Note deleted successfully');
          this.spinner.hide();
        });
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      this.notes().removeAt(i);
    }
  }
  saveDupNote(note) {
    // fix error of editing right after adding
    this.spinner.show();
    const payload = {
      'id': note.value.id,
      'author': note.value.author?.id ? note.value.author.id : note.value.author,
      'text': note.value.text,
      'createdOn': note.value.createdOn,
      'dupId': note.value.dupId,
    };
    if (note.value.alreadyExist) {
      this.dupService.editDupNote(payload.id, this.id, payload).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Note updated successfully');
        } else {
          this.toastr.error(res.messages[0]);
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    } else {
      payload.dupId = this.id;
      this.dupService.addDupNote(this.id, payload).subscribe((res: any) => {
        note.value.alreadyExist = true;
        if (res.statusCode === 201) {
          note.value.id = res?.id;
          note.value.dupId = res?.dupId;
          this.toastr.success('Note added successfully');
        } else {
          this.toastr.error(res.messages[0]);
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
  }
  
  get g() { return this.form.controls; }

  getOrganisation() {
    return this.commonLookup.getOrganizationList(this.pageSize);
  }

  setOrganisation(res) {
    if (res?.results) {
      this.organizationList = res.results;
    }
  }

  getStatus() {
    return this.processLookup.getDupStatusTypes();
  }

  setStatus(res) {
    if (res?.results) {
      this.statusList = res.results;
      const arr: any = this.statusList.filter((item: any) => item.name === 'Set up');
      if (arr && arr.length) {
        this.form.patchValue({
          status: arr[0].id
        })
      }
    }
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
  stringToDate(date) {
    const dateArray = new Date(date);
    return date ? { year: dateArray.getFullYear(), month: dateArray.getMonth()+1, day: dateArray.getDate()} : null;
  }
  viewDate(date) {
    const dateArray = new Date(date);
    return date ? dateArray.getFullYear() + '/' 
        + (dateArray.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + '/' 
        + (dateArray.getDate()).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) : 'No Date Provided';
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

    if (payload.repoSignatory1?.id) {
      payload.repoSignatory1 = payload.repoSignatory1.id;
    }
    if (payload.repoSignatory2?.id) {
      payload.repoSignatory2 = payload.repoSignatory2.id;
    }
    if (payload.providerSignatory1?.id) {
      payload.providerSignatory1 = payload.providerSignatory1.id;
    }
    if (payload.providerSignatory2?.id) {
      payload.providerSignatory2 = payload.providerSignatory2.id;
    }
    if (payload.requesterSignatory1?.id) {
      payload.requesterSignatory1 = payload.requesterSignatory1.id;
    }
    if (payload.requesterSignatory2?.id) {
      payload.requesterSignatory2 = payload.requesterSignatory2.id;
    }

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
      this.toastr.error('Initial Contact Date cannot be greater than Set Up Completed date. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
      return;
    }
    if (payload.setUpCompletedDate > payload.prereqsMetDate) {
      this.toastr.error('Set Up Completed date cannot be greater than PreRequest Met date. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
      return;
    }
    if (payload.prereqsMetDate > payload.duaAgreedDate) {
      this.toastr.error('Prereqs Met date cannot be greater than DUA Agreed date. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
      return;
    }
    if (payload.duaAgreedDate > payload.availabilityRequestedDate) {
      this.toastr.error('DUA Agreed date cannot be greater than Availability Requested date. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
      return;
    }
    if (payload.availabilityRequestedDate > payload.availabilityConfirmedDate) {
      this.toastr.error('Availability Requested date cannot be greater than Availability Confirmed. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
      return;
    }
    if (payload.availabilityConfirmedDate > payload.accessConfirmedDate) {
      this.toastr.error('Availability Confirmed date cannot be greater than Access Confirmed date. Dates entered in one phase cannot not be anterior to dates in a previous phase.');
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
          let success: boolean = true;
          if (!(coreDupRes.statusCode === 200 || coreDupRes.statusCode === 201)) {
            success = false;
            this.toastr.error(coreDupRes.messages[0]);
          }
          if (!(duaRes.statusCode === 200 || duaRes.statusCode === 201)) {
            success = false;
            this.toastr.error(duaRes.messages[0]);
          }
          this.spinner.hide();
          if (success) {
            this.toastr.success('DUP updated successfully');
            localStorage.setItem('updateDupList', 'true');
            this.showStatus = false;
            this.reuseService.notifyComponents();
            this.router.navigate([`/data-use/${this.id}/view`]);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      } else {
        this.spinner.show();
        this.dupService.addDup(payload).subscribe((res: any) => {
          if (res.statusCode === 201) {
            this.toastr.success('DUP added successfully');
            localStorage.setItem('updateDupList', 'true');
            this.showStatus = false;
            this.reuseService.notifyComponents();
            if (res.id) {
              this.router.navigate([`/data-use/${res.id}/view`]);
            } else {
              this.back();
            }
          } else {
            this.spinner.hide();
            this.toastr.error(res.messages[0]);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      }
    } else {
      this.toastr.error("Please correct the errors in the form's fields.");
    }
  }

  getStatusByName(name) {
    const arr: any = this.statusList.filter((item: any) => item.name.toLowerCase() === name);
    return arr[0].id;
  }

  getDupById(id) {
    return this.dupService.getDupById(id);
  }

  setDupById(res) {
    if (res) {
      this.dupData = res;
      this.patchForm(this.dupData);
    }
  }

  getDua(id) {
    return this.dupService.getDua(id);
  }

  setDua(res) {
    if (res?.results) {
      this.duaData = res.results;
      this.patchDua(this.duaData);
    }
  }

  patchForm(data) {
    this.form.patchValue({
      organisation: data.organisation ? data.organisation.id : null,
      displayName: data.displayName,
      status: data.status ? data.status.id : null,
      initialContactDate: this.stringToDate(data.initialContactDate),
      setUpCompletedDate: this.stringToDate(data.setUpCompletedDate),
      prereqsMetDate: this.stringToDate(data.prereqsMetDate),
      duaAgreedDate: this.stringToDate(data.duaAgreedDate),
      availabilityRequestedDate: this.stringToDate(data.availabilityRequestedDate),
      availabilityConfirmedDate: this.stringToDate(data.availabilityConfirmedDate),
      accessConfirmedDate: this.stringToDate(data.accessConfirmedDate),
    });
    // this.patchNote(data.dupNotes);
    const arr: any = this.statusList.filter((item: any) => item.id === this.dupData.status.id);
    if (arr && arr.length) {
      this.currentStatus = arr[0].name.toLowerCase() === 'creation' ? 1 : arr[0].name.toLowerCase() === 'set up' ? 2 : arr[0].name.toLowerCase() === 'preparation' ? 3 : arr[0].name.toLowerCase() === 'checking' ? 4 : arr[0].name.toLowerCase() === 'complete' ? 5 : 1;
      this.wizard.goTo(this.currentStatus);
    }
    if (this.form.value.initialContactDate !== null && this.form.value.initialContactDate !== '' && this.form.value.setUpCompletedDate !== null && this.form.value.setUpCompletedDate !== '' && this.form.value.prereqsMetDate !== null && this.form.value.prereqsMetDate !== '' &&
    this.form.value.duaAgreedDate !== null && this.form.value.duaAgreedDate !== '' && this.form.value.availabilityRequestedDate !== null && this.form.value.availabilityRequestedDate !== '' && this.form.value.availabilityConfirmedDate !== null && this.form.value.availabilityConfirmedDate !== '') {
      this.showUploadButton = this.role ? true : false;
    }
  }
  patchDua(data) {
    this.form.patchValue({
      variations: data[0]?.variations,
      conformsToDefault: data[0]?.conformsToDefault,
      repoIsProxyProvider: data[0]?.repoIsProxyProvider,
      duaFilePath: data[0]?.duaFilePath,
      repoSignatory1: data[0]?.repoSignatory1,
      repoSignatory2: data[0]?.repoSignatory2,
      providerSignatory1: data[0]?.providerSignatory1,
      providerSignatory2: data[0]?.providerSignatory2,
      requesterSignatory1: data[0]?.requesterSignatory1,
      requesterSignatory2: data[0]?.requesterSignatory2,
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
    this.backService.back();
  }
  addStudy() {
    const studyModal = this.modalService.open(CommonModalComponent, { size: 'xl', backdrop: 'static' });
    studyModal.componentInstance.title = 'Add Study';
    studyModal.componentInstance.type = 'study';
    studyModal.componentInstance.dupId = this.id;
    studyModal.componentInstance.currentStudiesIds = new Set(this.associatedStudies.map((item) => item.study?.id));
    studyModal.componentInstance.currentObjectsIds = new Set(this.associatedObjects.map((item) => item.dataObject?.id));
    studyModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          combineLatest([
            this.getDupObjectsAndPrereqs(this.id),
            this.getDupStudies(this.id),
          ]).subscribe((res) => {
            this.setDupStudies(res.pop());
            // getDupObjectsAndPrereqs doesn't return a value
            this.spinner.hide();
          })
        });
      }
    }, error => {});
  }

  getDupStudies(id) {
    return this.dupService.getDupStudies(id);
  }

  setDupStudies(res) {
    if (res) {
      this.associatedStudies = res.results ? res.results : [];
    }
  }

  removeDupStudy(dupStudy) {
    this.spinner.show();
    this.commonLookup.objectInvolvementDup(this.id, dupStudy.study?.id).subscribe((res: any) => {
      if (res.studyAssociated && res.objectsAssociated) {
        this.toastr.error(`Objects linked to this study is linked to this DUP. So, delete the objects before deleting this study`);
        this.spinner.hide();
      } else {
        this.dupService.deleteDupStudy(dupStudy.id, this.id).subscribe((res: any) => {
          this.getDupStudies(this.id).subscribe((res) => {
            this.setDupStudies(res);
            this.toastr.success('Study has been disassociated successfully');
            this.spinner.hide();
          });
        }, error => {
          this.toastr.error(error.error.title);
          this.spinner.hide();
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
    dataModal.componentInstance.currentStudiesIds = new Set(this.associatedStudies.map((item) => item.study?.id));
    dataModal.componentInstance.currentObjectsIds = new Set(this.associatedObjects.map((item) => item.dataObject?.id));
    dataModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDupObjectsAndPrereqs(this.id).subscribe(() => this.spinner.hide());
        });
      }
    }, error => { })
  }

  getDupObjectsAndPrereqs(id) {
    return this.dupService.getDupObjects(id).pipe(
      mergeMap((res: any) => {
        if (res) {
          this.associatedObjects = res.results ? res.results : [];
          this.dataObjectIds = this.associatedObjects.map((assocDo: any) => assocDo.dataObject.id);
          return this.getDupObjectPrereqs(this.dataObjectIds);
        }
        return of(false);
      }),
      map((res) => {
        this.setDupObjectPrereqs(res);
      })
    );
  }

  setDupObjects(res) {
    if (res) {
      this.associatedObjects = res.results ? res.results : [];
    }
  }

  getDupObjectPrereqs(dataObjectsIds) {
    return this.dupService.getDupObjectPrereqs(dataObjectsIds);
  }

  setDupObjectPrereqs(res) {
    if (res?.data) {
      this.prereqs = this.dataObjectIds.map(() => []);
      res.data.forEach((prereq) => {
        const ind = this.dataObjectIds.indexOf(prereq?.dataObject?.id);
        if (ind > -1) {
          this.prereqs[ind].push(prereq);
        }
      })
    }
  }

  removeDupObject(id) {
    this.spinner.show();
    this.dupService.deleteDupObject(id, this.id).subscribe((res: any) => {
      this.getDupObjectsAndPrereqs(this.id).subscribe(() => {
        this.toastr.success('Data object has been disassociated successfully');
        this.spinner.hide();
      });
    }, error => {
      this.toastr.error(error.error.title);
    })
  }

  addUser() {
    const userModal = this.modalService.open(CommonModalComponent, {size: 'xl', backdrop: 'static'});
    userModal.componentInstance.title = 'Add User';
    userModal.componentInstance.type = 'user';
    userModal.componentInstance.dupId = this.id;
    userModal.componentInstance.currentUsersIds = new Set(this.associatedUsers.map((item) => item.person?.id));
    userModal.result.then((data) => {
      if (data) {
        this.spinner.show();
        setTimeout(() => {
          this.getDupPeople(this.id).subscribe((res) => {
            this.setDupPeople(res);
            this.spinner.hide();
          });
        });
      }
    }, error => {})
  }

  getDupPeople(id) {
    return this.dupService.getDupPeople(id);
  }

  setDupPeople(res) {
    if (res) {
      this.associatedUsers = res.results ? res.results : [];
    }
  }

  findPeopleById(id) {
    const arr: any = this.associatedUsers.filter((item: any) => item.id === id);
    return arr && arr.length ? arr[0].person?.firstName + ' ' + arr[0].person?.lastName : 'None';
  }
  removeDupUser(id) {
    this.spinner.show();
    this.dupService.deleteDupPerson(id, this.id).pipe(
      mergeMap(() => {
        return this.getDupPeople(this.id);
      }),
      mergeMap((res) => {
        this.setDupPeople(res);
        return this.getDua(this.id);
      }),
      map((res) => {
        this.setDua(res);
        this.toastr.success('User has been dissociated successfully');
      }),
      finalize(() => this.spinner.hide()),
      catchError(err => {
        this.toastr.error(err.message, 'Error during user dissociation');
        return of(false);
      })
    ).subscribe();
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
    this.pdfGeneratorService.dupPdfGenerator(payload, this.associatedUsers);
  }
  jsonExport() {
    const payload = JSON.parse(JSON.stringify(this.dupData));
    /*payload.coreDup.organisation = this.findOrganization(payload.coreDup.organisation);
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
    });*/
    this.jsonGenerator.jsonGenerator(payload, 'dup');
  }

  getStudyList() {
    return this.listService.getStudyList();
  }

  setStudyList(res) {
    if (res?.data) {
      this.studyList = res.data;
    }
  }

  getObjectList() {
    return this.listService.getObjectList();
  }

  setObjectList(res) {
    if (res?.data) {
      this.objectList = res.data;
    }
  }

  findStudyById(studyId) {
    const arr: any = this.studyList.filter((item: any) => item.studyId === studyId);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  findObjectById(objectId) {
    const arr: any = this.objectList.filter((item: any) => item.objectId === objectId);
    return arr && arr.length ? arr[0].displayTitle : 'None';
  }
  customSearchUsers(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.person?.firstName.toLocaleLowerCase().indexOf(term) > -1 
        || item.person?.lastName.toLocaleLowerCase().indexOf(term) > -1
        || item.person?.email.toLocaleLowerCase().indexOf(term) > -1
        || (item.person?.firstName.toLocaleLowerCase() + " " + item.person?.lastName.toLocaleLowerCase()).indexOf(term) > -1;
  }

  compareUsers(u1: any, u2: any) {
    return u1.id === u2.id;
  }

  goToTsd() {
    this.router.navigate([])
    .then(result => { window.open('https://crr.tsd.usit.no/', '_blank'); });
  }
  ngOnDestroy() {
    this.scrollService.unsubscribeScroll();
  }
}
