import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const url = environment.baseUrl + '/rms'
const mdmUrl = environment.baseUrl + '/metadata-management';
const base = 'https://api-test.ecrin-rms.org';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor( private http: HttpClient) { }
  
  getStatistics() {
    return this.http.get(`${base}/app/statistics`)
  }
}
