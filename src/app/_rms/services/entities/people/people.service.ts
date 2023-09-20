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
    return this.http.get(`${base}/people/${id}`);
  }
  editPeople(id, payload) {
    return this.http.put(`${base}/people/${id}`, payload)
  }
  addPeople(payload) {
    return this.http.post(`${base}/people`, payload);
  }
  deletePeopleById(id) {
    return this.http.delete(`${base}/people/full/${id}`);
  }
}
