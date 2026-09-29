import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ShareModule } from 'src/app/share.module';
import { StaffTimesheetCalculationModalPage } from './staff-timesheet-calculation-modal.page';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, TranslateModule, ShareModule],
	declarations: [StaffTimesheetCalculationModalPage],
	exports: [StaffTimesheetCalculationModalPage],
})
export class StaffTimesheetCalculationModalPageModule {}
