import { UserInterface } from "../user/user.interface";

export interface DupPersonInterface {
    id: number;
    dupId: number;
    person: UserInterface;
    notes: string;
    createdOn: string;
}
