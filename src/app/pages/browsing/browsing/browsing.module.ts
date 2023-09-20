import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseComponent } from './browse/browse/browse.component';
import { CommonPagesModule } from '../../common/common-pages.module';
import { WidgetsModule } from 'src/app/_rms/partials/content/widgets/widgets.module';
import { RouterModule } from '@angular/router';
import { UpsertStudyComponent } from '../../common/study/upsert/upsert-study/upsert-study.component';
import { SummaryStudyComponent } from '../../common/study/summary-study/summary-study.component';
import { SummaryObjectComponent } from '../../common/object/summary-object/summary-object.component';
import { UpsertObjectComponent } from '../../common/object/upsert/upsert-object/upsert-object.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxPermissionsModule } from 'ngx-permissions';



@NgModule({
  declarations: [
    BrowseComponent
  ],
  imports: [
    CommonModule,
    CommonPagesModule,
    WidgetsModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: BrowseComponent
      },
      {
        path: 'study',
        pathMatch: 'full',
        component: SummaryStudyComponent
      },
      {
        path: 'browsing/studies/:id/view',
        pathMatch: 'full',
        component: UpsertStudyComponent
      },
      {
        path: 'data-objects',
        pathMatch: 'full',
        component: SummaryObjectComponent
      },
      {
        path: 'browsing/data-objects/:id/view',
        pathMatch: 'full',
        component: UpsertObjectComponent
      }
    ]),
    NgbDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonModule,
    NgApexchartsModule,
    NgxPermissionsModule.forChild()

  ]
})
export class BrowsingModule { }
