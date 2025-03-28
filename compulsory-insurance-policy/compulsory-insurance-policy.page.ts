import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolCompulsoryInsuranceProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormBuilder } from '@angular/forms';

@Component({
	selector: 'app-compulsory-insurance-policy',
	templateUrl: 'compulsory-insurance-policy.page.html',
	styleUrls: ['compulsory-insurance-policy.page.scss'],
	standalone: false,
})
export class CompulsoryInsurancePolicyPage extends PageBase {
	branchList = [];

	constructor(
		public pageProvider: HRM_PolCompulsoryInsuranceProvider,
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
