import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor( private http: HttpClient) { }

  // study lists

  getStudyList() {
    return this.http.get(`${base}/studies/list`);
  }

  getFilteredStudyList(title_fragment: string, page: number, size: number) {
    // at the moment the whole filtered set is returned as pagination is done in the UI
    // page and size therefore not used
    // return this.http.get(`${base}/studies/list/title-contains/${title}?pagenum=${page}&pagesize=${size}`);
    return this.http.get(`${base}/studies/list/title-contains/${title_fragment}`);
  }

  getStudyListByOrg(orgId :number) {
    return this.http.get(`${base}/studies/list/by-org/${orgId}`);
  }

  getRecentStudiesList(n :number) {
    return this.http.get(`${base}/studies/list/recent/${n}`);
  }

  getBrowsingStudyList() {
    return this.http.get(`${base}/browsing/studies/list`);
  }



  // object lists

  getObjectList() {
    return this.http.get(`${base}/data-objects/list`);
  }
  
  getFilteredObjectList(title_fragment: string, page: number, size: number) {
      // at the moment the whole filtered set is returned as pagination is done in the UI
      // page and size therefore not used
      // return this.http.get(`${base}/data-objects/list/title-contains/${title}?pagenum=${page}&pagesize=${size}`);
      return this.http.get(`${base}/data-objects/list/title-contains/${title_fragment}`);
  }

  getObjectListByStudy(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/objects`);
  }
  getObjectByMultiStudies(sdSid) {
    return this.http.get(`${base}/multi-studies/objects?sdSids=${sdSid}`);
  }
  getBrowsingObjectByMultiStudies(sdSid) {
    return this.http.get(`${base}/browsing/multi-studies/objects?sdSids=${sdSid}`);
  }


  getObjectListByOrg(orgId :number) {
    return this.http.get(`${base}/data-objects/list/by-org/${orgId}`);
  }

  getRecentObjectsList(n :number) {
    return this.http.get(`${base}/data-objects/list/recent/${n}`);
  }

  getBrowsingObjectList() {
    return this.http.get(`${base}/browsing/data-objects/list`);
  }


  // DTP lists

  getDtpList() {
    return this.http.get(`${base}/data-transfers/list`);
  }
  
  getFilteredDtpList(title_fragment: string, page: number, size: number) {
      return this.http.get(`${base}/data-transfers/list/title-contains/${title_fragment}`);
  }

  getDtpListByOrg(orgId :number) {
    return this.http.get(`${base}/data-transfers/list/by-org/${orgId}`);
  }

  getRecentDtpList(n :number) {
    return this.http.get(`${base}/data-transfers/list/recent/${n}`);
  }

  // DUP lists

  getDupList() {
    return this.http.get(`${base}/data-uses/list`);
  }
  
  getFilteredDuptList(title_fragment: string, page: number, size: number) {
      return this.http.get(`${base}/data-uses/list/title-contains/${title_fragment}`);
  }

  getDupListByOrg(orgId :number) {
    return this.http.get(`${base}/data-uses/list/by-org/${orgId}`);
  }

  getRecentDupList(n :number) {
    return this.http.get(`${base}/data-uses/list/recent/${n}`);
  }

  // People Lists
  getPeopleList() {
    return this.http.get(`${base}/people/list`);
  }
  getFilteredPeopleList(name_fragment: string, page: number, size: number) {
    return this.http.get(`${base}/people/list/name-contains/${name_fragment}`);
  }

  getPeopleListByOrg(orgId: number) {
    return this.http.get(`${base}/people/list/by-org/${orgId}`);
  }

  getRecentPeopleList(n: number) {
    return this.http.get(`${base}/people/list/recent/${n}`);
  }
}