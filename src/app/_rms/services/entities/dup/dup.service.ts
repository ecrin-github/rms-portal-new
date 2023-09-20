import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class DupService {

  constructor( private http: HttpClient) { }
  
  // full DUP - with attributes

  getFullDupById(id) {
    return this.http.get(`${base}/data-uses/full/${id}`);
  }

  deleteFullDupById(id) {
    return this.http.delete(`${base}/data-uses/full/${id}`);
  }

  // check for deletion
  checkDupAgreed(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}`);
  }


    // DUP record - core record only

  getDupById(id) {
    return this.http.get(`${base}/data-uses/${id}`);
  }

  getDupByIdWfkn(id) {
    return this.http.get(`${base}/data-uses/with-fk-names/${id}`);
  }

  addDup(payload) {
    return this.http.post(`${base}/data-uses`, payload);
  }

  editDup(id, payload) {
    return this.http.put(`${base}/data-uses/${id}`, payload);
  }

  deleteDupById(id) {
    return this.http.delete(`${base}/data-uses/${id}`);
  }
  

  // DUAs - only ever one Dua / Dup, therefore code can be simpler

  addDua(dupId, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/Dua`, payload);
  }
  getDua(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/Dua`);
  }
  getDuaWfkn(dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/dta`);
  }
  editDua(dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/Dua`, payload);
  }
  deleteDua(dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/Dua`);
  }


  // Dup Studies

  getDupStudies(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/studies`);
  }
  getDupStudiesWfkn(dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/studies`);
  }
  addDupStudy(dupId, sdSid, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/studies/${sdSid}`, payload);
  }
  getDupStudy(id, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/studies/${id}`);
  }
  getDupStudyWfkn(id, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/studies/${id}`);
  }
  editDupStudy(id, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/studies/${id}`, payload);
  }
  deleteDupStudy(id, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/studies/${id}`);
  }


  // Dup Objects

  getDupObjects(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/objects`);
  }
  getDupObjectsWfkn(dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/objects`);
  }
  addDupObject(dupId, sdOid, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/objects/${sdOid}`, payload);
  }
  getDupObject(id, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/objects/${id}`);
  }
  getDupObjectWfkn(id, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/objects/${id}`);
  }
  editDupObject(id, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/objects/${id}`, payload);
  }
  deleteDupObject(id, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/objects/${id}`);
  }


  // Dup People

  getDupPeople(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/people`);
  }
  getDupPeopleWfkn(dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/people`);
  }
  addDupPerson(dupId, personId, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/people/${personId}`, payload);
  }
  getDupPerson(id, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/people/${id}`);
  }
  getDupPersonWfkn(id, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/people/${id}`);
  }
  editDupPerson(id, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/people/${id}`, payload);
  }
  deleteDupPerson(id, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/people/${id}`);
  }


  // Dup Notes

  getDupNotes(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/notes`);
  }
  getDupNotesWfkn(dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/notes`);
  }
  addDupNote(dupId, personId, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/notes/${personId}`, payload);
  }
  getDupNote(id, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/notes/${id}`);
  }
  getDupNoteWfkn(id, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/notes/${id}`);
  }
  editDupNote(id, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/notes/${id}`, payload);
  }
  deleteDupNote(id, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/notes/${id}`);
  }


  // Dup Object pre-requisites

  getDupObjectPrereqs(sdOid, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/objects/${sdOid}/prereqs`);
  }
  getDupObjectPrereqsWfkn(sdOid, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/objects/${sdOid}/prereqs`);
  }
  addDupObjectPrereq(dupId, sdOid, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/objects/${sdOid}/prereqs`, payload);
  }
  getDupObjectPrereq(id, sdOid, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/objects/${sdOid}/prereqs/${id}`);
  }
  getDupObjectPrereqWfkn(id, sdOid, dupId) {
    return this.http.get(`${base}/data-uses/with-fk-names/${dupId}/objects/${sdOid}/prereqs/${id}`);
  }
  editDupObjectPrereq(id, sdOid, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/objects/${sdOid}/prereqs/${id}`, payload);
  }
  deleteDupObjectPrereq(id, sdOid, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/objects/${sdOid}/prereqs/${id}`);
  }

  // DUP secondary use

  getDupSecUses(dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/secondary-use`);
  }
  addDupSecUse(dupId, payload) {
    return this.http.post(`${base}/data-uses/${dupId}/secondary-use`, payload);
  }
  getDupSecUse(id, dupId) {
    return this.http.get(`${base}/data-uses/${dupId}/secondary-use/${id}`);
  }
  editDupSecUse(id, dupId, payload) {
    return this.http.put(`${base}/data-uses/${dupId}/secondary-use/${id}`, payload);
  }
  deleteDupSecUse(id, dupId) {
    return this.http.delete(`${base}/data-uses/${dupId}/secondary-use/${id}`);
  }
}
