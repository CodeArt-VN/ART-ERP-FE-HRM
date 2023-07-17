import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchedulerPage } from './scheduler.page';
import { ShareModule } from 'src/app/share.module';
import { PriceReportComponentsModule } from '../../BI/price-report/components/price-report-components.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
import { SchedulerGeneratorPage } from '../scheduler-generator/scheduler-generator.page';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  resourceTimelinePlugin, 
  interactionPlugin
]);


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PriceReportComponentsModule,
    ShareModule,
    NgSelectModule,
    NgOptionHighlightModule,
    FullCalendarModule,
    RouterModule.forChild([{ path: '', component: SchedulerPage }])
  ],
  declarations: [SchedulerPage, StaffPickerPage, SchedulerGeneratorPage]
})
export class SchedulerPageModule {}
