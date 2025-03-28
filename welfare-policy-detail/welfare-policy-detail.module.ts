import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { WelfarePolicyDetailPage } from './welfare-policy-detail.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: WelfarePolicyDetailPage }])],
	declarations: [WelfarePolicyDetailPage],
})
export class WelfarePolicyDetailPageModule {}
