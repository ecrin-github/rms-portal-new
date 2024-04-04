import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ObjectContributorInterface } from 'src/app/_rms/interfaces/data-object/object-contributor.interface';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Router } from '@angular/router';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';

@Component({
  selector: 'app-object-contributor',
  templateUrl: './object-contributor.component.html',
  styleUrls: ['./object-contributor.component.scss']
})
export class ObjectContributorComponent implements OnInit {
  form: UntypedFormGroup;
  contributorType: [] = [];
  organizationList: [] = [];
  subscription: Subscription = new Subscription();
  @Input() objectId: string;
  @Input() isView: boolean;
  @Input() isEdit: boolean;
  objectContributor: ObjectContributorInterface;
  isIndividual = [];
  @Input() set initiateEmit(initiateEmit: any) {
    if (initiateEmit) {
      this.emitData();
    }
  }
  @Output() emitContributor: EventEmitter<any> = new EventEmitter();
  len: any;
  isBrowsing: boolean = false;
  pagesize: Number = 10000;
  personList = [];

  constructor( private fb: UntypedFormBuilder,private router: Router, private commonLooupService: CommonLookupService, private objectService: DataObjectService, private spinner: NgxSpinnerService, private toastr: ToastrService, private modalService: NgbModal, private listService: ListService) { 
    this.form = this.fb.group({
      objectContributors: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false;
    this.getContributorType();
    this.getOrganization();
    this.getPersonList();
    if (this.isEdit || this.isView) {
      this.getObjectContributor();
    }
  }
  objectContributors(): UntypedFormArray {
    return this.form.get('objectContributors') as UntypedFormArray;
  }

  newObjectContributor(): UntypedFormGroup {
    return this.fb.group({
      id: '',
      objectId: '',
      contributorType: '',
      isIndividual: false,
      organisation: '',
      person: '',
      alreadyExist: false
    });
  }

  addObjectContributor() {
    this.len = this.objectContributors().value.length;
    if (this.len) {
      if (this.objectContributors().value[this.len-1].contributorType) {
        this.objectContributors().push(this.newObjectContributor());
      } else {
        if (this.objectContributors().value[this.len-1].alreadyExist) {
          this.objectContributors().push(this.newObjectContributor());
        } else {
          this.toastr.info('Please provide the Contributor type in the previously added Object Contributor');
        }
      }
    } else {
      this.objectContributors().push(this.newObjectContributor());
    }
  }

  removeObjectContributor(i: number) {
    if (!this.objectContributors().value[i].alreadyExist) {
      this.objectContributors().removeAt(i);
    } else {
      const removeModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
      removeModal.componentInstance.type = 'objectContributor';
      removeModal.componentInstance.id = this.objectContributors().value[i].id;
      removeModal.componentInstance.objectId = this.objectContributors().value[i].objectId;
      removeModal.result.then((data) => {
        if (data) {
          this.objectContributors().removeAt(i);
        }
      }, error => {})
    }
  }
  getContributorType() {
    this.commonLooupService.getContributorTypes(this.pagesize).subscribe((res: any) => {
      if (res.results) {
        this.contributorType = res.results;
      }
    }, error => {
      console.log('error', error);
    });
  }
  getObjectContributor() {
    this.objectService.getObjectContributors(this.objectId).subscribe((res: any) => {
      if (res && res.results) {
        this.objectContributor = res.results.length ? res.results : [];
        this.patchForm(this.objectContributor);
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  patchForm(contributors) {
    this.form.setControl('objectContributors', this.patchArray(contributors));
  }
  patchArray(contributors): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    contributors.forEach(contributor => {
      formArray.push(this.fb.group({
        id: contributor.id,
        objectId: contributor.objectId,
        contributorType: contributor.contributorType ? contributor.contributorType.id : null,
        isIndividual: contributor.isIndividual,
        organisation: contributor.organisation ? contributor.organisation.id : null,
        person: contributor.person ? contributor.person.id : null,
        alreadyExist: true
      }))
    });
    return formArray;
  }
  addContributor(index) {
    this.spinner.show();
    const payload = this.form.value.objectContributors[index];
    payload.objectId = this.objectId;
    payload.isIndividual = payload.isIndividual === 'true' ? true : false;
    delete payload.id;

    this.objectService.addObjectContributor(this.objectId, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 201) {
        this.toastr.success('Object Contributor added successfully');
        this.getObjectContributor();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  editContributor(contributorObject) {
    const payload = contributorObject.value;
    payload.isIndividual = payload.isIndividual === 'true' ? true : false;
    this.spinner.show();
    this.objectService.editObjectContributor(payload.id, payload.objectId, payload).subscribe((res: any) => {
      this.spinner.hide();
      if (res.statusCode === 200) {
        this.toastr.success('Object Contributor updated successfully');
        this.getObjectContributor();
      } else {
        this.toastr.error(res.messages[0]);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
    getOrganization() {
    this.commonLooupService.getOrganizationList(this.pagesize).subscribe((res: any) => {
      if (res && res.results) {
        this.organizationList = res.results;
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  findOrganization(id) {
    const organizationArray: any = this.organizationList.filter((type: any) => type.id === id);
    return organizationArray && organizationArray.length ? organizationArray[0].defaultName : '';
  }
  findContributorType(id) {
    const contributorArray: any = this.contributorType.filter((type: any) => type.id === id);
    return contributorArray && contributorArray.length ? contributorArray[0].name : '';
  }
  emitData() {
    const payload = this.form.value.objectContributors.map(item => {
      item.isIndividual = item.isIndividual === 'true' ? true : false;
      if (!item.id) {
        delete item.id;
      }
      if(this.objectId) {
        item.objectId = this.objectId;
      }
      return item;
    })
    this.emitContributor.emit({data: payload, isEmit: false});
  }
  onChange(index) {
    this.isIndividual[index] = this.form.value.studyContributors[index].isIndividual === 'true' ? true : false;
  }
  scrollToElement(): void {
    setTimeout(() => {
      const yOffset = -200; 
      const element = document.getElementById('objectconst'+this.len);
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({top: y, behavior: 'smooth'});
    });
  }
  getPersonList() {
    this.listService.getPeopleList(this.pagesize, '').subscribe((res: any) => {
      if (res && res.results) {
        this.personList = res.results;
      }
    }, error => {

    })
  }
  findPerson(id) {
    const personArray: any = this.personList.filter((item: any) => item.id === id);
    return personArray && personArray.length ? personArray[0].firstName + ' ' + personArray[0].lastName : ''
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
