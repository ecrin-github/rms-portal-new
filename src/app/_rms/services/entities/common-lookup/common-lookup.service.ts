import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base = environment.baseUrl;
const contactUrl = 'https://api-v2.ecrin-rms.org';

@Injectable({
  providedIn: 'root'
})
export class CommonLookupService {

  constructor( private http: HttpClient) { }

  getTopicTypes(pageSize) {
    return this.http.get(`${base}/context/topic-types?page_size=${pageSize}`);
  }
  getTopicVocabularies(pageSize) {
    return this.http.get(`${base}/context/topic-vocabularies?page_size=${pageSize}`);
  }
  getContributorTypes(pageSize) {
    return this.http.get(`${base}/context/contributor-types?page_size=${pageSize}`);
  }
  getOrganizationList(pageSize) {
    return this.http.get(`${base}/general/organisations?page_size=${pageSize}`);
  }


  getLanguageCodes(pageSize) {
    return this.http.get(`${base}/general/language-codes?page_size=${pageSize}`);
  }
  //  checks if an object is linked to a dtp/dup without associated study
  objectInvolvement(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/object-involvement`);
  }
  emailAPI(payload) {
    return this.http.post(`${contactUrl}/app/send-email`, payload);
  }
}