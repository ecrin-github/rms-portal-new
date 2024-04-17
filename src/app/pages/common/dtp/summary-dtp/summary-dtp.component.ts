import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { DtpListEntryInterface } from 'src/app/_rms/interfaces/dtp/dtp-listentry.interface';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { DtpService } from 'src/app/_rms/services/entities/dtp/dtp.service';
import { NgxPermission } from 'ngx-permissions/lib/model/permission.model';
import { NgxPermissionsService } from 'ngx-permissions';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';


@Component({
  selector: 'app-summary-dtp',
  templateUrl: './summary-dtp.component.html',
  styleUrls: ['./summary-dtp.component.scss'],
  providers: [ScrollService]
})

export class SummaryDtpComponent implements OnInit {
  usedURLs = ['/', '/data-transfers'];
  displayedColumns = ['dtpId', 'organisation', 'title', 'status', 'actions'];
  dataSource: MatTableDataSource<DtpListEntryInterface>;
  filterOption: string = 'title';
  searchText:string = '';
  dtpLength: number = 0;
  warningModal: any;
  orgId: any;
  role: any;
  deBouncedInputValue = this.searchText;
  searchDebounec: Subject<string> = new Subject();
  sticky: boolean = false;
  notDashboard:boolean = false;
  dataChanged: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('exampleModal') exampleModal : TemplateRef<any>;

  constructor(private statesService: StatesService,
              private reuseService: ReuseService,
              private scrollService: ScrollService,
              private listService: ListService, 
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService, 
              private modalService: NgbModal,
              private dtpService: DtpService,
              private permissionService: NgxPermissionsService, 
              private router: Router) { }

  ngOnInit() {
    this.role = this.statesService.currentAuthRole;
    this.permissionService.loadPermissions([this.role]);
    this.orgId = this.statesService.currentAuthOrgId;
    this.notDashboard = this.router.url.includes('data-transfers') ? true : false;
    this.getDtpList();
    this.setupSearchDeBouncer();
    this.scrollService.handleScroll(['/data-transfers']);

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

  getDtplistByOrg() {
    this.spinner.show();
    this.listService.getDtpListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res) {
        this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res);
      } else {
        this.dataSource = new MatTableDataSource();
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title)
    })
  }

  getAllDtpList() {
    this.spinner.show();
    const pageSize = 10000;
    this.listService.getDtpList(pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res.results);
      } else {
        this.dataSource = new MatTableDataSource();
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title)
    })
  }
  getDtpList() {
    if (this.role === 'User') {
      this.getDtplistByOrg();
    } else {
      this.getAllDtpList();
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
      const filterService$ = this.role === 'Manager' ? this.listService.getFilteredDtpList(title_fragment, page, size) : this.listService.getFilteredDtpListByOrg(title_fragment, this.orgId, page, size);
      filterService$.subscribe((res: any) => {
        this.spinner.hide()
        if (res) {
          this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res);
          // this.dtpLength = res.count;
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
      this.getDtpList();
    }
  }

  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getDtpList();
    localStorage.removeItem('updateDtpList');
  }
  deleteRecord(id) {
    this.dtpService.getDtpById(id).subscribe((res: any) => {
      if (res) {
        if (res.status?.id === 'd28ae345-8ee6-4997-b989-f871f79f3ce9' || res.status?.id === '1e87d5ce-1f95-49ca-98b7-44418f1fc5aa' || res.status?.id === 'a1e891ef-3d88-4884-851a-d2c7b098b68f') {
          this.warningModal = this.modalService.open(this.exampleModal, { size: 'lg', backdrop: 'static' });
        } else {
          const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
          deleteModal.componentInstance.type = 'dtp';
          deleteModal.componentInstance.id = id;
          deleteModal.result.then((data: any) => {
            console.log('data', data)
            if (data) {
              this.getDtpList();
            }
          }, error => { });
        }
      }
    }, error => {})
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
