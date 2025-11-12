import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrganisationInterface } from '../../interfaces/organisation/organisation.interface';
import { CommonLookupService } from '../entities/common-lookup/common-lookup.service';
import { StatesService } from '../states/states.service';
import { States } from '../../states/states';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  public organisations: BehaviorSubject<OrganisationInterface[]> =
        new BehaviorSubject<OrganisationInterface[]>(null);
  private isOrgIdValid: boolean = false;

  constructor(
    private commonLookup: CommonLookupService,
    private statesService: StatesService,
    private states: States,
    private toastr: ToastrService) {

    // Subscribing to org id changes to load organisations
    this.states.currentAuthOrgId.subscribe(() => {
      this.isOrgIdValid = this.statesService.isOrgIdValid();
      // TODO: re-triggered on user profile page and probably others as well
      if (this.isOrgIdValid && !(this.organisations.value?.length > 0)) { // If auth with org + query not already done
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

  searchOrganisations(term: string, item) {
    term = term.toLocaleLowerCase();
    return item.defaultName?.toLocaleLowerCase().indexOf(term) > -1 || item.city?.toLocaleLowerCase().indexOf(term) > -1
      || item.countryName?.toLocaleLowerCase().indexOf(term) > -1;
  }
}
