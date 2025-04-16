import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolInsuranceProvider,
	HRM_StaffPolInsuranceEnrollmentProvider,
	HRM_StaffProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-insurance-enrollment-detail',
	templateUrl: './insurance-enrollment-detail.page.html',
	styleUrls: ['./insurance-enrollment-detail.page.scss'],
	standalone: false,
})
export class InsuranceEnrollmentDetailPage extends PageBase {
	statusList = [];
	typeList = [];
	polInsuranceList = [];
	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});
	constructor(
		public pageProvider: HRM_StaffPolInsuranceEnrollmentProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public staffProvider: HRM_StaffProvider,
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
			IDPolInsurance: ['', Validators.required],
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
			EnrollmentDate: ['', Validators.required],
			Type: ['', Validators.required],
			Status: ['Draft', Validators.required],
			IDStaffList: [''],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.env.getType('HRMInsuranceType'), this.polInsuranceProvider.read()]).then((values: any) => {
			this.statusList = values[0];
			this.typeList = values[1]; //Chưa khai báo system type cho enrollment
			this.polInsuranceList = values[2].data;
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item?.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
			this.formGroup.controls.IDBranch.markAsDirty();
		} else {
			if (this.item.IDStaffList) {
				this.formGroup.controls.IDStaffList.setValue(JSON.parse(this.item.IDStaffList));
			}
			this.staffDataSource.selected = [];
			if (this.item._Staffs) {
				this.item._Staffs.forEach((element) => {
					this.staffDataSource.selected.push(element);
				});
			}
		}
		this.staffDataSource.initSearch();
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		if (savedItem.IDStaffList) {
			this.formGroup.controls.IDStaffList.setValue(JSON.parse(savedItem.IDStaffList));
		} else {
			this.formGroup.controls.IDStaffList.setValue(JSON.parse(this.item.IDStaffList));
		}
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	async saveChange() {
		if (this.formGroup.controls.IDStaffList.value != '') {
			this.formGroup.controls.IDStaffList.setValue(JSON.stringify(this.formGroup.controls.IDStaffList.value));
		}
		super.saveChange2();
	}
}
