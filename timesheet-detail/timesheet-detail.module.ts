import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetDetailPageRoutingModule } from './timesheet-detail-routing.module';

import { TimesheetDetailPage } from './timesheet-detail.page';
import { ShareModule } from 'src/app/share.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ShareModule,
    NgSelectModule,
    NgOptionHighlightModule,
    TimesheetDetailPageRoutingModule
  ],
  declarations: [TimesheetDetailPage]
})
export class TimesheetDetailPageModule {}
