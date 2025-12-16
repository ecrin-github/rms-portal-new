import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { OrganisationInterface } from 'src/app/_rms/interfaces/organisation/organisation.interface';
import { StudyInterface } from 'src/app/_rms/interfaces/study/study.interface';
import { UserInterface } from 'src/app/_rms/interfaces/user/user.interface';
import { ContextService } from 'src/app/_rms/services/context/context.service';
import { CommonLookupService } from 'src/app/_rms/services/entities/common-lookup/common-lookup.service';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { UserService } from 'src/app/_rms/services/user/user.service';
import { OrganisationModalComponent } from 'src/app/pages/common/organisation-modal/organisation-modal.component';
import { ngbDateStructToString, keysToSnakeCase, objectToFormData } from 'src/assets/js/util';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-access-request-form',
  templateUrl: './access-request-form.component.html',
  styleUrls: ['./access-request-form.component.scss']
})
export class AccessRequestFormComponent implements OnInit {

  projectTypes = ["Secondary Analysis", "Individual Patient Data Meta-analysis", "Interventional Clinical Study", "Observational Clinical Study", "Re-analysis"];
  form: UntypedFormGroup;
  organisations: OrganisationInterface[] = [];
  qpSdSid: string = null;
  studies: StudyInterface[] = [];
  submitted: boolean = false;
  submittedSuccessfully: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private commonLookupService: CommonLookupService,
    private contextService: ContextService,
    private dupService: DupService,
    private fb: UntypedFormBuilder, 
    private listService: ListService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      id: null,
      organisation: [null, Validators.required],
      organisationAddress: [null, Validators.required],
      principalSecondaryUser: this.fb.group({
        name: [null, Validators.required],
        email: [null, Validators.required],
      }),
      cv: [null, Validators.required],
      additionalSecondaryUsers: this.fb.array([]),
      requestedStudy: [null, Validators.required],
      projectTitle: [null, Validators.required],
      projectType: [null, Validators.required],
      projectAbstract: [null, Validators.required],
      ethicsApproval: [null, Validators.required],
      ethicsApprovalDetails: [null, Validators.required],
      projectFunding: null,
      estimatedAccessDurationRequired: null,
      provisionalStartingDate: null,
      otherInfo: null,
      requesterName: [null, Validators.required],
      requesterEmail: [null, Validators.required],
      requesterEmailConfirmation: [null, Validators.required],
      acceptedTCs: [null, Validators.requiredTrue]
    });
    
    const emailChecker = (form: FormGroup) => {
      const email = form.get('requesterEmail').value;
      const confirm = form.get('requesterEmailConfirmation').value;
    
      return email === confirm ? null : { emailMismatch: 'The email addresses are different' };
    };

    this.form.setValidators([emailChecker]);
  }

  ngOnInit(): void {
    this.getStudies().subscribe((res: any) => {
      this.setStudies(res);
    }, error => {
      this.toastr.error(error.error.title);
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params?.sdSid) {
        this.qpSdSid = params.sdSid;
        if (this.studies) {
          this.patchStudy();
        }
      }
    });

    this.contextService.organisations.subscribe((organisations: OrganisationInterface[]) => {
      this.organisations = organisations;
    });
  }

  get g() { return this.form["controls"]; }
  get puc() { return this.form["controls"].principalSecondaryUser["controls"]; }

  getAdditionalSecondaryUsersForm(): UntypedFormArray {
    return this.form.get('additionalSecondaryUsers') as UntypedFormArray;
  }

  getStudies() {
    return this.listService.getStudyList();
  }

  setStudies(res) {
    if (res?.results) {
      this.studies = res.results;
      if (this.qpSdSid) {
        this.patchStudy();
      }
    }
  }

  patchStudy() {
    let foundStudy = null;
    for (let study of this.studies) {
      if (study.sdSid === this.qpSdSid) {
        foundStudy = study;
        break;
      }
    }

    this.form.patchValue({
      "requestedStudy": foundStudy
    });
  }

  searchOrganisations = (term: string, item: any) => {
    return this.contextService.searchOrganisations(term, item);
  }

  searchStudies(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.id?.toLocaleLowerCase().indexOf(term) > -1 || item.displayTitle?.toLocaleLowerCase().indexOf(term) > -1;
  }

  newAdditionalUser() {
    return this.fb.group({
      id: null,
      name: null,
      email: null,
    });
  }
  
  addAdditionalUser() {
    this.getAdditionalSecondaryUsersForm().push(this.newAdditionalUser());
  }

  deleteAdditionalUser(i: number) {
    this.getAdditionalSecondaryUsersForm().removeAt(i);
  }

  addProjectType(projectType) {
    return projectType;
  }

  addOrganisation = (orgName) => {
    const addOrgModal = this.modalService.open(OrganisationModalComponent, { size: 'lg', backdrop: 'static' });
    addOrgModal.componentInstance.name = orgName;

    return addOrgModal.result.then((result) => {
      return result;
    })
    .catch((err) => {
      this.toastr.error(err, "Error adding organisation", { timeOut: 20000, extendedTimeOut: 20000 });
      return null;
    });
  }

  compareIds(fv1, fv2): boolean {
    return fv1?.id == fv2?.id;
  }

  ngbDateStructToString(date) {
    return ngbDateStructToString(date);
  }

  onFileChange($event) {
    const file = ($event.target as HTMLInputElement).files[0];
    if (file.size > 2621440) {  // 2.5MB
      this.toastr.error("Please select a file that is at most 2.5MB");
      $event.target.value = null;
      this.form.patchValue({cv: null});
    } else {
      this.form.patchValue({cv: file});
    }
  }

  keysToSnakeCase(payload) {
    return keysToSnakeCase(payload);
  }

  updatePayload(payload) {
    if (payload.requestedStudy?.id) {
      payload.requestedStudy = payload.requestedStudy.id;
    }

    payload.provisionalStartingDate = this.ngbDateStructToString(payload.provisionalStartingDate);
  }

  getFormDataFromPayload(payload) {
    const formData = new FormData();

    // Need to manually convert to snake case here because it won't do it automatically https://github.com/vbabiy/djangorestframework-camel-case/issues/82
    // Note: FormData sucks

    formData.append("organisation", JSON.stringify(this.keysToSnakeCase(payload.organisation)));
    formData.append("organisation_address", payload.organisationAddress);
    formData.append("principal_secondary_user", JSON.stringify(this.keysToSnakeCase(payload.principalSecondaryUser)));
    formData.append("cv", this.form.value.cv);  // Non-stringified CV file

    for (let i = 0; i < payload.additionalSecondaryUsers.length; i++) {
      formData.append(`additional_secondary_users`, JSON.stringify(this.keysToSnakeCase(payload.additionalSecondaryUsers[i])));
    }

    formData.append("requested_study", payload.requestedStudy);
    formData.append("project_title", payload.projectTitle);
    formData.append("project_type", payload.projectType);
    formData.append("project_abstract", payload.projectAbstract);
    formData.append("ethics_approval", payload.ethicsApproval);
    formData.append("ethics_approval_details", payload.ethicsApprovalDetails);
    if (payload.projectFunding) {
      formData.append("project_funding", payload.projectFunding);
    }
    if (payload.estimatedAccessDurationRequired) {
      formData.append("estimated_access_duration_required", payload.estimatedAccessDurationRequired);
    }
    if (payload.provisionalStartingDate) {
      formData.append("provisional_starting_date", payload.provisionalStartingDate);
    }
    if (payload.otherInfo) {
      formData.append("other_info", payload.otherInfo);
    }
    formData.append("requester_name", payload.requesterName);
    formData.append("requester_email", payload.requesterEmail);

    return formData;
  }

  submit() {
    this.submitted = true;

    if (!this.form.valid) {
      this.toastr.error("Please correct the errors in the form");
    } else {
      this.spinner.show();
  
      const payload = JSON.parse(JSON.stringify(this.form.value));
      this.updatePayload(payload);

      const formData = this.getFormDataFromPayload(payload);
  
      this.dupService.addAccessRequest(formData).subscribe((res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Success! An email has been sent to your email address.');
          this.submittedSuccessfully = true;
          this.spinner.hide();
        } else {
          this.toastr.error(res);
          this.spinner.hide();
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(error);
      });
    }
  }
}
