import { Component, HostListener, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from 'src/app/_rms';
import { DashboardService } from 'src/app/_rms/services/entities/dashboard/dashboard.service';
import { UserService } from 'src/app/_rms/services/user/user.service';

@Component({
  selector: 'app-main-page-internal',
  templateUrl: './internal-main-page.component.html',
  styleUrls: ['./internal-main-page.component.scss']
})
export class InternalMainPageComponent implements OnInit {
  colorsGrayGray100: string;
  colorsGrayGray700: string;
  colorsThemeBaseSuccess: string;
  colorsThemeLightSuccess: string;
  fontFamily: string;
  dtpChartOptions: any = {};
  dtpTotal: number = 0;
  dupChartOptions: any = {};
  dupTotal: number = 0;
  studyChartOptions: any = {};
  studyTotal: any;
  objectChartOptions: any = {};
  objectTotal: any;
  peopleChartOptions: any = {};
  peopleTotal: any;
  valuePer: any = {};
  valueNum: any = {};
  userData: any;
  organisation: string = '';
  organisationName: string = '';
  role: string = '';
  
  constructor( private layout: LayoutService, private dashboardService: DashboardService, private toastr: ToastrService, private permissionService: NgxPermissionsService, 
    private userService: UserService) { 
    this.colorsGrayGray100 = this.layout.getProp('js.colors.gray.gray100');
    this.colorsGrayGray700 = this.layout.getProp('js.colors.gray.gray700');
    this.colorsThemeBaseSuccess = this.layout.getProp(
      'js.colors.theme.base.success'
    );
    this.colorsThemeLightSuccess = this.layout.getProp(
      'js.colors.theme.light.success'
    );
    this.fontFamily = this.layout.getProp('js.fontFamily');

  }

  ngOnInit(): void {
    this.getUserData();
    this.getStatistics();
  }

  getUserData() {
    if (localStorage.getItem('userData')) {
      this.userData = JSON.parse(localStorage.getItem('userData'));
      this.userService.getUserRoleInfo(this.userData).subscribe((res: any) => {
        this.role = res.isSuperuser && res.isStaff ? 'Manager' : 'User'
        // this.permissionService.loadPermissions([res.role]);
        this.permissionService.loadPermissions([this.role]);
        this.organisation = res.userProfile?.organisation?.id;
        this.organisationName = res.userProfile?.organisation?.defaultName;
        // localStorage.setItem('role', res.userProfile?.role);
        localStorage.setItem('role', this.role);
        localStorage.setItem('organisationId', res.userProfile?.organisation?.id);
      }, error => {
        console.log(error);
      })
    } else {
      this.userService.getUser().subscribe(res => {
        if (res) {
          localStorage.setItem('userData', JSON.stringify(res));
          this.userData = res;
          this.userService.getUserRoleInfo(this.userData).subscribe((res: any) => {
            this.role = res.isSuperuser && res.isStaff ? 'Manager' : 'User'
            // this.permissionService.loadPermissions([res.role]);
            this.permissionService.loadPermissions([this.role]);
            this.organisation = res.userProfile?.organisation?.id;
            this.organisationName = res.userProfile?.organisation?.defaultName;
            // localStorage.setItem('role', res.userProfile?.role);
            localStorage.setItem('role', this.role);
            localStorage.setItem('organisationId', res.userProfile?.organisation?.id);
          }, error => {
            console.log(error);
          })
        }
      }, error => {
        console.log('error', error);
      })
    }
  }
  getStatistics() {
    this.dashboardService.getStatistics().subscribe((res: any) => {
      if(res) {
        this.studyTotal = res.totalStudies;
        this.studyChartOptions = this.getChartOptions(this.studyTotal, 'Total Studies', false);
        this.objectTotal = res.totalObjects;
        this.objectChartOptions = this.getChartOptions(this.objectTotal, 'Total Objects', false);
        this.peopleTotal = res.totalUsers;
        this.peopleChartOptions = this.getChartOptions(this.peopleTotal, 'Total People', false);
        this.dtpTotal = res.dtp.total;
        this.dtpChartOptions = this.getChartOptions(this.dtpTotal, 'Completed DTs', false);  
        this.dupTotal = res.dtp.total;
        this.dupChartOptions = this.getChartOptions(this.dupTotal, 'Completed DUs', false);
        }
    }, error => {

    })
  }
  getChartOptions(data, label, format) {
    this.valuePer = {
      color: this.colorsGrayGray700,
      fontSize: '20px',
      fontWeight: '700',
      offsetY: 12,
      show: true,
    };
    this.valueNum = {
      formatter: function (val) {
        return parseInt(val.toString(), 10).toString();
      },
      color: this.colorsGrayGray700,
      fontSize: '20px',
      fontWeight: '700',
      offsetY: 12,
      show: true,
    }
    const strokeColor = '#D13647';
    return {
      series: [data],
      offsetX: 5000,
      chart: {
        type: 'radialBar',
        height: 170,
      },
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: '65%',
          },
          dataLabels: {
            showOn: 'always',
            name: {
              show: false,
              fontWeight: '700',
            },
            value: format ? this.valuePer : this.valueNum,
          },
          track: {
            background: this.colorsThemeLightSuccess,
            strokeWidth: '100%',
          },
        },
      },
      colors: [this.colorsThemeBaseSuccess],
      stroke: {
        lineCap: 'round',
      },
      labels: [label],
      legend: {},
      dataLabels: {},
      fill: {},
      xaxis: {},
      yaxis: {},
      states: {},
      tooltip: {},
      markers: {},
    };
  }
  scrollToElement($element): void {
    var topOfElement = $element.offsetTop - 135;
    window.scroll({ top: topOfElement, behavior: "smooth" });
  }
}
