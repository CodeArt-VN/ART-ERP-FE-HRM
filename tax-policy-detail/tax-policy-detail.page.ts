import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolCompulsoryInsuranceProvider, HRM_StaffProvider, HRM_TaxPolicyProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-tax-policy-detail',
	templateUrl: 'tax-policy-detail.page.html',
	styleUrls: ['tax-policy-detail.page.scss'],
	standalone: false,
})
export class TaxPolicyDetailPage extends PageBase {
	statusList = [];
	typeList = [];
	constructor(
		public pageProvider: HRM_TaxPolicyProvider,
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
			Code: [''],
			Remark: [''],
			Type: [''],
			ContributionRate: [''],
			Status: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
		});
	}

	preLoadData() {
		Promise.all([this.env.getType('HRPolicyTaxType'),this.env.getStatus('StandardApprovalStatus')]).then((values) => {
			this.typeList = values[0];
			this.statusList = values[1];
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
