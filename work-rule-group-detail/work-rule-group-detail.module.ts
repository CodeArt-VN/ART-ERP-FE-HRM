import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { WorkRuleGroupDetailPage } from './work-rule-group-detail.page';
import { ShareModule } from 'src/app/share.module';

const routes: Routes = [
	{
		path: '',
		component: WorkRuleGroupDetailPage,
	},
];

@NgModule({
	imports: [CommonModule, FormsModule, ShareModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
	declarations: [WorkRuleGroupDetailPage],
})
export class WorkRuleGroupDetailPageModule {}
