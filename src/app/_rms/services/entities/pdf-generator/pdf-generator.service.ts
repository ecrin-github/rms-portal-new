import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  dtpPdfGenerator(dtpData, peopleData) {
    
    const doc = new jsPDF();

    const bodyData: Array<any> = [];

    bodyData.push([{content: dtpData.coreDtp.displayName, colSpan: 4, rowSpan: 1, styles: {halign: 'left', fontStyle: 'bold', fontSize: 16}}]);
    bodyData.push([
      { content: 'Organization: ' + dtpData.coreDtp.orgId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Status: ' + dtpData.coreDtp.statusId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Initial Contact Date: ' + dtpData.coreDtp.initialContactDate, colSpan: 2, styles: { halign: 'left' } },
      { content: 'SetUp Completed: ' + dtpData.coreDtp.setUpCompleted, colSpan: 2, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'MD Access Granted: ' + dtpData.coreDtp.mdAccessGranted, colSpan: 2, styles: { halign: 'left' } },
      { content: 'MD Completed: ' + dtpData.coreDtp.mdCompleteDate, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ])
    bodyData.push([
      { content: 'DTA Agreed: ' + dtpData.coreDtp.dtaAgreedDate, rowSpan: 1, colSpan: 2, styles: { halign: 'left' } },
      { content: 'Upload Access Requested: ' + dtpData.coreDtp.uploadAccessRequested, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Upload Access Confirmed: ' + dtpData.coreDtp.uploadAccessConfirmed, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Upload Completed: ' + dtpData.coreDtp.uploadsComplete, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'QC Checks Completed: ' + dtpData.coreDtp.qcChecksCompleted, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'MD integrated with MDR: ' + dtpData.coreDtp.mdIntegratedWithMdr, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ])
    bodyData.push([
      { content: 'Availability Requested: ' + dtpData.coreDtp.availabilityRequested, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Availability Confirmed: ' + dtpData.coreDtp.availabilityConfirmed, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Agreement Details', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    bodyData.push([
      { content: 'Conforms To Default: ' + dtpData.dtas[0].conformsToDefault, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Variations: ' + dtpData.dtas[0].variations, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'DTA File Path: ' + dtpData.dtas[0].dtaFilePath, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } }
    ])
    bodyData.push([
      { content: 'Repository Signatory 1: ' + dtpData.dtas[0].repoSignatory1, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Repository Signatory 2: ' + dtpData.dtas[0].repoSignatory2, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Repository Signatory 3: ' + dtpData.dtas[0].providerSignatory1, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Repository Signatory 4: ' + dtpData.dtas[0].providerSignatory2, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Notes', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let note of dtpData.dtpNotes) {
      bodyData.push([
        { content: note.author + ' ' + note.createdOn + ':' + note.text, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Associated Studies', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);

    for ( let study of dtpData.dtpStudies) {
      bodyData.push([
        { content: study.studyName + '(' + study.sdSid + ')', colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    } 
    bodyData.push([
      { content: 'Associated Objects', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for ( let object of dtpData.dtpObjects) {
      const content = object.sdOid + '(' + object.objectName + ') \n Access Type: ' + object.accessTypeId + '  Access Details: ' + object.accessDetails + '\nEmbargo Requested: ' + object.embargoRequested +
                        '  Access Check Status: ' + object.accessCheckStatusId + '  Access Check By: ' + object.accessCheckBy;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Associated People', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let person of peopleData) {
      bodyData.push([
        { content: person.personName, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    autoTable(doc, {
      startY: 20,
      theme: 'plain',
      body: bodyData,
    })
    doc.save(dtpData.coreDtp.displayName + '.pdf');
  }
  dupPdfGenerator(dupData, peopleData) {
    const doc = new jsPDF();

    const bodyData: Array<any> = [];

    bodyData.push([{content: dupData.coreDup.displayName, colSpan: 4, rowSpan: 1, styles: {halign: 'left', fontStyle: 'bold', fontSize: 16}}]);
    bodyData.push([
      { content: 'Organization: ' + dupData.coreDup.orgId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Status: ' + dupData.coreDup.statusId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Initial Contact Date: ' + dupData.coreDup.initialContactDate, colSpan: 2, styles: { halign: 'left' } },
      { content: 'SetUp Completed: ' + dupData.coreDup.setUpCompleted, colSpan: 2, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'PreRequstMet: ' + dupData.coreDup.prereqsMet, colSpan: 2, styles: { halign: 'left' } },
      { content: 'DUA Agreed Date: ' + dupData.coreDup.duaAgreedDate, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ])
    bodyData.push([
      { content: 'Availability Requested: ' + dupData.coreDup.availabilityRequested, rowSpan: 1, colSpan: 2, styles: { halign: 'left' } },
      { content: 'Availability Confirmed: ' + dupData.coreDup.availabilityConfirmed, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Access Confirmed: ' + dupData.coreDup.accessConfirmed, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Agreement Details', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    bodyData.push([
      { content: 'Conforms To Default: ' + dupData.duas[0].conformsToDefault, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Variations: ' + dupData.duas[0].variations, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Repo Is Proxy Provider: ' + dupData.duas[0].repoIsProxyProvider, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'DTA File Path: ' + dupData.duas[0].duaFilePath, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ])
    bodyData.push([
      { content: 'Repository Signatory 1: ' + dupData.duas[0].repoSignatory1, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Repository Signatory 2: ' + dupData.duas[0].repoSignatory2, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Provider Signatory 1: ' + dupData.duas[0].providerSignatory1, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Provider Signatory 2: ' + dupData.duas[0].providerSignatory2, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'RequesterSignatory 1: ' + dupData.duas[0].requesterSignatory1, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'RequesterSignatory 2: ' + dupData.duas[0].requesterSignatory2, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Notes', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let note of dupData.dupNotes) {
      bodyData.push([
        { content: note.author + ' ' + note.createdOn + ':' + note.text, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Associated Studies', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);

    for ( let study of dupData.dupStudies) {
      bodyData.push([
        { content: study.studyName + '(' + study.sdSid + ')', colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    } 
    bodyData.push([
      { content: 'Associated Objects', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for ( let object of dupData.dupObjects) {
      bodyData.push([
        { content: object.sdOid + '(' + object.objectName + ')' ,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Associated People', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let person of peopleData) {
      bodyData.push([
        { content: person.personName, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    autoTable(doc, {
      startY: 20,
      theme: 'plain',
      body: bodyData,
    })
    doc.save(dupData.coreDup.displayName + '.pdf');
  }
  studyPdfGenerator(studyData) {
    const doc = new jsPDF();

    const bodyData: Array<any> = [];

    bodyData.push([{content: studyData.coreStudy.displayTitle, colSpan: 4, rowSpan: 1, styles: {halign: 'left', fontStyle: 'bold', fontSize: 16}}]);
    bodyData.push([
      { content: 'Study Description', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    bodyData.push([{content: studyData.coreStudy.briefDescription, colSpan: 4, rowSpan: 1,}]);
    bodyData.push([
      { content: 'Data Sharing Statement', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    bodyData.push([{content: studyData.coreStudy.dataSharingStatement, colSpan: 4, rowSpan: 1}]);
    bodyData.push([
      { content: 'Study Status: ' + studyData.coreStudy.studyStatusId.name, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Study Type: ' + studyData.coreStudy.studyTypeId.name, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Study Start Year: ' + studyData.coreStudy.studyStartYear, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Study Start Month: ' + studyData.coreStudy.studyStartMonth, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Study Gender Eligibility: ' + studyData.coreStudy.studyGenderEligId.name, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Study Enrollement: ' + studyData.coreStudy.studyEnrolment, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Min Age: ' + studyData.coreStudy.minAge + ' ' + studyData.coreStudy.minAgeUnitsId.name, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Max Age: ' + studyData.coreStudy.maxAge + ' ' + studyData.coreStudy.maxAgeUnitsId.name, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Study Identifiers', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let identifier of studyData.studyIdentifiers) {
      let content = 'Identifier Type: ' + identifier.identifierTypeId + '  Identifier Value: ' + identifier.identifierValue + '  Identifier Organization:' + identifier.identifierOrg + '  Identifier Date: ' + identifier.identifierDate;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Study Titles', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let title of studyData.studyTitles) {
      let content = 'Title Type: ' + title.titleTypeId + '  Title Text: ' + title.titleText;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Study Feature', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let feature of studyData.studyFeatures) {
      let content = 'Feature Type: ' + feature.featureTypeId + '  Feature Value: ' + feature.featureValueId;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Study Topics', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let topic of studyData.studyTopics) {
      let content = 'Topic Type: ' + topic.topicTypeId + '  Topic Value: ' + topic.meshValue + '  Controlled Terminology: ' + topic.originalCtId + '  CT Code: ' + topic.meshCode;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Study Relationships', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let relationship of studyData.studyRelationships) {
      let content = 'Relationship Type: ' + relationship.relationshipTypeId + '  Target Study: ' + relationship.targetSdSid;
      bodyData.push([
        { content: content,colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ])
    }
    bodyData.push([
      { content: 'Study Contributors', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    autoTable(doc, {
      startY: 20,
      theme: 'plain',
      body: bodyData,
    })
    doc.save(studyData.coreStudy.displayTitle + '.pdf');

  }
  objectPdfGenerator(objectData) {
    const doc = new jsPDF();

    const bodyData: Array<any> = [];

    bodyData.push([{content: objectData.coreObject.displayTitle, colSpan: 4, rowSpan: 1, styles: {halign: 'left', fontStyle: 'bold', fontSize: 16}}]),
    bodyData.push([
      { content: 'DOI: ' + objectData.coreObject.doi, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Version: ' + objectData.coreObject.version, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Object Class: ' + objectData.coreObject.objectClassId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Object Type: ' + objectData.coreObject.objectTypeId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Publication Year: ' + objectData.coreObject.publicationYear, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Language: ' + objectData.coreObject.langCode, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'Managing Organization: ' + objectData.coreObject.managingOrg, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'Access Type: ' + objectData.coreObject.accessTypeId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    bodyData.push([
      { content: 'EOSC Category: ' + objectData.coreObject.eoscCategory, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
    ]);
    bodyData.push([
      { content: 'Access Details', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    bodyData.push([
      { content: 'Description: ' + objectData.coreObject.accessDetails, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
      { content: 'URL: ' + objectData.coreObject.accessDetailsUrl, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
    ]);
    if (objectData.objectDatasets.length > 0) {
      bodyData.push([
        { content: 'Dataset Record Key', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
      ]);
      bodyData.push([
        { content: 'Keys Type: ' + objectData.objectDatasets[0].recordKeysTypeId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'Keys Detail: ' + objectData.objectDatasets[0].recordKeysDetails, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Dataset Deidentification Level', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
      ]);
      bodyData.push([
        { content: 'Type: ' + objectData.objectDatasets[0].consentTypeId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'Direct ID`s: ' + objectData.objectDatasets[0].deidentDirect, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'HIPAA Applied: ' + objectData.objectDatasets[0].deidentHipaa, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'Dates Rebased: ' + objectData.objectDatasets[0].deidentDates, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Non Narrative: ' + objectData.objectDatasets[0].deidentNonarr, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'KANON Applied: ' + objectData.objectDatasets[0].deidentKanon, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Details: ' + objectData.objectDatasets[0].deidentDetails, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
      bodyData.push([
        { content: 'Dataset Consent', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
      ]);
      bodyData.push([
        { content: 'Type: ' + objectData.objectDatasets[0].consentTypeId, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'Noncommercial Only: ' + objectData.objectDatasets[0].consentNoncommercial, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Geographic Restrictions: ' + objectData.objectDatasets[0].consentGeogRestrict, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'Research Type Related: ' + objectData.objectDatasets[0].consentResearchType, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Genetic Research Only: ' + objectData.objectDatasets[0].consentGeneticOnly, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } },
        { content: 'No Methods: ' + objectData.objectDatasets[0].consentNoMethods, colSpan: 2, rowSpan: 1, styles: { halign: 'left' } }
      ]);
      bodyData.push([
        { content: 'Details: ' + objectData.objectDatasets[0].consentDetails, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);

    }
    bodyData.push([
      { content: 'Object Instances', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);  
    for (let instance of objectData.objectInstances) {
      let content = 'Repository Organisation: ' + instance.repositoryOrg + '  Access Details(Direct Access): ' + instance.urlAccessible + '  Access Details: ' + instance.url + '  Resource Details(Resource Type): ' + instance.resourceTypeId +
                      '  Resource Details(Size): ' + instance.resourceSize + ' ' + instance.resourceSizeUnits + '  Comments: ' + instance.resourceComments;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Titles', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);  
    for (let title of objectData.objectTitles) {
      let content = 'Title Type: ' + title.titleTypeId + '  Title Text: ' + title.titleText + '  Language Code: ' + title.langCode;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Dates', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);  
    for (let date of objectData.objectDates) {
      let content = !date.dateIsRange ? 'Date Type: ' + date.dateTypeId + '  Is Date Range: ' + date.dateIsRange + '  Start Date: ' + date.startDay+'-'+date.startMonth+'-'+date.startYear : 'Date Type: ' + date.dateTypeId + '  Is Date Range: ' + date.dateIsRange + '  Start Date: ' + date.startDay+'-'+date.startMonth+'-'+date.startYear + date.dateIsRange + '  End Date: ' + date.endDay+'-'+date.endMonth+'-'+date.endYear ;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Contributors', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]); 
    for (let contibutor of objectData.objectContributors) {

    } 
    bodyData.push([
      { content: 'Object Topics', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let topic of objectData.objectTopics) {
      let content = 'Topic Type: ' + topic.topicTypeId + '  Topic Value: ' + topic.originalValue + '  Controlled Terminology: ' + topic.meshValue + '  CT Code: ' + topic.meshCode + '  Mesh Coded: ' + topic.meshCoded;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Identifiers', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let identifier of objectData.objectIdentifiers) {
      let content = 'Identifier Type: ' + identifier.identifierTypeId + '  Identifier Value: ' + identifier.identifierValue + '  Identifier Organization: ' + identifier.identifierOrg + '  Identifier Date: ' + identifier.identifierDate;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Description', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let description of objectData.objectDescriptions) {
      let content = 'Description Type: ' + description.descriptionTypeId + '  Description Label: ' + description.label + '  Description Text: ' + description.descriptionText + '  Language Code: ' + description.langCode;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Rights', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let right of objectData.objectRights) {
      let content = 'Rights Name: ' + right.rightsName + '  Rights URL:' + right.rightsUri + '  Comments: ' + right.comments;
      bodyData.push([
        { content: content, colSpan: 4, rowSpan: 1, styles: { halign: 'left' } },
      ]);
    }
    bodyData.push([
      { content: 'Object Relationship', colSpan: 4, rowSpan: 1, styles: { halign: 'left', fontStyle: 'bold', fontSize: 14 } },
    ]);
    for (let relation of objectData.objectRelationships) {
      
    }
    autoTable(doc, {
      startY: 20,
      theme: 'plain',
      body: bodyData,
    })
    doc.save(objectData.coreObject.displayTitle + '.pdf');
  }
}
