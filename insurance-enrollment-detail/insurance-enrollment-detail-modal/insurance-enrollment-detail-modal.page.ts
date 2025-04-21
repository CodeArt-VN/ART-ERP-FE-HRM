import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolBenefitProvider, HRM_StaffProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-insurance-enrollment-detail-modal',
	templateUrl: './insurance-enrollment-detail-modal.page.html',
	styleUrls: ['./insurance-enrollment-detail-modal.page.scss'],
	standalone: false,
})
export class InsuranceEnrollmentDetailModalPage extends PageBase {
	line;
	calculationMethodTypeList = [];
	typeList = [];
	Items;
	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});
	constructor(
		// public pageProvider: HRM_PolBenefitProvider,
		public staffProvider: HRM_StaffProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public modalController: ModalController
	) {
		super();
		this.formGroup = formBuilder.group({
			IDStaffList: [],
			InsuranceSalary:['',Validators.required],
			Remark:['']
		});
	}
	preLoadData(event?: any): void {
		this.pageConfig.showSpinner = true;
		this.loadedData();

		// Promise.all([this.env.getType('CalculationMethodType'), this.env.getType('HRMInsuranceType')]).then((values) => {
		// 	this.calculationMethodTypeList = values[0];
		// 	this.typeList = values[1];
		// });
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.Items) {
			this.formGroup.controls.IDStaffList.setValue(this.Items.map((e) => e.IDStaff));
			this.Items.forEach((e) => {
				if (e._Staff) {
					this.staffDataSource.selected.push(e._Staff);
				}
			});
		}
		let values = this.Items[0];
		this.pageConfig.showSpinner = false;
		this.staffDataSource.initSearch();
	}

	dismiss() {
		this.modalController.dismiss();
	}

	submitModal() {
		const formData = this.formGroup.getRawValue();
		const result = formData.IDStaffList.map((id) => ({
			IDStaff: id,
			InsuranceSalary: formData.InsuranceSalary,
		}));
		this.modalController.dismiss(result);
	}
}
