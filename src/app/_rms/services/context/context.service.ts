import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OrganisationInterface } from '../../interfaces/organisation/organisation.interface';
import { CommonLookupService } from '../entities/common-lookup/common-lookup.service';

@Injectable({
  providedIn: 'root'
})
export class ContextService {

  public organisations: BehaviorSubject<OrganisationInterface[]> =
        new BehaviorSubject<OrganisationInterface[]>(null);

  constructor(
    private commonLookup: CommonLookupService,
    private toastr: ToastrService) {
    // Note: be careful if you add new observables because of the way their result is retrieved later (combineLatest + pop)
    // The code is built like this because in the version of RxJS used here combineLatest does not handle dictionaries
    let queryFuncs: Array<Observable<any>> = [];

    queryFuncs.push(this.getOrganisations());

    let obsArr: Array<Observable<any>> = [];
    queryFuncs.forEach((funct) => {
      obsArr.push(funct.pipe(catchError(error => of(this.toastr.error(error.error.title)))));
    });

    combineLatest(obsArr).subscribe(res => {
      this.setOrganisations(res.pop());
    });
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
