export interface ObjectDatasetInterface {
    id: number;
    sdOid: string;
    recordKeysTypeId: number;
    recordKeysDetails: string;
    deidentTypeId: number;
    deidentDirect: boolean;
    deidentHipaa: boolean;
    deidentDates: boolean;
    deidentNonarr: boolean;
    deidentKanon: boolean;
    deidentDetails: string;
    consentTypeId: number;
    consentNoncommercial: boolean;
    consentGeogRestrict: boolean;
    consentResearchType: boolean;
    consentGeneticOnly: boolean;
    consentNoMethods: boolean;
    consentDetails: string;
    createdOn: string;
}
