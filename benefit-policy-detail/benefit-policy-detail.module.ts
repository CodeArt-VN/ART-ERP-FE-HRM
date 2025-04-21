import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { BenefitPolicyDetailPage } from './benefit-policy-detail.page';
import { BenefitPolicyDetailModalPage } from './benefit-policy-detail-modal/benefit-policy-detail-modal.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: BenefitPolicyDetailPage }])],
	declarations: [BenefitPolicyDetailPage,BenefitPolicyDetailModalPage],
})
export class BenefitPolicyDetailPageModule {}
