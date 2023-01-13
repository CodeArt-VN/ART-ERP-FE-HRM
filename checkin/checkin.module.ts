import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckinPage } from './checkin.page';
import { ShareModule } from 'src/app/share.module';
import { CateringVoucherModalPage } from '../catering-voucher-modal/catering-voucher-modal.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ShareModule,
    RouterModule.forChild([{ path: '', component: CheckinPage }])
  ],
  declarations: [CheckinPage, CateringVoucherModalPage]
})
export class CheckinPageModule {}
