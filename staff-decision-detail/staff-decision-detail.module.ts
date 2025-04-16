import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { StaffDecisionDetailPage } from './staff-decision-detail.page';
import { StaffDecisionDetailModal } from './staff-decision-detail-modal/staff-decision-detail-modal';

const routes: Routes = [
	{
		path: '',
		component: StaffDecisionDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [StaffDecisionDetailPage,StaffDecisionDetailModal],
})
export class StaffDecisionDetailPageModule {}
