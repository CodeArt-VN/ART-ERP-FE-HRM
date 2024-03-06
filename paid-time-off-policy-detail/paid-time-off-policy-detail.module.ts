import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PaidTimeOffPolicyDetailPage } from './paid-time-off-policy-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PaidTimeOffPolicyDetailPage,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
  declarations: [PaidTimeOffPolicyDetailPage],
})
export class PaidTimeOffPolicyDetailPageModule {}
