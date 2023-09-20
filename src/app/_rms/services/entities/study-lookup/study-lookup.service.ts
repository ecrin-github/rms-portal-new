import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class StudyLookupService {

  constructor( private http: HttpClient) { }
  
  getStudyTypes() {
    return this.http.get(`${base}/lookup/study-types/simple`);
  }
  getBrowsingStudyTypes() {
    return this.http.get(`${base}/browsing/lookup/study-types/simple`);
  }
  getStudyStatuses() {
    return this.http.get(`${base}/lookup/study-statuses/simple`);
  }
  getBrowsingStudyStatuses() {
    return this.http.get(`${base}/browsing/lookup/study-statuses/simple`);
  }
  getGenderEligibilities() {
    return this.http.get(`${base}/lookup/gender-eligibility-types/simple`);
  } 
  getBrowsingGenderEligibilities() {
    return this.http.get(`${base}/browsing/lookup/gender-eligibility-types/simple`);
  }
  getFeatureTypes() {
    return this.http.get(`${base}/lookup/study-feature-types/simple`);
  }
  getBrowsingFeatureTypes() {
    return this.http.get(`${base}/browsing/lookup/study-feature-types/simple`);
  }
  getFeatureValues() {
    return this.http.get(`${base}/lookup/study-feature-categories/simple`);
  }
  getBrowsingFeatureValues() {
    return this.http.get(`${base}/browsing/lookup/study-feature-categories/simple`);
  }
  getStudyIdentifierTypes() {
    return this.http.get(`${base}/lookup/identifier-types-for-studies/simple`);
  }
  getBrowsingStudyIdentifierTypes() {
    return this.http.get(`${base}/browsing/lookup/identifier-types-for-studies/simple`);
  }
  getStudyTitleTypes() {
    return this.http.get(`${base}/lookup/title-types-for-studies/simple`);
  }
  getBrowsingStudyTitleTypes() {
    return this.http.get(`${base}/browsing/lookup/title-types-for-studies/simple`);
  }
  getStudyRelationshipTypes() {
    return this.http.get(`${base}/lookup/study-relationship-types/simple`);
  }
  getBrowsingStudyRelationshipTypes() {
    return this.http.get(`${base}/browsing/lookup/study-relationship-types/simple`);
  }
  getTimeUnits() {
    return this.http.get(`${base}/lookup/time-units/simple`);
  }
  getBrowsingTimeUnits() {
    return this.http.get(`${base}/browsing/lookup/time-units/simple`);
  }
  getTrialRegistries() {
    return this.http.get(`${base}/lookup/trial-registries/simple`);
  }
  getBrowsingTrialRegistries() {
    return this.http.get(`${base}/browsing/lookup/trial-registries/simple`);
  }

}