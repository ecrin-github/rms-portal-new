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

  getFilteredStudyList(title_fragment: string, page: number, size: number) {
    // at the moment the whole filtered set is returned as pagination is done in the UI
    // page and size therefore not used
    // return this.http.get(`${base}/studies/list/title-contains/${title}?pagenum=${page}&pagesize=${size}`);
    return this.http.get(`${base}/mdm/studies/by-title?title=${title_fragment}`);
  }
  getFilteredStudyListByOrg(title_fragment: string, orgId: string, page: number, size: number) {
    return this.http.get(`${base}/mdm/studies/by-title-and-organisation?title=${title_fragment}&orgId=${orgId}`);
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
  
  getFilteredObjectList(title_fragment: string, page: number, size: number) {
      // at the moment the whole filtered set is returned as pagination is done in the UI
      // page and size therefore not used
      // return this.http.get(`${base}/data-objects/list/title-contains/${title}?pagenum=${page}&pagesize=${size}`);
      return this.http.get(`${base}/mdm/data-objects/by-title?title=${title_fragment}`);
  }
  getFilteredObjectListByOrg(title_fragment: string, orgId, page: number, size: number) {
    return this.http.get(`${base}/mdm/data-objects/by-title-and-organisation?title=${title_fragment}&orgId=${orgId}`);
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
  
  getFilteredDtpList(title_fragment: string, page: number, size: number) {
      return this.http.get(`${base}/mdm/dtp/by-title?title=${title_fragment}`);
  }
  getFilteredDtpListByOrg(title_fragment: string, orgId, page: number, size: number) {
    return this.http.get(`${base}/mdm/dtp/by-title-and-organisation?title=${title_fragment}&orgId=${orgId}`);
}

  getDtpListByOrg(orgId :number) {
    return this.http.get(`${base}/mdm/dtp/by-org?orgId=${orgId}`);
  }

  getRecentDtpList(n :number) {
    return this.http.get(`${base}/data-transfers/list/recent/${n}`);
  }

  // DUP lists

  getDupList(pageSize?, page?) {
    return this.http.get(`${base}/rms/dup?${pageSize ? `page_size=${pageSize}` : ''}${page ? `page=${page}` : ''}`);
  }
  
  getFilteredDuptList(title_fragment: string, page: number, size: number) {
      return this.http.get(`${base}/mdm/dup/by-title?title=${title_fragment}`);
  }
  getFilteredDuptListByOrg(title_fragment: string, orgId, page: number, size: number) {
    return this.http.get(`${base}/mdm/dup/by-title-and-organisation?title=${title_fragment}&orgId=${orgId}`);
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
  getFilteredPeopleList(name_fragment: string, page: number, size: number) {
    return this.http.get(`${base}/users/by-name?name=${name_fragment}`);
  }
  getFilteredPeopleListByOrg(name_fragment: string, orgId, page: number, size: number) {
    return this.http.get(`${base}/users/by-name-and-organisation?name=${name_fragment}&orgId=${orgId}`);
  }

  getPeopleListByOrg(orgId: number) {
    return this.http.get(`${base}/users/by-org?orgId=${orgId}`);
  }

  getRecentPeopleList(n: number) {
    return this.http.get(`${base}/people/list/recent/${n}`);
  }
}