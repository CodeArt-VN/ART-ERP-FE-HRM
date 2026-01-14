import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { SortConfig } from 'src/app/interfaces/options-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_StaffTimeOffRequestProvider } from 'src/app/services/static/services.service';
import { environment } from 'src/environments/environment';
import { SYS_ConfigService } from 'src/app/services/custom/system-config.service';

@Component({
	selector: 'app-staff-time-off-request',
	templateUrl: 'staff-time-off-request.page.html',
	styleUrls: ['staff-time-off-request.page.scss'],
	standalone: false,
})
export class StaffTimeOffRequestPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffTimeOffRequestProvider,
		public sysConfigService: SYS_ConfigService,
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
		let sorted: SortConfig[] = [{ Dimension: 'Id', Order: 'DESC' }];
		this.pageConfig.sort = sorted;
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.sysConfigService.getConfig(this.env.selectedBranch, ['TimeOffUsedApprovalModule'])]).then((values: any) => {
			this.statusList = values[0];
			if(values[1]){
				this.pageConfig = {
					...this.pageConfig,
					...values[1]
				};
			}
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

	submitForApproval() {
		let ids = this.selectedItems.map((i) => i.Id);
		if (!this.pageConfig.canSubmit || !this.pageConfig.ShowSubmit || this.submitAttempt) return;

		this.env
			.actionConfirm('submit', ids.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST', 'HRM/StaffTimeOffRequest/Submit', { Ids: ids }).toPromise()
			)
			.then((_) => {
				this.env.publishEvent({
					Code: this.pageConfig.pageName,
				});
				this.env.showMessage('Submit successfully!', 'success');
				this.submitAttempt = false;
				this.refresh();
			})
			.catch((err: any) => {
				if (err != 'User abort action') this.env.showMessage('Cannot submit, please try again', 'danger');
				console.log(err);
			});
	}
}
