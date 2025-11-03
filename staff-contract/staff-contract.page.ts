import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffContractProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { StaffContractModalPage } from '../staff-contract-modal/staff-contract-modal.page';

@Component({
	selector: 'app-staff-contract',
	templateUrl: 'staff-contract.page.html',
	styleUrls: ['staff-contract.page.scss'],
	standalone: false,
})
export class StaffContractPage extends PageBase {
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffContractProvider,
		public providerService: SYS_IntegrationProviderProvider,
		public branchProvider: BRA_BranchProvider,
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
		Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((res) => {
			this.statusList = res[0];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		this.items.forEach((i) => {
			i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i.StatusText = lib.getAttrib(i.Status, this.statusList, 'Name', '--', 'Code');
			i.StatusColor = lib.getAttrib(i.Status, this.statusList, 'Color', 'dark', 'Code');
		});
		super.loadedData(event);
	}

	async showStaffPickerModal() {
		const modalStaff = await this.modalController.create({
			component: StaffPickerPage,
			componentProps: {
				id: this.id,
			},
			cssClass: 'modal90',
		});

		await modalStaff.present();
		const { data } = await modalStaff.onWillDismiss();

		if (data && data.length) {
			const modal = await this.modalController.create({
				component: StaffContractModalPage,
				backdropDismiss: false,
				cssClass: 'modal90',
				componentProps: {
					Id: this.id,
					Items: data,
				},
			});

			await modal.present();
			await modal.onWillDismiss();
		}
	}
	add() {
		this.showStaffPickerModal();
	}
}
