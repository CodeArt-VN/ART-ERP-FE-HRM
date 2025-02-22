import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-point-modal',
	templateUrl: './point-modal.page.html',
	styleUrls: ['./point-modal.page.scss'],
	standalone: false,
})
export class PointModalPage extends PageBase {
	constructor(
		public pageProvider: HRM_ShiftProvider,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef
	) {
		super();
	}

	preLoadData(event?: any): void {
		this.item = this.navParams.data.event.extendedProps;

		super.loadedData(event);
	}
}
