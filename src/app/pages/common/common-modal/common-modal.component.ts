import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { DtpService } from 'src/app/_rms/services/entities/dtp/dtp.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';

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

  constructor( private activeModal: NgbActiveModal, private listService: ListService, private spinner: NgxSpinnerService, 
    private toastr: ToastrService, private objectService: DataObjectService, private fb: UntypedFormBuilder, private dtpService: DtpService, private dupService: DupService) { 
      this.studyForm = this.fb.group({
        targetSdSid: ''
      });
      this.objectForm = this.fb.group({
        targetsdOid: {value: '', disabled: true}
      });
      this.userForm = this.fb.group({
        targetPersonId: ''
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
  addDtpStudy(dtpId, id, payload) {
    this.dtpService.addDtpStudy(dtpId, id, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Studies associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  addDupStudy(dupId, id, payload) {
    this.dupService.addDupStudy(dupId, id, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Studies associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDtpObject(dtpId, id, payload) {
    this.dtpService.addDtpObject(dtpId, id, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Objects associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  addDupObject(dupId, id, payload) {
    this.dupService.addDupObject(dupId, id, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('Objects associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDtpUser(dtpId, id, payload) {
    this.dtpService.addDtpPerson(dtpId, id, payload).subscribe((res: any) => {
      if (res.statusCode === 200) {
        this.toastr.success('User associated successfully');
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  addDupUser(dupId, id, payload) {
    this.dupService.addDupPerson(dupId, id, payload).subscribe((res: any) => {
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
      const studyPayload = this.studyForm.value.targetSdSid;
      studyPayload.map ((item: any) => {
        if (this.dtpId) {
          this.addDtpStudy(this.dtpId, item, {});
        }
        if (this.dupId) {
          this.addDupStudy(this.dupId, item, {});
        }
      })
      if (this.objectForm.value.targetsdOid) {
        const objectPayload = this.objectForm.value.targetsdOid;
        objectPayload.map((item: any) => {
          if (this.dtpId) {
            this.addDtpObject(this.dtpId, item, {});
          }
          if (this.dupId) {
            this.addDupObject(this.dupId, item, {});
          }
        });
      }
      this.closeModal(this.studyForm.value.targetSdSid);
    }
    if (this.type === 'dataObject') {
      const payload = this.objectForm.value.targetsdOid;
      payload.map ((item : any) => {
        if (this.dtpId) {
          this.addDtpObject(this.dtpId, item, {});
        }
        if (this.dupId) {
          this.addDupObject(this.dupId, item, {});
        }
      });
      this.closeModal({});
    }
    if (this.type === 'user') {
      const payload = this.userForm.value.targetPersonId;
      payload.map((item: any) => {
        if (this.dtpId) {
          this.addDtpUser(this.dtpId, item, {});
        }
        if (this.dupId) {
          this.addDupUser(this.dupId, item, {});
        }
      });
      this.closeModal({});
    }
  }
  getStudyList() {
    this.spinner.show();
    this.listService.getStudyList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.studyList = res.data.length ? res.data : [];;
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
    this.listService.getPeopleList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.userList = res.data;
      }
      console.log(res);
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  studyDropdownClose() {
    if (this.type === 'dataObject') {
      this.objectForm.controls.targetsdOid.enable();
    } else if (this.type === 'study') {
      if (this.studyForm.value.targetSdSid.length) {
        this.objectForm.controls.targetsdOid.enable();
        const sdSids = this.sdSidArray ? this.studyForm.value.targetSdSid.toString() + ',' + this.sdSidArray : this.studyForm.value.targetSdSid.toString();
        this.getObjectListByStudy(sdSids);
      } else {
        this.objectForm.controls.targetsdOid.disable();
      }
    }
  }
}
