import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider,   HRM_PolBenefitProvider,   HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormBuilder } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-benefit-policy',
	templateUrl: 'benefit-policy.page.html',
	styleUrls: ['benefit-policy.page.scss'],
	standalone: false,
})
export class BenefitPolicyPage extends PageBase {
	branchList = [];
	statusList = [];
	
	constructor(
		public pageProvider: HRM_PolBenefitProvider,
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

	preLoadData(event?: any): void {
			Promise.all([]).then((values: any) => {
				super.preLoadData(event);
			});
			Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((res) => {
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
