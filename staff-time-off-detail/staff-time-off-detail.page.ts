import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { lib } from 'src/app/services/static/global-functions';
import { BRA_BranchProvider, HRM_StaffProvider, HRM_StaffTimeOffProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-time-off-detail',
	templateUrl: './staff-time-off-detail.page.html',
	styleUrls: ['./staff-time-off-detail.page.scss'],
	standalone: false,
})
export class StaffTimeOffDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffTimeOffProvider,
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
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			IDStaff: ['', Validators.required],
			Date: [''],
			Start: [''],
			End: [''],
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.item.Date = lib.dateFormat(this.item.Date);
		if (this.id && this.item._Staff) {
			if (!this.staffDataSource.selected.some((d) => d.Id == this.item._Staff.Id)) this.staffDataSource.selected.push(this.item._Staff);
		}
		this.staffDataSource.initSearch();
		super.loadedData(event, ignoredFromGroup);
	}

	staffChange(e) {
		if (e) {
			this.formGroup.controls.IDStaff.setValue(e.Id);
			this.formGroup.controls.IDStaff.markAsDirty();
			this.saveChange();
		}
	}
	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Term: term,
		});
	});

	checkStartEnd() {
		const start = this.formGroup.get('Start')?.value;
		const end = this.formGroup.get('End')?.value;
		if (start && end && start >= end) {
			this.env.showMessage('Finishing time must be after starting time', 'warning');
			return false;
		}
		return true;
	}

	async saveChange() {
		super.saveChange2();
	}

	savedChange(savedItem = null, form = this.formGroup) {
		super.savedChange(savedItem, form);
		this.item = savedItem;
		this.loadedData(null);
	}
}
