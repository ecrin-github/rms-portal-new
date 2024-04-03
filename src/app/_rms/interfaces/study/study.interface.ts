import { DataObjectInterface } from '../data-object/data-object.interface';
import { OrganisationInterface } from '../organisation/organisation.interface';
import {StudyContributorInterface} from './study-contributor.interface';
import {StudyFeatureInterface} from './study-feature.interface';
import {StudyIdentifierInterface} from './study-identifiers.interface';
import {StudyReferenceInterface} from './study-reference.interface';
import {StudyRelationshipInterface} from './study-relationship.interface';
import {StudyTitleInterface} from './study-title.interface';
import {StudyTopicInterface} from './study-topic.interface';


export interface StudyInterface {
    id: number | null;
    sdSid: string | null;
    mdrSdSid: string | null;
    mdrSourceId: number | null;
    displayTitle: string | null;
    titleLangCode: string | null;
    briefDescription: string | null;
    dataSharingStatement: string | null;
    studyStartYear: number | null;
    studyStartMonth: number | null;
    studyType: {id: number, name: string} | null;
    studyStatus: {id:number, name: string} | null;
    studyEnrollment: {id:number, name: string} | null;
    studyGenderElig: {id:number, name:string} | null;
    minAge: number | null;
    minAgeUnit: {id:number, name: string} | null;
    maxAge: number | null;
    maxAgeUnit: {id:number, name:string} | null;
    createdOn: string | null;
    organisation: OrganisationInterface | null;
    studyContributors: StudyContributorInterface[] | null;
    studyFeatures: StudyFeatureInterface[] | null;
    studyIdentifiers: StudyIdentifierInterface[] | null;
    studyReferences: StudyReferenceInterface[] | null;
    studyRelationships: StudyRelationshipInterface[] | null;
    studyTitles: StudyTitleInterface[] | null;
    studyTopics: StudyTopicInterface[] | null;
    linkedObjects: DataObjectInterface | null;
}

export interface StudyDataInterface {
    id: string | null;
    sdSid: string | null;
    mdrSdSid: string | null;
    mdrSourceId: number | null;
    displayTitle: string | null;
    titleLangCode: string | null;
    briefDescription: string | null;
    dataSharingStatement: string | null;
    studyStartYear: number | null;
    studyStartMonth: number | null;
    studyTypeId: number | null;
    studyStatusId: number | null;
    studyEnrolment: number | null;
    studyGenderEligId: number | null;
    minAge: number | null;
    minAgeUnitsId: number | null;
    maxAge: number | null;
    maxAgeUnitsId: number | null;
    createdOn: string | null;
}
