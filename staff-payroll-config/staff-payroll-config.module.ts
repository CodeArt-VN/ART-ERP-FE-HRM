import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { StaffPayrollConfigPage } from './staff-payroll-config.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: StaffPayrollConfigPage }])],
	declarations: [StaffPayrollConfigPage],
})
export class StaffPayrollConfigPageModule {}
