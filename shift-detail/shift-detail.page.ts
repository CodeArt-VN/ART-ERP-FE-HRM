import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider } from 'src/app/services/static/services.service';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { conflictingShiftLabel, isReservedShiftCode } from './shift-code.rules';

@Component({
	selector: 'app-shift-detail',
	templateUrl: './shift-detail.page.html',
	styleUrls: ['./shift-detail.page.scss'],
	standalone: false,
})
export class ShiftDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_ShiftProvider,
		public popoverCtrl: PopoverController,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			Start: ['07:00', Validators.required],
			End: ['17:00', Validators.required],
			Sort: [''],
			Remark: [''],
			Breaks: [2, Validators.required],
			Type: ['DayShift', Validators.required],
			StdPoint: [1, Validators.required],
			EarliestCheckIn: [15, Validators.required],
			LatestCheckIn: [15, Validators.required],
			EarliestCheckOut: [15, Validators.required],
			LatestCheckOut: [15, Validators.required],
			IsOvernightShift: [false],
		});
	}

	timeOffCodes: string[] = [];

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('ShiftType'), this.env.getType('TimeOffType', true)]).then((values: any[]) => {
			this.ShiftTypeList = values[0];
			this.timeOffCodes = (values[1] || []).map((d) => d?.Code).filter((code) => !!code);
			this.applyTimeOffCodeValidator();
			super.preLoadData(event);
		});
	}

	applyTimeOffCodeValidator() {
		const reserved: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
			isReservedShiftCode(control.value, this.timeOffCodes) ? { timeOffCode: true } : null;
		const code = this.formGroup.get('Code');
		const name = this.formGroup.get('Name');
		code?.setValidators(reserved);
		name?.setValidators([Validators.required, reserved]);
		code?.updateValueAndValidity({ emitEvent: false });
		name?.updateValueAndValidity({ emitEvent: false });
	}

	ShiftTypeList;
	loadedData(event) {
		super.loadedData();
		if (this.id == 0) {
			this.formGroup.controls.Start.markAsDirty();
			this.formGroup.controls.End.markAsDirty();
			this.formGroup.controls.Breaks.markAsDirty();
			this.formGroup.controls.Type.markAsDirty();

			this.formGroup.controls.StdPoint.markAsDirty();
			this.formGroup.controls.EarliestCheckIn.markAsDirty();
			this.formGroup.controls.LatestCheckIn.markAsDirty();
			this.formGroup.controls.EarliestCheckOut.markAsDirty();
			this.formGroup.controls.LatestCheckOut.markAsDirty();
			this.formGroup.controls.IsOvernightShift.markAsDirty();
		}
	}

	async saveChange() {
		const conflict = conflictingShiftLabel(this.formGroup.controls.Code.value, this.formGroup.controls.Name.value, this.timeOffCodes);
		if (conflict) {
			this.applyTimeOffCodeValidator();
			this.env.showMessage('Shift code is reserved for a time-off type ({value})', 'warning', conflict);
			return;
		}
		super.saveChange2();
	}
}
