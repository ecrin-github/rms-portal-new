import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/_rms/services/user/user.service';
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
    private userService: UserService,
    private fb: UntypedFormBuilder,
  ) {
    this.form = this.fb.group({
      lsAaiId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      organisation: ['', Validators.required],
      role: ['', ]
    });
  }

  ngOnInit(): void {
    this.user = this.statesService.currentUser;
    this.patchForm();

    // this.userService.getUserAccessData(this.statesService.currentUser.id).subscribe((res) => {
    //   console.log(`user access data: ${JSON.stringify(res)}`);
    // });
  }

  patchForm() {
    this.form.patchValue({
      lsAaiId: this.user.userProfile.lsAaiId,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      // title: this.user.userProfile.title,
      // designation: this.user.userProfile.designation,
      organisation: this.user.userProfile.organisation?.defaultName,
      role: this.user.isSuperuser ? 'Manager' : 'User'
    });
  }
}
