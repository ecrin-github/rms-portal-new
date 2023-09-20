import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const base = environment.baseUrl;

@Injectable({
  providedIn: 'root'
})
export class ObjectLookupService {

  constructor( private http: HttpClient) { }

  // lookups
  getObjectClasses() {
    return this.http.get(`${base}/lookup/object-classes/simple`);
  }
  getBrowsingObjectClasses() {
    return this.http.get(`${base}/browsing/lookup/object-classes/simple`);
  }
  getObjectTypes() {
    return this.http.get(`${base}/lookup/object-types/simple`);
  }
  getBrowsingObjectTypes() {
    return this.http.get(`${base}/browsing/lookup/object-types/simple`);
  }
  getObjectTitleTypes() {
    return this.http.get(`${base}/lookup/title-types-for-objects/simple`);
  }
  getBrowsingObjectTitleTypes() {
    return this.http.get(`${base}/browsing/lookup/title-types-for-objects/simple`);
  }
  getAccessTypes() {
    return this.http.get(`${base}/lookup/object-access-types/simple`);
  }
  getBrowsingAccessTypes() {
    return this.http.get(`${base}/browsing/lookup/object-access-types/simple`);
  }
  getRecordKeyTypes() {
    return this.http.get(`${base}/lookup/dataset-recordkey-types/simple`);
  }
  getBrowsingRecordKeyTypes() {
    return this.http.get(`${base}/browsing/lookup/dataset-recordkey-types/simple`);
  }
  getDeidentificationTypes() {
    return this.http.get(`${base}/lookup/dataset-deidentification-types/simple`);
  }
  getBrowsingDeidentificationTypes() {
    return this.http.get(`${base}/browsing/lookup/dataset-deidentification-types/simple`);
  }
  getConsentTypes() {
    return this.http.get(`${base}/lookup/dataset-consent-types/simple`);
  }
  getBrowsingConsentTypes() {
    return this.http.get(`${base}/browsing/lookup/dataset-consent-types/simple`);
  }
  getSizeUnits() {
    return this.http.get(`${base}/lookup/size-units/simple`);
  }
  getBrowsingSizeUnits() {
    return this.http.get(`${base}/browsing/lookup/size-units/simple`);
  }
  getResourceTypes() {
    return this.http.get(`${base}/lookup/resource-types/simple`);
  }
  getBrowsingResourceTypes() {
    return this.http.get(`${base}/browsing/lookup/resource-types/simple`);
  }
  getDateTypes() {
    return this.http.get(`${base}/lookup/date-types/simple`);
  }
  getBrowsingDateTypes() {
    return this.http.get(`${base}/browsing/lookup/date-types/simple`);
  }
  getDescriptionTypes() {
    return this.http.get(`${base}/lookup/description-types/simple`);
  }
  getBrowsingDescriptionTypes() {
    return this.http.get(`${base}/browsing/lookup/description-types/simple`);
  }
  getObjectIdentifierTypes() {
    return this.http.get(`${base}/lookup/identifier-types-for-objects/simple`);
  }
  getBrowsingObjectIdentifierTypes() {
    return this.http.get(`${base}/browsing/lookup/identifier-types-for-objects/simple`);
  }
  getObjectRelationshipTypes() {
    return this.http.get(`${base}/lookup/object-relationship-types/simple`);
  }
  getBrowsingObjectRelationshipTypes() {
    return this.http.get(`${base}/browsing/lookup/object-relationship-types/simple`);
  }
}