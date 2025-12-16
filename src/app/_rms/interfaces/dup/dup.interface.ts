import { OrganisationInterface } from "../organisation/organisation.interface";
import { DataAccessRequestInterface } from "./dar.interface";
import { DupObjectInterface } from "./dup-object.interface";
import { DupPersonInterface } from "./dup-person.interface";
import { DupStudyInterface } from "./dup-study.interface";

export interface DupInterface {
    id: number;
    organisation: OrganisationInterface;
    displayName: string;
    status: number;
    dataAccessRequest: DataAccessRequestInterface;
    requestDecisionDate: string;
    agreementSignedDate: string;
    DataAccessAvailableFrom: string;
    DataAccessAvailableUntil: string;
    dupStudies: DupStudyInterface[];
    dupObjects: DupObjectInterface[];
    dupPeople: DupPersonInterface[];
    createdOn: string;
}