import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../../../../_rms';
import { Observable } from 'rxjs';
import {UserInterface} from '../../../../../interfaces/user/user.interface';
import {States} from '../../../../../states/states';
import {AuthService} from '../../../../../services/auth/auth.service';
import { UserService } from 'src/app/_rms/services/user/user.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';


@Component({
  selector: 'app-user-offcanvas',
  templateUrl: './user-offcanvas.component.html',
  styleUrls: ['./user-offcanvas.component.scss'],
})
export class UserOffcanvasComponent implements OnInit {
  extrasUserOffcanvasDirection = 'offcanvas-right';
  user$: Observable<UserInterface>;
  userData: any;

  constructor(
      private layout: LayoutService,
      private states: States,
      private auth: AuthService,
      private userService: UserService,
      private oidcSecurityService: OidcSecurityService
  ) {}

  ngOnInit(): void {
    this.extrasUserOffcanvasDirection = `offcanvas-${this.layout.getProp(
      'extras.user.offcanvas.direction'
    )}`;
    this.user$ = this.states.currentUser.asObservable();
    this.getUserData();
  }
  getUserData() {
    if (localStorage.getItem('userData')) {
      this.userData = JSON.parse(localStorage.getItem('userData'));
    } else {
        this.userService.getUser().subscribe((res: any) => {
          if (res) {
            console.log(res);
            this.userData = res;
            this.userData.pic = './assets/media/svg/avatars/001-boy.svg';
            this.userData.occupation = '';
          }
        }, error => {
          console.log('error', error);
        });
    }
  }

  logout() {
    this.oidcSecurityService.logoff();
    document.location.reload();
    localStorage.clear();
  }
}
