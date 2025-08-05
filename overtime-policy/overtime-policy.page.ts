import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { HRM_PolOvertimeProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';

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


	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.items.forEach((i) => {
			i.Start = lib.dateFormat('2000-01-01 ' + i.Start, 'hh:MM');
			i.End = lib.dateFormat('2000-01-01 ' + i.End, 'hh:MM');
		});
		super.loadedData(event, ignoredFromGroup);
	}
}
