import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class DtpService {

  constructor( private http: HttpClient) { }

  // full DTP - with attributes

  getFullDtpById(id) {
    return this.http.get(`${base}/data-transfers/full/${id}`);
  }

  deleteFullDtpById(id) {
    return this.http.delete(`${base}/data-transfers/full/${id}`);
  }

  // check for the deletion
  checkDtaAgreed(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}`);
  }
  
  // DTP record - core record only

  getDtpById(id) {
    return this.http.get(`${base}/data-transfers/${id}`);
  }

  getDtpByIdWfkn(id) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${id}`);
  }

  addDtp(payload) {
    return this.http.post(`${base}/data-transfers`, payload);
  }

  editDtp(id, payload) {
    return this.http.put(`${base}/data-transfers/${id}`, payload);
  }

  deleteDtpById(id) {
    return this.http.delete(`${base}/data-transfers/${id}`);
  }
   

  // DTAs - only ever one dta / dtp, therefore code can be simpler

  addDta(dtpId, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/dta`, payload);
  }
  getDta(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/dta`);
  }
  getDtaWfkn(dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/dta`);
  }
  editDta(dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/dta`, payload);
  }
  deleteDta(dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/dta`);
  }

  
  // DTP Studies

  getDtpStudies(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/studies`);
  }
  getDtpStudiesWfkn(dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/studies`);
  }
  addDtpStudy(dtpId, sdSid, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/studies/${sdSid}`, payload);
  }
  getDtpStudy(id, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/studies/${id}`);
  }
  getDtpStudyWfkn(id, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/studies/${id}`);
  }
  editDtpStudy(id, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/studies/${id}`, payload);
  }
  deleteDtpStudy(id, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/studies/${id}`);
  }


  // DTP Objects

  getDtpObjects(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/objects`);
  }
  getDtpObjectsWfkn(dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/objects`);
  }
  addDtpObject(dtpId, sdOid, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/objects/${sdOid}`, payload);
  }
  getDtpObject(id, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/objects/${id}`);
  }
  getDtpObjectWfkn(id, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/objects/${id}`);
  }
  editDtpObject(id, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/objects/${id}`, payload);
  }
  deleteDtpObject(id, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/objects/${id}`);
  }
  

  // DTP People

  getDtpPeople(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/people`);
  }
  getDtpPeopleWfkn(dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/people`);
  }
  addDtpPerson(dtpId, personId, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/people/${personId}`, payload);
  }
  getDtpPerson(id, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/people/${id}`);
  }
  getDtpPersonWfkn(id, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/people/${id}`);
  }
  editDtpPerson(id, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/people/${id}`, payload);
  }
  deleteDtpPerson(id, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/people/${id}`);
  }


  // DTP Notes

  getDtpNotes(dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/notes`);
  }
  getDtpNotesWfkn(dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/notes`);
  }
  addDtpNote(dtpId, personId, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/notes/${personId}`, payload);
  }
  getDtpNote(id, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/notes/${id}`);
  }
  getDtpNoteWfkn(id, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/notes/${id}`);
  }
  editDtpNote(id, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/notes/${id}`, payload);
  }
  deleteDtpNote(id, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/notes/${id}`);
  }


  // DTP Object pre-requisites

  getDtpObjectPrereqs(sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/objects/${sdOid}/prereqs`);
  }
  getDtpObjectPrereqsWfkn(sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/objects/${sdOid}/prereqs`);
  }
  addDtpObjectPrereq(dtpId, sdOid, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/objects/${sdOid}/prereqs`, payload);
  }
  getDtpObjectPrereq(id, sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/objects/${sdOid}/prereqs/${id}`);
  }
  getDtpObjectPrereqWfkn(id, sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/objects/${sdOid}/prereqs/${id}`);
  }
  editDtpObjectPrereq(id, sdOid, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/objects/${sdOid}/prereqs/${id}`, payload);
  }
  deleteDtpObjectPrereq(id, sdOid, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/objects/${sdOid}/prereqs/${id}`);
  }


  // DTP object dataset sdata - none or one per object

  addDtpObjectDataset(dtpId, sdOid, payload) {
    return this.http.post(`${base}/data-transfers/${dtpId}/objects/${sdOid}/dataset`, payload);
  }
  getDtpObjectDataset(id, sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/${dtpId}/objects/${sdOid}/dataset`);
  }
  getDtpObjectDatasetWfkn(id, sdOid, dtpId) {
    return this.http.get(`${base}/data-transfers/with-fk-names/${dtpId}/objects/${sdOid}/dataset`);
  }
  editDtpObjectDataset(id, sdOid, dtpId, payload) {
    return this.http.put(`${base}/data-transfers/${dtpId}/objects/${sdOid}/dataset`, payload);
  }
  deleteDtpObjectDataset(id, sdOid, dtpId) {
    return this.http.delete(`${base}/data-transfers/${dtpId}/objects/${sdOid}/dataset`);
  }
}
