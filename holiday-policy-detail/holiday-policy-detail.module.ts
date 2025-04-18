import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { HolidayPolicyDetailPage } from './holiday-policy-detail.page';

const routes: Routes = [
	{
		path: '',
		component: HolidayPolicyDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [HolidayPolicyDetailPage],
})
export class HolidayPolicyDetailPageModule {}
