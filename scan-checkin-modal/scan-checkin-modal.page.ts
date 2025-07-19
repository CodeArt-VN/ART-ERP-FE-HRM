import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_TimesheetLogProvider, OST_OfficeGateProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
@Component({
	selector: 'app-scan-checkin-modal',
	templateUrl: './scan-checkin-modal.page.html',
	styleUrls: ['./scan-checkin-modal.page.scss'],
	standalone: false,
})
export class ScanCheckinModalPage extends PageBase {
	myIP: any;
	activeGate: any = {};
	constructor(
		public pageProvider: OST_OfficeGateProvider,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public modalController: ModalController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController
	) {
		super();
	}

	preLoadData(event?: any): void {
		this.query.IPAddress = this.myIP;
		super.preLoadData(event);
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		console.log('Loaded data:', this.items);
	}

	changeGate(i) {
		this.activeGate = i;
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
			Logtime: formattedDate,
			IPAddress: this.myIP,
		};

		this.timesheetLogProvider.save(postDTO).then((resp: any) => {
			if (resp) {
				this.env.showMessage('Check-in successful', 'success');
				this.modalController.dismiss();
			}
		});
	}
}
