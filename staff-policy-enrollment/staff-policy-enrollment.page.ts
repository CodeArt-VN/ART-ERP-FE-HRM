import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AlertController, ItemReorderEventDetail, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import {
	HRM_StaffEnrollmentProvider,
	HRM_PolBenefitProvider,
	HRM_PolInsuranceProvider,
	HRM_PolEmployeeProvider,
	HRM_PolicyPaidTimeOffProvider,
	BRA_BranchProvider,
	SYS_FormProvider,
} from 'src/app/services/static/services.service';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { NavigationExtras } from '@angular/router';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-policy-enrollment',
	templateUrl: 'staff-policy-enrollment.page.html',
	styleUrls: ['staff-policy-enrollment.page.scss'],
	standalone: false,
})
export class StaffPolicyEnrollmentPage extends PageBase {
	groupControl = {
		showReorder: false,
		showPopover: false,
		groupList: [],
		selectedGroup: null,
	};
	polEnrollmentType = [];
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffEnrollmentProvider,
		public polBenefitProvider: HRM_PolBenefitProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
		public polPaidTimeOffProvider: HRM_PolicyPaidTimeOffProvider,

		public formProvider: SYS_FormProvider,
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

	ngOnDestroy(): void {
		this.groupControl.showPopover = false;
		super.ngOnDestroy();
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('PolEnrollmentType'), this.env.getStatus('StandardApprovalStatus')]).then((values: any) => {
			this.groupControl.groupList = values[0];
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

	onGroupChange(g) {
		this.pageConfig.isSubActive = true;
		this.groupControl.selectedGroup = g;
		this.polEnrollmentType = [];

		if (g) {
			this.query.PolicyType = g.Code;
			let provider;
			switch (g.Code) {
				case 'PolBenefit':
					provider = this.polBenefitProvider;
					break;
				case 'PolInsurance':
					provider = this.polInsuranceProvider;
					break;
				case 'PolEmployee':
					provider = this.polEmployeeProvider;
					break;
				case 'PolPaidTimeOff':
					provider = this.polPaidTimeOffProvider;
					break;
				default:
			}
			if (provider) {
				provider.read().then((res: any) => {
					this.polEnrollmentType = res.data;
				});
			}
		} else {
			delete this.query.PolicyType;
		}

		this.refresh();
	}

	async add() {
		const modal = await this.modalController.create({
			component: StaffPickerEnrollmentPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				dataSource: this.polEnrollmentType,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let navigationExtras: NavigationExtras = {
				state: {
					PolicyId: data.IDPol,
					PolicyType: this.groupControl.selectedGroup?.Code,
					StaffList: data.StaffList,
				},
			};
			this.nav('/staff-policy-enrollment/0', 'forward', navigationExtras);
		}
	}
	goToDetail(item: any) {
		const navigationExtras: NavigationExtras = {
			state: {
				PolicyType: this.groupControl.selectedGroup?.Code,
			}
		};
		this.nav('/staff-policy-enrollment/' + item.Id, 'forward', navigationExtras);
	}
}
