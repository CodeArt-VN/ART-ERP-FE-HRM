import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PriceReportComponentsModule } from '../../BI/price-report/components/price-report-components.module';
import { CheckinLogPage } from './checkin-log.page';

import { LogGeneratorPageModule } from '../log-generator/log-generator.module';
import { FullCalendarModule } from '@fullcalendar/angular';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ReactiveFormsModule,
		FullCalendarModule,
		PriceReportComponentsModule,
		ShareModule,
		LogGeneratorPageModule,
		RouterModule.forChild([{ path: '', component: CheckinLogPage }]),
	],
	declarations: [CheckinLogPage],
	exports: [CheckinLogPage],
})
export class CheckinLogPageModule {}
