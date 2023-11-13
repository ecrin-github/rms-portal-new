import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class StudyService {

  constructor( private http: HttpClient) { }

  // full study - witrh attributes
  
  getFullStudyById(sdSid) {
    return this.http.get(`${base}/studies/full/${sdSid}`);
  }
  getBrowsingFullStudyById(sdSid) {
    return this.http.get(`${base}/browsing/studies/full/${sdSid}`);
  }

  deleteFullStudyById(sdSid) {
    return this.http.delete(`${base}/studies/full/${sdSid}`);
  }

  // MDR related calls
 
  getFullStudyFromMdr(regId: number, sdSid: string) {
    return this.http.get(`${base}/mdm/studies/mdr?regId=${regId}&sdSid=${sdSid}`);
  }
  
  getStudyFromMdr(regId: number, sdSid: string) {
    // N.B. Limited use - was for testing only
    return this.http.get(`${base}/studies/mdr/${regId}/${sdSid}/data`);
  }

  
  // study data - study table data only 

  addStudy(payload) {
    // note inclusion of explicit sdSid in call
    return this.http.post(`${base}/mdm/studies`, payload);
  }
  getStudyById(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}`);
  }
  editStudy(sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}`, payload);
  }
  deleteStudyById(sdSid) {
    // full delete would normally be more useful
    return this.http.delete(`${base}/studies/${sdSid}`);
  }


  // study identifiers

  getStudyIdentifiers(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-identifiers`);
  }
  addStudyIdentifier(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-identifiers`, payload);
  }
  getStudyIdentifier(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-identifiers/${id}`);
  }
  editStudyIdentifier(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-identifiers/${id}`, payload);
  }
  deleteStudyIdentifier(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-identifiers/${id}`);
  }


  // study titles

  getStudyTitles(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-titles`);
  }
  addStudyTitle(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-titles`, payload);
  }
  getStudyTitle(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-titles/${id}`);
  }
  editStudyTitle(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-titles/${id}`, payload);
  }
  deleteStudyTitle(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-titles/${id}`);
  }


  // study features
  getStudyFeatures(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-features`);
  }
  addStudyFeature(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-features`, payload);
  }
  getStudyFeature(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-features/${id}`);
  }
  editStudyFeature(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-features/${id}`, payload);
  }
  deleteStudyFeature(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-features/${id}`);
  }


  // study topics
  getStudyTopics(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-topics`);
  }
  addStudyTopic(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-topics`, payload);
  }
  getStudyTopic(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-topics/${id}`);
  }
  editStudyTopic(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-topics/${id}`, payload);
  }
  deleteStudyTopic(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-topics/${id}`);
  }
  

  // study relationships
  getStudyRelationships(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-relationships`);
  }
  addStudyRelationship(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-relationships`, payload);
  }
  getStudyRelationship(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-relationships/${id}`);
  }
  editStudyRelationship(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-relationships/${id}`, payload);
  }
  deleteStudyRelationship(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-relationships/${id}`);
  }


  // study contributors
  getStudyContributors(sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-contributors`);
  }
  addStudyContributor(sdSid, payload) {
    return this.http.post(`${base}/mdm/studies/${sdSid}/study-contributors`, payload);
  }
  getStudyContributor(id, sdSid) {
    return this.http.get(`${base}/mdm/studies/${sdSid}/study-contributors/${id}`);
  }
  editStudyContributor(id, sdSid, payload) {
    return this.http.put(`${base}/mdm/studies/${sdSid}/study-contributors/${id}`, payload);
  }
  deleteStudyContributor(id, sdSid) {
    return this.http.delete(`${base}/mdm/studies/${sdSid}/study-contributors/${id}`);
  }

  // check number of linked DTP and DUP
  studyInvolvement(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/involvement`);
  }

  // check number of linked objects
  linkedObject(sdSid){
    return this.http.get(`${base}/studies/${sdSid}/objects`);
  }

}
