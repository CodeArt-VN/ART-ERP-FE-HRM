import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TimesheetPageRoutingModule } from './timesheet-routing.module';

import { TimesheetPage } from './timesheet.page';
import { ShareModule } from 'src/app/share.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShareModule,
    TimesheetPageRoutingModule
  ],
  declarations: [TimesheetPage]
})
export class TimesheetPageModule {}
