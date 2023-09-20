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
import { Router } from '@angular/router';


@Component({
  selector: 'app-summary-dtp',
  templateUrl: './summary-dtp.component.html',
  styleUrls: ['./summary-dtp.component.scss']
})

export class SummaryDtpComponent implements OnInit {
  displayedColumns = ['id', 'organisation', 'title', 'status', 'actions'];
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

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('exampleModal') exampleModal : TemplateRef<any>;

  constructor( private listService: ListService, 
               private spinner: NgxSpinnerService, 
               private toastr: ToastrService, 
               private modalService: NgbModal,
               private dtpService: DtpService,
               private permissionService: NgxPermissionsService, private router: Router) {
  }

  ngOnInit() {
    if (localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
      this.permissionService.loadPermissions([this.role]);
    }
    if (localStorage.getItem('organisationId')) {
      this.orgId = localStorage.getItem('organisationId');
    }
    this.notDashboard = this.router.url.includes('data-transfers') ? true : false;
    this.getDtpList();
    this.setupSearchDeBouncer();
  }
  getDtplistByOrg() {
    this.spinner.show();
    this.listService.getDtpListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res.data);
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
    this.listService.getDtpList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res.data);
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
      this.listService.getFilteredDtpList(title_fragment, page, size).subscribe((res: any) => {
        this.spinner.hide()
        if (res && res.data) {
          this.dataSource = new MatTableDataSource<DtpListEntryInterface>(res.data);
          this.dtpLength = res.total;
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
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.role !== 'User' || this.notDashboard) {
      const navbar = document.getElementById('navbar');
      const sticky = navbar.offsetTop;
      if (window.pageYOffset >= sticky) {
        navbar.classList.add('sticky');
        this.sticky = true;
      } else {
        navbar.classList.remove('sticky');
        this.sticky = false;
      }
    }
  }
  deleteRecord(id) {
    this.dtpService.checkDtaAgreed(id).subscribe((res: any) => {
      if (res && res.data) {
        if (res.data[0].statusId === 14 || res.data[0].statusId === 15 || res.data[0].statusId === 16) {
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
}
