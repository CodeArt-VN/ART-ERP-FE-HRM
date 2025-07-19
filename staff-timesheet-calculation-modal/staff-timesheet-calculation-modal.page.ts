import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_PayrollTemplateProvider, HRM_ShiftProvider, HRM_StaffPayrollProvider, HRM_TimesheetCycleProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-timesheet-calculation-modal',
	templateUrl: './staff-timesheet-calculation-modal.page.html',
	styleUrls: ['./staff-timesheet-calculation-modal.page.scss'],
	standalone: false,
})
export class StaffTimesheetCalculationModalPage implements OnInit {
	formGroup;
	formDate: any;
	toDate: any;
	constructor(
		public popoverCtrl: PopoverController,
		public formBuilder: FormBuilder
	) {}
	ngOnInit(): void {
		this.formGroup = this.formBuilder.group({
			FromDate: [this.formDate],
			ToDate: [this.toDate],
		});
	}

	calculation() {
		this.popoverCtrl.dismiss(this.formGroup.value);
	}
}
