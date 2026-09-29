import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetTemplateDetailPage } from './timesheet-template-detail.page';
import { TimesheetTemplateDetailPageModule } from './timesheet-template-detail.module';

const routes: Routes = [
	{
		path: '',
		component: TimesheetTemplateDetailPage,
	},
];

@NgModule({
	imports: [TimesheetTemplateDetailPageModule, RouterModule.forChild(routes)],
})
export class TimesheetTemplateDetailPageRoutingModule {}
