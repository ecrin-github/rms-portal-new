import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/_rms/services/user/user.service';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  form: UntypedFormGroup;
  avatarPic = 'none';
  user: any;
  orgId: string;
  orgName: string;

  constructor(
    private statesService: StatesService,
    private fb: UntypedFormBuilder,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      pic: ['', Validators.required],
      userName: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      country: ['', Validators.required],
      organisation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.orgId = this.statesService.currentAuthOrgId;
    if (this.orgId !== null && this.orgId !== undefined && this.orgId !== 'null' && this.orgId !== 'undefined') {
      const orgUrl = environment.baseUrl + '/general/organisations/' + this.orgId;
      this.http.get(orgUrl).subscribe((response) => {
        if (response != null) {
          this.orgName = response['defaultName'];
        }
        this.getUserData();
      })
    }
    else{
      this.getUserData();
    }
  }

  patchForm() {
    this.form.patchValue({
      pic: this.user.pic,
      userName: this.user.name,
      firstName: this.user.given_name ? this.user.given_name : '',
      lastName: this.user.family_name,
      email: this.user.email,
      phone: this.user.phone,
      country: this.user.location,
      organisation: this.user.organisation ? this.orgName : this.orgName
    });
  }
  getUserData() {
    // TODO
    this.user = this.statesService.currentUser;
    this.user.pic = 'none';
    this.user.country = '';
    this.user.phone = '';
    this.user.organisation = this.orgName
    this.patchForm();
  }
  getPic() {
    if (!this.user?.pic) {
      return 'none';
    }
    return `url('${this.user?.pic}')`;
  }
  deletePic() {
    this.user.pic = '';
  }
  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }
  
  isControlInvalid(controlName: string): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
