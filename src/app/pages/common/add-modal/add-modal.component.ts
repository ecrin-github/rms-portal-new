import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DtpService } from 'src/app/_rms/services/entities/dtp/dtp.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { ProcessLookupService } from 'src/app/_rms/services/entities/process-lookup/process-lookup.service';

@Component({
  selector: 'app-add-modal',
  templateUrl: './add-modal.component.html',
  styleUrls: ['./add-modal.component.scss']
})
export class AddModalComponent implements OnInit {
  objectList: [] = [];
  preReqForm: UntypedFormGroup;
  embargoForm: UntypedFormGroup;
  title: any;
  dtpId: any;
  dupId: any;
  preRequTypes: [] = [];
  type: any;
  todayDate: any;
  accessTypes: [] = [];
  dupPreReqForm: UntypedFormGroup;
  isEmbargoRequested: boolean = false;

  constructor( private spinner: NgxSpinnerService, private fb: UntypedFormBuilder, private dtpService: DtpService, private toastr: ToastrService, private processLookup: ProcessLookupService,
    private activeModal: NgbActiveModal, private objectLookupService: ObjectLookupService, private dupService: DupService) { 
    this.preReqForm = this.fb.group({
      sdOid: '',
      preRequisiteTypeId: '',
      preRequisiteNotes: ''
    });
    this.embargoForm = this.fb.group({
      accessCheckStatusId: null,
      accessCheckBy: null,
      accessDetails: '',
      accessCheckDate: null,
      accessTypeId: null,
      downloadAllowed: false,
      embargoRegime: '',
      embargoRequested: null,
      embargoStillApplies: null,
      sdOid: ''
    });
    this.dupPreReqForm = this.fb.group({
      preRequisiteId: '',
      preRequisiteNotes: '',
      preRequisiteMet: '',
      metNotes: '',
      sdOid: ''
    })
}

  ngOnInit(): void {
    const todayDate = new Date();
    this.todayDate = {year: todayDate.getFullYear(), month: todayDate.getMonth()+1, day: todayDate.getDate()};
    if (this.type === 'dtpPrereq') {
      this.getPrereqTypes();
      this.getDtpObjectList(this.dtpId);
    }
    if (this.type === 'dtpEmbargo') {
      this.getAccessType();
      this.getDtpObjectList(this.dtpId);
    }
    if (this.type === 'dupPrereq') {
      this.getPrereqTypes();
      this.getDupObjectList(this.dupId);
    }
  }
  getPrereqTypes() {
    this.processLookup.getPrereqTypes().subscribe((res: any) => {
      if (res) {
        this.preRequTypes = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  getAccessType() {
    this.objectLookupService.getAccessTypes().subscribe((res: any) => {
      if(res.data) {
        this.accessTypes = res.data;
      }
    }, error => {
      this.toastr.error(error.error.title);
    });
  }
  getDtpObjectList(id) {
    this.spinner.show();
    this.dtpService.getDtpObjects(id).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectList = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title)
    })
  }
  getDupObjectList(id) {
    this.spinner.show();
    this.dupService.getDupObjects(id).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectList = res.data;
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
  onSave() {
    if (this.type === 'dtpPrereq') {
      this.spinner.show();
      const payload = this.preReqForm.value;
      this.dtpService.addDtpObjectPrereq(this.dtpId,payload.sdOid, payload).subscribe((res: any) => {
        this.spinner.hide();
        if(res.statusCode === 200) {
          this.toastr.success('Pre-Requisite added successfully');
          this.closeModal('data');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
    if (this.type === 'dtpEmbargo') {
      this.spinner.show();
      const payload = this.embargoForm.value;
      this.dtpService.addDtpObject(this.dtpId, payload.sdOid, payload).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Object Embargo added successfully');
          this.closeModal('data');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
    if (this.type === 'dupPrereq') {
      this.spinner.show();
      const payload = this.dupPreReqForm.value;
      payload.preRequisiteMet = this.dateToString(payload.preRequisiteMet);
      this.dupService.addDupObjectPrereq(this.dupId, payload.sdOid, payload).subscribe((res: any) => {
        this.spinner.hide();
        if (res.statusCode === 200) {
          this.toastr.success('Pre-Requisite added successfully');
          this.closeModal('data');
        } else {
          this.toastr.error(res.messages[0]);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
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
  closeModal(data) {
    this.activeModal.close(data);
  }

}
