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
import { Subject, combineLatest, fromEvent } from 'rxjs';
import { NgxPermissionsService } from 'ngx-permissions';
import { NavigationEnd, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';
import { ReuseService } from 'src/app/_rms/services/reuse/reuse.service';
import { StatesService } from 'src/app/_rms/services/states/states.service';

@Component({
  selector: 'app-summary-study',
  templateUrl: './summary-study.component.html',
  styleUrls: ['./summary-study.component.scss'],
  providers: [ScrollService]
})

export class SummaryStudyComponent implements OnInit {

  usedURLs = ['/', '/browsing', '/studies'];
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
  scroll: any;
  notDashboard:boolean = false;
  isOrgIdValid: boolean = false;
  dataChanged: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('studyDeleteModal') studyDeleteModal : TemplateRef<any>;

  constructor(private statesService: StatesService,
              private reuseService: ReuseService,
              private scrollService: ScrollService, 
              private listService: ListService, 
              private spinner: NgxSpinnerService, 
              private toastr: ToastrService, 
              private modalService: NgbModal,
              private studyService: StudyService,
              private permissionService: NgxPermissionsService,
              private router: Router) { }

  ngOnInit(): void {
    this.orgId = this.statesService.currentAuthOrgId;
    this.role = this.statesService.currentAuthRole;
    this.isOrgIdValid = this.statesService.isOrgIdValid();
    this.isBrowsing = this.router.url.includes('browsing');
    if (!this.isBrowsing) {
      this.permissionService.loadPermissions([this.role]);
    }
    this.notDashboard = this.router.url.includes('studies') ? true : false;
    this.getStudyList();
    this.setupSearchDeBouncer();
    this.scrollService.handleScroll(this.role, ['/studies']);

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

  getAllStudyList() {
    this.spinner.show();
    const pageSize = 10000
    this.listService.getStudyList(pageSize, '').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.results);
        this.studyLength = res.count;
      } else {
        this.dataSource = new MatTableDataSource();
        this.studyLength = res.count;
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
      if (res) {
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res);
        // this.studyLength = res.count;
      } else {
        this.dataSource = new MatTableDataSource();
        // this.studyLength = res.count;
      }
      this.dataSource.paginator = this.paginator;
      this.searchText = '';
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    })
  }
  getStudyList() {
    if (this.role === 'User' && this.isOrgIdValid) {
      this.getStudyListByOrg();
    } else {
      this.getAllStudyList();
    }
  }

  getFilteredStudyList(title_fragment, page, size) {
    if (this.role === 'User' && this.isOrgIdValid) {
      return this.listService.getFilteredStudyListByOrg(title_fragment, this.orgId, page, size);
    } else {
      return this.listService.getFilteredStudyList(title_fragment, page, size);
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
      const filterService$ = this.getFilteredStudyList(title_fragment, page, size);
      filterService$.subscribe((res: any) => {
        this.spinner.hide()
        if (res) {
          this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res);
          // this.studyLength = res.totalRecords; // use this for database-paged record retrieval
          // this.studyLength = res.count
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

  deleteRecord(id) {
    const studyInvolvementDtp$ = this.studyService.studyInvolvementDtp(id);
    const studyInvolvementDup$ = this.studyService.studyInvolvementDup(id);
    const linkedObject$ = this.listService.getObjectByMultiStudies(id);
    const combine$ = combineLatest([studyInvolvementDtp$, studyInvolvementDup$, linkedObject$]).subscribe(([studyInvolvementDtpRes, studyInvolvementDupRes, linkedObjectRes]: [any, any, any]) => {
      if (studyInvolvementDtpRes && studyInvolvementDupRes && linkedObjectRes && linkedObjectRes.data) {
        const dtpLinked = studyInvolvementDtpRes.count;
        const dupLinked = studyInvolvementDupRes.count;
        if (dtpLinked > 0 && dupLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's and ${dupLinked} DUP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dtpLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dupLinked > 0) {
          this.title = ` There are ${dupLinked} DUP's linked to this study. So you can't delete the study`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (linkedObjectRes.data.length) {
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
    this.searchDebounec.next(e.target.value);
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
