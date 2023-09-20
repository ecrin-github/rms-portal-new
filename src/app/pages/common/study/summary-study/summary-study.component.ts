import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { StudyListEntryInterface } from 'src/app/_rms/interfaces/study/study-listentry.interface';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { StudyService } from 'src/app/_rms/services/entities/study/study.service';
import { Subject, combineLatest } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-summary-study',
  templateUrl: './summary-study.component.html',
  styleUrls: ['./summary-study.component.scss']
})

export class SummaryStudyComponent implements OnInit {

  displayedColumns = ['sdSid', 'title', 'type', 'status', 'actions'];
  dataSource: MatTableDataSource<StudyListEntryInterface>;
  filterOption: string = 'title';
  searchText:string = '';
  studyLength: number = 0;
  title: string = '';
  warningModal: any;
  orgId: any;
  role: any;
  isBrowsing: boolean = false;
  deBouncedInputValue = this.searchText;
  searchDebounec: Subject<string> = new Subject();
  sticky: boolean = false;
  notDashboard:boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('studyDeleteModal') studyDeleteModal : TemplateRef<any>;

  constructor( private listService: ListService, 
               private spinner: NgxSpinnerService, 
               private toastr: ToastrService, 
               private modalService: NgbModal,
               private studyService: StudyService,
               private permissionService: NgxPermissionsService,
               private router: Router) {
  }

  ngOnInit(): void {
    this.isBrowsing = this.router.url.includes('browsing') ? true : false
    if (!this.isBrowsing) {
      if (localStorage.getItem('role')) {
        this.role = localStorage.getItem('role');
        this.permissionService.loadPermissions([this.role]);
      }
      if(localStorage.getItem('organisationId')) {
        this.orgId = localStorage.getItem('organisationId');
      }
    }
    this.notDashboard = this.router.url.includes('studies') ? true : false;
    this.getStudyList();
    this.setupSearchDeBouncer();
  }

  getAllStudyList() {
    this.spinner.show();
    this.listService.getStudyList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.data);
        this.studyLength = res.total;
      } else {
        this.dataSource = new MatTableDataSource();
        this.studyLength = res.total;
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
    getStudyListByOrg() {
    this.spinner.show();
    this.listService.getStudyListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.data);
        this.studyLength = res.total;
      } else {
        this.dataSource = new MatTableDataSource();
        this.studyLength = res.total;
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getBrowsingStudy() {
    this.spinner.show();
    this.listService.getBrowsingStudyList().subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.data) {
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.data);
        this.studyLength = res.total;
      } else {
        this.dataSource = new MatTableDataSource();
        this.studyLength = res.total;
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getStudyList() {
    if (this.role === 'User') {
      this.getStudyListByOrg();
    } else {
      if (this.isBrowsing) {
        this.getBrowsingStudy();
      } else {
        this.getAllStudyList();
      }
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
      this.listService.getFilteredStudyList(title_fragment, page, size).subscribe((res: any) => {
        this.spinner.hide()
        if (res && res.data) {
          this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.data);
          // this.studyLength = res.totalRecords; // use this for database-paged record retrieval
          this.studyLength = res.total
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
      this.getStudyList();
    }
  } 

  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getStudyList();
    localStorage.removeItem('updateStudyList');
  }
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (!this.isBrowsing && this.role !== 'User' || this.notDashboard) {
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
    const studyInvolvement$ = this.studyService.studyInvolvement(id);
    const linkedObject$ = this.studyService.linkedObject(id);
    const combine$ = combineLatest([studyInvolvement$, linkedObject$]).subscribe(([studyInvolvementRes, linkedObjectRes]: [any, any]) => {
      if (studyInvolvementRes && studyInvolvementRes.data && linkedObjectRes && linkedObjectRes.data) {
        const dtpLinked = studyInvolvementRes.data[0].statValue;
        const dupLinked = studyInvolvementRes.data[1].statValue;
        if (dtpLinked > 0 && dupLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's and ${dupLinked} DUP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dtpLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dupLinked > 0) {
          this.title = ` There are ${dupLinked} DUP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (linkedObjectRes.data) {
          this.title = `Objects are linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else {
          const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
          deleteModal.componentInstance.type = 'study';
          deleteModal.componentInstance.id = id;
          deleteModal.result.then((data: any) => {
            if (data) {
              this.getStudyList();
            }
          }, error => { });
        }
      } else {
        const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
        deleteModal.componentInstance.type = 'study';
        deleteModal.componentInstance.id = id;
        deleteModal.result.then((data: any) => {
          if (data) {
            this.getStudyList();
          }
        }, error => { });
      }
    }, error => {
      this.toastr.error(error.error.title);
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
}
