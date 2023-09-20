import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ObjectTopicInterface } from 'src/app/_rms/interfaces/data-object/object-topic.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-object-topic',
  templateUrl: './object-topic.component.html',
  styleUrls: ['./object-topic.component.scss']
})
export class ObjectTopicComponent implements OnInit {
  form: UntypedFormGroup;
  topicType: [] = [];
  subscription: Subscription = new Subscription();
  @Input() sdOid: string;
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  objectTopic: ObjectTopicInterface;
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitTopic: EventEmitter<any> = new EventEmitter();
  len: any;
  isBrowsing: boolean = false;

  constructor( private fb: UntypedFormBuilder,private router: Router, private commonLookupService: CommonLookupService, private spinner: NgxSpinnerService, private toastr: ToastrService, private objectService: DataObjectService, private modalService: NgbModal) {
    this.form = this.fb.group({
      objectTopics: this.fb.array([])
    });
   }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getTopicType();
    if (this.isView || this.isEdit) {
      this.getObjectTopic();
    }
  }
  objectTopics(): UntypedFormArray {
    return this.form.get('objectTopics') as UntypedFormArray;
  }

  newObjectTopic(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      sdOid: '',
      topicTypeId: '',
      meshCoded: false,
      meshCode: '',
      meshValue: '',
      meshQualcode: '',
      meshQualvalue: '',
      originalValue: '',
      alreadyExist: false
    });
  }

  addObjectTopic() {
    this.len = this.objectTopics().value.length;
    if (this.len) {
      if (this.objectTopics().value[this.len-1].topicTypeId && this.objectTopics().value[this.len-1].meshValue) {
        this.objectTopics().push(this.newObjectTopic());
      } else {
        if (this.objectTopics().value[this.len-1].alreadyExist) {
          this.objectTopics().push(this.newObjectTopic());
        } else {
          this.toastr.info('Please provide the Topic Type and Topic Value in the previously added Object Topic');
        }
      }
    } else {
      this.objectTopics().push(this.newObjectTopic());
    }
  }

  removeObjectTopic(i: number) {
    if (!this.objectTopics().value[i].alreadyExist) {
      this.objectTopics().removeAt(i);
    } else {
      const removeModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      removeModal.componentInstance.type = 'objectTopic';
      removeModal.componentInstance.id = this.objectTopics().value[i].id;
      removeModal.componentInstance.sdOid = this.objectTopics().value[i].sdOid;
      removeModal.result.then((data) => {
        if (data) {
          this.objectTopics().removeAt(i);
        }
      }, error => {})
    }
  }
  getTopicType() {
    const getTopicType$ = this.isBrowsing ? this.commonLookupService.getBrowsingTopicTypes() : this.commonLookupService.getTopicTypes();
    getTopicType$.subscribe((res: any) => {
      if(res.data) {
        this.topicType = res.data;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getObjectTopic() {
    const getObjectTopics$ = this.isBrowsing ? this.objectService.getBrowsingObjectTopics(this.sdOid) : this.objectService.getObjectTopics(this.sdOid);
    this.spinner.show();
    getObjectTopics$.subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.objectTopic = res.data.length ? res.data : [];
        this.patchForm(this.objectTopic);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  patchForm(topics) {
    this.form.setControl('objectTopics', this.patchArray(topics));
  }
  patchArray(topics): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    topics.forEach(topic => {
      formArray.push(this.fb.group({
        id: topic.id,
        sdOid: topic.sdOid,
        topicTypeId: topic.topicTypeId,
        meshCoded: topic.meshCoded,
        meshCode: topic.meshCode,
        meshValue: topic.meshValue,
        meshQualcode: topic.meshQualcode,
        meshQualvalue: topic.meshQualvalue,
        originalValue: topic.originalValue,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addTopic(index) {
    this.spinner.show();
    const payload = this.form.value.objectTopics[index];
    payload.sdOid = this.sdOid;
    payload.meshCoded = payload.meshCoded === 'true' ? true : false;
    delete payload.id;

    this.objectService.addObjectTopic(this.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Obect Topic added successfully');
        this.getObjectTopic();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  editTopic(topicObject) {
    const payload = topicObject.value;
    payload.meshCoded = payload.meshCoded === 'true' ? true : false;
    this.spinner.show();
    this.objectService.editObjectTopic(payload.id, payload.sdOid, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Topic updated successfully');
        this.getObjectTopic();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  findTopicType(id) {
    const topicTypeArrray: any = this.topicType.filter((type: any) => type.id === id);
    return topicTypeArrray && topicTypeArrray.length ? topicTypeArrray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.objectTopics.map(item => {
      item.meshCoded = item.meshCoded === 'true' ? true : false;
      if (!item.id) {
        delete item.id;
      }
      if(this.sdOid) {
        item.sdOid = this.sdOid;
      }
      return item;
    })
    this.emitTopic.emit({data: payload, isEmit: false});
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objecttopic'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
