import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { StatesService } from '../../services/states/states.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DataObjectInterface } from '../../interfaces/data-object/data-object.interface';
import { ToastrService } from 'ngx-toastr';

const base = environment.baseUrl;


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  /* Use this guard when needing to check if user is logged in and authorized to see a certain page (corresponding orgId or Manager) */
  constructor(
    private http: HttpClient,
    private statesService: StatesService,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isAuth$: Observable<boolean> = of(false);
    let action: string;
    if (route.url.length > 2) {  // Edit
      action = route.url[2].path;
    } else if (route.url.length > 1) {  // Add
      action = route.url[1].path;
    }  // Else: view

    // Speeding up the app by not calling authentication again when checking for role
    if (this.statesService.isManager()) {
      isAuth$ = of(true);
    } else if (this.statesService.isOrgIdValid()) {
      if (action === 'edit') {
        isAuth$ = this.http.get(`${base}/mdm/${route.url[0]}/${route.url[1]}`).pipe(
          timeout(10000),
          switchMap((res: StudyInterface | DataObjectInterface) => {
            return of(res.organisation?.id ===  this.statesService.currentAuthOrgId);
          }),
          catchError(err => {
            this.toastr.error(err.message, 'Authorization error');
            return of(false);
          })
        );
      } else {
        isAuth$ = of(true);
      }
    }

    return isAuth$;
    
    /*
    // Speeding up the app by not calling authentication pipeline again just to view certain pages
    if (['add', 'edit'].indexOf(action) > -1) {
      // TODO: Remove authentication call here to speed up app?
      return this.authService.isAuthenticUser().pipe(
        timeout(10000),
        mergeMap((isAuthentic: boolean) => {
          if (isAuthentic) {
            if (this.statesService.isManager()) {
              isAuthObs = of(true);
            } else if (this.statesService.isOrgIdValid()) {
              if (action === 'edit') {
                return this.http.get(`${base}/mdm/${route.url[0]}/${route.url[1]}`).pipe(
                  map((res: StudyInterface | DataObjectInterface) => {
                    return res.organisation?.id ===  this.statesService.currentAuthOrgId;
                  }),
                );
              } else {
                return of(true)
              }
            }
          }
          return isAuthObs;
        }),
        catchError(err => {
          this.toastr.error(err.message, 'Authorization error');
          return isAuthObs;
        })
      );
    } else {
      return of(true);
    }*/
  }
}
