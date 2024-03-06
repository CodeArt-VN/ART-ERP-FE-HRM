import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetDetailPage } from './timesheet-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TimesheetDetailPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetDetailPageRoutingModule {}
