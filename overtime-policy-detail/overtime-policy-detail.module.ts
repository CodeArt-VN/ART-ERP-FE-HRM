import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { OvertimePolicyDetailPage } from './overtime-policy-detail.page';

const routes: Routes = [
	{
		path: '',
		component: OvertimePolicyDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [OvertimePolicyDetailPage],
})
export class OvertimePolicyDetailPageModule {}
