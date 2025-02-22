import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PTOsEnrollmentPage } from './ptos-enrollment.page';
import { ShareModule } from 'src/app/share.module';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: PTOsEnrollmentPage }])],
	declarations: [PTOsEnrollmentPage],
})
export class PTOsEnrollmentPageModule {}
