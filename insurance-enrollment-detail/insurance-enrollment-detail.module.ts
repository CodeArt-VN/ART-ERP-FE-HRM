import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { InsuranceEnrollmentDetailPage } from './insurance-enrollment-detail.page';
import { InsuranceEnrollmentDetailModalPage } from './insurance-enrollment-detail-modal/insurance-enrollment-detail-modal.page';

const routes: Routes = [
	{
		path: '',
		component: InsuranceEnrollmentDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [InsuranceEnrollmentDetailPage, InsuranceEnrollmentDetailModalPage],
})
export class InsuranceEnrollmentDetailPageModule {}
