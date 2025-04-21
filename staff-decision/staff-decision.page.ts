import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolEmployeeProvider, HRM_StaffPolEmployeeDecisionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { NavigationExtras } from '@angular/router';

@Component({
	selector: 'app-staff-decision',
	templateUrl: 'staff-decision.page.html',
	styleUrls: ['staff-decision.page.scss'],
	standalone: false,
})
export class StaffDecisionPage extends PageBase {
	statusList = [];
	isOpenAddNewPopover = false;
	HRPolicyTypeList = [];
	constructor(
		public pageProvider: HRM_StaffPolEmployeeDecisionProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
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
	}

	preLoadData(event?: any): void {
		Promise.all([]).then((values: any) => {
			super.preLoadData(event);
		});
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.env.getType('HRPolicyType')]).then((res) => {
			this.statusList = res[0];
			this.HRPolicyTypeList = res[1];

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

	@ViewChild('addNewPopover') addNewPopover!: HTMLIonPopoverElement;
	presentCopyPopover(e) {
		this.addNewPopover.event = e;
		this.isOpenAddNewPopover = !this.isOpenAddNewPopover;
	}
	async HRPolicyTypeClick(type) {
		this.polEmployeeProvider.read({ Type: type.Code }).then(async (res:any) => {
			const modal = await this.modalController.create({
						component: StaffPickerEnrollmentPage,
						backdropDismiss: false,
						cssClass: 'modal90',
						componentProps: {
							dataSource: res.data,
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
						this.nav('/staff-decision/0', 'forward', navigationExtras);
					}
		});
	}
}
