import { Component, HostListener, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { ObjectListEntryInterface } from 'src/app/_rms/interfaces/data-object/data-object-listentry.interface';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';

@Component({
  selector: 'app-recent-objects',
  templateUrl: './recent-objects.component.html',
})

export class RecentObjectsComponent {
  @Input() cssClass;
  @Input() objectTotal: number = 0;
  displayedColumns = ['sdOid', 'title', 'type', 'linkedStudy', 'actions'];
  dataSource: MatTableDataSource<ObjectListEntryInterface>;
  role: any;

  constructor(private toastr: ToastrService, 
              private dashboardService: DashboardService, private permissionService: NgxPermissionsService) { }

  ngOnInit(): void {
    this.getObjectList();
    if (localStorage.getItem('role')) {
      this.role = localStorage.getItem('role');
      this.permissionService.loadPermissions([this.role]);
    }
  }
  
  getObjectList() {
    this.dashboardService.getMostRecent10Objects().subscribe((res: any) => {
      if (res && res.data) {
        this.dataSource = new MatTableDataSource(res.data);
      } else {
        this.dataSource = new MatTableDataSource();
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  
  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getObjectList();
  }
}
