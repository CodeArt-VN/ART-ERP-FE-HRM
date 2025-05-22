import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffDecisionPage } from './staff-decision.page';
import { ShareModule } from 'src/app/share.module';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: StaffDecisionPage }])],
	declarations: [StaffDecisionPage,StaffPickerEnrollmentPage],
})
export class StaffDecisionPageModule {}
