import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { DtpService } from 'src/app/_rms/services/entities/dtp/dtp.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import {HttpClient} from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { DataObjectInterface } from 'src/app/_rms/interfaces/data-object/data-object.interface';

export enum DataType {
  STUDY = "study",
  DATA_OBJECT = "dataObject",
  USER = "user",
};

@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.scss']
})
export class CommonModalComponent implements OnInit {
  
  studyForm: UntypedFormGroup;
  objectForm: UntypedFormGroup;
  userForm: UntypedFormGroup;
  title: string = '';
  type: string = '';
  dtpId: number;
  dupId: number;

  alreadyAddedStudyIds: Set<String> = new Set<String>();
  studyIdDPStudyIdDict: { [key: string]: string } = {};

  // Input
  alreadyAddedObjectIds: Set<String> = new Set<String>();
  alreadyAddedUserIds: Set<String> = new Set<String>();
  alreadyAddedDPStudies: [] = [];

  currentStudyIds: Set<String>; // already added + in dropdown
  currentUserIds: Set<String>;
  allStudies: StudyInterface[] = [];
  filteredStudies: StudyInterface[] = [];
  filteredDataObjects: DataObjectInterface[] = [];
  userList: [] = [];
  DataType = DataType;  // To allow access in template

  constructor(private activeModal: NgbActiveModal, private listService: ListService, private spinner: NgxSpinnerService, 
              private toastr: ToastrService, private objectService: DataObjectService, private fb: UntypedFormBuilder,
              private dtpService: DtpService, private dupService: DupService, private httpClient: HttpClient) {
      this.studyForm = this.fb.group({
        studies: '',
      });
      this.objectForm = this.fb.group({
        dataObjects: ''
      });
      this.userForm = this.fb.group({
        people: ''
      })
    }

  ngOnInit(): void {
    if(this.type === DataType.STUDY || this.type === DataType.DATA_OBJECT) {
      this.getStudies();
    }
    if (this.type === DataType.USER) {
      this.getPeopleList();
    }
    this.studyDropdownClose();
  }
  closeModal(data) {
    this.activeModal.close(data);
  }

  getStudies() {
    this.spinner.show();
    this.listService.getStudyList().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.results) {
        this.allStudies = res.results;

        // Note: in theory this should be done earlier but https://github.com/ng-bootstrap/ng-bootstrap/issues/2645
        this.alreadyAddedStudyIds = new Set(this.alreadyAddedDPStudies.map((item: any) => item.study?.id));
        this.alreadyAddedDPStudies.forEach((dupStudy: any) => {
          if (dupStudy?.study?.id && dupStudy?.id) {
            this.studyIdDPStudyIdDict[dupStudy.study.id] = dupStudy.id;
          }
        });

        this.filteredStudies = res.results.filter((study: StudyInterface) => !this.alreadyAddedStudyIds.has(study?.id));
        this.setFilteredDataObjects();
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error);
    })
  }

  setCurrentStudyIds() {
    this.currentStudyIds = new Set(this.alreadyAddedStudyIds);
    if (this.studyForm.value.studies) {
      this.studyForm.value.studies?.forEach(study => {
        this.currentStudyIds.add(study.id);
      });
    }
  }

  setFilteredDataObjects() {
    this.setCurrentStudyIds();  // Updating current study IDs

    // Note: can probably be optimised but the first filter will return a few studies at most so it should be fine
    this.filteredDataObjects = this.allStudies.filter((study: StudyInterface) => this.currentStudyIds.has(study?.id))
                                              .map((study: StudyInterface) => study.linkedObjects)
                                              .reduce((accumulator, objArr) => accumulator.concat(objArr), []);
    // Filtering out DOs already added + public DOs
    this.filteredDataObjects = this.filteredDataObjects.filter((dataObj: DataObjectInterface) => !this.alreadyAddedObjectIds.has(dataObj?.id)
                                                                                                  && dataObj?.accessType?.name?.toLowerCase() === 'controlled');
  }

  getPeopleList() {
    this.spinner.show();
    this.listService.getPeopleList().subscribe((res: any) => {
      this.spinner.hide();
      if (res?.results) {
        this.userList = res.results.filter((item: any) => {
          return (!this.alreadyAddedUserIds.has(item?.id));
        });
      }
    }, error => {
      console.log('error', error);
    })
  }

  studyDropdownClose() {
    if (this.type === DataType.STUDY && this.studyForm.value.studies.length) {
        // Updating list of selectable DOs based on current studies (list of added + selected study IDs is also updated there)
        this.setFilteredDataObjects();
    }
  }

  customSearchStudies(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.sdSid.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle.toLocaleLowerCase().indexOf(term) > -1;
  }
  customSearchObjects(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.sdOid.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle.toLocaleLowerCase().indexOf(term) > -1;
  }
  customSearchUser(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.firstName.toLocaleLowerCase().indexOf(term) > -1 || item.lastName.toLocaleLowerCase().indexOf(term) > -1;
  }

  addDtpStudy(dtpId, payload) {
    return this.dtpService.addDtpStudy(dtpId, payload);
  }
  addDupStudy(dupId, payload) {
    return this.dupService.addDupStudy(dupId, payload);
  }
  
  addDtpObject(dtpId, payload) {
    return this.dtpService.addDtpObject(dtpId, payload);
  }
  addDupObject(dupId, payload) {
    return this.dupService.addDupObject(dupId, payload);
  }

  addDtpUser(dtpId, payload) {
    return this.dtpService.addDtpPerson(dtpId, payload);
  }
  addDupUser(dupId, payload) {
    return this.dupService.addDupPerson(dupId, payload);
  }

  getDPStudyQueries(studies) {
    let studies$: Array<Observable<any>> = [];

    if (studies?.length > 0) {
      studies.map((study : StudyInterface) => {
        if (this.dtpId) {
          studies$.push(this.addDtpStudy(this.dtpId, {dtpId: this.dtpId, study: study.id}));
        }
        if (this.dupId) {
          studies$.push(this.addDupStudy(this.dupId, {dupId: this.dupId, study: study.id}));
        }
      });

      studies$ = studies$.map((funct) => {
        return funct.pipe(
          map((res: any) => {
            if (res.statusCode === 201) {
              this.toastr.success('Study associated successfully.');
            } else {
              this.toastr.error(res.message);
            }

            if (res?.id && res?.study) {  // TODO: should change BE to serialize study object probably
              this.studyIdDPStudyIdDict[res.study] = res.id;
            } else {
              this.toastr.error("Couldn't properly associate study");
            }
          }), 
          catchError(error => of(this.toastr.error(error))));
      });
    }

    return studies$;
  }

  getDPDOQueries(dos) {
    let dataObjects$: Array<Observable<any>> = [];

    if (dos?.length > 0) {
      dos.map((dataObject : any) => {
        if (dataObject?.linkedStudy?.id && dataObject.linkedStudy.id in this.studyIdDPStudyIdDict) {  // TODO: should change BE to serialize study object probably
          const dpStudyId = this.studyIdDPStudyIdDict[dataObject.linkedStudy.id];
          if (this.dtpId) {
            dataObjects$.push(this.addDtpObject(this.dtpId, {dtpId: this.dtpId, dataObject: dataObject.id, dtpStudy: dpStudyId}));
          }
          if (this.dupId) {
            dataObjects$.push(this.addDupObject(this.dupId, {dupId: this.dupId, dataObject: dataObject.id, dupStudy: dpStudyId}));
          }
        } else {
          this.toastr.error("Couldn't find DTP/DUP study from data object study, not associating DO");
        }
      });
  
      dataObjects$ = dataObjects$.map((funct) => {
        return funct.pipe(
          map((res) => {
            if (res.statusCode === 201) {
              this.toastr.success('Object associated successfully.');
            } else {
              this.toastr.error(res.message);
            }
          }), 
          catchError(error => of(this.toastr.error(error))));
      });
    }

    return dataObjects$;
  }

  getUserQueries(payload) {
    let users$: Array<Observable<any>> = [];

    if (payload?.length > 0) {
      payload.map((item: any) => {
        if (this.dtpId) {
          users$.push(this.addDtpUser(this.dtpId, {dtpId: this.dtpId, person: item}));
        } else if (this.dupId) {
          users$.push(this.addDupUser(this.dupId, {dupId: this.dupId, person: item}));
        }
      });
      users$ = users$.map((funct) => {
        return funct.pipe(catchError(error => of(this.toastr.error(error))));
      });
    }

    return users$;
  }

  runDOQueries(doIds) {
    // Study queries populate the studyIdDPStudyIdDict dictionary, now that they have finished we can run the DO queries
    if (doIds?.length > 0) {
      combineLatest(this.getDPDOQueries(doIds)).subscribe(res => {
        this.closeModal({});
      });
    } else {
      this.closeModal({});
    }
  }

  save() {
    const studies = this.studyForm.value.studies;
    const dos = this.objectForm.value.dataObjects;
    const personIds = this.userForm.value.people;

    if (this.type === DataType.STUDY) {
      if (studies?.length > 0) {
        combineLatest(this.getDPStudyQueries(studies)).subscribe(res => {
          // Study queries populate the studyIdDPStudyIdDict dictionary, now that they have finished we can run the DO queries (which will close modal at the end)
          this.runDOQueries(dos);
        });
      } else {
        this.runDOQueries(dos);
      }
    }

    if (this.type === DataType.DATA_OBJECT) {
      this.runDOQueries(dos);
    }
    
    if (this.type === DataType.USER) {
      combineLatest(this.getUserQueries(personIds)).subscribe(res => {
        res.forEach((resI: any) => {
          if (resI.statusCode === 201) {
            this.toastr.success('User associated successfully.');
          } else {
            this.toastr.error(resI.message);
          }
        })
        this.closeModal({});
      });
    }
  }
}
