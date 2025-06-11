import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PersonalSchedulerPage } from './personal-scheduler.page';
import { ShareModule } from 'src/app/share.module';
import { PriceReportComponentsModule } from '../../BI/price-report/components/price-report-components.module';

import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins

import { PersonalSchedulerGeneratorPage } from '../personal-scheduler-generator/personal-scheduler-generator.page';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		ReactiveFormsModule,
		PriceReportComponentsModule,
		ShareModule,
		FullCalendarModule,
		RouterModule.forChild([{ path: '', component: PersonalSchedulerPage }]),
	],
	declarations: [PersonalSchedulerPage, PersonalSchedulerGeneratorPage],
	exports: [PersonalSchedulerPage, PersonalSchedulerGeneratorPage],
})
export class PersonalSchedulerPageModule {}
