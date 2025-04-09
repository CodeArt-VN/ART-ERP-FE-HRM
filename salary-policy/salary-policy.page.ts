import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';
import { HRM_PolSalaryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-salary-policy',
	templateUrl: 'salary-policy.page.html',
	styleUrls: ['salary-policy.page.scss'],
	standalone: false,
})
export class SalaryPolicyPage extends PageBase {
	constructor(
		public pageProvider: HRM_PolSalaryProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
	}
}
