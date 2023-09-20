import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const url = environment.baseUrl + '/rms'
const mdmUrl = environment.baseUrl + '/metadata-management';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor( private http: HttpClient) { }
  
  getDtpStatistics() {
    return this.http.get(`${base}/data-transfers/incomplete`);
  }
  getDupStatistics() {
    return this.http.get(`${base}/data-uses/incomplete`);
  }
  getStudyStatistics() {
    return this.http.get(`${base}/studies/total`);
  }
  getObjectStatistics() {
    return this.http.get(`${base}/data-objects/total`);
  }
  getPeopleStatistics() {
    return this.http.get(`${base}/people/total`);
  }

  getMostRecent10Dtps() {
      return this.http.get(`${base}/data-transfers/list/recent/10`);
  }
  getMostRecent10Dups() {
      return this.http.get(`${base}/data-uses/list/recent/10`);
  }
  getMostRecent10Studies() {
      return this.http.get(`${base}/studies/list/recent/10`);
  }
  getMostRecent10Objects() {
      return this.http.get(`${base}/data-objects/list/recent/10`);
  }
  getMostRecent10People() {
      return this.http.get(`${base}/people/list/recent/10`);
  }

}
