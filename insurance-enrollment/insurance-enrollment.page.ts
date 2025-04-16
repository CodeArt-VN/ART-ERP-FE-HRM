import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffPolInsuranceEnrollmentProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';

@Component({
	selector: 'app-insurance-enrollment',
	templateUrl: 'insurance-enrollment.page.html',
	styleUrls: ['insurance-enrollment.page.scss'],
	standalone: false,
})
export class InsuranceEnrollmentPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffPolInsuranceEnrollmentProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
		this.pageConfig.isShowFeature = true;
		this.pageConfig.isFeatureAsMain = true;
	}

	preLoadData(event?: any): void {
		super.preLoadData(event);
	}
	loadedData(event) {
		super.loadedData(event);
	}
}
