import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { StaffBenefitEnrollmentDetailPage } from './staff-benefit-enrollment-detail.page';
import { StaffBenefitEnrollmentDetailModalPage } from './staff-benefit-enrollment-detail-modal/staff-benefit-enrollment-detail-modal.page';

const routes: Routes = [
	{
		path: '',
		component: StaffBenefitEnrollmentDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule,RouterModule.forChild(routes)],
	declarations: [StaffBenefitEnrollmentDetailPage,StaffBenefitEnrollmentDetailModalPage],
})
export class StaffBenefitEnrollmentDetailPageModule {}
