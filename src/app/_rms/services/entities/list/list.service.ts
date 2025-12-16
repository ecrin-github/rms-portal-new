import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base = environment.baseUrlApi;

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor( private http: HttpClient) { }

  // study lists

  getStudyList(pageSize?,page?) {
    return this.http.get(`${base}/mdm/studies?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`);
  }

  getStudyListByOrg(orgId: string) {
    return this.http.get(`${base}/mdm/studies/by-org?orgId=${orgId}`);
  }

  getRecentStudiesList(n: number) {
    return this.http.get(`${base}/studies/list/recent/${n}`);
  }


  // object lists

  getObjectList(pageSize?,page?) {
    return this.http.get(`${base}/mdm/data-objects?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`);
  }


  getObjectListByStudy(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/objects`);
  }
  getObjectByMultiStudies(sdSid) {
    return this.http.get(`${base}/mdm/multi-studies/objects?studiesIds=${sdSid}`);
  }


  getObjectListByOrg(orgId :number) {
    return this.http.get(`${base}/mdm/data-objects/by-org?orgId=${orgId}`);
  }

  getRecentObjectsList(n :number) {
    return this.http.get(`${base}/data-objects/list/recent/${n}`);
  }

  // DTP lists

  getDtpList(pageSize?, page?) {
    return this.http.get(`${base}/rms/dtp?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`);
  }

  getDtpListByOrg(orgId :number) {
    return this.http.get(`${base}/mdm/dtp/by-org?orgId=${orgId}`);
  }

  getRecentDtpList(n :number) {
    return this.http.get(`${base}/data-transfers/list/recent/${n}`);
  }

  // DUP lists

  getDupList() {
    return this.http.get(`${base}/rms/dup`);
  }

  getDupListByOrg(orgId :number) {
    return this.http.get(`${base}/mdm/dup/by-org?orgId=${orgId}`);
  }

  getRecentDupList(n :number) {
    return this.http.get(`${base}/data-uses/list/recent/${n}`);
  }

  // People Lists
  getPeopleList(pageSize?, page?) {
    return this.http.get(`${base}/users/?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`);
  }

  getRecentPeopleList(n: number) {
    return this.http.get(`${base}/people/list/recent/${n}`);
  }
}