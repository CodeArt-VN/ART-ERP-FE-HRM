import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffPolBenefitEnrollmentProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/models/options-interface';
import { lib } from 'src/app/services/static/global-functions';
@Component({
	selector: 'app-staff-benefit-enrollment',
	templateUrl: 'staff-benefit-enrollment.page.html',
	styleUrls: ['staff-benefit-enrollment.page.scss'],
	standalone: false,
})
export class StaffBenefitEnrollmentPage extends PageBase {
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffPolBenefitEnrollmentProvider,
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
		Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((res : any) => {
			this.statusList = res[0];		
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
}
