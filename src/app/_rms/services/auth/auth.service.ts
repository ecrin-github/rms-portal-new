import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError, mergeMap, timeout } from 'rxjs/operators';
import { ToastrService  } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserInterface } from '../../interfaces/user/user.interface';
import { AuthHTTPService } from '../auth-http';
import { StatesService } from '../states/states.service';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { UserService } from '../user/user.service';
import { LsAaiUserInterface } from '../../interfaces/user/ls-aai/ls-aai.user.interface';
import { NgxPermissionsService } from 'ngx-permissions';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // public fields
  isauthentic: boolean;

  constructor(
    private authHttpService: AuthHTTPService,
    private statesService: StatesService,
    private permissionService: NgxPermissionsService, 
    private router: Router,
    private oidcSecurityService: OidcSecurityService,
    private userService: UserService,
    private toastr: ToastrService
  ) { }

  isAuthenticUser() {
    return this.oidcSecurityService.checkAuth().pipe(
      timeout(10000),
      mergeMap(async ({isAuthenticated, userData, accessToken, idToken}) => {
        if (isAuthenticated) {
          // Note: userData in checkAuth result is obtained from localStorage (and therefore can be tampered with), so we have to query LS AAI again
          // Note 2: querying LS AAI even if statesService.currentUser is set for added security (preventing client-side memory tampering)
          await this.getUser();
        } else {
          this.logout();
        }
        this.isauthentic = isAuthenticated;
        return isAuthenticated;
      }),
      catchError(err => {
        this.logout(err);
        return of(false);
      })
    );
  }

  getUser() {
    /* Get user from LS and get role and organisation from our DB. Setting user and permissions as well. */
    this.statesService.isLoadingSubject = true;
    return this.userService.getUser()
      .pipe(
        timeout(10000),
        mergeMap((userDataClean: LsAaiUserInterface) => {
          return this.authHttpService.getUserByLSID(userDataClean.sub);
        }),
        map((user: UserInterface) => {
          this.statesService.currentUser = user;
          this.permissionService.loadPermissions([this.statesService.currentAuthRole]);
        }),
        catchError(err => {
          this.logout(err);
          return of(false);
        })
      ).toPromise();
  }

  logout(err?) {
    this.oidcSecurityService.logoff();
    localStorage.clear();
    if (err) {
      this.toastr.error(err.message, 'Authentication error');
    }
    this.router.navigate(['login']);
  }
}
