import { OrganisationInterface } from "../organisation/organisation.interface";
import { UserInterface } from "../user/user.interface";
import { StudyContributorTypeInterface } from "./study-contributor-type.interface";

export interface StudyContributorInterface {
    contributorType: StudyContributorTypeInterface;
    createdOn: string;
    id: number;
    isIndividual: boolean;
    lastEditedBy: UserInterface;
    organisation: OrganisationInterface;
    person: UserInterface;
    studyId: string;
}