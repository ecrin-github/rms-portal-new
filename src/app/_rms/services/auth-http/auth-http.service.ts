import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {UserInterface} from '../../interfaces/user/user.interface';


@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  getUserByLSID(sub): Observable<UserInterface> {
    /* LS AAI ID */
    return this.http.get<UserInterface>(`${environment.baseUrlApi}/users/by-ls-aai-id`, {
      params: {
        id: sub
      }
    });
  }
}
