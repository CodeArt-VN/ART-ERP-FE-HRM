import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	BRA_BranchProvider,
	HRM_PolInsuranceProvider,
	HRM_StaffPolInsuranceEnrollmentProvider,
	SYS_ActionProvider,
	SYS_IntegrationProviderProvider,
} from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { NavigationExtras } from '@angular/router';
import { HRM_PolInsurance } from 'src/app/models/model-list-interface';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-insurance-enrollment',
	templateUrl: 'insurance-enrollment.page.html',
	styleUrls: ['insurance-enrollment.page.scss'],
	standalone: false,
})
export class InsuranceEnrollmentPage extends PageBase {
	polInsuranceList = [];
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffPolInsuranceEnrollmentProvider,
		public polInsuraceProvider: HRM_PolInsuranceProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location,
		public formBuilder: FormBuilder
	) {
		super();
		this.pageConfig.isShowFeature = true;
	}

	preLoadData(event?: any): void {
		Promise.all([this.polInsuraceProvider.read(), this.env.getStatus('StandardApprovalStatus')]).then((values: any) => {
			this.polInsuranceList = values[0].data;
			this.statusList = values[1];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		this.items.forEach((i) => {
			i.StatusText = lib.getAttrib(i.Status, this.statusList, 'Name', '--', 'Code');
			i.StatusColor = lib.getAttrib(i.Status, this.statusList, 'Color', 'dark', 'Code');
		});
		super.loadedData(event);
	}

	async add() {
		const modal = await this.modalController.create({
			component: StaffPickerEnrollmentPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				dataSource: this.polInsuranceList,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let navigationExtras: NavigationExtras = {
				state: {
					IDPol: data.IDPol,
					StaffList: data.StaffList,
				},
			};
			this.nav('/insurance-enrollment/0', 'forward', navigationExtras);
		}
	}
}
