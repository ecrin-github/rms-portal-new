import { Component, HostListener, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';
import { StudyListEntryInterface } from 'src/app/_rms/interfaces/study/study-listentry.interface';

@Component({
  selector: 'app-recent-studies',
  templateUrl: './recent-studies.component.html',
})

export class RecentStudiesComponent {
  @Input() cssClass;
  @Input() studyTotal: number = 0;
  displayedColumns = ['sdSid', 'title', 'type', 'status', 'actions'];
  dataSource: MatTableDataSource<StudyListEntryInterface>;
 
  constructor( private dashboardService: DashboardService, 
               private toastr: ToastrService) { }

  ngOnInit() {
    this.getStudyList();
  }

  getStudyList() {
    this.dashboardService.getMostRecent10Studies().subscribe((res: any) => {
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
    this.getStudyList();
  }
}
