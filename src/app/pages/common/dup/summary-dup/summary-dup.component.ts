import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { DupListEntryInterface } from 'src/app/_rms/interfaces/dup/dup-listentry.interface';
import { DupService } from 'src/app/_rms/services/entities/dup/dup.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';

@Component({
  selector: 'app-summary-dup',
  templateUrl: './summary-dup.component.html',
  styleUrls: ['./summary-dup.component.scss'],
  providers: [ScrollService]
})
export class SummaryDupComponent implements OnInit {
  usedURLs = ['/', '/data-use'];
  displayedColumns = ['id', 'organisation', 'title', 'status', 'actions'];
  dataSource: MatTableDataSource<DupListEntryInterface>;
  filterOption: string = 'title';
  searchText:string = '';
  dupLength: number = 0;
  warningModal: any;
  orgId: any;
  role: any;
  deBouncedInputValue = this.searchText;
  searchDebounec: Subject<string> = new Subject();
  sticky: boolean = false;
  notDashboard:boolean = false;
  dataChanged: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('deleteModal') deleteModal : TemplateRef<any>;

  constructor( private reuseService: ReuseService,
               private scrollService: ScrollService,
               private listService: ListService, 
               private spinner: NgxSpinnerService, 
               private toastr: ToastrService, 
               private modalService: NgbModal,
               private dupService: DupService,
               private permissionService: NgxPermissionsService, private router: Router) { }

  ngOnInit() {
    if (localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
      this.permissionService.loadPermissions([this.role]);
    }
    if (localStorage.getItem('organisationId')) {
      this.orgId = localStorage.getItem('organisationId');
    }
    this.notDashboard = this.router.url.includes('data-use') ? true : false;
    this.getDupList();
    this.setupSearchDeBouncer();
    this.scrollService.handleScroll(this.role, ['/data-use']);

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

  getAllDupList() {
    this.spinner.show();
    const pageSize = 10000;
    this.listService.getDupList(pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<DupListEntryInterface>(res.results);
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
  getDupListByOrg() {
    this.spinner.show();
    this.listService.getDupListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res) {
        this.dataSource = new MatTableDataSource<DupListEntryInterface>(res);
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
  getDupList() {
    if (this.role === 'User') {
      this.getDupListByOrg();
    } else {
      this.getAllDupList();
    }
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  filterSearch() {
    let page = 1; let size = 10; // though not currently used
    let title_fragment = this.searchText;
    if (this.filterOption === 'title' && this.searchText !== '') {
      this.spinner.show();
      const filterService$ = this.role === 'Manager' ? this.listService.getFilteredDuptList(title_fragment, page, size) : this.listService.getFilteredDuptListByOrg(title_fragment, this.orgId, page, size);
      filterService$.subscribe((res: any) => {
        this.spinner.hide()
        if (res) {
          this.dataSource = new MatTableDataSource<DupListEntryInterface>(res);
          // this.dupLength = res.count;
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
      this.getDupList();
    }
  } 
  
  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getDupList();
    localStorage.removeItem('updateDupList');
  }
  deleteRecord(id) {
    this.dupService.getDupById(id).subscribe((res: any) => {
      if (res) {
        if (res.status?.id === '5f7846ba-0627-49f7-acf6-9b362db5af1b' || res.status?.id === '16f2eb8a-9694-46c9-830e-b961e3371500') {
          this.warningModal = this.modalService.open(this.deleteModal, {size: 'lg', backdrop: 'static'});
        } else {
          const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
          deleteModal.componentInstance.type = 'dup';
          deleteModal.componentInstance.id = id;
          deleteModal.result.then((data: any) => {
            if (data) {
              this.getDupList();
            }
          }, error => { });
        }
      }
    })
  }
  closeModal() {
    this.warningModal.close();
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
