import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})

export class DataObjectService {

  constructor( private http: HttpClient) { }
  
  // full Object - witrh attributes
  
  getFullObjectById(sdOid) {
    return this.http.get(`${base}/data-objects/full/${sdOid}`);
  }

  deleteFullObjectById(sdOid) {
    return this.http.delete(`${base}/data-objects/full/${sdOid}`);
  }

  // MDR related calls
  // Parameters are the SdSid of the parent study in the RMS, 
  // and integer id of the object in the MDR
  getFullObjectFromMdr(sdSid: string, mdrId: number) {
    return this.http.get(`${base}/data-objects/mdr/${sdSid}/${mdrId}`);
  }
  
  
  // Object data - Object table data only 

  getDataObjectById(sdOid) {
    return this.http.get(`${base}/data-objects/full/${sdOid}`);
  }
  getBrowsingDataObjectById(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/full/${sdOid}`);
  }
  addDataObject(sdSid, payload) {
    // note inclusion of parent sdSid in call
    return this.http.post(`${base}/data-objects/${sdSid}`, payload);
  }
  editDataObject(sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}`, payload);
  }
  deleteDataObjectById(sdOid) {
    // full delete would normally be more useful
    return this.http.delete(`${base}/data-objects/${sdOid}`);
  }
  

  // Object instances

  getObjectInstances(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/instances`);
  }
  getBrowsingObjectInstances(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/instances`);
  }
  addObjectInstance(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/instances`, payload);
  }
  getObjectInstance(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/instances/${id}`);
  }
   editObjectInstance(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/instances/${id}`, payload);
  }
  deleteObjectInstance(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/instances/${id}`);
  }

  
  // Object titles

  getObjectTitles(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/titles`);
  }
  getBrowsingObjectTitles(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/titles`);
  }
  addObjectTitle(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/titles`, payload);
  }
  getObjectTitle(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/titles/${id}`);
  }
  editObjectTitle(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/titles/${id}`, payload);
  }
  deleteObjectTitle(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/titles/${id}`);
  }


  // Object dates

  getObjectDates(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/dates`);
  }
  getBrowsingObjectDates(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/dates`);
  }
  addObjectDate(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/dates`, payload);
  }
  getObjectDate(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/dates/${id}`);
  }
  editObjectDate(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/dates/${id}`, payload);
  }
  deleteObjectDate(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/dates/${id}`);
  }
  

  // Object datasets

  getObjectDatasets(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/datasets`);
  }
  addObjectDatasete(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/datasets`, payload);
  }
  getObjectDatasete(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/datasets/${id}`);
  }
  editObjecDataset(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/datasets/${id}`, payload);
  }
  deleteObjectDataset(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/datasets/${id}`);
  }


  // Object topics

  getObjectTopics(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/topics`);
  }
  getBrowsingObjectTopics(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/topics`);
  }
  addObjectTopic(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/topics`, payload);
  }
  getObjectTopic(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/topics/${id}`);
  }
  editObjectTopic(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/topics/${id}`, payload);
  }
  deleteObjectTopic(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/topics/${id}`);
  }
  

  // Object relationships

  getObjectRelationships(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/relationships`);
  }
  getBrowsingObjectRelationships(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/relationships`);
  }
  addObjectRelationship(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/relationships`, payload);
  }
  getObjectRelationship(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/relationships/${id}`);
  }
  editObjectRelationship(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/relationships/${id}`, payload);
  }
  deleteObjectRelationship(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/relationships/${id}`);
  }


  // Object contributors

  getObjectContributors(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/contributors`);
  }
  getBrowsingObjectContributors(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/contributors`);
  }
  addObjectContributor(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/contributors`, payload);
  }
  getObjectContributor(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/contributors/${id}`);
  }
  editObjectContributor(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/contributors/${id}`, payload);
  }
  deleteObjectContributor(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/contributors/${id}`);
  }


  // Object descriptions

  getObjectDescriptions(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/descriptions`);
  }
  getBrowsingObjectDescriptions(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/descriptions`);
  }
  addObjectDescription(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/descriptions`, payload);
  }
  getObjectDescription(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/descriptions/${id}`);
  }
  editObjectDescription(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/descriptions/${id}`, payload);
  }
  deleteObjectDescription(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/descriptions/${id}`);
  }


  // Object Rights

  getObjectRights(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/rights`);
  }
  getBrowsingObjectRights(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/rights`);
  }
  addObjectRight(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/rights`, payload);
  }
  getObjectRight(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/rights/${id}`);
  }
  editObjectRight(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/rights/${id}`, payload);
  }
  deleteObjectRight(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/rights/${id}`);
  }


  // Object identifiers

  getObjectIdentifiers(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/identifiers`);
  }
  getBrowsingObjectIdentifiers(sdOid) {
    return this.http.get(`${base}/browsing/data-objects/${sdOid}/identifiers`);
  }
  addObjectIdentifier(sdOid, payload) {
    return this.http.post(`${base}/data-objects/${sdOid}/identifiers`, payload);
  }
  getObjectIdentifier(id, sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/identifiers/${id}`);
  }
  editObjectIdentifier(id, sdOid, payload) {
    return this.http.put(`${base}/data-objects/${sdOid}/identifiers/${id}`, payload);
  }
  deleteObjectIdentifier(id, sdOid) {
    return this.http.delete(`${base}/data-objects/${sdOid}/identifiers/${id}`);
  }

  // check number of linked DTP and DUP
  objectInvolvement(sdOid) {
    return this.http.get(`${base}/data-objects/${sdOid}/involvement`);
  }
  
 }
