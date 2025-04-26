import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_PayrollTemplateProvider, HRM_ShiftProvider, HRM_StaffPayrollProvider, HRM_TimesheetCycleProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-payroll-modal',
	templateUrl: './staff-payroll-modal.page.html',
	styleUrls: ['./staff-payroll-modal.page.scss'],
	standalone: false,
})
export class StaffPayrollModalPage extends PageBase {
	timesheetCycleList: any = [];
	statusList: any = [];
	payrollTemplateList: any = [];
	constructor(
		public pageProvider: HRM_StaffPayrollProvider,
		public cycleProvider: HRM_TimesheetCycleProvider,
		public payrollTemplateProvider: HRM_PayrollTemplateProvider,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef
	) {
		super();
		this.formGroup = this.formBuilder.group({
			IDTimesheetCycle: ['', Validators.required],
			IDTimesheet: ['', Validators.required],
			IDPayrollTemplate: ['', Validators.required],
			Status: ['Draft', Validators.required],
			// Name: ['', Validators.required],
		});
	}

	preLoadData(event?: any): void {
		this.item = this.navParams.data;
		Promise.all([this.cycleProvider.read(), this.env.getStatus('StandardApprovalStatus'), this.payrollTemplateProvider.read()]).then((values: any) => {
			this.timesheetCycleList = values[0].data;
			this.statusList = values[1];
			this.payrollTemplateList = values[2].data;
			this.loadedData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.pageConfig.isDetailPage = true;
		super.loadedData(event, ignoredFromGroup);
		this.formGroup.controls.IDTimesheetCycle.markAsDirty();
		this.formGroup.controls.Status.markAsDirty();
		this.formGroup.controls.IDTimesheet.markAsDirty();
	}

	async saveChange(publishEventCode?: any) {
		this.env.showLoading('Please wait for a few moments', super.saveChange2()).then((_) => {
			this.env.showMessage('Saved successfully', 'success');
			this.modalController.dismiss();
		});
	}
}
