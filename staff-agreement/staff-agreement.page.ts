import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffAgreementProvider } from 'src/app/services/static/services.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-staff-agreement',
	templateUrl: 'staff-agreement.page.html',
	styleUrls: ['staff-agreement.page.scss'],
	standalone: false,
})
export class StaffAgreementPage extends PageBase {
	statusList = [];

	constructor(
		public pageProvider: HRM_StaffAgreementProvider,
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

	preLoadData(event) {
		Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((values) => {
			this.statusList = values[0];
			
			super.preLoadData(event);
		});
	}

	loadedData(event) {
		this.items.forEach((i) => {
			i._Status = this.statusList.find((d) => d.Code == i.Status);
			// i.Avatar = i.Code ? environment.staffAvatarsServer + i.Code + '.jpg' : 'assets/avartar-empty.jpg';
			// i.Email = i.Email ? i.Email.replace(environment.loginEmail, '') : '';
		});
		
		super.loadedData(event);
	}
	
}
