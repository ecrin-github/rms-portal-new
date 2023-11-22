import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const aaiUrl = 'https://proxy.aai.lifescience-ri.eu/OIDC/userinfo';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor( private http: HttpClient) { }

  getUser() {
    return this.http.get(`${aaiUrl}`);
  }
  getUserRoleInfo(payload) {
    return this.http.post(`${baseUrl}/users/`, payload);
  }
}
