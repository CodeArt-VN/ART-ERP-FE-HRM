import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_ShiftProvider, HRM_TimesheetProvider, HRM_TimesheetTemplateProvider, OST_OfficeProvider } from 'src/app/services/static/services.service';
import { readTimesheetOption, writeTimesheetOption } from './timesheet-detail.option';

@Component({
	selector: 'app-timesheet-detail',
	templateUrl: './timesheet-detail.page.html',
	styleUrls: ['./timesheet-detail.page.scss'],
	standalone: false,
})
export class TimesheetDetailPage extends PageBase {
	dataIDBranchList = [];
	timesheetTemplateList = [];
	shiftList = [];
	officeList = [];
	constructor(
		public pageProvider: HRM_TimesheetProvider,
		public timesheetTemplateProvider: HRM_TimesheetTemplateProvider,
		public shiftProvider: HRM_ShiftProvider,
		public officeProvider: OST_OfficeProvider,
		public branchProvicer: BRA_BranchProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.id = this.route.snapshot?.paramMap?.get('id');

		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
			Name: ['', Validators.required],
			Code: [''],
			Type: ['', Validators.required],
			Sort: [''],
			Remark: [''],
			IDTimesheetTemplate: ['', Validators.required],
			CheckInPolicy: ['', Validators.required],
			NumberOfShiftPerDay: ['', Validators.required],
			WorkingHoursPerDay: ['', Validators.required],
			Manager: [''],

			IsCheckOutRequired: [''],
			IsRequiredApproveToEnroll: [''],
			IsRequiredApproveToTransfer: [''],
			IsRequiredApproveToSwitch: [''],

			Option: [''],
			ShiftList: [''],
			IDOffice: [null],
		});
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	saveChange(publishEventCode?: any): Promise<unknown> {
		const current = this.formGroup.get('Option').value || this.item?.Option;
		this.formGroup.get('Option').setValue(writeTimesheetOption(current, this.formGroup.get('ShiftList').value, this.formGroup.get('IDOffice').value));
		this.formGroup.get('Option').markAsDirty();
		return super.saveChange2();
	}

	timesheetTypeList;
	CheckInOutPolicyList;
	preLoadData(event?: any): void {
		Promise.all([
			this.timesheetTemplateProvider.read(),
			this.shiftProvider.read(),
			this.env.getType('TimesheetType'),
			this.env.getType('CheckInOutPolicy'),
			this.officeProvider.read(),
		]).then((values: any) => {
			this.timesheetTemplateList = values[0]?.data;
			this.shiftList = values[1]?.data;
			this.timesheetTypeList = values[2];
			this.CheckInOutPolicyList = values[3];
			this.officeList = values[4]?.data || [];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		// this.dataIDBranchList = this.env.branchList;
		// this.env.getType('TimesheetType').then((data) => {
		// 	this.timesheetTypeList = data;

		// 	this.env.getType('CheckInOutPolicy').then((data) => {
		// 		this.CheckInOutPolicyList = data;

		// 	});
		// });
		if (this.item?.Id) {
			const option = readTimesheetOption(this.item.Option);
			this.formGroup.get('ShiftList').setValue(option.ShiftList);
			this.formGroup.get('IDOffice').setValue(option.IDOffice);
		}
		super.loadedData();
	}
}
