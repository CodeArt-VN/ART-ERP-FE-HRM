import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { TimesheetRecordDetailPage } from './timesheet-record-detail.page';
import { StaffTimesheetCalculationModalPageModule } from '../staff-timesheet-calculation-modal/staff-timesheet-calculation-modal.module';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, StaffTimesheetCalculationModalPageModule, RouterModule.forChild([{ path: '', component: TimesheetRecordDetailPage }])],
	declarations: [TimesheetRecordDetailPage],
})
export class TimesheetRecordDetailPageModule {}
