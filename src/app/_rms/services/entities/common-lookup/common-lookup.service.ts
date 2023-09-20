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

  getTopicTypes() {
    return this.http.get(`${base}/lookup/topic-types/simple`);
  }
  getBrowsingTopicTypes() {
    return this.http.get(`${base}/browsing/lookup/topic-types/simple`);
  }
  getTopicVocabularies() {
    return this.http.get(`${base}/lookup/topic-vocabularies/simple`);
  }
  getBrowsingTopicVocabularies() {
    return this.http.get(`${base}/browsing/lookup/topic-vocabularies/simple`);
  }
  getContributorTypes() {
    return this.http.get(`${base}/lookup/contribution-types/simple`);
  }
  getBrowsingContributorTypes() {
    return this.http.get(`${base}/browsing/lookup/contribution-types/simple`);
  }
  getIndividualContributorTypes() {
    return this.http.get(`${base}/lookup/contribution-types-for-individuals/simple`);
  }
  getrowsingIndividualContributorTypes() {
    return this.http.get(`${base}/browsing/lookup/contribution-types-for-individuals/simple`);
  }
  getOrganisationContributorTypes() {
    return this.http.get(`${base}/lookup/contribution-types-for-organisations/simple`);
  }
  getBrowsingOrganisationContributorTypes() {
    return this.http.get(`${base}/browsing/lookup/contribution-types-for-organisations/simple`);
  }

  getOrganizationList() {
    return this.http.get(`${base}/context/orgnames`);
  }
  getBrowsingOrganizationList() {
    return this.http.get(`${base}/browsing/context/orgnames`);
  }


  getLanguageCodes(nameLang) {
    return this.http.get(`${base}/lookup/major-langs/${nameLang}`);
  }
  getBrowsingLanguageCodes(nameLang) {
    return this.http.get(`${base}/browsing/lookup/major-langs/${nameLang}`);
  }

  //  checks if an object is linked to a dtp/dup withou associated study
  objectInvolvement(sdSid) {
    return this.http.get(`${base}/studies/${sdSid}/object-involvement`);
  }
  emailAPI(payload) {
    return this.http.post(`${contactUrl}/service-controller/send-email`, payload);
  }
}