import { Component, HostListener, OnInit, OnDestroy, ViewChild, Renderer2 } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { PeopleService } from 'src/app/_rms/services/entities/people/people.service';
import { ConfirmationWindowComponent } from '../../../confirmation-window/confirmation-window.component';
import { Subject, asapScheduler, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, observeOn } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-summary-user',
  templateUrl: './summary-user.component.html',
  styleUrls: ['./summary-user.component.scss'],
  providers: [ScrollService]
})
export class SummaryUserComponent implements OnInit, OnDestroy {
  usedURLs = ['/', '/people'];
  displayedColumns = ['name', 'roleName', 'orgName', 'actions'];
  dataSource: MatTableDataSource<any>;
  peopleLength: number = 0;
  searchText: string = '';
  orgId: any;
  role: any;
  deBouncedInputValue = this.searchText;
  searchDebounec: Subject<string> = new Subject();
  notDashboard:boolean = false;
  sticky: boolean = false;
  detachedRouteHandlesService: any;
  dataChanged: boolean = false;
  
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  constructor(private statesService: StatesService,
              private reuseService: ReuseService,
              private scrollService: ScrollService, 
              private listService: ListService, 
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService, 
              private modalService: NgbModal, 
              private permissionService: NgxPermissionsService, 
              private router: Router) { }

  ngOnInit(): void {
    this.role = this.statesService.currentAuthRole;
    this.orgId = this.statesService.currentAuthOrgId;
    this.permissionService.loadPermissions([this.role]);
    this.notDashboard = this.router.url.includes('people') ? true : false;
    this.getPeople();
    this.setupSearchDeBouncer();
    this.scrollService.handleScroll(['/people']);

    // Updating data while reusing detached component
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.usedURLs.includes(event.urlAfterRedirects) && this.dataChanged) {
        this.filterSearch();
        this.dataChanged = false;
      }
    });

    this.reuseService.notification$.subscribe((source) => {
      if (this.usedURLs.includes(source) && !this.dataChanged) {
        this.dataChanged = true;
      }
    });
  }

  getAllPeople() {
    this.spinner.show();
    const pageSize = 10000;
    this.listService.getPeopleList(pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<any>(res.results);
      } else {
        this.dataSource = new MatTableDataSource();
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getPeopleByOrg() {
    this.spinner.show();
    this.listService.getPeopleListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<any>(res.results);
      } else {
        this.dataSource = new MatTableDataSource();
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getPeople() {
    if (this.role === 'User') {
      this.getPeopleByOrg();
    } else {
      this.getAllPeople();
    }
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
  filterSearch() {
    let page = 1; let size = 10; // though not currently used
    let people_fragment = this.searchText;
    if (this.searchText !== '') {
      this.spinner.show();
      const filterService$ = this.role === 'Manager' ? this.listService.getFilteredPeopleList(people_fragment, page, size) : this.listService.getFilteredPeopleListByOrg(people_fragment, this.orgId, page, size)
      filterService$.subscribe((res: any) => {
        this.spinner.hide()
        if (res && res.results) {
          this.dataSource = new MatTableDataSource<any>(res.results);
          this.peopleLength = res.count;
        } else {
          this.dataSource = new MatTableDataSource();
        }
        this.dataSource.paginator = this.paginator;
      }, error => {
        this.spinner.hide();
        this.toastr.error(error.error.title);
      })
    }
    if (this.searchText === '') {
      this.getPeople();
    }
  }
  deleteRecord(id) {
    const  deleteModal = this.modalService.open(ConfirmationWindowComponent, {size: 'lg', backdrop: 'static'});
    deleteModal.componentInstance.type = 'people';
    deleteModal.componentInstance.peopleId = id;
    deleteModal.result.then((data: any) => {
      if (data) {
        this.getPeople();
      }
    })
  }
  @HostListener('window: storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event);
    this.getPeople();
    localStorage.removeItem('updateUserList');
  }
  onInputChange(e) {
    const searchText = e.target.value;
    if (!!searchText) {
      this.searchDebounec.next(searchText);
    }
  }
  setupSearchDeBouncer() {
    const search$ = this.searchDebounec.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe((term: string) => {
      this.deBouncedInputValue = term;
      this.filterSearch();
    });
  }
  ngOnDestroy() {
    this.scrollService.unsubscribeScroll();
  }
}
