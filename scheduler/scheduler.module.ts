import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchedulerPage } from './scheduler.page';
import { ShareModule } from 'src/app/share.module';
import { PriceReportComponentsModule } from '../../BI/price-report/components/price-report-components.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
import { SchedulerGeneratorPage } from '../scheduler-generator/scheduler-generator.page';
import { CheckinLogPageModule } from '../checkin-log/checkin-log.module';
import { LogGeneratorPage } from '../log-generator/log-generator.page';
import { CheckinLogComponent } from './checkin-log/checkin-log.page';
import { TimesheetCycleDetailComponent } from './timesheet-cycle/timesheet-cycle-detail.page';
import { TimesheetCycleSelectModalComponent } from './timesheet-cycle-select-modal/timesheet-cycle-select-modal.page';
import { StaffTimesheetCalculationModalPage } from '../staff-timesheet-calculation-modal/staff-timesheet-calculation-modal.page';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ReactiveFormsModule,
		PriceReportComponentsModule,
		ShareModule,
		FullCalendarModule,
		// CheckinLogPageModule,
		RouterModule.forChild([{ path: '', component: SchedulerPage }]),
	],
	declarations: [SchedulerPage, StaffPickerPage, SchedulerGeneratorPage,CheckinLogComponent,TimesheetCycleDetailComponent,TimesheetCycleSelectModalComponent,StaffTimesheetCalculationModalPage],
})
export class SchedulerPageModule {}
