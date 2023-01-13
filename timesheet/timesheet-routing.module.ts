import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TimesheetPage } from './timesheet.page';

const routes: Routes = [
  {
    path: '',
    component: TimesheetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TimesheetPageRoutingModule {}
