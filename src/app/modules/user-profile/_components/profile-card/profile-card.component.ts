import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from 'src/app/_rms/services/user/user.service';
import {UserInterface} from '../../../../_rms/interfaces/user/user.interface';
import {States} from '../../../../_rms/states/states';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {
  user$: Observable<UserInterface>;
  user: any;
  constructor(
      public states: States,
      private userService: UserService
  ) {
    this.user$ = this.states.currentUser.asObservable();
    this.getUserData();
  }
  getUserData() {
    if (localStorage.getItem('userData')) {
      this.user = JSON.parse(localStorage.getItem('userData'));
    } else {
      this.userService.getUser().subscribe((res: any) => {
        if (res.data && res.data.length) {
          this.user = res.data[0];
          this.user.pic = './assets/media/svg/avatars/001-boy.svg';
          this.user.companyName = '';
          this.user.address = '';
          this.user.phone = '';
        }
      }, error => {
        console.log('error', error);
      });
    }
  }
}
