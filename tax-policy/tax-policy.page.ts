import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolCompulsoryInsuranceProvider, HRM_StaffProvider, HRM_TaxPolicyProvider } from 'src/app/services/static/services.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-tax-policy',
	templateUrl: 'tax-policy.page.html',
	styleUrls: ['tax-policy.page.scss'],
	standalone: false,
})
export class TaxPolicyPage extends PageBase {
	branchList = [];

	constructor(
		public pageProvider: HRM_TaxPolicyProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public formBuilder: FormBuilder,
		public env: EnvService,
		public navCtrl: NavController
	) {
		super();
	}

	preLoadData(event) {
		super.preLoadData(event);
	}

	loadedData(event) {
		super.loadedData(event);
	}
}
