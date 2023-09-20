import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl + '/lookup';

@Injectable({
  providedIn: 'root'
})
export class ProcessLookupService {

  constructor( private http: HttpClient) { }

  getDtpStatusTypes() {
    return this.http.get(`${base}/dtp-status-types/simple`);
  }
  
  getDupStatusTypes() {
    return this.http.get(`${base}/dup-status-types/simple`);
  }
  
  getLegalStatusTypes() {
    return this.http.get(`${base}/legal-status-types/simple`);
  }
  
  getPrereqTypes() {
    return this.http.get(`${base}/prerequisite-types/simple`);
  }
    
  getRepoAccessTypes() {
    return this.http.get(`${base}/repo-access-types/simple`);
  }
  
  getRmsUserTypes() {
    return this.http.get(`${base}/rms-user-types/simple`);
  }
  getObjectAccessTypes() {
    return this.http.get(`${base}/check-status-types/simple`);
  }
  
}