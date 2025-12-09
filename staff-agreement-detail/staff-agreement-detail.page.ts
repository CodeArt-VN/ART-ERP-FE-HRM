import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	CRM_ContactProvider,
	HRM_StaffAgreementProvider,
	HRM_StaffProvider,
	SYS_ConfigProvider,
	WMS_ItemProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({ 
		selector: 'app-staff-agreement-detail', 
		templateUrl: './staff-agreement-detail.page.html', 
		styleUrls: ['./staff-agreement-detail.page.scss'], 
		standalone: false })
export class StaffAgreementDetailPage extends PageBase {
	checkingCanEdit = false;
	statusList = [];
	statusLineList = [];
	contentTypeList = [];
	branchList;
	markAsPristine = false;
	_currentVendor;
	_isVendorSearch = false;
	_vendorDataSource = this.buildSelectDataSource((term) => {
		return this.contactProvider.search({ SkipAddress: true, IsVendor: true, SortBy: ['Id_desc'], Take: 20, Skip: 0, Term: term });
	});

	_staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});

	constructor(
		public pageProvider: HRM_StaffAgreementProvider,
		public contactProvider: CRM_ContactProvider,
		public branchProvider: BRA_BranchProvider,
		public itemProvider: WMS_ItemProvider,
		public sysConfigProvider: SYS_ConfigProvider,
		public popoverCtrl: PopoverController,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public staffProvider: HRM_StaffProvider
	) {
		super();
		this.buildFormGroup();
		this.pageConfig.isDetailPage = true;
	}
	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			IDStaff: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: [''],
			Remark: [''],
			Sort: [''],
			Status: new FormControl({ value: 'Draft', disabled: true }, Validators.required),
			EffectiveFrom: ['', Validators.required],
			EffectiveTo: ['', Validators.required],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			Lines: this.formBuilder.array([]),
			DeletedLines: [''],
		});
	}
	preLoadData(event) {
		Promise.all([
			this.env.getStatus('PurchaseRequest')
		]).then((values: any) => {
			if (values[0]) this.statusList = values[0];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.pageConfig.canEdit = this.checkingCanEdit;
		this.buildFormGroup();
		if (!this.item.Id) {
			this.item.IDStaff = this.env.user.StaffID;
			this.item._Staff = { Id: this.env.user.StaffID, FullName: this.env.user.FullName };
		}
		
		super.loadedData(event);

		if (this.item._Staff) {
			this._staffDataSource.selected.push(lib.cloneObject(this.item._Staff));
		}

		this._staffDataSource.initSearch();

		if (!this.item.Id) {
			this.formGroup.get('Status').markAsDirty();
			this.formGroup.get('IDStaff').markAsDirty();
		}
		// if (this.formGroup.get('Id').value && this.formGroup.get('Status').value != 'Draft' && this.formGroup.get('Status').value != 'Unapproved') {
		// 	this.formGroup.disable();
		// 	this.pageConfig.canEdit = false;
		// }


	}

	removeItem(Ids) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		if (Ids && Ids.length > 0) {
			this.formGroup.get('DeletedLines').setValue(Ids);
			this.formGroup.get('DeletedLines').markAsDirty();
			this.saveChange().then((s) => {
				Ids.forEach((id) => {
					let index = groups.controls.findIndex((x) => x.get('Id').value == id);
					if (index >= 0) groups.removeAt(index);
				});
			});
		}
	}

	setLines() {
		this.formGroup.controls.Lines = new FormArray([]);
		if (this.item?._Items?.length) {
			const sortedLines = this.item._Items?.slice().sort((a, b) => a.Sort - b.Sort);
			sortedLines.forEach((i) => {
				this.addItemLine(i);
			});
		}

		let groups = <FormArray>this.formGroup.controls.Lines;
		groups.value.sort((a, b) => a.Sort - b.Sort);
		groups.controls.sort((a, b) => a.value['Sort'] - b.value['Sort']);
		this.formGroup.controls.Lines.patchValue(groups.value);
	}

	addItemLine(line) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			_IDItemDataSource: this.buildSelectDataSource((term) => {
				return this.itemProvider.search({
					SortBy: ['Id_desc'],
					Take: 20,
					Skip: 0,
					Term: term,
				});
			}),
			Id: [line?.Id],
			Name: [line?.Name],
			Code: [line?.Code],
			IDItem: [line?.IDItem, Validators.required],
			Sort: [line?.Sort],
			IsChecked: [false],
			IsDisabled: [line?.IsDisabled],
		});
		let _item = {
			Id: line?.IDItem,
			Code: line?.Code,
			Name: line?.Name,
		};
		if (line) group.get('_IDItemDataSource').value.selected.push(_item);
		group.get('_IDItemDataSource').value.initSearch();
		groups.push(group);
	}

	changeDate() {
		if (this.submitAttempt) return;
		this.submitAttempt = true;

		const effectiveFrom = this.formGroup.controls.EffectiveFrom.value;
		const effectiveTo = this.formGroup.controls.EffectiveTo.value;
		const from = new Date(effectiveFrom);
		const to = new Date(effectiveTo);

		if (to < from) {
			this.env.showMessage('Please select a future date', 'warning');
			this.formGroup.controls.EffectiveFrom.setValue(this.item.EffectiveFrom);
			this.formGroup.controls.EffectiveTo.setValue(this.item.EffectiveTo);
			this.formGroup.controls.EffectiveFrom.markAsPristine();
			this.formGroup.controls.EffectiveTo.markAsPristine();
			this.submitAttempt = false;
		} else {
			this.submitAttempt = false;
			this.saveChange();
		}
	}

	async saveChange() {
		return super.saveChange2();
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		this.item = savedItem;
		this.loadedData();
	}
	
	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	
}
