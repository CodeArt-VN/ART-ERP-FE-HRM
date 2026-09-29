import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { TimesheetTemplateDetailPage } from './timesheet-template-detail.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule, ShareModule],
	declarations: [TimesheetTemplateDetailPage],
	exports: [TimesheetTemplateDetailPage],
})
export class TimesheetTemplateDetailPageModule {}
