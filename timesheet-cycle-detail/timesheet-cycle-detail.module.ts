import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { TimesheetCycleDetailPage } from './timesheet-cycle-detail.page';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins

import { PointModalPage } from '../point-modal/point-modal.page';

const routes: Routes = [
  {
    path: '',
    component: TimesheetCycleDetailPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ShareModule,
    FullCalendarModule,
    RouterModule.forChild(routes),
  ],
  declarations: [TimesheetCycleDetailPage, PointModalPage],
})
export class TimesheetCycleDetailPageModule {}
