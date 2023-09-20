import { Component, HostListener, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';
import { DtpListEntryInterface } from 'src/app/_rms/interfaces/dtp/dtp-listentry.interface';

@Component({
  selector: 'app-recent-dtu',
  templateUrl: './recent-dtu.component.html',
})
export class RecentDtuComponent {
  @Input() cssClass;
  @Input() dtpTotal: number = 0;
  displayedColumns = ['id', 'organisation', 'title', 'status', 'actions'];
  dataSource: MatTableDataSource<DtpListEntryInterface>;

  constructor(private dashboardService: DashboardService, 
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getDtpList();
  }
  getDtpList() {
    this.dashboardService.getMostRecent10Dtps().subscribe((res: any) => {
      if (res && res.data) {
        this.dataSource = new MatTableDataSource(res.data);
      } else {
        this.dataSource = new MatTableDataSource();
      }
    }, error => {
      this.toastr.error(error.error.title)
    })
  }
  
  @HostListener('window:storage', ['$event'])
  refreshList(event) {
    console.log('event triggered', event)
    this.getDtpList();
  }
}
