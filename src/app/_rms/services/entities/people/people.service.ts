import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class PeopleService {

  constructor( private http: HttpClient) { }
  getPeopleById(id) {
    return this.http.get(`${base}/users/${id}`);
  }
    editPeople(id, payload) {
    return this.http.put(`${base}/users/${id}`, payload)
  }
  editUserProfile(id, userProfileId, payload) {
    return this.http.put(`${base}/users/${id}/profile/${userProfileId}`, payload)
  }
  addPeople(payload) {
    return this.http.post(`${base}/people`, payload);
  }
  deletePeopleById(id) {
    return this.http.delete(`${base}/people/full/${id}`);
  }
}
