import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-scheduler-generator',
	templateUrl: './scheduler-generator.page.html',
	styleUrls: ['./scheduler-generator.page.scss'],
	standalone: false,
})
export class SchedulerGeneratorPage extends PageBase {
	dayList = [
		{ Group: 1, Day: 'Sun', Value: 0 },
		{ Group: 1, Day: 'Mon', Value: 1 },
		{ Group: 1, Day: 'Tue', Value: 2 },
		{ Group: 1, Day: 'Wed', Value: 3 },
		{ Group: 1, Day: 'Thu', Value: 4 },
		{ Group: 1, Day: 'Fri', Value: 5 },
		{ Group: 1, Day: 'Sat', Value: 6 },
	];

	shiftList = [];
	staffList = [];
	timeoffTypeList = [];

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

		let firstDateInWeek = new Date();
		firstDateInWeek.setDate(firstDateInWeek.getDate() - firstDateInWeek.getDay() + 7);
		let firstDate = lib.dateFormat(firstDateInWeek);

		this.formGroup = formBuilder.group({
			FromDate: [firstDate, Validators.required],
			ToDate: ['', Validators.required],
			DaysOfWeek: ['', Validators.required],
			IDShift: [''],
			IsOpenShift: [false],
			IsAllStaff: [true],
			Staffs: [''],
			TimeOffType: [''],
			IsBookLunchCatering: [false],
			IsBookBreakfastCatering: [false],
			IsBookDinnerCatering: [false],
		});
	}

	preLoadData(event?: any): void {
		this.staffList = JSON.parse(JSON.stringify(this.navParams.data.staffList));
		this.shiftList = this.navParams.data.shiftList;
		this.timeoffTypeList = this.navParams.data.timeoffTypeList;

		if (this.navParams.data.FromDate) {
			this.formGroup.controls.FromDate.setValue(this.navParams.data.FromDate);
			this.formGroup.controls.ToDate.setValue(this.navParams.data.ToDate);
			this.formGroup.controls.DaysOfWeek.setValue(this.navParams.data.DaysOfWeek);
		}
		if (this.navParams.data.IDShift) {
			this.formGroup.controls.IDShift.setValue(this.navParams.data.IDShift);
		}

		if (this.navParams.data.Staffs) {
			this.formGroup.controls.IsAllStaff.setValue(this.navParams.data.IsAllStaff);
			this.formGroup.controls.IsOpenShift.setValue(this.navParams.data.IsOpenShift);
			this.formGroup.controls.IsBookLunchCatering.setValue(this.navParams.data.IsBookLunchCatering);
			this.formGroup.controls.IsBookBreakfastCatering.setValue(this.navParams.data.IsBookBreakfastCatering);
			this.formGroup.controls.IsBookDinnerCatering.setValue(this.navParams.data.IsBookDinnerCatering);
			this.formGroup.controls.Staffs.setValue(this.navParams.data.Staffs);
		}

		this.formGroup.controls.TimeOffType.setValue(this.navParams.data.TimeOffType);
		this.loadedData(event);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData();
		if (!this.pageConfig.canEditPassDay) {
			let d1 = lib.dateFormat(this.navParams.data.FromDate);
			let d2 = lib.dateFormat(this.navParams.data.currentDate);
			if (d1 <= d2) {
				this.formGroup.disable();
				this.pageConfig.canEdit = false;
			}
		}
		setTimeout(() => {}, 0);
	}

	massShiftAssignment() {
		if (!this.formGroup.controls.IDShift.value && !this.formGroup.controls.TimeOffType.value) {
			this.env.showMessage('Please choose working shift or classify leaves', 'danger', null, 0, true);
			return;
		}

		this.formGroup.updateValueAndValidity();
		if (!this.formGroup.valid) {
			this.env.showMessage('Please recheck information highlighted in red above', 'warning');
		} else {
			let submitItem = this.formGroup.value; //this.getDirtyValues(this.formGroup);
			this.modalController.dismiss(submitItem);
		}
	}

	// changeDate(){
	//     this.dayList = lib.getStartEndDates(this.formGroup.controls.FromDate.value, this.formGroup.controls.ToDate.value);
	//     this.dayList.forEach(d=>{
	//         d.Text=''+lib.dateFormat(d.Date,'weekday') +'-'+ lib.dateFormat(d.Date, 'dd/mm') +'' ;
	//     })
	// }

	changeTimeOffType(t) {
		this.formGroup.controls.TimeOffType.setValue(this.formGroup.controls.TimeOffType.value ? null : t.Code);

		if (this.formGroup.controls.TimeOffType.value) {
			this.formGroup.controls.IsBookLunchCatering.setValue(false);
			this.formGroup.controls.IsBookBreakfastCatering.setValue(false);
			this.formGroup.controls.IsBookDinnerCatering.setValue(false);
		}
	}
}
