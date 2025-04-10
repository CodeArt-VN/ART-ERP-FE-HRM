import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HRM_PayrollTemplateProvider} from 'src/app/services/static/services.service';

@Component({
	selector: 'app-payroll-template',
	templateUrl: 'payroll-template.page.html',
	styleUrls: ['payroll-template.page.scss'],
	standalone: false,
})
export class PayrollTemplatePage extends PageBase {
	constructor(
		public pageProvider: HRM_PayrollTemplateProvider,
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
