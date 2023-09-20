import { Injectable, OnDestroy } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import {UserInterface} from '../../interfaces/user/user.interface';
import {AuthHTTPService} from '../auth-http';
import {AuthInterface} from '../../interfaces/user/auth.interface';
import {PrivilegesService} from '../privileges/privileges.service';
import {StatesService} from '../states/states.service';
import {States} from '../../states/states';
import { OidcSecurityService } from 'angular-auth-oidc-client';


@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = [];
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserInterface>;
  isLoading$: Observable<boolean>;
  isauthentic: boolean;

  constructor(
    private authHttpService: AuthHTTPService,
    private states: States,
    private statesService: StatesService,
    private privilegesService: PrivilegesService,
    private router: Router,
    private oidcSecurityService: OidcSecurityService
  ) {
    this.currentUser$ = this.states.currentUser.asObservable();
    this.isLoading$ = this.states.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }
  isAuthenticUser() {
    this.oidcSecurityService.checkAuth().subscribe(({ isAuthenticated, userData, accessToken, idToken }) => {
      this.isauthentic = isAuthenticated;
      // if (localStorage.getItem('role')) {
      //   localStorage.removeItem('role');
      // }
      // localStorage.setItem('role', userData.role);
    });
    return this.isauthentic;
  }

  // public methods
  login(email: string, password: string): Observable<UserInterface> {
    this.statesService.isLoadingSubject = true;
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthInterface) => {
        return this.setAuthFromLocalStorage(auth);
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => {
        this.statesService.isLoadingSubject = false;
      })
    );
  }

  logout() {
    // localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/login'], {
      queryParams: {},
    });
  }

  getUserByToken(): Observable<UserInterface> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.accessToken) {
      return of(undefined);
    }

    this.statesService.isLoadingSubject = true;
    return this.authHttpService.getUserByToken(auth.accessToken).pipe(
      map((user: UserInterface) => {
        if (user) {
          this.statesService.currentUser = user;
          this.privilegesService.setPrivileges(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => {
        this.statesService.isLoadingSubject = false;
      })
    );
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthInterface): boolean {
    if (auth && auth.accessToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): AuthInterface {
    try {
      return JSON.parse(
          localStorage.getItem(this.authLocalStorageToken)
      );
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
