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
    return this.http.get(`${base}/studies/mdr/${regId}/${sdSid}`);
  }
  
  getStudyFromMdr(regId: number, sdSid: string) {
    // N.B. Limited use - was for testing only
    return this.http.get(`${base}/studies/mdr/${regId}/${sdSid}/data`);
  }

  
  // study data - study table data only 

  addStudy(sdSid, payload) {
    // note inclusion of explicit sdSid in call
    return this.http.post(`${base}/studies/${sdSid}`, payload);
  }
  getStudyById(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}`);
  }
  editStudy(sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}`, payload);
  }
  deleteStudyById(sdSid) {
    // full delete would normally be more useful
    return this.http.delete(`${base}/studies/${sdSid}`);
  }


  // study identifiers

  getStudyIdentifiers(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/identifiers`);
  }
  getBrowsingStudyIdentifiers(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/identifiers`);
  }
  addStudyIdentifier(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/identifiers`, payload);
  }
  getStudyIdentifier(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/identifiers/${id}`);
  }
    editStudyIdentifier(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/identifiers/${id}`, payload);
  }
  deleteStudyIdentifier(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/identifiers/${id}`);
  }


  // study titles

  getStudyTitles(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/titles`);
  }
  getBrowsingStudyTitles(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/titles`);
  }
  addStudyTitle(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/titles`, payload);
  }
  getStudyTitle(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/titles/${id}`);
  }
  editStudyTitle(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/titles/${id}`, payload);
  }
  deleteStudyTitle(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/titles/${id}`);
  }


  // study features
  getStudyFeatures(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/features`);
  }
  getBrowsingStudyFeatures(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/features`);
  }
  addStudyFeature(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/features`, payload);
  }
  getStudyFeature(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/features/${id}`);
  }
  editStudyFeature(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/features/${id}`, payload);
  }
  deleteStudyFeature(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/features/${id}`);
  }


  // study topics
  getStudyTopics(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/topics`);
  }
  getBrowsingStudyTopics(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/topics`);
  }
  addStudyTopic(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/topics`, payload);
  }
  getStudyTopic(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/topics/${id}`);
  }
  editStudyTopic(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/topics/${id}`, payload);
  }
  deleteStudyTopic(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/topics/${id}`);
  }
  

  // study relationships
  getStudyRelationships(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/relationships`);
  }
  getBrowsingStudyRelationships(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/relationships`);
  }
  addStudyRelationship(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/relationships`, payload);
  }
  getStudyRelationship(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/relationships/${id}`);
  }
  editStudyRelationship(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/relationships/${id}`, payload);
  }
  deleteStudyRelationship(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/relationships/${id}`);
  }


  // study contributors
  getStudyContributors(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/contributors`);
  }
  getBrowsingStudyContributors(sdSid) {
    return this.http.get(`${base}/browsing/studies/${sdSid}/contributors`);
  }
  addStudyContributor(sdSid, payload) {
    return this.http.post(`${base}/studies/${sdSid}/contributors`, payload);
  }
  getStudyContributor(id, sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/contributors/${id}`);
  }
  editStudyContributor(id, sdSid, payload) {
    return this.http.put(`${base}/studies/${sdSid}/contributors/${id}`, payload);
  }
  deleteStudyContributor(id, sdSid) {
    return this.http.delete(`${base}/studies/${sdSid}/contributors/${id}`);
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
