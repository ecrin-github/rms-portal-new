import { Component, HostListener, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';

@Component({
  selector: 'app-recent-users',
  templateUrl: './recent-users.component.html',
})
export class RecentUsersComponent {
  @Input() cssClass;
  @Input() peopleTotal: number = 0;
  displayedColumns = ['name', 'roleName', 'orgName', 'actions'];
  dataSource: MatTableDataSource<any>;
  totalData: any;
  constructor( private dahboardService: DashboardService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getUserList();
  }
  getUserList() {
    this.dahboardService.getMostRecent10People().subscribe((res: any) => {
      if (res && res.data) {
        this.dataSource = new MatTableDataSource(res.data);
      } else {
        this.dataSource = new MatTableDataSource();
      }
    }, error => {
      this.toastr.error(error.error.title);
    })
  }
  @HostListener('window: storage', ['$event'])
  refreshList(event) {
    this.getUserList();
  }
}
