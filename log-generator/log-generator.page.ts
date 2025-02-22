import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_ShiftProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-log-generator',
	templateUrl: './log-generator.page.html',
	styleUrls: ['./log-generator.page.scss'],
	standalone: false,
})
export class LogGeneratorPage extends PageBase {
	dayList = [
		{ Group: 1, Day: 'Sun', Value: 0 },
		{ Group: 1, Day: 'Mon', Value: 1 },
		{ Group: 1, Day: 'Tue', Value: 2 },
		{ Group: 1, Day: 'Wed', Value: 3 },
		{ Group: 1, Day: 'Thu', Value: 4 },
		{ Group: 1, Day: 'Fri', Value: 5 },
		{ Group: 1, Day: 'Sat', Value: 6 },
	];

	staffList = [];
	officeList = [];
	gateList = [];
	gateViewList = [];

	constructor(
		public pageProvider: HRM_ShiftProvider,
		public shiftProvider: HRM_ShiftProvider,

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
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			TimeSpan: ['', Validators.required],
			IDStaff: [''],
			Id: [0],
			Remark: [''],
			LogTime: [''],
			IDOffice: ['', Validators.required],
			IDGate: ['', Validators.required],
			Image: [''],
			IPAddress: [''],
			UUID: [''],
			IsValidLog: [true],
			IsOpenLog: [false],
			IsMockLocation: [false],
			Staffs: [],
			DaysOfWeek: [],
			IsAllStaff: [false],
		});
	}

	preLoadData(event?: any): void {
		this.staffList = JSON.parse(JSON.stringify(this.navParams.data.staffList));
		this.officeList = this.navParams.data.officeList;
		this.gateList = this.navParams.data.gateList;

		this.formGroup.controls.FromDate.setValue(this.navParams.data.FromDate);
		this.formGroup.controls.ToDate.setValue(this.navParams.data.ToDate);
		this.formGroup.controls.TimeSpan.setValue(this.navParams.data.TimeSpan);

		this.formGroup.controls.IDStaff.setValue(this.navParams.data.IDStaff);
		this.formGroup.controls.Id.setValue(this.navParams.data.Id);
		this.formGroup.controls.IDOffice.setValue(this.navParams.data.IDOffice);
		this.formGroup.controls.IDGate.setValue(this.navParams.data.IDGate);

		this.formGroup.controls.Image.setValue(this.navParams.data.Image);
		this.formGroup.controls.IPAddress.setValue(this.navParams.data.IPAddress);
		this.formGroup.controls.UUID.setValue(this.navParams.data.UUID);
		this.formGroup.controls.IsValidLog.setValue(this.navParams.data.IsValidLog);
		this.formGroup.controls.IsOpenLog.setValue(this.navParams.data.IsOpenLog);
		this.formGroup.controls.IsMockLocation.setValue(this.navParams.data.IsMockLocation);

		if (this.formGroup.controls.IDOffice.value) {
			this.changeOffice();
		}
		if (this.formGroup.controls.Id.value) {
			this.formGroup.controls.IDStaff.disable();
			this.formGroup.controls.IDOffice.disable();
			this.formGroup.controls.IDGate.disable();
		} else {
			this.formGroup.controls.Staffs.setValidators(Validators.required);
			this.formGroup.controls.Staffs.setValue(this.navParams.data.Staffs);
			this.formGroup.controls.Staffs.updateValueAndValidity();

			this.formGroup.controls.DaysOfWeek.setValidators(Validators.required);
			this.formGroup.controls.DaysOfWeek.setValue([0, 1, 2, 3, 4, 5, 6]);
			this.formGroup.controls.DaysOfWeek.updateValueAndValidity();
		}
		super.loadedData();
	}

	changeOffice() {
		this.gateViewList = this.gateList.filter((d) => d.IDOffice == this.formGroup.controls.IDOffice.value);
		this.gateViewList = [...this.gateViewList];
		console.log(this.gateViewList);
	}

	massShiftAssignment() {
		this.formGroup.updateValueAndValidity();
		if (!this.formGroup.valid) {
			this.env.showMessage('Please recheck information highlighted in red above', 'warning');
		} else {
			let submitItem = this.formGroup.value; //this.getDirtyValues(this.formGroup);
			this.modalController.dismiss(submitItem);
		}
	}
}
