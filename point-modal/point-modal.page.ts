import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider, HRM_TimesheetLogProvider, OST_OfficeGateProvider, OST_OfficeProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-point-modal',
	templateUrl: './point-modal.page.html',
	styleUrls: ['./point-modal.page.scss'],
	standalone: false,
})
export class PointModalPage extends PageBase {
	cData;
	IDCycle;
	TimesheetLogList: any[] = [];
	officeList: any[] = [];
	gateList: any[] = [];
	isShowCreateCheckin = false;
	canCreateCheckinLog = false;
	constructor(
		public pageProvider: HRM_ShiftProvider,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public officeProvider: OST_OfficeProvider,
		public gateProvider: OST_OfficeGateProvider,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef
	) {
		super();
		this.formGroup = this.formBuilder.group({
			// bổ sung checkin
			IDStaff: ['', Validators.required],
			TimeSpan: ['', Validators.required],
			IDOffice: ['', Validators.required],
			IDGate: ['', Validators.required],
			IPAddress: [''],
		});
	}

	preLoadData(event?: any): void {
		this.item = this.cData.event.extendedProps; // this.navParams.data.event.extendedProps;
		let dto = {
			IDTimesheet: this.item.IDTimesheet,
			StartDate: this.item.WorkingDate,
			EndDate: this.item.WorkingDate,
			IDCycle: this.IDCycle,
			IDStaff: this.item.IDStaff,
		};

		let d1 = lib.dateFormat(this.navParams.data.FromDate);
		let d2 = lib.dateFormat(new Date());
		if (d1 <= d2) {
			this.canCreateCheckinLog = true;
		}
		Promise.all([
			this.officeProvider.read(),
			this.gateProvider.read(),
			this.pageProvider.commonService.connect('GET', 'HRM/TimesheetCycle/GetTimesheetLog', dto).toPromise(),
		]).then((values: any) => {
			this.officeList = values[0]['data'];
			this.gateList = values[1]['data'];
			this.TimesheetLogList = values[2];

			this.loadedData(event);
		});
	}
	loadedData(event?: any): void {
		this.formGroup.controls.IDStaff.setValue(this.item.IDStaff);
		this.formGroup.controls.IDStaff.markAsDirty();
		super.loadedData(event);
	}

	submitCheckin() {
		let submitData = this.formGroup.getRawValue();
		let dateStr = this.item.WorkingDate;
		let [day, month, year] = dateStr.split('/');
		submitData.LogTime = `${year}-${month}-${day}T${submitData.TimeSpan}:00`;
		submitData.IsAdditional = true;
		this.timesheetLogProvider.save(submitData).then((res: any) => {
			this.env.showMessage('Saved successfully', 'success');
			this.closeModal();
		});
	}
	gateViewList = [];
	changeOffice() {
		this.gateViewList = this.gateList.filter((d) => d.IDOffice == this.formGroup.controls.IDOffice.value);
		this.gateViewList = [...this.gateViewList];
		console.log(this.gateViewList);
	}
	changeGate(e) {
		this.formGroup.controls.IPAddress.setValue(e?.IPAddress);
	}
}
