import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import {StatesService} from '../../services/states/states.service';
import {AuthService} from '../../services/auth/auth.service';
import { of } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
      private statesService: StatesService,
      private authService: AuthService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(`RoleGuard canActivate: ${JSON.stringify(route.params)} ${JSON.stringify(route.data)}`);
    console.log(`RoleGuard state: ${state}`);
    return of(false);
  }
}
