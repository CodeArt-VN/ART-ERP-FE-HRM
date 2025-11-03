import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { environment } from 'src/environments/environment';
import { AdvanceFilterModalComponent } from 'src/app/modals/advance-filter-modal/advance-filter-modal.component';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-leave-statistics',
	templateUrl: 'leave-statistics.page.html',
	styleUrls: ['leave-statistics.page.scss'],
	standalone: false,
})
export class LeaveStatisticsPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffProvider,
		public commonService: CommonService,
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

	loadData(event = null, forceReload = false) {	
		const currentYear = new Date().getFullYear();
		this.query.FromDate = `${currentYear}-01-01`;
		this.query.ToDate = `${currentYear}-12-31`;

		this.parseSort();

		if (this.pageProvider && !this.pageConfig.isEndOfData) {
			if (event == 'search') {
				this.pageProvider.commonService
					.connect('GET', 'HRM/Staff/GetLeaveStatistics', this.query)
					.toPromise()
					.then((result: any) => {
						if (result.data.length == 0) {
							this.pageConfig.isEndOfData = true;
						}
						this.items = result.data;
						this.loadedData(null);
					});
			} else {
				this.query.Skip = this.items.length;
				this.pageProvider.commonService
					.connect('GET', 'HRM/Staff/GetLeaveStatistics', this.query)
					.toPromise()
					.then((result: any) => {
						if (result.data.length == 0) {
							this.pageConfig.isEndOfData = true;
						}
						if (result.data.length > 0) {
							this.items = this.dataManagementService.mergeItems(this.items, result.data);
						}

						this.loadedData(event);
					})
					.catch((err) => {
						if (err.message != null) {
							this.env.showMessage(err.message, 'danger');
						} else {
							this.env.showMessage('Cannot extract data', 'danger');
						}

						this.loadedData(event);
					});
			}
		} else {
			this.loadedData(event);
		}
	}

	loadedData(event) {
		this.items.forEach((i) => {
			i.Avatar = i.Code ? environment.staffAvatarsServer + i.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i.Email = i.Email ? i.Email.replace(environment.loginEmail, '') : '';
		});

		super.loadedData(event);
	}

	async export() {
		let apiPath = {
			getExport: {
				method: 'DOWNLOAD',
				url: function () {
					return ApiSetting.apiDomain('HRM/Staff/ExportLeaveBalance/');
				},
			},
		};

		this.loadingController
			.create({
				cssClass: 'my-custom-class',
				message: 'Please wait for a few moments',
			})
			.then((loading) => {
				loading.present();
				const currentYear = new Date().getFullYear();
				const exportFilter = {
					FromDate: `${currentYear}-01-01`,
					ToDate: `${currentYear}-12-31`
				};
				this.commonService
					.export(apiPath, exportFilter)
					.then((response: any) => {
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.downloadURLContent(response);
					})
					.catch((err) => {
						if (err.message != null) {
							this.env.showMessage(err.message, 'danger');
						} else {
							this.env.showMessage('Cannot extract data', 'danger');
						}
						this.submitAttempt = false;
						if (loading) loading.dismiss();
						this.refresh();
					});
			});
	}

}
