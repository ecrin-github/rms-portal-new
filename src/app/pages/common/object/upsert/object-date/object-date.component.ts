import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ObjectDateInterface } from 'src/app/_rms/interfaces/data-object/object-date.interface';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-object-date',
  templateUrl: './object-date.component.html',
  styleUrls: ['./object-date.component.scss']
})
export class ObjectDateComponent implements OnInit {
  form: UntypedFormGroup;
  dateType: [] = [];
  subscription: Subscription = new Subscription();
  @Input() sdOid: string;
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  objectDateData: ObjectDateInterface;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitDate: EventEmitter<any> = new EventEmitter();
  monthValues = [{id:'1', name:'January'}, {id:'2', name:'February'}, {id:'3', name: 'March'}, {id:'4', name: 'April'}, {id:'5', name: 'May'}, {id:'6', name: 'June'}, {id:'7', name: 'July'}, {id:'8', name: 'August'}, {id:'9', name: 'September'}, {id:'10', name: 'October'}, {id:'11', name:'November'}, {id:'12', name: 'December'}];
  dayValues = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13','14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  showEndday = [];
  len: any;
  isBrowsing: boolean = false;

  constructor( private fb: UntypedFormBuilder, private router: Router, private objectLookupService: ObjectLookupService, private objectService: DataObjectService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal) {
    this.form = this.fb.group({
      objectDates: this.fb.array([])
    })
   }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getDateType();
    if(this.isEdit || this.isView) {
      this.getObjectDate();
    }
  }
  objectDates(): UntypedFormArray {
    return this.form.get('objectDates') as UntypedFormArray;
  }

  newObjectDate(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdOid: '',
      dateTypeId: '',
      dateIsRange: false,
      dateAsString: '',
      startDay: null,
      startMonth: null,
      startYear:null,
      endDay: null,
      endMonth:null,
      endYear: null,
      details: '',
      alreadyExist: false
    });
  }

  addObjectDate() {
    this.len = this.objectDates().value.length;
    if (this.len) {
      if (this.objectDates().value[this.len-1].dateTypeId && this.objectDates().value[this.len-1].startYear) {
        this.objectDates().push(this.newObjectDate());
        this.showEndday.push(false);
      } else {
        if (this.objectDates().value[this.len-1].alreadyExist) {
          this.objectDates().push(this.newObjectDate());
          this.showEndday.push(false);
        } else {
          this.toastr.info('Please provide the Date Type and Start Year in the previously added Object Date');
        }
      }
    } else {
      this.objectDates().push(this.newObjectDate());
      this.showEndday.push(false);
    }
  }

  removeObjectDate(i: number) {
    if (!this.objectDates().value[i].alreadyExist) {
      this.objectDates().removeAt(i);
      this.showEndday.splice(i, 1);
    } else {
      const deleteModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      deleteModal.componentInstance.type = 'objectDate';
      deleteModal.componentInstance.id = this.objectDates().value[i].id;
      deleteModal.componentInstance.sdOid = this.objectDates().value[i].sdOid;
      deleteModal.result.then((data) => {
        if (data) {
          this.objectDates().removeAt(i);
          this.showEndday.splice(i, 1);
        }
      }, error => {})
    }
  }
  getDateType() {
    const getDateType$ = this.isBrowsing ? this.objectLookupService.getBrowsingDateTypes() :this.objectLookupService.getDateTypes();
    getDateType$.subscribe((res: any) => {
      if(res.data) {
        this.dateType = res.data
      }
    }, error => {
      console.log('error', error);
    })
  }
  getObjectDate() {
    this.spinner.show();
    const getObjectDates$ = this.isBrowsing ? this.objectService.getBrowsingObjectDates(this.sdOid) : this.objectService.getObjectDates(this.sdOid);
    getObjectDates$.subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectDateData = res.data.length ? res.data : [];
        this.patchForm(this.objectDateData);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(dates) {
    this.form.setControl('objectDates',this.patchArray(dates));
  }
  patchArray(dates): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    dates.forEach((date, index) => {
      formArray.push(this.fb.group({
        id: date.id,
        sdOid: date.sdOid,
        dateTypeId: date.dateTypeId,
        dateIsRange: date.dateIsRange,
        dateAsString: date.dateAsString,
        startDay: date.startDay,
        startMonth: date.startMonth,
        startYear: date.startYear ? new Date(`01/01/${date.startYear}`) : '',
        endDay: date.endDay,
        endMonth: date.endMonth,
        endYear: date.endYear ? new Date(`01/01/${date.endYear}`) : '',
        details: date.details,
        alreadyExist: true
      }))
      this.showEndday[index] = date.dateIsRange ? true : false;
    });
    return formArray;
  }
  addDate(index) {
    this.spinner.show();
    const payload = this.form.value.objectDates[index];
    payload.sdOid = this.sdOid;
    payload.startYear = payload.startYear ? payload.startYear.getFullYear() : null;
    payload.endYear = payload.endYear ? payload.endYear.getFullYear() : null;
    payload.dateIsRange = payload.dateIsRange === 'true' ? true : false 
    delete payload.id;

    this.objectService.addObjectDate(this.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Date added successfully');
        this.getObjectDate();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  editDate(dateObject, index) {
    const payload = dateObject.value;
    payload.startYear = payload.startYear ? payload.startYear.getFullYear() : null;
    payload.endYear = payload.endYear ? payload.endYear.getFullYear() : null;
    payload.dateIsRange = payload.dateIsRange === 'true' ? true : false 
    this.spinner.show();
    this.objectService.editObjectDate(payload.id, payload.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Date update successfully');
        this.getObjectDate();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
    this.objectDates().at(index).patchValue({
      startYear: payload.startYear ? new Date(`01/01/${payload.startYear}`) : '',
      endYear: payload.endYear ? new Date(`01/01/${payload.endYear}`) : '',
    })
  }
  getYear(date) {
    return date ? date.getFullYear() : ''
  }
  findDateType(id) {
    const dateTypeArray: any = this.dateType.filter((type: any) => type.id === id);
    return dateTypeArray && dateTypeArray.length ? dateTypeArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.objectDates.map(item => {
      item.startYear = item.startYear ? item.startYear.getFullYear() : null;
      item.endYear = item.endYear ? item.endYear.getFullYear() : null;  
      item.dateIsRange = item.dateIsRange === 'true' ? true : false 
      if (!item.id) {
        delete item.id;
      }
      if(this.sdOid) {
        item.sdOid = this.sdOid;
      }
      return item;
    })
    this.emitDate.emit({data: payload, isEmit: false});
    this.form.value.objectDates.map((item1, index) => {
      this.objectDates().at(index).patchValue({
        startYear: item1.startYear ? new Date(`01/01/${item1.startYear}`) : '',
        endYear: item1.endYear ? new Date(`01/01/${item1.endYear}`) : '',
      })
    })
  }
  onChange(index) {
    this.showEndday[index] = this.form.value.objectDates[index].dateIsRange === true || this.form.value.objectDates[index].dateIsRange === 'true' ? true : false;
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objectdate'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
