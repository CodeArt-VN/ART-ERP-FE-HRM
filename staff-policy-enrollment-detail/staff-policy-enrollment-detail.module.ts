import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { StaffPolicyEnrollmentDetailPage } from './staff-policy-enrollment-detail.page';
import { StaffPolicyEnrollmentDetailModalPage } from './staff-policy-enrollment-detail-modal/staff-policy-enrollment-detail-modal.page';

const routes: Routes = [
	{
		path: '',
		component: StaffPolicyEnrollmentDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [StaffPolicyEnrollmentDetailPage, StaffPolicyEnrollmentDetailModalPage],
})
export class StaffPolicyEnrollmentDetailPageModule {}
