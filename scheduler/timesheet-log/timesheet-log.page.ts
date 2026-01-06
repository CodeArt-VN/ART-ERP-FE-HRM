import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetLogProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-timesheet-log',
	templateUrl: 'timesheet-log.page.html',
	styleUrls: ['timesheet-log.page.scss'],
	standalone: false,
})
export class TimesheetLogPage extends PageBase {
	idStaffList: any = [];

	constructor(
		public pageProvider: HRM_TimesheetLogProvider,
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

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = 'Timesheet log';
		super.preLoadData(event);
	}	

	loadData(event?: any): void {
		this.query.IDStaff = JSON.stringify(this.idStaffList);
		this.query.SeftClaim = true;
		super.loadData(event);
	}

	loadedData(event) {
		this.items.forEach((i) => {
			i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i._Staff.Email = i._Staff.Email ? i._Staff.Email.replace(environment.loginEmail, '') : '';
		});
		super.loadedData(event);
	}
	showCommandBySelectedRows(selectedRows: any): void {
		this.pageConfig.ShowDisapprove = true;
		this.pageConfig.ShowApprove = true;
		if (this.selectedItems.some((s) => !s.IsValidLog)) this.pageConfig.ShowDisapprove = false;
		if (this.selectedItems.some((s) => s.IsValidLog)) this.pageConfig.ShowApprove = false;
	}
}
