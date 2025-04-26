import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PayrollTemplateProvider, HRM_PolSalaryProvider, HRM_StaffPayrollProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-payroll-detail',
	templateUrl: 'staff-payroll-detail.page.html',
	styleUrls: ['staff-payroll-detail.page.scss'],
	standalone: false,
})
export class StaffPayrollDetailPage extends PageBase {
	jobTitleList = [];
	constructor(
		public pageProvider: HRM_StaffPayrollProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
		this.pageConfig.isDetailPage = true;
	}

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = 'Staff record payroll';

		this.jobTitleList = lib.cloneObject(this.env.jobTitleList);
		super.preLoadData(event);
	}
	loadedData(event) {
		this.pageConfig.showSpinner = false;
		event?.target?.complete();
		console.log(this.item);
		this.item.StaffRecordPayroll.forEach((i) => {
			i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i._Staff.JobTitle = lib.getAttrib(i._Staff.IDJobTitle, this.jobTitleList);
		});
	}
}
