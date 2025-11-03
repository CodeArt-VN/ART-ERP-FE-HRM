import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ShareModule } from 'src/app/share.module';
import { LeaveStatisticsPage } from './leave-statistics.page';


@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: LeaveStatisticsPage }])],
	declarations: [LeaveStatisticsPage],
})
export class LeaveStatisticsPageModule {}
