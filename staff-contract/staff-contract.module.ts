import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffContractPage } from './staff-contract.page';
import { ShareModule } from 'src/app/share.module';
import { StaffContractModalPage } from '../staff-contract-modal/staff-contract-modal.page';

@NgModule({
	imports: [IonicModule, CommonModule, FormsModule, ShareModule, RouterModule.forChild([{ path: '', component: StaffContractPage }])],
	declarations: [StaffContractPage, StaffContractModalPage],
})
export class StaffContractPageModule {}
