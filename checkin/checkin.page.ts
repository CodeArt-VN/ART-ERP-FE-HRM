import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetLogProvider, OST_OfficeGateProvider, SYS_UserDeviceProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { BarcodeScannerService } from 'src/app/services/util/barcode-scanner.service';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CateringVoucherModalPage } from '../catering-voucher-modal/catering-voucher-modal.page';
import { HttpClient } from '@angular/common/http';
import { ScanCheckinModalPage } from '../scan-checkin-modal/scan-checkin-modal.page';

@Component({
	selector: 'app-checkin',
	templateUrl: 'checkin.page.html',
	styleUrls: ['checkin.page.scss'],
	standalone: false,
})
export class CheckinPage extends PageBase {
	constructor(
		public pageProvider: HRM_TimesheetLogProvider,
		public gateProvider: OST_OfficeGateProvider,
		public userDeviceProvider: SYS_UserDeviceProvider,
		public scanner: BarcodeScannerService,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		private http: HttpClient,
		public navCtrl: NavController
	) {
		super();

		this.pageConfig.dividers = [
			{
				field: 'LogTime',
				dividerFn: (record, recordIndex, records) => {
					let a: any = recordIndex == 0 ? new Date('2000-01-01') : new Date(records[recordIndex - 1].LogTime);
					let b: any = new Date(record.LogTime);
					let mins = Math.floor((b - a) / 1000 / 60);

					if (Math.abs(mins) < 600) {
						return null;
					}
					return  lib.dateFormat(record.LogTime, 'dd/mm/yyyy') ;
				},
			},
		];
	}
	gateList = [];
	myIP = '';
	preLoadData(event?: any): void {
		this.pageConfig.sort = [{ Dimension: 'LogTime', Order: 'DESC' }];
		
		this.query.IDStaff = this.env.user.StaffID;

		this.gateProvider.read().then((resp) => {
			this.gateList = resp['data'];
			super.preLoadData(event);
		});

		this.pageProvider.commonService
			.connect('GET', ApiSetting.apiDomain('Account/MyIP'), null)
			.toPromise()
			.then((resp: any) => {
				this.myIP = resp;
				console.log(this.myIP);
			});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.items.forEach((i, idx, arr) => {
			i.Time = lib.dateFormat(i.LogTime, 'hh:MM');
			i.Date = lib.dateFormat(i.LogTime, 'dd/mm/yyyy');
			i.Gate = this.gateList.find((d) => d.Id == i.IDGate);
		});

		super.loadedData(event, ignoredFromGroup);
	}

	myHeaderFn(record, recordIndex, records) {
		let a: any = recordIndex == 0 ? new Date('2000-01-01') : new Date(records[recordIndex - 1].LogTime);
		let b: any = new Date(record.LogTime);
		let mins = Math.floor((b - a) / 1000 / 60);

		if (Math.abs(mins) < 600) {
			return null;
		}
		return record.Date;
		// return {
		//   CreatedTimeText: record.CreatedDate ? lib.dateFormat(record.CreatedDate, 'hh:MM') : '',
		//   CreatedDateText: record.CreatedDate ? lib.dateFormat(record.CreatedDate, 'dd/mm/yy') : ''
		// }
	}

	async scanQRCode() {
		if (Capacitor.getPlatform() == 'web') {
			this.scanQRCodeBS();
			return;
		}
		try {
			let code = await this.scanner.scan();

			let gateCode = '';
			if (code.indexOf('G:') == 0) {
				gateCode = code.replace('G:', '');
			} else {
				this.env
					.showPrompt('Please scan valid QR code', 'Invalid QR code', null, 'Retry', 'Cancel')
					.then(() => {
						setTimeout(() => this.scanQRCode(), 0);
					})
					.catch(() => {});
				return;
			}

			const loading = await this.loadingController.create({
				cssClass: 'my-custom-class',
				message: 'Vui lòng chờ kiểm tra checkin',
			});
			await loading.present().then(async () => {
				let logItem = {
					IDStaff: this.env.user.StaffID,
					GateCode: gateCode,
					Lat: null,
					Long: null,
					UUID: '',
					IPAddress: this.myIP,
					IsMockLocation: false,
				};

				if (Capacitor.isPluginAvailable('Device')) {
					let UID = await Device.getId();
					logItem.UUID = UID.identifier;
				}
				Geolocation.getCurrentPosition({
					timeout: 5000,
					enableHighAccuracy: true,
				})
					.then((resp) => {
						logItem.Lat = resp.coords.latitude;
						logItem.Long = resp.coords.longitude;
						console.log(resp);
					})
					.catch((err) => {
						console.log(err);
					})
					.finally(() => {
						this.pageProvider
							.save(logItem)
							.then((resp: any) => {
								console.log(resp);
								if (loading) loading.dismiss();

								this.refresh();
								if (resp.Id) {
									let i = resp;
									i.Time = lib.dateFormat(i.LogTime, 'hh:MM');
									i.Date = lib.dateFormat(i.LogTime, 'dd/mm/yyyy');
									i.Gate = this.gateList.find((d) => d.Id == i.IDGate);
									this.env.showMessage('Check-in completed', 'success');
									this.showLog(i);
								} else if (resp != 'OK') {
									this.showLogMessage(resp);
								} else {
									this.env.showMessage('Check-in completed', 'success');
								}
							})
							.catch((err) => {
								if (loading) loading.dismiss();
								// this.env.showMessage(err, 'danger');
							});
					});
			});
		} catch (error) {
			console.error(error);
		}
	}
	async scanQRCodeBS() {
		// this.pageProvider.commonService
		// 	.connect('GET', ApiSetting.apiDomain('Account/MyIP'), null)
		// 	.toPromise()
		// 	.then((resp: any) => {
		// 		this.myIP = resp;
		// 		console.log(this.myIP);
		// 	});
		this.env.showLoading('Loading ...', this.http.get('https://api.ipify.org/?format=json').toPromise()).then(async (resp: any) => {
			this.myIP = resp.ip;

			const modal = await this.modalController.create({
				component: ScanCheckinModalPage,
				componentProps: {
					myIP: this.myIP,
				},
				cssClass: 'my-custom-class',
			});

			await modal.present();
			const { data } = await modal.onWillDismiss();
			this.loadData(null);
			console.log('Public IP:', this.myIP);
		});
	}

	async showLog(cData) {
		const modal = await this.modalController.create({
			component: CateringVoucherModalPage,
			componentProps: cData,
			cssClass: 'modal-catering-voucher',
		});
		await modal.present();
	}

	showRemark(i) {
		if (!i.IsValidLog && i.Remark) {
			this.showLogMessage(i.Remark);
		}
	}

	showLogMessage(message) {
		if (message.indexOf('Invalid IP') > -1) {
			this.env.showMessage('IP is invalid. Please use companys wify when checking in', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid gate coordinate') > -1) {
			this.env.showMessage('Check-in gates coordintates are invalid.', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid coordinate') > -1) {
			this.env.showMessage('Cannot verify check-in location, please turn on GPS during chech-in', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid distance') > -1) {
			this.env.showMessage('Please check in at specified location', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid LogTime') > -1) {
			this.env.showMessage('Check-in time is invalid, please check-in at specfied time', 'warning', null, 0, true);
		} else if (message.indexOf('No pre-ordered') > -1) {
			this.env.showMessage('You have not register for meals. Please register at least 01 day in advance', 'warning', null, 0, true);
		} else if (message.indexOf('Schedule not found') > -1) {
			this.env.showMessage('You do not have working schedule', 'warning', null, 0, true);
		} else if (message.indexOf('Catering voucher has been used') > -1) {
			this.env.showMessage('Meal Check-in completed', 'warning', null, 0, true);
		}
	}
}
