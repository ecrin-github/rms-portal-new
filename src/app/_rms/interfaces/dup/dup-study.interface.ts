import { StudyInterface } from "../study/study.interface";

export interface DupStudyInterface {
    id: number;
    dupId: number;
    study: StudyInterface;
    createdOn: string;
}
