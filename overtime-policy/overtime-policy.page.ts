import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { HRM_PolOvertimeProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-overtime-policy',
	templateUrl: 'overtime-policy.page.html',
	styleUrls: ['overtime-policy.page.scss'],
	standalone: false,
})
export class OvertimePolicyPage extends PageBase {
	constructor(
		public pageProvider: HRM_PolOvertimeProvider,
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
}
