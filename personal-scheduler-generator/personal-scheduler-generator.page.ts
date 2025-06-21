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
	selector: 'app-personal-scheduler-generator',
	templateUrl: './personal-scheduler-generator.page.html',
	styleUrls: ['./personal-scheduler-generator.page.scss'],
	standalone: false,
})
export class PersonalSchedulerGeneratorPage extends PageBase {
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
	shiftList = [];
	timeoffTypeList = [];
	officeList = [];

	ShiftStart = '';
	ShiftEnd = '';
	gateViewList = [];
	gateList = [];
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
		this.pageConfig.canEdit = true;
		this.formGroup = formBuilder.group({
			Id: [''],
			FromDate: new FormControl({ value: '', disabled: true }),
			ToDate: new FormControl({ value: '', disabled: true }),
			ShiftStart: new FormControl({ value: '', disabled: true }),
			ShiftEnd: new FormControl({ value: '', disabled: true }),
			IDShift: new FormControl({ value: '', disabled: true }),
			IsOpenShift: [false],
			Staffs: [''],
			TimeOffType: [''],
			IsBookLunchCatering: [false],
			IsBookBreakfastCatering: [false],
			IsBookDinnerCatering: [false],
			// bổ sung checkin
			TimeSpan: ['',Validators.required],
			IDOffice: ['',Validators.required],
			IDGate: ['',Validators.required],
			IPAddress: [''],
		});
	}

	canBook = false;
	canCreateCheckinLog = false;
	preLoadData(event?: any): void {
		// this.staffList = JSON.parse(JSON.stringify(this.navParams.data.staffList));
		// this.shiftList = this.navParams.data.shiftList;
		// this.timeoffTypeList = this.navParams.data.timeoffTypeList;
		this.gateList = this.navParams.data.gateList;
		this.officeList = this.navParams.data.officeList;

		this.formGroup.controls.Id.setValue(this.navParams.data.Id);
		this.formGroup.controls.FromDate.setValue(this.navParams.data.FromDate);
		this.formGroup.controls.ToDate.setValue(this.navParams.data.ToDate);
		this.formGroup.controls.ShiftStart.setValue(this.navParams.data.ShiftStart);
		this.formGroup.controls.ShiftEnd.setValue(this.navParams.data.ShiftEnd);

		//this.formGroup.controls.IDStaff.setValue(this.navParams.data.IDStaff);

		if (this.navParams.data.IDShift) {
			this.formGroup.controls.IDShift.setValue(this.navParams.data.IDShift);
		}

		this.formGroup.controls.IsBookLunchCatering.setValue(this.navParams.data.IsBookLunchCatering);
		this.formGroup.controls.IsBookBreakfastCatering.setValue(this.navParams.data.IsBookBreakfastCatering);
		this.formGroup.controls.IsBookDinnerCatering.setValue(this.navParams.data.IsBookDinnerCatering);

		this.formGroup.controls.TimeOffType.setValue(this.navParams.data.TimeOffType);
		//this.formGroup.controls.Id.setValue(this.navParams.data.Id);
		//this.formGroup.controls.IDStaff.disable();
		//this.formGroup.controls.IDShift.disable();
		if (this.formGroup.controls.IDOffice.value) {
			this.changeOffice();
		}
		super.loadedData();

		let d1 = lib.dateFormat(this.navParams.data.FromDate);
		let d2 = lib.dateFormat(new Date());
		if (d1 <= d2) {
			this.formGroup.controls.IsBookLunchCatering.disable();
			this.formGroup.controls.IsBookBreakfastCatering.disable();
			this.formGroup.controls.IsBookDinnerCatering.disable();
			this.canBook = false;
			this.canCreateCheckinLog = true;

		} else {
			this.formGroup.controls.Id.enable();
			this.formGroup.controls.IsBookLunchCatering.enable();
			this.formGroup.controls.IsBookBreakfastCatering.enable();
			this.formGroup.controls.IsBookDinnerCatering.enable();
			this.canBook = true;
			this.canCreateCheckinLog = false;
			this.formGroup.controls.TimeSpan.setValidators(null);
			this.formGroup.controls.IDGate.setValidators(null);
			this.formGroup.controls.IDOffice.setValidators(null);
			this.formGroup.updateValueAndValidity();
		}
	}
	changeOffice() {
		this.gateViewList = this.gateList.filter((d) => d.IDOffice == this.formGroup.controls.IDOffice.value);
		this.gateViewList = [...this.gateViewList];
		console.log(this.gateViewList);
	}
	changeGate(e) {
		this.formGroup.controls.IPAddress.setValue(e?.IPAddress);
	}

	massShiftAssignment() {
		// this.formGroup.updateValueAndValidity();
		// let submitItem = this.formGroup.value;//this.getDirtyValues(this.formGroup);

		// this.env.showTranslateMessage('Lưu thông tin thành công.', 'success');
		// this.modalController.dismiss(submitItem);

		this.formGroup.updateValueAndValidity();
		if (!this.formGroup.valid) {
			this.env.showMessage('Please recheck information highlighted in red above', 'warning');
		} else {
			let submitItem = this.formGroup.value; //this.getDirtyValues(this.formGroup);
			this.env.showMessage('Information saved successfully', 'success');
			this.modalController.dismiss(submitItem);
		}
	}
}
