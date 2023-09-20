import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ObjectRightInterface } from 'src/app/_rms/interfaces/data-object/object-right.interface';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-object-right',
  templateUrl: './object-right.component.html',
  styleUrls: ['./object-right.component.scss']
})
export class ObjectRightComponent implements OnInit {
  form: UntypedFormGroup;
  @Input() sdOid: string;
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  objectRight: ObjectRightInterface;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitRight: EventEmitter<any> = new EventEmitter();
  len: any;
  isBrowsing: boolean = false;

  constructor( private fb: UntypedFormBuilder, private router: Router, private objectService: DataObjectService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal) {
    this.form = this.fb.group({
      objectRights: this.fb.array([])
    });
   }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    if (this.isEdit || this.isView) {
      this.getObjectRight();
    }
  }
  objectRights(): UntypedFormArray {
    return this.form.get('objectRights') as UntypedFormArray;
  }

  newObjectRight(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdOid: '',
      rightsName: '',
      rightsUri: '',
      comments: '',
      alreadyExist: false
    });
  }

  addObjectRight() {
    this.len = this.objectRights().value.length;
    if (this.len) {
      if (this.objectRights().value[this.len-1].rightsName && this.objectRights().value[this.len-1].rightsUri) {
        this.objectRights().push(this.newObjectRight());
      } else {
        if (this.objectRights().value[this.len-1].alreadyExist) {
          this.objectRights().push(this.newObjectRight());
        } else {
          this.toastr.info('Please provide the Rights Name and Rights URL in the previously added Object Right');
        }
      }
    } else {
      this.objectRights().push(this.newObjectRight());
    }
  }

  removeObjectRight(i: number) {
    if (!this.objectRights().value[i].alreadyExist) {
      this.objectRights().removeAt(i);
    } else {
      const deleteModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      deleteModal.componentInstance.type = 'objectRight';
      deleteModal.componentInstance.id = this.objectRights().value[i].id;
      deleteModal.componentInstance.sdOid = this.objectRights().value[i].sdOid;
      deleteModal.result.then((data) => {
        if (data) {
          this.objectRights().removeAt(i);
        }
      }, error => {})
    }
  }
  getObjectRight() {
    this.spinner.show();
    const getObjectRights$ = this.isBrowsing ? this.objectService.getBrowsingObjectRights(this.sdOid) : this.objectService.getObjectRights(this.sdOid);
    getObjectRights$.subscribe((res: any) => {
      this.spinner.hide();
      if(res && res.data) {
        this.objectRight = res.data.length ? res.data : [];
        this.patchForm(this.objectRight);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(rights) {
    this.form.setControl('objectRights', this.patchArray(rights));
  }
  patchArray(rights): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    rights.forEach(right => {
      formArray.push(this.fb.group({
        id: right.id,
        sdOid: right.sdOid,
        rightsName: right.rightsName,
        rightsUri: right.rightsUri,
        comments: right.comments,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addRight(index) {
    this.spinner.show();
    const payload = this.form.value.objectRights[index];
    payload.sdOid = this.sdOid;
    delete payload.id;

    this.objectService.addObjectRight(this.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Right added successfully');
        this.getObjectRight();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  editRight(rightObject) {
    const payload = rightObject.value;
    this.spinner.show();
    this.objectService.editObjectRight(payload.id, payload.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if( res.statusCode === 200) {
        this.toastr.success('Object Right updated successfully');
        this.getObjectRight();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  emitData() {
    const payload = this.form.value.objectRights.map(item => {
      if (!item.id) {
        delete item.id;
      }
      if(this.sdOid) {
        item.sdOid = this.sdOid;
      }
      return item;
    })
    this.emitRight.emit({data: payload, isEmit: false});
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objectright'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
}
