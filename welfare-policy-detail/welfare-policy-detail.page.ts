import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PolWelfareProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-welfare-policy-detail',
	templateUrl: 'welfare-policy-detail.page.html',
	styleUrls: ['welfare-policy-detail.page.scss'],
	standalone: false,
})
export class WelfarePolicyDetailPage extends PageBase {
	branchList = [];
	frequencyList = [];
	typeList = [];
	currencyUnitTypeList = [];
	constructor(
		public pageProvider: HRM_PolWelfareProvider,
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
			Name: ['', Validators.required],
			Code: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9.\\-]+$')]],
			Remark: [''],
			Frequency: ['', Validators.required],
			DecisionSignDate: [''],
			DecisionEffectiveDate: [''],
			IDDecisionSignedBy: [''],
			DecisionNumber: [''],
			TimeOfEvent: [''],
			AOMAccordingPol: [''],
			AOMAccordingAct: [''],
			IsApproved: [''],
			IsPaidInKind: [''],
			IsIncomePerMonth: [''],
			IsIncomePerYear: ['', Validators.required],
			CurrencyUnitType: [''],
			WelfareType: ['', Validators.required],
		});
	}

	preLoadData() {
		//frequencyList load tu db
		this.frequencyList = [
			{ Id: 1, Code: 'Payroll', Name: 'Payroll' },
			{ Id: 2, Code: 'Weekly', Name: 'Weekly' },
			{ Id: 3, Code: 'Monthly', Name: 'Monthly' },
			{ Id: 4, Code: 'Yearly', Name: 'Yearly' },
			{ Id: 5, Code: 'Event', Name: 'Event' }, // sự kiện
		];
		this.currencyUnitTypeList = [
			{ Id: 0, Name: 'Written Description' }, // 0 - Diễn giải bằng chữ
			{ Id: 1, Name: 'Currency Unit' }, // 1 - Dạng đơn vị tiền tệ
		];
		//Load danh sách phúc lợi lên gán vào TypeList
		// this.env.getStatus('WelfareType').then((data: any) => {
		// 	this.typeList = data;
		// });

		Promise.all([this.env.getStatus('WelfareType'),this.env.getStatus('WelfareFrequencyType')]).then((values) => {
			this.typeList = values[0];
			this.frequencyList = values[1];
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
