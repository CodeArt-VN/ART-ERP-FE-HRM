import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolBenefitProvider, HRM_StaffProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-staff-benefit-enrollment-detail-modal',
	templateUrl: './staff-benefit-enrollment-detail-modal.page.html',
	styleUrls: ['./staff-benefit-enrollment-detail-modal.page.scss'],
	standalone: false,
})
export class StaffBenefitEnrollmentDetailModalPage extends PageBase {
	IDPolBenefit;
	UDFList;
	frequencyList = [];
	UDFUsedList;
	Items;
	constructor(
		public pageProvider: HRM_PolBenefitProvider,
		public staffProvider: HRM_StaffProvider,
		public udfProvider: HRM_UDFProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public modalController: ModalController
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDStaffList: [],
		});
	}
	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});

	preLoadData(event?: any): void {
		this.id = this.IDPolBenefit;
		this.frequencyList = [
			{ Id: 1, Code: 'Payroll', Name: 'Payroll' },
			{ Id: 2, Code: 'Weekly', Name: 'Weekly' },
			{ Id: 3, Code: 'Monthly', Name: 'Monthly' },
			{ Id: 4, Code: 'Yearly', Name: 'Yearly' },
			{ Id: 5, Code: 'Event', Name: 'Event' }, // sự kiện
		];
		// Promise.all([this.udfProvider.read({ Group: 'Benefits' })]).then((res: any) => {
		// 	this.UDFList = res[0].data;
		// });
		super.preLoadData(event);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.Items) {
			this.formGroup.controls.IDStaffList.setValue(this.Items.map((e) => e.IDStaff));
			this.Items.forEach((e) => {
				if (e._Staff) {
					this.staffDataSource.selected.push(e._Staff);
				}
			});
			let values = this.Items[0].BenefitEnrollmentValue? JSON.parse(this.Items[0].BenefitEnrollmentValue):[];
			this.UDFList = this.UDFList.filter((e) => this.item.Lines.some((line) => line.IDUDF === e.Id));
			this.UDFList.forEach((e) => {
				e.isEdit = false;
				let line = values.find((d) => d.IDUDF == e.Id) || {};
				e._value = line.Value || '';
				e._checked = !!line.Value;
				e._isIncome = line.IsIncome || false;
				e._isCurrency = line.IsCurrency || false;
				e._isManagerCanCreateBenefit = line.IsManagerCanCreateBenefit || false;
				e._frequency = line.Frequency || '';
				e._formGroup = this.formBuilder.group({
					IDUDF: new FormControl({ value: e.Id, disabled: true }),
					IDPolBenefit: new FormControl({ value: this.item.Id, disabled: true }),
					Value: [e._value],
					Id: new FormControl({ value: line.Id || 0, disabled: true }),
					IsIncome: [e._isIncome],
					IsCurrency: [e._isCurrency],
					IsManagerCanCreateBenefit: [e._isManagerCanCreateBenefit],
					Frequency: [e._frequency],
				});
				// if (line.Id) {
				// 	delete line.Id;
				// 	Object.assign(e, line);
				// }
			});
		} else {
			this.UDFList = this.UDFList.filter((e) => this.item.Lines.some((line) => line.IDUDF === e.Id));
			this.UDFList.forEach((e) => {
				e.isEdit = false;
				let line = this.item.Lines.find((d) => d.IDUDF == e.Id) || {};
				e._value = line.Value || '';
				e._checked = !!line.Value;
				e._isIncome = line.IsIncome || false;
				e._isCurrency = line.IsCurrency || false;
				e._isManagerCanCreateBenefit = line.IsManagerCanCreateBenefit || false;
				e._frequency = line.Frequency || '';
				e._formGroup = this.formBuilder.group({
					IDUDF: new FormControl({ value: e.Id, disabled: true }),
					IDPolBenefit: new FormControl({ value: this.item.Id, disabled: true }),
					Value: [e._value],
					Id: new FormControl({ value: line.Id || 0, disabled: true }),
					IsIncome: [e._isIncome],
					IsCurrency: [e._isCurrency],
					IsManagerCanCreateBenefit: [e._isManagerCanCreateBenefit],
					Frequency: [e._frequency],
				});
				// if (line.Id) {
				// 	delete line.Id;
				// 	Object.assign(e, line);
				// }
			});
		}

		console.log(this.item);
		console.log(this.UDFList);

		super.loadedData(event, ignoredFromGroup);
		this.staffDataSource.initSearch();
	}

	dismiss() {
		this.modalController.dismiss();
	}

	submitModal() {
		const selectedStaffIDs = this.formGroup.controls.IDStaffList.value || [];
		const udfValues = this.UDFList.map((udf) => udf._formGroup.getRawValue());

		const result = selectedStaffIDs.map((IDStaff) => ({
			IDStaff,
			BenefitEnrollmentValue: JSON.stringify(
				udfValues.map(({ Frequency, IsCurrency, IsIncome, IsManagerCanCreateBenefit, Value, IDUDF }) => ({
					Frequency,
					IsCurrency,
					IsIncome,
					IsManagerCanCreateBenefit,
					Value,
					IDUDF,
				}))
			),
		}));

		this.modalController.dismiss(result);
	}

	async saveChange() {
		super.saveChange2();
	}
}
