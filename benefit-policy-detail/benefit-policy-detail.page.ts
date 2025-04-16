import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {   HRM_PolBenefitDetailProvider, HRM_PolBenefitProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-benefit-policy-detail',
	templateUrl: 'benefit-policy-detail.page.html',
	styleUrls: ['benefit-policy-detail.page.scss'],
	standalone: false,
})
export class BenefitPolicyDetailPage extends PageBase {
	branchList = [];
	frequencyList = [];
	typeList = [];
	currencyUnitTypeList = [];
	segmentView = 's1';
	UDFItems;
	constructor(
		public pageProvider: HRM_PolBenefitProvider,
		public welfareDetailProvider: HRM_PolBenefitDetailProvider,
		public hrmUDFProvider: HRM_UDFProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public route: ActivatedRoute,
		public cdr: ChangeDetectorRef,
		public router: Router,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.buildFormGroup();
	}

	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			Name: ['', Validators.required],
			Code: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9.\\-]+$')]],
			Remark: [''],
			Value: [''],
			Type: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			Lines: this.formBuilder.array([]),
		});
	}

	preLoadData() {
		//frequencyList load tu db
		this.frequencyList = [
			{ Id: 1, Code: 'Payroll', Name: 'Payroll' },
			{ Id: 2, Code: 'Weekly', Name: 'Weekly' },
			{ Id: 3, Code: 'Monthly', Name: 'Monthly' },
			{ Id: 4, Code: 'Yearly', Name: 'Yearly' },
			{ Id: 5, Code: 'Event', Name: 'Event' }, // sự kiện
		];

		Promise.all([
			this.env.getType('WelfareType'),
			this.env.getType('WelfareFrequencyType'),
			this.hrmUDFProvider.read({Group: 'Benefits'}),
		]).then((values : any) => {
			this.typeList = values[0];
			// this.frequencyList = values[1];
			this.UDFItems = values[2].data;
			super.preLoadData();
		});
	}

	loadData(event?: any): void {
		super.loadData(event);
	}

	loadedData(event) {
		this.UDFItems.forEach((i) => {
			i.isEdit = false; // set isEdit = false for all items
			let line = this.item.Lines?.find((x) => x.IDUDF === i.Id);
			i._value = line ? line.Value : '';
			i._checked = line ? true : false;
			i._isIncome = line ? line.IsIncome : false;
			i._isCurrency = line ? line.IsCurrency : false;
			i._isManagerCanCreateBenefit = line ? line.IsManagerCanCreateBenefit : false;
			i._frequency = line ? line.Frequency : '';
			let idDetail = line ? line.Id : 0;
			i._formGroup = this.formBuilder.group({
				IDUDF: new FormControl({ value: i.Id, disabled: true }),
				IDPolBenefit: new FormControl({ value: this.item.Id, disabled: true }),
				Value: [i._value],
				Id : new FormControl({ value: idDetail, disabled: true }),
				IsIncome:[line ? line.IsIncome : false],
				IsCurrency:[line ? line.IsCurrency : false],
				IsManagerCanCreateBenefit:[line ? line.IsManagerCanCreateBenefit : false],
				Frequency :[line ? line.Frequency : ''],
			});

		});
		super.loadedData(event);
	}
	saveChange() {
		return super.saveChange2();
	}

	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	selectRow(row) {
		row._checked = !row._checked;
		if(row._checked) {
			this.saveRow(row);
		}else{
			this.welfareDetailProvider.disable(row._formGroup.getRawValue(), !row._checked).then((data: any) => {
				this.refresh();
			});
		}
		
	}
	editRow(row) {
		row.isEdit = true;
	}

	cancelRow(row) {
		row.isEdit = false;
	}

	saveRow(row) {
		row.isEdit = false;
		row._formGroup.controls.IDUDF.markAsDirty();
		row._formGroup.controls.IDPolBenefit.markAsDirty();
		// let arr = <FormArray>this.formGroup.controls.Lines;
		// let existingRowIndex = arr.controls.findIndex((control: any) => control.controls.IDUDF.value === row._formGroup.get('IDUDF').value);
		// if (existingRowIndex !== -1) {
		// 	arr.at(existingRowIndex).patchValue(row._formGroup.getRawValue());
		// 	Object.keys(this.getDirtyValues(row._formGroup)).forEach((key) => {
		// 		arr.at(existingRowIndex).get(key).markAsDirty();
		// 	});
		// } else {
		// 	arr.push(row._formGroup);
		// }
		// this.formGroup.controls.Lines.markAsDirty();
		super.saveChange2(row._formGroup,this.pageConfig.pageName,this.welfareDetailProvider).then((data: any) => {this.refresh()});
	}
}
