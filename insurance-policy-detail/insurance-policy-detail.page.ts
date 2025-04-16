import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolInsuranceProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-insurance-policy-detail',
	templateUrl: 'insurance-policy-detail.page.html',
	styleUrls: ['insurance-policy-detail.page.scss'],
	standalone: false,
})
export class InsurancePolicyDetailPage extends PageBase {
	calculationMethodTypeList = [];
	typeList = [];
	constructor(
		public pageProvider: HRM_PolInsuranceProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public route: ActivatedRoute,
		public cdr: ChangeDetectorRef,
		public router: Router,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.buildFormGroup();
	}

	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			Name: [''],
			Code: ['', Validators.pattern('^[a-zA-Z0-9.\\-]+$')],
			Remark: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			EffectiveDate: [''],
			DateOfExpiry: [''],
			Type: [''],
			CalculationMethodType: [''],
			RateCo: [''],
			RateEm: [''],
			IsManagerCanCreateInsurance: [''],
		});
	}

	preLoadData() {
		Promise.all([this.env.getType('CalculationMethodType'),this.env.getType('HRMInsuranceType')]).then((values) => {
			this.calculationMethodTypeList = values[0];
			this.typeList = values[1];
		});

		super.preLoadData();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	loadedData(event) {
		super.loadedData(event);
	}
	saveChange() {
		return super.saveChange2();
	}
}
