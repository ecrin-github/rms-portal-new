import { OrganisationInterface } from "../organisation/organisation.interface";
import { StudyInterface } from "../study/study.interface";
import { UserInterface } from "../user/user.interface";

export interface DataAccessRequestInterface {
    id: number;
    organisation: OrganisationInterface;
    organisationAddress: string;
    principalSecondaryUser: UserInterface;
    cv: string;
    additionalSecondaryUsers: UserInterface[];
    requestedStudy: StudyInterface;
    projectTitle: string;
    projectType: string;
    projectAbstract: string;
    ethicsApproval: string;
    ethicsApprovalDetails: string;
    projectFunding: string;
    estimatedAccessDurationRequired: string;
    provisionalStartingDate: string;
    otherInfo: string;
    requestDate: string;
}