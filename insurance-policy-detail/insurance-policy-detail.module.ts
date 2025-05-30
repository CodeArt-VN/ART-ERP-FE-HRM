import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { InsurancePolicyDetailPage } from './insurance-policy-detail.page';
import { InsurancePolicyDetailModalPage } from './insurance-policy-detail-modal/insurance-policy-detail-modal.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: InsurancePolicyDetailPage }])],
	declarations: [InsurancePolicyDetailPage,InsurancePolicyDetailModalPage],
})
export class InsurancePolicyDetailPageModule {}
