import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { FileUploadModule } from 'ng2-file-upload';
import { TimesheetCyclePage } from './timesheet-cycle.page';
import { TimesheetCycleModalPage } from '../timesheet-cycle-modal/timesheet-cycle-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FileUploadModule,
    ShareModule,
    RouterModule.forChild([{ path: '', component: TimesheetCyclePage }])
  ],
  declarations: [TimesheetCyclePage, TimesheetCycleModalPage]
})
export class TimesheetCyclePageModule {}
