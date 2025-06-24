import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { PriceReportComponentsModule } from '../../BI/price-report/components/price-report-components.module';
import { CheckinLogPage } from './checkin-log.page';

import { LogGeneratorPage } from '../log-generator/log-generator.page';
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
		RouterModule.forChild([{ path: '', component: CheckinLogPage }]),
	],
	declarations: [CheckinLogPage, LogGeneratorPage],
	exports: [CheckinLogPage],
})
export class CheckinLogPageModule {}
