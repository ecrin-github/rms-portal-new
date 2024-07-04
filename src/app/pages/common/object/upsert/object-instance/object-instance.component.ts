import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ObjectInstanceInterface } from 'src/app/_rms/interfaces/data-object/object-instance.interface';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { Router } from '@angular/router';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';

@Component({
  selector: 'app-object-instance',
  templateUrl: './object-instance.component.html',
  styleUrls: ['./object-instance.component.scss']
})
export class ObjectInstanceComponent implements OnInit {
  form: UntypedFormGroup;
  sizeUnit: [] = [];
  resourceType: [] = [];
  organizationList: []  [];
  subscription: Subscription = new Subscription();
  @Input() objectId: string;
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  objectInstance: ObjectInstanceInterface;
  isBrowsing: boolean = false;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitInstance: EventEmitter<any> = new EventEmitter();
  len: any;
  pageSize: number = 10000;

  constructor( private fb: UntypedFormBuilder, private router: Router, private objectLookupService: ObjectLookupService, private objectService: DataObjectService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal, private commonLookup: CommonLookupService) { 
    this.form = this.fb.group({
      objectInstances: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getSizeUnit();
    this.getResourceType();
    this.getOrganization();
    if (this.isEdit || this.isView) {
      this.getObjectInstance();
    }
  }
  objectInstances(): UntypedFormArray {
    return this.form.get('objectInstances') as UntypedFormArray;
  }

  newObjectInstance(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      objectId: '',
      repositoryOrg: '',
      urlAccessible: false,
      url: [{value: '', disabled: true}],
      resourceType: '',
      resourceSize: 0,
      resourceSizeUnit: '',
      resourceComments: '',
      alreadyExist: false
    });
  }

  addObjectInstance() {
    this.len = this.objectInstances().value.length;
    if (this.len) {
      if (this.objectInstances().value[this.len-1].urlAccessible === true || this.objectInstances().value[this.len-1].urlAccessible === 'true' ? this.objectInstances().value[this.len-1].repositoryOrg && this.objectInstances().value[this.len-1].url : this.objectInstances().value[this.len-1].repositoryOrg) {
        this.objectInstances().push(this.newObjectInstance());
      } else {
        if (this.objectInstances().value[this.len-1].alreadyExist) {
          this.objectInstances().push(this.newObjectInstance());
        } else {
          if (this.objectInstances().value[this.len-1].urlAccessible === true || this.objectInstances().value[this.len-1].urlAccessible === 'true') {
            this.toastr.info('Please provide the Repository Organistion and URL in the previously added Object Instance');
          } else {
            this.toastr.info('Please provide the Repository Organistion in the previously added Object Instance');
          }
        }
      }
    } else {
      this.objectInstances().push(this.newObjectInstance());
    }
  }

  removeObjectInstance(i: number) {
    if (!this.objectInstances().value[i].alreadyExist) {
      this.objectInstances().removeAt(i);
    } else {
      const deleteModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop:'static'});
      deleteModal.componentInstance.type = 'objectInstance';
      deleteModal.componentInstance.id = this.objectInstances().value[i].id;
      deleteModal.componentInstance.objectId = this.objectInstances().value[i].objectId;
      deleteModal.result.then((data) => {
        if (data) {
          this.objectInstances().removeAt(i);
        }
      }, error => {})
    }
  }
  getSizeUnit() {
    this.objectLookupService.getSizeUnits(this.pageSize).subscribe((res: any) => {
      if(res.results) {
        this.sizeUnit = res.results;
      }
    }, error => {
      console.log('error', error);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    });
  }
  getResourceType() {
    this.objectLookupService.getResourceTypes(this.pageSize).subscribe((res: any) => {
      if (res.results) {
        this.resourceType = res.results;
      }
    }, error => {
      console.log('error',error);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    });
  }
  getObjectInstance() {
    this.objectService.getObjectInstances(this.objectId, this.pageSize).subscribe((res: any) => {
      if (res && res.results) {
        this.objectInstance = res.results.length ? res.results : [];
        this.patchForm(this.objectInstance);
      }
    }, error => {
      // this.toastr.error(error.error.title);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    })
  }
  patchForm(instances) {
    this.form.setControl('objectInstances', this.patchArray(instances));
  }
  patchArray(instances): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    instances.forEach(instance => {
      formArray.push(this.fb.group({
        id: instance.id,
        objectId: instance.objectId,
        repositoryOrg: instance.repositoryOrg ? instance.repositoryOrg.id : null,
        urlAccessible: instance.urlAccessible,
        url: instance.url,
        resourceType: instance.resourceType ? instance.resourceType.id : null,
        resourceSize: instance.resourceSize,
        resourceSizeUnit: instance.resourceSizeUnit ? instance.resourceSizeUnit.id : null,
        resourceComments: instance.resourceComments,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addInstance(index) {
    this.spinner.show();
    const payload = this.form.value.objectInstances[index];
    payload.objectId = this.objectId;
    payload.urlAccessible = payload.urlAccessible === 'true' ? true : false;
    delete payload.id;

    this.objectService.addObjectInstance(this.objectId, payload).subscribe((res: any) => {
      this.spinner.hide();
      if( res.statusCode === 201) {
        this.toastr.success('Object Instance added successfully');
        this.getObjectInstance();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      // this.toastr.error(error.error.title);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    })
  }
  editInstance(instanceObject) {
    const payload = instanceObject.value;
    payload.urlAccessible = payload.urlAccessible === 'true' ? true : false;
    this.spinner.show();
    this.objectService.editObjectInstance(payload.id, payload.objectId, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Instance updated successfully');
        this.getObjectInstance();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      // this.toastr.error(error.error.title);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    })
  }
  getOrganization() {
    this.commonLookup.getOrganizationList(this.pageSize).subscribe((res: any) => {
      if (res && res.results) {
        this.organizationList = res.results;
      }
    }, error => {
      // this.toastr.error(error.error.title);
      const arr = Object.keys(error.error);
      arr.map((item,index) => {
        this.toastr.error(`${item} : ${error.error[item]}`);
      })
    })
  }
  findResourceType(id) {
    const resourceArray: any = this.resourceType.filter((type: any) => type.id === id);
    return resourceArray && resourceArray.length ? resourceArray[0].name : '';
  }
  findOrganizationType(id) {
    const orgArr: any = this.organizationList?.filter((type:any) => type.id === id);
    return orgArr && orgArr.length ? orgArr[0].defaultName : '';
  }
  findSizeUnit(id) {
    const sizeArray: any = this.sizeUnit.filter((type: any) => type.id === id);
    return sizeArray && sizeArray.length ? sizeArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.objectInstances.map(item => {
      item.urlAccessible = item.urlAccessible === 'true' ? true : false;
      if (!item.id) {
        delete item.id;
      }
      if(this.objectId) {
        item.objectId = this.objectId;
      }
      return item;
    })
    this.emitInstance.emit({data: payload, isEmit: false});
  }
  onChange(index) {
    if (this.objectInstances().value[index].urlAccessible === 'true' || this.objectInstances().value[index].urlAccessible === true) {
      this.objectInstances().controls[index].get('url').enable();
    } else {
      this.objectInstances().controls[index].get('url').disable();
    }
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objectinst'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
