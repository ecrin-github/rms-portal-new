import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const aaiUrl = 'https://proxy.aai.lifescience-ri.eu/OIDC/userinfo';
const userUrl = 'https://user.ecrin-rms.org/api/v1/UserApi'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor( private http: HttpClient) { }

  getUser() {
    return this.http.get(`${aaiUrl}`);
  }
  getUserRoleInfo(payload) {
    return this.http.post(`${userUrl}/GetOrCreateUser`, payload);
  }
}
