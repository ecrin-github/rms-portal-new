import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {UserInterface} from '../../interfaces/user/user.interface';
import {AuthInterface} from '../../interfaces/user/auth.interface';


const API_USERS_URL = `${environment.baseUrl}/users`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  getUserByLSID(sub): Observable<UserInterface> {
    /* LS AAI ID */
    return this.http.get<UserInterface>(`${API_USERS_URL}/by-ls-aai-id`, {
      params: {
        id: sub
      }
    });
  }
}
