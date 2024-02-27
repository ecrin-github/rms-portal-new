import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ObjectListEntryInterface } from 'src/app/_rms/interfaces/data-object/data-object-listentry.interface';
import { DataObjectService } from 'src/app/_rms/services/entities/data-object/data-object.service';
import { ListService } from 'src/app/_rms/services/entities/list/list.service';
import { ConfirmationWindowComponent } from '../../confirmation-window/confirmation-window.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';
import { ScrollService } from 'src/app/_rms/services/scroll/scroll.service';

@Component({
  selector: 'app-summary-object',
  templateUrl: './summary-object.component.html',
  styleUrls: ['./summary-object.component.scss'],
  providers: [ScrollService]
})
export class SummaryObjectComponent implements OnInit {

  displayedColumns = ['sdOid', 'title', 'type', 'linkedStudy', 'actions'];
  dataSource: MatTableDataSource<ObjectListEntryInterface>;
  filterOption: string = 'title';
  searchText:string = '';
  objectLength: number = 0;
  title: string = '';
  warningModal: any;
  role: any;
  orgId: any;
  isBrowsing: boolean = false;
  deBouncedInputValue = this.searchText;
  searchDebounec: Subject<string> = new Subject();
  sticky: boolean = false;
  notDashboard:boolean = false;
  isOrgIdValid: boolean = false;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('objectDeleteModal') objectDeleteModal : TemplateRef<any>;

  constructor( private scrollService: ScrollService,
               private listService: ListService, 
               private spinner: NgxSpinnerService, 
               private toastr: ToastrService, 
               private modalService: NgbModal,
               private dataObjectService: DataObjectService,
               private permissionService: NgxPermissionsService,
               private router: Router) { }

  ngOnInit(): void {
    this.orgId = localStorage.getItem('organisationId');
    this.isOrgIdValid = this.orgId !== 'null' && this.orgId !== 'undefined' && this.orgId !== null && this.orgId !== undefined;
    this.isBrowsing = this.router.url.includes('browsing') && this.isOrgIdValid;
    if (!this.isBrowsing) {
      if (localStorage.getItem('role')) {
        this.role = localStorage.getItem('role');
        this.permissionService.loadPermissions([this.role]);
      }
      if (localStorage.getItem('organisationId')) {
        this.orgId = localStorage.getItem('organisationId');
      }
    }
    this.notDashboard = this.router.url.includes('data-objects') ? true : false;
    this.getObjectList();
    this.setupSearchDeBouncer();
    this.scrollService.handleScroll(this.router, this.role, ['/data-objects']);
  }
  
  getAllObjectList() {
    const pageSize = 10000;
    this.listService.getObjectList(pageSize,'').subscribe((res: any) => {
      this.spinner.hide();
      if (res && res.results) {
        this.dataSource = new MatTableDataSource<ObjectListEntryInterface>(res.results);
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
  getObjectListByOrg() {
    this.listService.getObjectListByOrg(this.orgId).subscribe((res: any) => {
      this.spinner.hide();
      if (res) {
        this.dataSource = new MatTableDataSource<ObjectListEntryInterface>(res);
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
  getObjectList() {
    if (this.role === 'User' && this.isOrgIdValid) {
      this.getObjectListByOrg();
    } else {
      this.getAllObjectList();
    }
  } 
  getFilteredObjectList(title_fragment, page, size) {
    if (this.role === 'User' && this.isOrgIdValid) {
      return this.listService.getFilteredObjectListByOrg(title_fragment, this.orgId, page, size);
    } else {
      return this.listService.getFilteredObjectList(title_fragment, page, size);
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
    if (this.filterOption === 'title' && this.searchText != '') {
      this.spinner.show();
      const filterService$ = this.getFilteredObjectList(title_fragment, page, size);
      filterService$.subscribe((res: any) => {
        this.spinner.hide();
        if (res) {
          this.dataSource = new MatTableDataSource<ObjectListEntryInterface>(res);
          // this.objectLength = res.count;
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
      this.getObjectList();
    }
  }

  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getObjectList();
    localStorage.removeItem('updateObjectList');
  }

  deleteRecord(id) {
    const objectInvolvementDtp$ = this.dataObjectService.objectInvolvementDtp(id);
    const objectInvolvementDup$ = this.dataObjectService.objectInvolvementDup(id);
    const combine$ = combineLatest([objectInvolvementDtp$, objectInvolvementDup$]).subscribe(([objectInvolvementDtpRes, objectInvolvementDupRes] : [any, any]) => {
      if (objectInvolvementDtpRes && objectInvolvementDupRes) {
        const dtpLinked = objectInvolvementDtpRes.count;
        const dupLinked = objectInvolvementDupRes.count;
        if (dtpLinked > 0 && dupLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's and ${dupLinked} DUP's linked to this object. So you can't delete the object`;
          this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dtpLinked > 0) {
          this.title = `There are ${dtpLinked} DTP's linked to this object. So you can't delete the object`;
          this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
        } else if (dupLinked > 0) {
          this.title = ` There are ${dupLinked} DUP's linked to this object. So you can't delete the object`;
          this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
        } else {
          const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
          deleteModal.componentInstance.type = 'dataObject';
          deleteModal.componentInstance.id = id;
          deleteModal.result.then((data: any) => {
            if (data) {
              this.getObjectList();
            }
          }, error => { });
        }
      } else {
        const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
        deleteModal.componentInstance.type = 'dataObject';
        deleteModal.componentInstance.id = id;
        deleteModal.result.then((data: any) => {
          if (data) {
            this.getObjectList();
          }
        }, error => { });
      }
    }, error => {
      console.log('error', error);
    })
    // this.dataObjectService.objectInvolvement(id).subscribe((res: any) => {
    //   console.log('res', res);
    //   if (res && res.data) {
    //     const dtpLinked = res.data[0].statValue;
    //     const dupLinked = res.data[1].statValue;  
    //     if (dtpLinked > 0 && dupLinked > 0) {
    //       this.title = `There are ${dtpLinked} DTP's and ${dupLinked} DUP's linked to this object. So you can't delete the object`;
    //       this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
    //     } else if (dtpLinked > 0) {
    //       this.title = `There are ${dtpLinked} DTP's linked to this object. So you can't delete the object`;
    //       this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
    //     } else if (dupLinked > 0) {
    //       this.title = ` There are ${dupLinked} DUP's linked to this object. So you can't delete the object`;
    //       this.warningModal = this.modalService.open(this.objectDeleteModal, { size: 'lg', backdrop: 'static' });
    //     } else {
    //       const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
    //       deleteModal.componentInstance.type = 'dataObject';
    //       deleteModal.componentInstance.id = id;
    //       deleteModal.result.then((data: any) => {
    //         if (data) {
    //           this.getObjectList();
    //         }
    //       }, error => { });
    //     }
    //   } else {
    //     const deleteModal = this.modalService.open(ConfirmationWindowComponent, { size: 'lg', backdrop: 'static' });
    //     deleteModal.componentInstance.type = 'dataObject';
    //     deleteModal.componentInstance.id = id;
    //     deleteModal.result.then((data: any) => {
    //       if (data) {
    //         this.getObjectList();
    //       }
    //     }, error => { });
    //   }
    // }, error => {
    //   this.toastr.error(error.error.title);
    // });
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
