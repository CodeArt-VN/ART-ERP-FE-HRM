import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolInsuranceProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-insurance-policy',
	templateUrl: 'insurance-policy.page.html',
	styleUrls: ['insurance-policy.page.scss'],
	standalone: false,
})
export class InsurancePolicyPage extends PageBase {
	branchList = [];

	constructor(
		public pageProvider: HRM_PolInsuranceProvider,
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
