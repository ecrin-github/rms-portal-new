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
import { resolvePath } from 'src/assets/js/util.js';

@Component({
  selector: 'app-summary-study',
  templateUrl: './summary-study.component.html',
  styleUrls: ['./summary-study.component.scss'],
  providers: [ScrollService]
})

export class SummaryStudyComponent implements OnInit {
  usedURLs = ['/', '/browsing', '/studies'];
  // search dropdown filters
  searchColumns = [
    {'value': 'sdSid', 'text': 'Study ID'},
    {'value': 'displayTitle', 'text': 'Title'},
    {'value': 'organisation.defaultName', 'text': 'Organisation'},
    {'value': 'studyType.name', 'text': 'Study Type'},
    {'value': 'studyStatus.name', 'text': 'Study Status'},
  ]
  filterColumn: string = 'displayTitle';
  displayedColumns = ['sdSid', 'studyTitle', 'studyOrganisation', 'studyType', 'studyStatus', 'actions'];
  dataSource: MatTableDataSource<StudyListEntryInterface>;
  searchText:string = '';
  studyLength: number = 0;
  title: string = '';
  warningModal: any;
  orgId: any;
  role: any;
  isBrowsing: boolean = false;
  deBouncedInputValue = this.searchText;
  searchDebounce: Subject<string> = new Subject();
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
    this.scrollService.handleScroll(['/studies']);

    // Updating data while reusing detached component
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && this.usedURLs.includes(event.urlAfterRedirects) && this.dataChanged) {
        this.getStudyList();
        this.dataChanged = false;
      }
    });

    this.reuseService.notification$.subscribe((source) => {
      if (this.usedURLs.includes(source) && !this.dataChanged) {
        this.dataChanged = true;
      }
    });
  }
  
  getSortedStudies(studies) {
    const { compare } = Intl.Collator('en-GB');
    studies.sort((a, b) => {
      if (a.organisation?.id === this.orgId) {
        if (b.organisation?.id === this.orgId) {
          return compare(a.displayTitle, b.displayTitle);
        }
        return -1;
      } else if (b.organisation?.id === this.orgId) {
        return 1;
      } else {
        return compare(a.displayTitle, b.displayTitle);
      }
    });
  }

  getStudyList() {
    this.spinner.show();
    const pageSize = 10000;
    this.listService.getStudyList(pageSize, '').subscribe((res: any) => {
      if (res && res.results) {
        if (this.isOrgIdValid) {
          this.getSortedStudies(res.results);
        }
        this.dataSource = new MatTableDataSource<StudyListEntryInterface>(res.results);
        this.studyLength = res.count;
      } else {
        this.dataSource = new MatTableDataSource();
        this.studyLength = res.count;
      }
      this.dataSource.paginator = this.paginator;
      this.filterSearch();
      this.spinner.hide();
    }, error => {
      this.spinner.hide();
      this.toastr.error(error.error.title);
    });
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
          this.title = `There are ${dtpLinked} DTPs and ${dupLinked} DUPs linked to this study. Dissociate this study from them to delete it.`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dtpLinked > 0) {
          this.title = `There are ${dtpLinked} DTPs linked to this study. Dissociate this study from them to delete it.`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dupLinked > 0) {
          this.title = ` There are ${dupLinked} DUPs linked to this study. Dissociate this study from them to delete it.`;
          this.warningModal = this.modalService.open(this.studyDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (linkedObjectRes.data.length) {
          this.title = `Objects are linked to this study. Dissociate them from this study to delete it.`;
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
    this.searchDebounce.next(e.target.value);
  }

  filterSearch() {
    this.dataSource.filterPredicate = (data, filter: string) => {
      return filter && this.filterColumn && resolvePath(data, this.filterColumn)?.toLocaleLowerCase().includes(filter.toLocaleLowerCase());
    }
    this.dataSource.filter = this.searchText;
  }
  
  setupSearchDeBouncer() {
    const search$ = this.searchDebounce.pipe(
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
