import { Component, HostListener, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';
import { DupListEntryInterface } from 'src/app/_rms/interfaces/dup/dup-listentry.interface';

@Component({
  selector: 'app-recent-dup',
  templateUrl: './recent-dup.component.html',
})

export class RecentDupComponent {
  @Input() cssClass;
  @Input() dupTotal: number = 0;
  displayedColumns = ['id', 'organisation', 'title', 'status', 'actions'];
  dataSource: MatTableDataSource<DupListEntryInterface>;
   
  constructor( private dashboardService: DashboardService, 
               private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getDupList();
  }

  getDupList() {
    this.dashboardService.getMostRecent10Dups().subscribe((res: any) => {
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
    this.getDupList();
  }
}
