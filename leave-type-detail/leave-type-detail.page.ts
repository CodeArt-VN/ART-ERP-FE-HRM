import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';

import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_LeaveTypeProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-leave-type-detail',
	templateUrl: './leave-type-detail.page.html',
	styleUrls: ['./leave-type-detail.page.scss'],
	standalone: false,
})
export class LeaveTypeDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_LeaveTypeProvider,
		public branchProvider: BRA_BranchProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			IsPaid: [false, Validators.required],
			RequireApproval: [false, Validators.required],
			RequireDocument: [false, Validators.required],
			MaxDaysPerRequest: [null],
			MaxDaysPerYear: [null],
			MinAdvanceDays: [null],
			ApplicableGender: [null],
			MinAge: [null],
			MaxAge: [null],
			BeforeHoliday: [null],
			AfterHoliday: [null],
			BadgeColor:[''],
		});
	}
	_genderdataSource = [
		{ Code: -1, Name: 'All' },
		{ Code: 0, Name: 'Male' },
		{ Code: 1, Name: 'Female' },
	];

	changeValueInt(field: string) {
		const form = this.formGroup.get(field);
		if (form && form.value === '') {
			form.setValue(null);
		}
		this.saveChange();
	}

	changeApplicableGender() {
		const form = this.formGroup.get('ApplicableGender');
		if (form && form.value === -1) {
			form.setValue(null);
			form.markAsDirty();
		}
		this.saveChange();
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item && this.formGroup.get('ApplicableGender').value === null) {
			this.formGroup.get('ApplicableGender').setValue(-1);
		}
	}

	async saveChange() {
		if (!this.id && this.formGroup.get('ApplicableGender').value == -1) {
			this.formGroup.get('ApplicableGender').setValue(null);
			this.formGroup.get('ApplicableGender').markAsDirty();
		}
		super.saveChange2();
	}

	savedChange(savedItem = null, form = this.formGroup) {
		super.savedChange(savedItem, form);
		this.item = savedItem;
		this.loadedData(null);
	}
}
