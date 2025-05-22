import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolBenefitProvider, HRM_StaffProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-insurance-policy-detail-modal',
	templateUrl: './insurance-policy-detail-modal.page.html',
	styleUrls: ['./insurance-policy-detail-modal.page.scss'],
	standalone: false,
})
export class InsurancePolicyDetailModalPage extends PageBase {
	line;
	calculationMethodTypeList = [];
	typeList = [];
	constructor(
		public pageProvider: HRM_PolBenefitProvider,
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
		// this.formGroup = formBuilder.group({
		// 	Id: [0],
		// 	Type: ['', Validators.required],
		// 	CalculationMethodType: ['', Validators.required],
		// 	RateCo: ['', Validators.required],
		// 	RateEm: ['', Validators.required],
		// 	IsManagerCanCreateInsurance: ['', Validators.required],
		// });
	}
	preLoadData(event?: any): void {
		this.pageConfig.showSpinner = true;
		Promise.all([this.env.getType('CalculationMethodType'), this.env.getType('HRMInsuranceType')]).then((values) => {
			this.calculationMethodTypeList = values[0];
			this.typeList = values[1];
			this.loadedData();
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.formGroup = this.line;

		this.pageConfig.showSpinner = false;
	}

	dismiss() {
		this.modalController.dismiss();
	}

	submitModal() {
		console.log(this.formGroup.getRawValue());
		this.modalController.dismiss(this.formGroup.getRawValue());
	}
}
