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
  studyList: [] = [];
  objectList: [] = [];
  userList: [] = [];
  sdSidArray: any;
  pageSize = 10000;

  constructor( private activeModal: NgbActiveModal, private listService: ListService, private spinner: NgxSpinnerService, 
    private toastr: ToastrService, private objectService: DataObjectService, private fb: UntypedFormBuilder,
               private dtpService: DtpService, private dupService: DupService, private httpClient: HttpClient) {
      this.studyForm = this.fb.group({
        studyId: '',
      });
      this.objectForm = this.fb.group({
        objectId: {value: '', disabled: true}
      });
      this.userForm = this.fb.group({
        person: ''
      })
    }

  ngOnInit(): void {
    if(this.type === 'study') {
      this.getStudyList();
    }
    if (this.type === 'dataObject') {
      this.getObjectListByStudy(this.sdSidArray);
    }
    if (this.type === 'user') {
      this.getPeopleList();
    }
    this.studyDropdownClose();
  }
  closeModal(data) {
    this.activeModal.close(data);
  }
  addDtpStudy(dtpId, payload) {
    this.dtpService.addDtpStudy(dtpId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Studies associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  addDupStudy(dupId, payload) {
    this.dupService.addDupStudy(dupId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Studies associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDtpObject(dtpId, payload) {
    this.dtpService.addDtpObject(dtpId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Objects associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  addDupObject(dupId, payload) {
    this.dupService.addDupObject(dupId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Objects associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDtpUser(dtpId, payload) {
    this.dtpService.addDtpPerson(dtpId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('User associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDupUser(dupId, payload) {
    this.dupService.addDupPerson(dupId, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('User associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  save() {
    if (this.type === 'study') {
      const studyPayload = this.studyForm.value.studyId;
      studyPayload.map ((item: any) => {
        if (this.dtpId) {
          const payload = { dtpId: this.dtpId, studyId: item}
          this.addDtpStudy(this.dtpId, payload);
        }
        if (this.dupId) {
          const payload = {dupId: this.dupId, studyId: item}
          this.addDupStudy(this.dupId, payload);
        }
      })
      if (this.objectForm.value.objectId) {
        const objectPayload = this.objectForm.value.objectId;
        objectPayload.map((item: any) => {
          if (this.dtpId) {
            const payload = {dtpId: this.dtpId, objectId: item}
            this.addDtpObject(this.dtpId, payload);
          }
          if (this.dupId) {
            const payload = {dupId: this.dupId, objectId: item}
            this.addDupObject(this.dupId, payload);
          }
        });
      }
      this.closeModal(this.studyForm.value.studyId);
    }
    if (this.type === 'dataObject') {
      const payload = this.objectForm.value.objectId;
      payload.map ((item : any) => {
        if (this.dtpId) {
          const payload = {dtpId: this.dtpId, objectId: item}
          this.addDtpObject(this.dtpId, payload);
        }
        if (this.dupId) {
          const payload = {dupId: this.dupId, objectId: item}
          this.addDupObject(this.dupId, payload);
        }
      });
      this.closeModal({});
    }
    if (this.type === 'user') {
      const payload = this.userForm.value.person;
      payload.map((item: any) => {
        if (this.dtpId) {
          const payload = {dtpId: this.dtpId, person: item};
          this.addDtpUser(this.dtpId, payload);
        }
        if (this.dupId) {
          const payload = {dupId: this.dupId, person: item}
          this.addDupUser(this.dupId, payload);
        }
      });
      this.closeModal({});
    }
  }
  getStudyList() {
    this.spinner.show();
    this.listService.getStudyList(this.pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.studyList = res.results.length ? res.results : [];;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  customSearchFn(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.sdSid.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle.toLocaleLowerCase().indexOf(term) > -1;
  }
  customSearchUser(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.name.toLocaleLowerCase().indexOf(term) > -1 || item.name.toLocaleLowerCase().indexOf(term) > -1;
  }
  getObjectListByStudy(id) {
    this.spinner.show();
    this.listService.getObjectByMultiStudies(id).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectList = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title)
    })
  }
  getPeopleList() {
    this.spinner.show();
    this.listService.getPeopleList(this.pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.userList = res.results;
      }
      console.log(res);
    }, error => {
      console.log('error', error);
    })
  }
  studyDropdownClose() {
    if (this.type === 'dataObject') {
      this.objectForm.controls.objectId.enable();
    } else if (this.type === 'study') {
      if (this.studyForm.value.studyId.length) {
        this.objectForm.controls.objectId.enable();
        const sdSids = this.sdSidArray ? this.studyForm.value.studyId.toString() + ',' + this.sdSidArray : this.studyForm.value.studyId.toString();
        this.getObjectListByStudy(sdSids);
      } else {
        this.objectForm.controls.objectId.disable();
      }
    }
  }
}
