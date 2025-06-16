import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PolBenefitDetailProvider, HRM_PolBenefitProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';
import { BenefitPolicyDetailModalPage } from './benefit-policy-detail-modal/benefit-policy-detail-modal.page';

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
	UDFList = [];
	UDFModal = [];
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
			DeletedLines: [],
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

		Promise.all([this.env.getType('WelfareType'), this.env.getType('WelfareFrequencyType'), this.hrmUDFProvider.read({ Group: 'Benefits' })]).then((values: any) => {
			this.typeList = values[0];
			// this.frequencyList = values[1];
			this.UDFList = values[2].data;
			super.preLoadData();
		});
	}

	loadData(event?: any): void {
		super.loadData(event);
	}

	changeSelection(i: any, e?: any): void {
		super.changeSelection(i, e);
		if (i.selectedItems) {
			let selectedItems = `[${i.selectedItems.map((x: any) => x.Id).join(',')}]`;
			this.formGroup.controls.UDFList.setValue(selectedItems);
			this.formGroup.controls.UDFList.markAsDirty();
			this.saveChange2();
		}
	}

	loadedData(event?) {
		super.loadedData(event);
		this.item?.Lines?.forEach((item) => {
			item.ControlType = this.UDFList.find((x) => x.Id === item.IDUDF)?.ControlType || 'text';
		});
		this.setLines();
	}
	saveChange() {
		return super.saveChange2();
	}
	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem);
		this.item = savedItem;
	}

	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	selectRow(row) {
		row._checked = !row._checked;
		if (row._checked) {
			this.saveRow(row);
		} else {
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
		super.saveChange2(row._formGroup, this.pageConfig.pageName, this.welfareDetailProvider).then((data: any) => {
			this.refresh();
		});
	}

	setLines() {
		this.formGroup.controls.Lines = new FormArray([]);
		if (this.item?.Lines?.length)
			this.item?.Lines.forEach((i) => {
				this.addLine(i);
			});
	}

	addLine(line, openModal = false) {
		let udf = this.UDFList.find((x) => x.Id === line?.IDUDF);
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			IDUDF: [line.IDUDF],
			Id: [line.Id],
			IsManagerCanCreateInsurance: [line.IsManagerCanCreateInsurance],
			IsIncome: [line.IsIncome],
			IsCurrency: [line.IsCurrency],
			IsManagerCanCreateBenefit: [line.IsManagerCanCreateBenefit],
			Value: [line._Value, Validators.required],
			Frequency: [line.Frequency, Validators.required],
			ControlType: [udf?.ControlType || 'text'],
			
		});
		groups.push(group);
		if (openModal) this.showModal(group);
	}

	removeLine(i) {
		this.env.showPrompt('Are you sure you want to delete selected benefit?', null, 'Delete').then((_) => {
			this.formGroup.get('DeletedLines').setValue([i.Id]);
			this.formGroup.get('DeletedLines').markAsDirty();
			this.saveChange2().then((savedItem) => {
				this.item = savedItem;
				this.loadedData();
			});
		});
	}
	editLine(i) {
		const groups = <FormArray>this.formGroup.controls.Lines;
		const group = groups.controls.find((x) => x.get('Id').value === i.Id);
		this.showModal(group);
	}

	async showModal(i) {
		if (!i.controls.Id.value) this.UDFModal = this.UDFList.filter((udf) => !this.item.Lines.some((line) => line.IDUDF === udf.Id));
		else this.UDFModal = this.UDFList;
		const modal = await this.modalController.create({
			component: BenefitPolicyDetailModalPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				line: i,
				UDFList: this.UDFModal,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			const groups = <FormArray>this.formGroup.controls.Lines;
			const existingIndex = groups.controls.findIndex((x) => x.get('Id').value === data.Id);
			if (existingIndex >= 0) {
				Object.keys(i).forEach((key) => {
					if (groups.at(existingIndex).get(key) && i[key] != groups.at(existingIndex).get(key)?.value) {
						groups.at(existingIndex).get(key).setValue(i[key]);
						groups.at(existingIndex).get(key).markAsDirty();
					}
				});
			} else {
				this.addLine(data);
			}
			this.saveChange();
		}
	}
}
