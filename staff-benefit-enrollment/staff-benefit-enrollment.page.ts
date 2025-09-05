import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	BRA_BranchProvider,
	HRM_PolBenefitProvider,
	HRM_StaffPolBenefitEnrollmentProvider,
	SYS_ActionProvider,
	SYS_IntegrationProviderProvider,
} from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/interfaces/options-interface';
import { lib } from 'src/app/services/static/global-functions';
import { FormBuilder } from '@angular/forms';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { NavigationExtras } from '@angular/router';
@Component({
	selector: 'app-staff-benefit-enrollment',
	templateUrl: 'staff-benefit-enrollment.page.html',
	styleUrls: ['staff-benefit-enrollment.page.scss'],
	standalone: false,
})
export class StaffBenefitEnrollmentPage extends PageBase {
	statusList = [];
	isModalOpen = false;
	polBenefitList = [];
	constructor(
		public pageProvider: HRM_StaffPolBenefitEnrollmentProvider,
		public polBenefitProvider: HRM_PolBenefitProvider,
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
		this.pageConfig.isFeatureAsMain = true;
		this.formGroup = this.formBuilder.group({
			IDPolBenefit: [],
			IDStaffList: [],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.polBenefitProvider.read()]).then((res: any) => {
			this.statusList = res[0];
			this.polBenefitList = res[1].data;
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
				dataSource: this.polBenefitList,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let navigationExtras: NavigationExtras = {
				state:{
					IDPol: data.IDPol,
					StaffList: data.StaffList
				}
			};
			this.nav('/staff-benefit-enrollment/0', 'forward', navigationExtras);
		}
	}
}
