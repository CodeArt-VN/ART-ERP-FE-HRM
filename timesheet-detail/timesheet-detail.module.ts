import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetDetailPageRoutingModule } from './timesheet-detail-routing.module';

import { TimesheetDetailPage } from './timesheet-detail.page';
import { ShareModule } from 'src/app/share.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, TimesheetDetailPageRoutingModule],
  declarations: [TimesheetDetailPage],
})
export class TimesheetDetailPageModule {}
