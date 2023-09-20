import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { PeopleService } from 'src/app/_rms/services/entities/people/people.service';

@Component({
  selector: 'app-upsert-user',
  templateUrl: './upsert-user.component.html',
  styleUrls: ['./upsert-user.component.scss']
})
export class UpsertUserComponent implements OnInit {
  organizationList: [] = [];
  userForm: UntypedFormGroup;
  isEdit: boolean = false;
  isView: boolean = false;
  id: any;
  userData: any;
  submitte: boolean = false;

  constructor( private fb: UntypedFormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private peopleService: PeopleService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private commonLookup: CommonLookupService) {
    this.userForm = this.fb.group({
      familyName: '',
      givenName: '',
      designation: '',
      orgId: '',
      email: ''
    })
   }

  ngOnInit(): void {
    this.getOrganization();
    this.isEdit = this.router.url.includes('edit') ? true : false;
    this.isView = this.router.url.includes('view') ? true : false;
    if (this.isEdit || this.isView) {
      this.id = this.activatedRoute.snapshot.params.id;
      this.getPeopleById(this.id);
    }
  }
  getPeopleById(id) {
    this.spinner.show();
    this.peopleService.getPeopleById(this.id).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.userData = res.data[0];
        this.patchForm(this.userData);
      }
    }, error => {
      this.spinner.hide();
    })
  }
  patchForm(userData) {
    this.userForm.patchValue({
      familyName: userData.familyName,
      givenName: userData.givenName,
      designation: userData.designation,
      orgId: userData.orgId,
      email: userData.email
    })
  }
  getOrganization() {
    this.spinner.show();
    this.commonLookup.getOrganizationList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.organizationList = res.data;
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  onSave() {
    if (localStorage.getItem('updateUserList')) {
      localStorage.removeItem('updateUserList');
    }
    const payload = JSON.parse(JSON.stringify(this.userForm.value));
    this.submitte = true;
    if (this.userForm.valid) {
      if (this.isEdit) {
        this.spinner.show();
        payload.id = this.id;
        payload.orgName = this.findOrganization(payload.orgId);
        this.peopleService.editPeople(this.id, payload).subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.toastr.success('Information updated successfully');
            localStorage.setItem('updateUserList', 'true');
          } else {
            this.toastr.error(res.messages[0]);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      } else {
        this.spinner.show();
        payload.orgName = this.findOrganization(payload.orgId);
        this.peopleService.addPeople(payload).subscribe((res: any) => {
          this.spinner.hide();
          if (res.statusCode === 200) {
            this.toastr.success('People added successfully');
            localStorage.setItem('updateUserList', 'true');
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(error.error.title);
        })
      }
    }
  }
  close() {
    window.close();
  }
  findOrganization(id) {
    const organizationArray: any = this.organizationList.filter((item: any) => item.orgId === id);
    return organizationArray && organizationArray.length ? organizationArray[0].name : '';
  }

}
