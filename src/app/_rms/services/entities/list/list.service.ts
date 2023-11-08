import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BYPASS_LOG } from 'src/app/_rms/interceptor/myinterceptor.interceptor';
import { environment } from 'src/environments/environment';

const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ListService {

  constructor( private http: HttpClient) { }

  // study lists

  getStudyList(pageSize?,page?) {
    return this.http.get(`${base}/mdm/studies?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`,{ context: new HttpContext().set(BYPASS_LOG, true) });
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

  getObjectList(pageSize?,page?) {
    return this.http.get(`${base}/mdm/data-objects?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`,{ context: new HttpContext().set(BYPASS_LOG, true) });
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

  // DTP lists

  getDtpList() {
    return this.http.get(`${base}/rms/dtp`);
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
    return this.http.get(`${base}/rms/dup`);
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
  getPeopleList(pageSize?, page?) {
    return this.http.get(`${base}/users?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`,{ context: new HttpContext().set(BYPASS_LOG, true) });
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