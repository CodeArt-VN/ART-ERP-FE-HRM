import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { SortConfig } from 'src/app/interfaces/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_StaffTimeOffRequestProvider, SYS_ConfigProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-staff-time-off-request',
	templateUrl: 'staff-time-off-request.page.html',
	styleUrls: ['staff-time-off-request.page.scss'],
	standalone: false,
})
export class StaffTimeOffRequestPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffTimeOffRequestProvider,
		public sysConfigProvider: SYS_ConfigProvider,
		public branchProvider: BRA_BranchProvider,
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
	statusList = [];

	preLoadData(event?: any): void {
		let sysConfigQuery = ['TimeOffUsedApprovalModule'];
		let sorted: SortConfig[] = [{ Dimension: 'Id', Order: 'DESC' }];
		this.pageConfig.sort = sorted;
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.sysConfigProvider.read({ Code_in: sysConfigQuery, IDBranch: this.env.selectedBranch })]).then((values: any) => {
			this.statusList = values[0];
			values[1]['data'].forEach((e) => {
				if ((e.Value == null || e.Value == 'null') && e._InheritedConfig) {
					e.Value = e._InheritedConfig.Value;
				}
				this.pageConfig[e.Code] = JSON.parse(e.Value);
			});

			super.preLoadData();
		});
	}

	loadedData(event) {
		this.items.forEach((i) => {
			if (i._Staff) {
				i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
				i._Staff.Email = i._Staff.Email ? i._Staff.Email.replace(environment.loginEmail, '') : '';
			}

			if (i._ReplacementStaff) {
				i._ReplacementStaff.Avatar = i._ReplacementStaff.Code ? environment.staffAvatarsServer + i._ReplacementStaff.Code + '.jpg' : 'assets/avartar-empty.jpg';
				i._ReplacementStaff.Email = i._ReplacementStaff.Email ? i._ReplacementStaff.Email.replace(environment.loginEmail, '') : '';
			}
		});
		if (this.pageConfig['TimeOffUsedApprovalModule']) {
			this.pageConfig['canApprove'] = false;
		}
		super.loadedData(event);
	}
}
