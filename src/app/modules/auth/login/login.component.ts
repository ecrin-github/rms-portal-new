import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from '../../../_rms/services/auth/auth.service';
import {UserInterface} from '../../../_rms/interfaces/user/user.interface';
import {States} from '../../../_rms/states/states';
import {StatesService} from '../../../_rms/services/states/states.service';
import {PrivilegesService} from '../../../_rms/services/privileges/privileges.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  internalAuth: any = {
    email: 'sergei.gorianin@ecrin.org',
    password: 'admin',
  };
  externalAuth: any = {
    email: 'username@mail.org',
    password: 'username',
  };
  loginForm: UntypedFormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private states: States,
    private statesService: StatesService,
    private privilegesService: PrivilegesService,
    private route: ActivatedRoute,
    private router: Router,
    public oidcSecurityService: OidcSecurityService
  ) { }

  ngOnInit(): void { }

  get f() {
    return this.loginForm.controls;
  }
  login() {
    this.oidcSecurityService.authorize();
  }
  goToContact() {
    this.router.navigate([])
      .then(result => { window.open('/contactUs', '_blank'); });
  }
  goToBrowse() {
    this.router.navigate([])
      .then(result => { window.open('/browsing', '_blank'); });
  }
}
