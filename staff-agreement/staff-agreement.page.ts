import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { HRM_StaffAgreementProvider } from 'src/app/services/static/services.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-staff-agreement',
	templateUrl: 'staff-agreement.page.html',
	styleUrls: ['staff-agreement.page.scss'],
	standalone: false,
})
export class StaffAgreementPage extends PageBase {
	statusList = [];

	constructor(
		public pageProvider: HRM_StaffAgreementProvider,
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

	preLoadData(event) {
		Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((values) => {
			this.statusList = values[0];

			super.preLoadData(event);
		});
	}

	loadedData(event) {
		this.items.forEach((i) => {
			i._Status = this.statusList.find((d) => d.Code == i.Status);
			i.Avatar = i.Code ? environment.staffAvatarsServer + i.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i.Email = i.Email ? i.Email.replace(environment.loginEmail, '') : '';
		});

		super.loadedData(event);
	}

	changeStatus(text, message, Status) {
		this.alertCtrl
			.create({
				header: text,
				//subHeader: '---',
				message: message,
				buttons: [
					{
						text: 'Hủy',
						role: 'cancel',
						handler: () => {
							//console.log('Không xóa');
						},
					},
					{
						text: 'Xác nhận',
						cssClass: 'danger-btn',
						handler: () => {
							let publishEventCode = this.pageConfig.pageName;
							let apiPath = {
								method: 'POST',
								url: function () {
									return ApiSetting.apiDomain('PR/Program/ChangeStatus/');
								},
							};

							if (this.submitAttempt == false) {
								this.submitAttempt = true;
								let postDTO = {
									Ids: this.selectedItems.map((e) => e.Id),
									Status: Status,
								};
								this.pageProvider.commonService
									.connect(apiPath.method, apiPath.url(), postDTO)
									.toPromise()
									.then((savedItem: any) => {
										if (publishEventCode) {
											this.env.publishEvent({
												Code: publishEventCode,
											});
										}
										this.env.showMessage('Saving completed!', 'success');
										this.submitAttempt = false;
									})
									.catch((err) => {
										this.submitAttempt = false;
										//console.log(err);
									});
							}
						},
					},
				],
			})
			.then((alert) => {
				alert.present();
			});
	}

	submit(): void {
		let text = 'Gửi Duyệt';
		let message = 'Sau khi gửi duyệt, bạn không thể chỉnh sửa đối tượng được nữa. Bạn có chắc muốn gửi duyệt tất cả đối tượng chưa duyệt?';
		this.changeStatus(text, message, 'Submitted');
	}

	approve(): void {
		let text = 'Duyệt';
		let message = 'Bạn có chắc chắn duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Approved');
	}

	disapprove(): void {
		let text = 'Không Duyệt';
		let message = 'Bạn có chắc chắn không duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Disapproved');
	}

	cancel(): void {
		let text = 'Huỷ';
		let message = 'Bạn có chắc chắn huỷ các đối tượng này?';
		this.changeStatus(text, message, 'Rejected');
	}
}
