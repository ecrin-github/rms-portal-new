import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrganisationInterface } from '../../interfaces/organisation/organisation.interface';
import { CommonLookupService } from '../entities/common-lookup/common-lookup.service';
import { StatesService } from '../states/states.service';
import { States } from '../../states/states';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganisationModalComponent } from 'src/app/pages/common/organisation-modal/organisation-modal.component';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  public organisations: BehaviorSubject<OrganisationInterface[]> =
        new BehaviorSubject<OrganisationInterface[]>(null);
  private isOrgIdValid: boolean = false;

  constructor(
    private commonLookup: CommonLookupService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private statesService: StatesService,
    private states: States,
    private toastr: ToastrService) {

    // Subscribing to org id changes to load organisations
    this.states.currentAuthOrgId.subscribe(() => {
      this.isOrgIdValid = this.statesService.isOrgIdValid();
      // TODO: re-triggered on user profile page and probably others as well
      if (!(this.organisations.value?.length > 0)) { // If query not already done
        this.getOrganisations().subscribe(res => {
          this.setOrganisations(res);
        });
      }
    })
  }

  /* Organisations */
  getOrganisations() {
    return this.commonLookup.getOrganizationList();
  }

  sortOrganisations(organisations) {
    const { compare } = Intl.Collator('en-GB');
    organisations.sort((a, b) => { return compare(a.defaultName, b.defaultName); });
  }

  setOrganisations(organisations) {
    if (organisations.results){
      organisations = organisations.results;
      this.sortOrganisations(organisations);
    }
    this.organisations.next(organisations);
  }

  updateOrganisations() {
    return this.getOrganisations().pipe(
      map((organisations) => {
        this.setOrganisations(organisations);
      })
    );
  }

  searchOrganisations(term: string, item) {
    term = term.toLocaleLowerCase();

    for (const w of term.split(" ")) {
      if (item.defaultName?.toLocaleLowerCase().indexOf(term) > -1 || item.city?.toLocaleLowerCase().indexOf(term) > -1
        || item.countryName?.toLocaleLowerCase().indexOf(term) > -1) {
          return true;
        }
    }
    return false;
  }

  /**
   * 
   * @param orgToRemove TODO
   * @param currProjectId 
   */
  deleteOrganisationDropdown(orgToRemove) {
    this.spinner.show();
    // Delete organisation from the DB, then locally if succeeded
    this.commonLookup.deleteOrganisation(orgToRemove.id).subscribe((res: any) => {
      if (res.status !== 204) {
        this.toastr.error('Error when deleting organisation', res.error, { timeOut: 20000, extendedTimeOut: 20000 });
      } else {
        this.toastr.success('Organisation deleted successfully');
        // Updating organisations list
        this.updateOrganisations().subscribe(() => {
          this.spinner.hide();
        });
      }
      this.spinner.hide();
    }, error => {
      this.toastr.error(error);
      this.spinner.hide();
    });
  }
  
}
