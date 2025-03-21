import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolCompulsoryInsuranceProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-compulsory-insurance-policy-detail',
	templateUrl: 'compulsory-insurance-policy-detail.page.html',
	styleUrls: ['compulsory-insurance-policy-detail.page.scss'],
	standalone: false,
})
export class CompulsoryInsurancePolicyDetailPage extends PageBase {
	calcType = [];
	typeList = [];
	constructor(
		public pageProvider: HRM_PolCompulsoryInsuranceProvider,
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
			BasisOfCalcalation: [''],
			RateOfSocialInsuranceCo: [''],
			RateOfSocialInsuranceEm: [''],
			IsCompanyPaySI: [''],
			RateOfHealthInsuranceCo: [''],
			RateOfHealthInsuranceEm: [''],
			IsCompanyPayHI: [''],
			RateOfUnemploymentInsuranceCo: [''],
			RateOfUnemploymentInsuranceEm: [''],
			IsCompanyPayUI: [''],
			RateOfTradeUnionFeesCo: [''],
			RateOfTradeUnionFeesEm: [''],
			IsCompanyPayTUF: [''],
			IsApproved: [''],
		});
	}

	preLoadData() {
		this.calcType = [
			{ Id: 1, Name: 'Theo lương cơ bản' },
			{ Id: 2, Name: 'Theo tổng lương' },
			{ Id: 3, Name: 'Tuỳ chỉnh' },
		];
		Promise.all([this.env.getStatus('InsuranceType')]).then((values) => {
			this.typeList = values[0];
		});

		super.preLoadData();
	}

	loadedData(event) {
		super.loadedData(event);
	}
	saveChange() {
		return super.saveChange2();
	}
}
