import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {AuthInterface} from '../../interfaces/user/auth.model';
import {UserInterface} from '../../interfaces/user/user.model';


const API_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(email: string, password: string): Observable<any> {
    return this.http.post<AuthInterface>(API_USERS_URL,   { email, password });
  }

  getUserByToken(token): Observable<UserInterface> {
    const httpHeaders = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<UserInterface>(`${API_USERS_URL}`, {
      headers: httpHeaders,
    });
  }
}
