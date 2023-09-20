import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ObjectDescriptionInterface } from 'src/app/_rms/interfaces/data-object/object-description.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ObjectLookupService } from 'src/app/_rms/services/entities/object-lookup/object-lookup.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-object-description',
  templateUrl: './object-description.component.html',
  styleUrls: ['./object-description.component.scss']
})
export class ObjectDescriptionComponent implements OnInit {
  form: UntypedFormGroup;
  descriptionType: [] = [];
  languageCode: [] = [];
  subscription: Subscription = new Subscription();
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  @Input() sdOid: string;
  objectDescription: ObjectDescriptionInterface;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitDescription: EventEmitter<any> = new EventEmitter();
  len: any;
  isBrowsing: boolean = false;
  
  constructor( private fb: UntypedFormBuilder, private router: Router, private commonLookupService: CommonLookupService, private objectLookupService: ObjectLookupService, private objectService: DataObjectService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal) {
    this.form = this.fb.group({
      objectDescriptions: this.fb.array([])
    })
   }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getDescriptionType();
    this.getLanguageCode();
    if (this.isEdit || this.isView) {
      this.getObjectDescription();
    }
  }
  objectDescriptions(): UntypedFormArray {
    return this.form.get('objectDescriptions') as UntypedFormArray;
  }

  newObjectDescription(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdOid: '',
      descriptionTypeId: '',
      label: '',
      descriptionText: '',
      langCode: 'en',
      alreadyExist: false
    });
  }

  addObjectDescription() {
    this.len = this.objectDescriptions().value.length;
    if (this.len) {
      if (this.objectDescriptions().value[this.len-1].descriptionTypeId) {
        this.objectDescriptions().push(this.newObjectDescription());
      } else {
        if (this.objectDescriptions().value[this.len-1].alreadyExist) {
          this.objectDescriptions().push(this.newObjectDescription());
        } else {
          this.toastr.info('Please provide the Description Type and Description label in the previously added Object Description');
        }
      }
    } else {
      this.objectDescriptions().push(this.newObjectDescription());
    }
  }

  removeObjectDescription(i: number) {
    if(!this.objectDescriptions().value[i].alreadyExist) {
      this.objectDescriptions().removeAt(i);
    } else {
      const removeModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      removeModal.componentInstance.type = 'objectDescription';
      removeModal.componentInstance.id = this.objectDescriptions().value[i].id;
      removeModal.componentInstance.sdOid = this.objectDescriptions().value[i].sdOid;
      removeModal.result.then((data) => {
        if (data) {
          this.objectDescriptions().removeAt(i);
        }
      }, error => {})
    }
  }
  getDescriptionType() {
    const getDescriptionType$ = this.isBrowsing ? this.objectLookupService.getBrowsingDescriptionTypes() : this.objectLookupService.getDescriptionTypes();
    getDescriptionType$.subscribe((res: any) => {
      if(res.data) {
        this.descriptionType = res.data;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getLanguageCode() {
    const getLanguageCode$ = this.isBrowsing ? this.commonLookupService.getBrowsingLanguageCodes('en') : this.commonLookupService.getLanguageCodes('en')
    getLanguageCode$.subscribe((res:any) => {
      if(res.data) {
        this.languageCode = res.data;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getObjectDescription() {
    const getObjectDescriptions$ = this.isBrowsing ? this.objectService.getBrowsingObjectDescriptions(this.sdOid) : this.objectService.getObjectDescriptions(this.sdOid);
    this.spinner.show();
    getObjectDescriptions$.subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectDescription = res.data.length ? res.data : [];
        this.patchForm(this.objectDescription);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(descriptions) {
    this.form.setControl('objectDescriptions', this.patchArray(descriptions));
  }
  patchArray(descriptions): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    descriptions.forEach(description => {
      formArray.push(this.fb.group({
        id: description.id,
        sdOid: description.sdOid,
        descriptionTypeId: description.descriptionTypeId,
        label: description.label,
        descriptionText: description.descriptionText,
        langCode: description.langCode,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addDescription(index) {
    this.spinner.show();
    const payload = this.form.value.objectDescriptions[index];
    payload.sdOid = this.sdOid;
    delete payload.id;

    this.objectService.addObjectDescription(this.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Description added successfully');
        this.getObjectDescription();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  editDescription(descriptionObject) {
    const payload = descriptionObject.value;
    this.spinner.show();
    this.objectService.editObjectDescription(payload.id, payload.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Description updated successfully');
        this.getObjectDescription();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findDescriptionType(id) {
    const descriptionArray: any = this.descriptionType.filter((type: any) => type.id === id);
    return descriptionArray && descriptionArray.length ? descriptionArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.objectDescriptions.map(item => {
      if (!item.id) {
        delete item.id;
      }
      if(this.sdOid) {
        item.sdOid = this.sdOid;
      }
      return item;
    })
    this.emitDescription.emit({data: payload, isEmit: false});
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objectdesc'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
