import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/_rms/services/user/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  form: UntypedFormGroup;
  avatarPic = 'none';
  user: any;
  constructor( private fb: UntypedFormBuilder, private userService: UserService) { 
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
    this.getUserData();
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
      organisation: this.user.organisation ? this.user.organisation : ''
    });
  }
  getUserData() {
    if (localStorage.getItem('userData')) {
      this.user = JSON.parse(localStorage.getItem('userData'));
      this.user.pic = 'none';
      this.user.country = '';
      this.user.phone = '';
      this.patchForm();
    } else {
      this.userService.getUser().subscribe((res: any) => {
        console.log('res', res);
        if (res) {
          this.user = res;
          this.user.pic = 'none';
          this.user.country = '';
          this.user.phone = '';
          this.patchForm();
        }
      }, error => {
        console.log('error', error);
      });
    }
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
