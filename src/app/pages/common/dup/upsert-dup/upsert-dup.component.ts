import { Component, OnInit } from '@angular/core';
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
import { CommonModalComponent, DataType } from '../../common-modal/common-modal.component';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';
import { BackService } from 'src/app/_rms/services/back/back.service';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { catchError, finalize, map, mergeMap } from 'rxjs/operators';
import { dateToNgbDateStruct, ngbDateStructToString, isWholeNumber, sqlDateStringToString, stringToNgbDateStruct } from 'src/assets/js/util';
import { UserInterface } from 'src/app/_rms/interfaces/user/user.interface';
import { OrganisationInterface } from 'src/app/_rms/interfaces/organisation/organisation.interface';
import { ContextService } from 'src/app/_rms/services/context/context.service';

export enum StatusIndex {
  RequestUnderReview = 0,
  RequestApproved = 1,
  RequestDenied = 2,
  RequestFailed = 3,
  AccessGranted = 4,
  AccessExpired = 5,
};

@Component({
  selector: 'app-upsert-dup',
  templateUrl: './upsert-dup.component.html',
  styleUrls: ['./upsert-dup.component.scss'],
  providers: [ScrollService]
})
export class UpsertDupComponent implements OnInit {
  id: any;
  duaData: any;
  dupData: any;
  dupNotes: any;
  prereqs: any[] = [];
  form: UntypedFormGroup;
  isAdd: boolean = false;
  isEdit: boolean = false;
  isView: boolean = false;
  organisations: OrganisationInterface[] = [];
  statusList = [];
  sliceLength = 100;
  associatedStudies: any = [];
  associatedObjects: any = [];
  associatedUsers: any = [];
  studyList: [] = [];
  objectList: [] = [];
  dataObjectIds: any;
  role: any;
  user: UserInterface;
  isManager: boolean = false;
  sticky: boolean = false;
  submitted: boolean = false;
  statusIndex: number = 0;
  addDOButtonDisabled: boolean = true;
  hasDataAccessRequest: boolean = false;  // Indicates if a formal request has been submitted through the contact-us page or DUP manually created
  processAborted: boolean = false;
  requestApproved: boolean = false;
  requestDenied: boolean = false;
  getStatusTagClasses = UpsertDupComponent.getStatusTagClasses; // Allowing access in template

  constructor(private statesService: StatesService,
              private backService: BackService,
              private scrollService: ScrollService,
              private router: Router, 
              private fb: UntypedFormBuilder, 
              private dupService: DupService, 
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService,
              private contextService: ContextService,
              private activatedRoute: ActivatedRoute, 
              private modalService: NgbModal, 
              private reuseService: ReuseService,
              private commonLookup: CommonLookupService, 
              private processLookup: ProcessLookupService, 
              private pdfGeneratorService: PdfGeneratorService,
              private jsonGenerator: JsonGeneratorService, 
              private listService: ListService) {
    this.form = this.fb.group({
      organisation: [null, Validators.required],
      displayName: [null, Validators.required],
      dataAccessRequest: null,
      status: null,
      requestDecisionDate: null,
      agreementSignedDate: null,
      dataAccessAvailableFrom: null,
      dataAccessAvailableUntil: null,
      variationsFromAgreementTemplate: null,
      accessRequestsDelegatedToCrdsr: false,
      agreementLink: null,
      repoSignatory1: null,
      repoSignatory2: null,
      providerSignatory1: null,
      providerSignatory2: null,
      requesterSignatory1: null,
      requesterSignatory2: null,
      notes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.show(); 
    });

    this.role = this.statesService.currentAuthRole;
    this.id = this.activatedRoute.snapshot.params.id;
    this.isManager = this.statesService.isManager();
    this.user = this.statesService.currentUser;

    this.isEdit = this.router.url.includes('edit') ? true : false;
    if (this.router.url.includes('add')) {
      this.isAdd = true;
    }
    if (!this.isEdit && !this.isAdd) {
      this.isView = true;
    }

    this.contextService.organisations.subscribe((organisations) => {
      this.organisations = organisations;
    });

    // this.scrollService.handleScroll([`/data-use/${this.id}/view`, `/data-use/${this.id}/edit`, `/data-use/add`]);

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

    let obsArr: Array<Observable<any>> = [];
    queryFuncs.forEach((funct) => {
      obsArr.push(funct.pipe(catchError(error => of(this.toastr.error(error.error.title)))));
    });

    combineLatest(obsArr).subscribe(res => {
      this.setStatusList(res.pop());
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

      // this.verifyStep();

      setTimeout(() => {
        this.spinner.hide(); 
      });
    });
  }
  
  get dar() { return this.fc.dataAccessRequest.value; }
  get fc() { return this.form.controls; }
  get fv() { return this.form.value; }

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
    // TODO: fix error of editing right after adding
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

  getStatus() {
    return this.processLookup.getDupStatusTypes();
  }

  setStatusList(res) {
    if (res?.results) {
      this.statusList = res.results;

      this.statusList.sort((a: any, b: any) => { 
        return a?.listOrder > b?.listOrder ? 1 : -1; 
      });

      if (this.statusList.length > 0) {
        this.setStatusValue(this.statusIndex);
      }
    }
  }

  ngbDateStructToString(date) {
    return ngbDateStructToString(date);
  }

  stringToNgbDateStruct(dateStr) {
    return stringToNgbDateStruct(dateStr);
  }

  dateToNgbDateStruct(date) {
    return dateToNgbDateStruct(date);
  }

  viewDate(date) {
    return sqlDateStringToString(date);
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
      organisation: data.organisation,
      displayName: data.displayName,
      dataAccessRequest: data.dataAccessRequest,
      requestDecisionDate: this.stringToNgbDateStruct(data.requestDecisionDate),
      agreementSignedDate: this.stringToNgbDateStruct(data.agreementSignedDate),
      dataAccessAvailableFrom: this.stringToNgbDateStruct(data.dataAccessAvailableFrom),
      dataAccessAvailableUntil: this.stringToNgbDateStruct(data.dataAccessAvailableUntil),
    });

    // Setting status this way to set style as well instead of using patchValue
    this.setStatusValue(data?.status.listOrder);

    if (this.fv.dataAccessRequest) {
      this.hasDataAccessRequest = true;
    }

    if (this.fv.status?.listOrder !== StatusIndex.RequestUnderReview 
      && this.fv.status?.listOrder !== StatusIndex.RequestDenied) {
      this.requestApproved = true;
    } else if (this.fv.status?.listOrder === StatusIndex.RequestDenied) {
      this.requestDenied = true;
    }

    if (this.fv.status?.listOrder === StatusIndex.RequestFailed) {
      this.processAborted = true;
    }

    if (this.fv.dataAccessAvailableUntil 
      && this.ngbDateStructToString(this.fv.dataAccessAvailableUntil) < this.ngbDateStructToString(this.dateToNgbDateStruct(new Date()))) {
      this.setStatusValue(StatusIndex.AccessExpired);
    }
  }

  patchDua(data) {
    this.form.patchValue({
      variationsFromAgreementTemplate: data[0]?.variationsFromAgreementTemplate,
      accessRequestsDelegatedToCrdsr: data[0]?.accessRequestsDelegatedToCrdsr,
      agreementLink: data[0]?.agreementLink,
      repoSignatory1: data[0]?.repoSignatory1,
      repoSignatory2: data[0]?.repoSignatory2,
      providerSignatory1: data[0]?.providerSignatory1,
      providerSignatory2: data[0]?.providerSignatory2,
      requesterSignatory1: data[0]?.requesterSignatory1,
      requesterSignatory2: data[0]?.requesterSignatory2,
    });
  }

  addStudy() {
    const studyModal = this.modalService.open(CommonModalComponent, { size: 'xl', backdrop: 'static' });
    studyModal.componentInstance.title = 'Add Studies and Data Objects';
    studyModal.componentInstance.type = DataType.STUDY;
    studyModal.componentInstance.dupId = this.id;
    studyModal.componentInstance.alreadyAddedDPStudies = this.associatedStudies;
    studyModal.componentInstance.alreadyAddedObjectIds = new Set(this.associatedObjects.map((item) => item.dataObject?.id));
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
    if (res?.results) {
      this.getSortedDupStudies(res.results);
      this.associatedStudies = res.results;
      if (this.associatedStudies.length > 0) {
        this.addDOButtonDisabled = false;
      }
    }
  }

  removeDupStudy(dupStudy) {
    this.spinner.show();
    // TODO: remove this check, cascade delete
    this.commonLookup.objectInvolvementDup(this.id, dupStudy.study?.id).subscribe((res: any) => {
      if (res.studyAssociated && res.objectsAssociated) {
        this.toastr.error(`Object(s) linked to this study are linked to this DUP. Remove the object(s) before removing this study.`);
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
    dataModal.componentInstance.title = 'Add Data Objects';
    dataModal.componentInstance.type = DataType.DATA_OBJECT;
    dataModal.componentInstance.dupId = this.id;
    dataModal.componentInstance.alreadyAddedDPStudies = this.associatedStudies;
    dataModal.componentInstance.alreadyAddedObjectIds = new Set(this.associatedObjects.map((item) => item.dataObject?.id));
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
        if (res?.results) {
          this.getSortedDupObjects(res.results);
          this.associatedObjects = res.results;
          this.dataObjectIds = this.associatedObjects.map((assocDo: any) => assocDo.dataObject.id);
          if (res?.results?.length > 0) {
            return this.getDupObjectPrereqs(this.dataObjectIds);
          }
          return of(true);
        }
        return of(false);
      }),
      map((res) => {
        this.setDupObjectPrereqs(res);
      })
    );
  }

  getDupObjectPrereqs(dataObjectsIds) {
    return this.dupService.getDupObjectPrereqs(dataObjectsIds);
  }

  setDupObjectPrereqs(res) {
    if (res?.data) {
      this.prereqs = this.dataObjectIds.map(() => []);
      res.data.forEach((prereq) => {
        const ind = this.dataObjectIds.indexOf(prereq?.dtpDataObject?.dataObject?.id);
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
      this.spinner.hide();
    })
  }

  getSortedDupStudies(studies) {
    const { compare } = Intl.Collator('en-GB');
    studies.sort((a, b) => {
      if (a.study?.sdSid.length > 5 && b.study?.sdSid.length > 5) {
        if (isWholeNumber(a.study?.sdSid.slice(5, ))) {
          if (isWholeNumber(b.study?.sdSid.slice(5, ))) {
            // Both a and b are int
            return parseInt(a.study?.sdSid.slice(5, )) > parseInt(b.study?.sdSid.slice(5, )) ? 1 : -1;
          }
        } else {
          if (isWholeNumber(b.study?.sdSid.slice(5, ))) {
            // a is not int, b is int
            return 1;
          } else {
            // Both a and b are not int
            return compare(a.study?.sdSid, b.study?.sdSid);
          }
        }
      }
      return -1;
    });
  }

  getSortedDupObjects(objects) {
    const { compare } = Intl.Collator('en-GB');
    objects.sort((a, b) => {
      if (a.dataObject?.sdOid.length > 5 && b.dataObject?.sdOid.length > 5) {
        if (isWholeNumber(a.dataObject?.sdOid.slice(5, ))) {
          if (isWholeNumber(b.dataObject?.sdOid.slice(5, ))) {
            // Both a and b are int
            return parseInt(a.dataObject?.sdOid.slice(5, )) > parseInt(b.dataObject?.sdOid.slice(5, )) ? 1 : -1;
          }
        } else {
          if (isWholeNumber(b.dataObject?.sdOid.slice(5, ))) {
            // a is not int, b is int
            return 1;
          } else {
            // Both a and b are not int
            return compare(a.dataObject?.sdOid, b.dataObject?.sdOid);
          }
        }
      }
      return -1;
    });
  }

  addUser() {
    const userModal = this.modalService.open(CommonModalComponent, {size: 'xl', backdrop: 'static'});
    userModal.componentInstance.title = 'Add Users';
    userModal.componentInstance.type = DataType.USER;
    userModal.componentInstance.dupId = this.id;
    userModal.componentInstance.alreadyAddedUserIds = new Set(this.associatedUsers.map((item) => item.person?.id));
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

  printDocument() {
    const payload = JSON.parse(JSON.stringify(this.dupData));
    payload.associatedStudies = this.associatedStudies;
    payload.associatedObjects = this.associatedObjects;
    payload.associatedUsers = this.associatedUsers;
    payload.prereqs = ([] as string[]).concat(...this.prereqs);
    this.pdfGeneratorService.dupPdfGenerator(payload);
  }

  jsonExport() {
    const payload = JSON.parse(JSON.stringify(this.dupData));
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

  compareIds(fc1, fc2): boolean {
    return fc1?.id == fc2?.id;
  }

  searchOrganisations = (term: string, item) => {
    return this.contextService.searchOrganisations(term, item);
  }

  saveRequestStatus(toastrMessage) {
    this.spinner.show();
    // const payload = JSON.parse(JSON.stringify(this.form.value));
    if (this.fv.status?.id) {
      const payload = {'id': this.fv.id, 'status': this.fv.status?.id, 'requestDecisionDate': this.ngbDateStructToString(this.fv.requestDecisionDate)};
      // payload.requestDecisionDate = this.ngbDateStructToString(payload.requestDecisionDate);
  
      this.dupService.editDup(this.id, payload).subscribe((res: any) => {
        if (res.statusCode === 200) {
          switch (this.fv.status.listOrder) {
            case StatusIndex.RequestUnderReview:
              this.requestApproved = false;
              this.requestDenied = false;
              this.processAborted = false;
              break;
            case StatusIndex.RequestApproved:
              this.requestApproved = true;
              this.requestDenied = false;
              this.processAborted = false;
              break;
            case StatusIndex.RequestDenied:
              this.requestApproved = false;
              this.requestDenied = true;
              break;
            case StatusIndex.RequestFailed:
              this.requestApproved = true;
              this.processAborted = true;
              break;
            default:  // Request unaborted (access granted, access expired)
              this.requestApproved = true;
              this.requestDenied = false;
              this.processAborted = false;
          }
          this.toastr.success(toastrMessage, `DUP updated successfully`, { timeOut: 10000, extendedTimeOut: 10000 });
          if (this.isEdit) {
            this.router.navigate([`/data-use/${this.id}/view`]);
          }
        } else {
          this.toastr.error(res?.error);
        }
        this.spinner.hide();
      }, error => {
        this.spinner.hide();
        this.toastr.error(error);
      });
    } else {
      this.toastr.error("Invalid status error");
      this.spinner.hide();
    }
  }

  static getStatusTagClasses(statusListOrder) {
    let className = "tag";
    switch(statusListOrder) {
      case StatusIndex.RequestUnderReview:
        className = "tag warning-tag";
        break;
      case StatusIndex.RequestApproved:
        className = "tag primary-tag";
        break;
      case StatusIndex.RequestDenied:
        className = "tag danger-tag";
        break;
      case StatusIndex.RequestFailed:
        className = "tag danger-tag";
        break;
      case StatusIndex.AccessGranted:
        className = "tag success-tag";
        break;
      case StatusIndex.AccessExpired:
        className = "tag secondary-tag";
        break;
      default:
    }

    return className;
  }

  setStatusValue(statusIndex) {
    this.fc['status'].setValue(this.statusList[statusIndex]);
  }

  setStatusFromForm() {
    // Note: this function only sets status from form fields (not request accept/deny and process abort buttons)
    if (this.fv.agreementSignedDate) {
      if (this.fv.dataAccessAvailableUntil 
        && this.ngbDateStructToString(this.fv.dataAccessAvailableUntil) < this.ngbDateStructToString(this.dateToNgbDateStruct(new Date()))) {
        this.setStatusValue(StatusIndex.AccessExpired);
      } else {  // Access granted as soon as agreement is signed
        this.setStatusValue(StatusIndex.AccessGranted);
      }
    } else {
      this.setStatusValue(StatusIndex.RequestApproved);
    }
  }

  approveRequest() {
    this.setStatusValue(StatusIndex.RequestApproved);
    this.fc['requestDecisionDate'].setValue(this.dateToNgbDateStruct(new Date()));

    this.saveRequestStatus("Data access request approved");
  }

  denyRequest() {
    this.setStatusValue(StatusIndex.RequestDenied);
    this.fc['requestDecisionDate'].setValue(this.dateToNgbDateStruct(new Date()));

    this.saveRequestStatus("Data access request denied");
  }

  resetRequestDecision() {
    this.setStatusValue(StatusIndex.RequestUnderReview);
    this.fc['requestDecisionDate'].setValue(this.dateToNgbDateStruct(new Date()));

    this.saveRequestStatus("Data access request decision reset");
  }

  abortProcess() {
    this.setStatusValue(StatusIndex.RequestFailed);
    this.saveRequestStatus("DUP aborted");
  }

  unabortProcess() {
    this.setStatusFromForm();
    this.saveRequestStatus("DUP unaborted");
  }

  updatePayload(payload) {
    payload.requestDecisionDate = this.ngbDateStructToString(payload.requestDecisionDate);
    payload.agreementSignedDate = this.ngbDateStructToString(payload.agreementSignedDate);
    payload.dataAccessAvailableFrom = this.ngbDateStructToString(payload.dataAccessAvailableFrom);
    payload.dataAccessAvailableUntil = this.ngbDateStructToString(payload.dataAccessAvailableUntil);

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
    if (payload.status?.id) {
      payload.status = payload.status.id;
    }
    if (payload.organisation?.id) {
      payload.organisation = payload.organisation.id;
    }
    if (payload.dataAccessRequest?.id) {
      payload.dataAccessRequest = payload.dataAccessRequest.id;
    }
  }

  onSave() {
    const payload = JSON.parse(JSON.stringify(this.form.value));
    this.updatePayload(payload);

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

  checkUrl(instanceUrl) {
    // TODO: return different things if no valid URL, if TSD, or if external URL
    return (instanceUrl + '').includes('tsd.usit.no');
  }

  canAccess() {
    for (const aUser of this.associatedUsers) {
      if (aUser.person?.id === this.user.id) {
        return true;
      }
    }
    return false;
  }

  goToTsd() {
    this.router.navigate([])
    .then(result => { window.open('https://crdsr.tsd.usit.no/', '_blank'); });
  }

  back(): void {
    this.backService.back();
  }

  ngOnDestroy() {
    this.scrollService.unsubscribeScroll();
  }
}
