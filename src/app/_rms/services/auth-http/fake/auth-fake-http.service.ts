import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {environment} from '../../../../../environments/environment';
import {UserInterface} from '../../../interfaces/user/user.interface';
import {AuthInterface} from '../../../interfaces/user/auth.interface';
import {UsersTable} from '../../../../_fake/fake-db/users.table';



const API_USERS_URL = `${environment.apiUrl}/users`;

@Injectable({
  providedIn: 'root',
})
export class AuthHTTPService {
  constructor(private http: HttpClient) { }

  // public methods
  login(email: string, password: string): Observable<any> {
    const notFoundError = new Error('Not Found');
    if (!email || !password) {
      return of(notFoundError);
    }

    return this.getAllUsers().pipe(
      map((result: UserInterface[]) => {
        if (result.length <= 0) {
          return notFoundError;
        }

        const user = result.find((u) => {
          return (
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
          );
        });
        if (!user) {
          return notFoundError;
        }

        const auth: AuthInterface = {
            id: 1,
            accessToken: user.token.accessToken,
            refreshToken: user.token.refreshToken,
            expiresIn: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
        };
        return auth;
      })
    );
  }

  getUserByToken(token: string): Observable<UserInterface> {
    const user = UsersTable.users.find((u) => {
      return u.token.accessToken === token;
    });

    if (!user) {
      return of(undefined);
    }

    return of(user);
  }

  getAllUsers(): Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>(API_USERS_URL);
  }
}
