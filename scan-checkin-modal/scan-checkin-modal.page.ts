import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffScheduleProvider, HRM_TimesheetLogProvider, OST_OfficeGateProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { Capacitor } from '@capacitor/core';
import { BarcodeScannerService } from 'src/app/services/util/barcode-scanner.service';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { CateringVoucherModalPage } from '../catering-voucher-modal/catering-voucher-modal.page';
import { HttpClient } from '@angular/common/http';
import { SYS_ConfigService } from 'src/app/services/custom/system-config.service';
@Component({
	selector: 'app-scan-checkin-modal',
	templateUrl: './scan-checkin-modal.page.html',
	styleUrls: ['./scan-checkin-modal.page.scss'],
	standalone: false,
})
export class ScanCheckinModalPage extends PageBase {
	myIP: any;
	canScanQRCode = false;
	gateList = [];
	activeGate: any = {};
	selectedGateId: number = null;
	platform = Capacitor.getPlatform();
	hasShift = false;
	isCheckinDataLoaded = false;
	hrmConfig = {
		AllowCheckInWithoutShift: false,
		EnableLogRecording: false,
		AllowCheckInOutsideWorkingHours: false,
	};

	constructor(
		public pageProvider: OST_OfficeGateProvider,
		public scanner: BarcodeScannerService,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public staffScheduleProvider: HRM_StaffScheduleProvider,
		public sysConfigProvider: SYS_ConfigService,

		public modalController: ModalController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		private http: HttpClient
	) {
		super();
	}

	private getLocalDateValue(date = new Date()): string {
		return lib.dateFormat(date, 'yyyy-mm-dd');
	}

	private getPreviousLocalDateValue(date = new Date()): string {
		const previousDate = new Date(date);
		previousDate.setDate(previousDate.getDate() - 1);
		return this.getLocalDateValue(previousDate);
	}

	private getScheduleWorkingDate(schedule: any): string {
		return schedule?.WorkingDate ? lib.dateFormat(schedule.WorkingDate, 'yyyy-mm-dd') : '';
	}

	private getScheduleDateRange(schedule: any): { start: Date; end: Date } | null {
		const startValue = schedule?.Start ?? schedule?.start;
		const endValue = schedule?.End ?? schedule?.end;
		if (!startValue || !endValue) return null;

		const start = new Date(startValue);
		const end = new Date(endValue);
		if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

		return { start, end };
	}

	private isOvernightShiftEndingToday(schedule: any, today: string, range: { start: Date; end: Date }): boolean {
		return schedule?.ShiftType === 'OvernightShift' && this.getLocalDateValue(range.end) === today;
	}

	private hasCheckinShift(schedules: any[], now = new Date()): boolean {
		if (!schedules?.length) return false;

		const today = this.getLocalDateValue(now);
		if (schedules.some((schedule) => this.getScheduleWorkingDate(schedule) === today)) return true;

		const previousDaySchedules = schedules.filter((schedule) => this.getScheduleWorkingDate(schedule) !== today);
		if (!previousDaySchedules.length) return false;

		return previousDaySchedules.some((schedule) => {
			const range = this.getScheduleDateRange(schedule);
			if (!range) return false;
			return (range.start <= now && now <= range.end) || this.isOvernightShiftEndingToday(schedule, today, range);
		});
	}

	preLoadData(event?: any): void {
		Promise.all([
			this.pageProvider.commonService.connect('GET', ApiSetting.apiDomain('Account/MyIP'), null).toPromise(),
			this.pageProvider.read(),
			this.sysConfigProvider.getConfig(this.env.selectedBranch, Object.keys(this.hrmConfig)),
		]).then((resp: any) => {
			this.myIP = resp[0];
			this.gateList = resp[1]['data'];
			this.query.IPAddress = this.myIP;
			for (let key of Object.keys(this.hrmConfig)) {
				this.hrmConfig[key] = resp[2][key];
			}
			super.preLoadData(event);
		});
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.isCheckinDataLoaded = false;
		this.hasShift = false;
		if (!this.hrmConfig.AllowCheckInWithoutShift) {
			const now = new Date();
			this.staffScheduleProvider
				.read({
					IDStaff: this.env.user.StaffID,
					WorkingDateFrom: this.getPreviousLocalDateValue(now),
					WorkingDateTo: this.getLocalDateValue(now),
				})
				.then((resp: any) => {
					this.hasShift = this.hasCheckinShift(resp?.data, now);
				})
				.finally(() => {
					this.isCheckinDataLoaded = true;
					super.loadedData(event, ignoredFromGroup);
				});
		} else {
			this.isCheckinDataLoaded = true;
			super.loadedData(event, ignoredFromGroup);
		}
		if (this.platform !== 'web') {
				this.canScanQRCode = true;
				this.items.unshift({ Id: 0, Name: 'Scan QR Code', Code: 'SCAN_QR' });
			}
	}

	changeGate(i) {
		this.activeGate = i;
		this.selectedGateId = i.Id;
		if (i.Code == 'SCAN_QR') {
			this.scanQRCode();
		}
	}

	onGateSelectionChanged() {
		const selected = this.items.find((g) => g.Id === this.selectedGateId);
		if (selected) {
			this.changeGate(selected);
		}
	}

	async scanQRCode() {
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
						this.timesheetLogProvider
							.save(logItem)
							.then((resp: any) => {
								console.log(resp);
								if (loading) loading.dismiss();
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
								this.env.showMessage(err, 'danger');
							})
							.finally(() => {
								this.modalController.dismiss(true);
							});
					});
			});
		} catch (error) {
			this.env.showMessage(error, 'danger');
		}
	}

	checkin() {
		let now = new Date();
		let yyyy = now.getFullYear();
		let mm = String(now.getMonth() + 1).padStart(2, '0');
		let dd = String(now.getDate()).padStart(2, '0');
		let hh = String(now.getHours()).padStart(2, '0');
		let mi = String(now.getMinutes()).padStart(2, '0');
		let ss = String(now.getSeconds()).padStart(2, '0');
		let formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.000`;

		let postDTO = {
			IDStaff: this.env.user.StaffID,
			GateCode: this.activeGate.Code,
			LogTime: formattedDate,
			IPAddress: this.myIP,
		};
		// if (this.hrmConfig.AllowCheckInWithoutShift && !this.hrmConfig.EnableLogRecording && !this.hasShift) {
		// 	postDTO['WithoutShift'] = true;
		// }
		this.timesheetLogProvider.save(postDTO).then((resp: any) => {
			if (resp && resp != 'OK' && !resp.Id) {
				this.showLogMessage(resp);
			} else if (resp) {
				this.env.showMessage('Check-in successful', 'success');
				this.modalController.dismiss(true);
			}
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

	showLogMessage(message) {
		let messageKey = [
			'Invalid IP',
			'Invalid gate coordinate',
			'Invalid coordinate',
			'Invalid distance',
			'Invalid LogTime',
			'No pre-ordered',
			'Schedule not found',
			'Time attendance without assigned shift',
			'Catering voucher has been used',
			'Outside working hours',
		].find((key) => message.indexOf(key) > -1);

		switch (messageKey) {
			case 'Invalid IP':
				this.env.showMessage('IP is invalid. Please use companys wify when checking in', 'warning', null, 0, true);
				break;
			case 'Invalid gate coordinate':
				this.env.showMessage('Check-in gates coordintates are invalid.', 'warning', null, 0, true);
				break;
			case 'Invalid coordinate':
				this.env.showMessage('Cannot verify check-in location, please turn on GPS during chech-in', 'warning', null, 0, true);
				break;
			case 'Invalid distance':
				this.env.showMessage('Please check in at specified location', 'warning', null, 0, true);
				break;
			case 'Invalid LogTime':
				this.env.showMessage('Check-in time is invalid, please check-in at specfied time', 'warning', null, 0, true);
				break;
			case 'No pre-ordered':
				this.env.showMessage('You have not register for meals. Please register at least 01 day in advance', 'warning', null, 0, true);
				break;
			case 'Schedule not found':
				this.env.showMessage('You do not have working schedule', 'warning', null, 0, true);
				break;
			case 'Time attendance without assigned shift':
				this.env.showMessage('You have not been assigned a shift.', 'warning', null, 0, true);
				break;
			case 'Catering voucher has been used':
				this.env.showMessage('Meal Check-in completed', 'warning', null, 0, true);
				break;
			case 'Outside working hours':
				this.env.showMessage('Check-in time is outside working hours', 'warning', null, 0, true);
				break;
		}
	}
}
