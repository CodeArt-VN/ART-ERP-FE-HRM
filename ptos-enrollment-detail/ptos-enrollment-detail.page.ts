import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_PolicyPaidTimeOffProvider, HRM_StaffProvider, HRM_StaffPTOEnrollmentProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
	selector: 'app-ptos-enrollment-detail',
	templateUrl: './ptos-enrollment-detail.page.html',
	styleUrls: ['./ptos-enrollment-detail.page.scss'],
	standalone: false,
})
export class PTOsEnrollmentDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffPTOEnrollmentProvider,
		public policyPaidTimeOffProvider: HRM_PolicyPaidTimeOffProvider,
		public staffProvider: HRM_StaffProvider,

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
			IDPolicyPTO: ['', Validators.required],
			IDStaff: ['', Validators.required],
			StartDate: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: [''],
			Remark: [''],
			PTOBalance: ['', Validators.required],
			PTOCarryOver: ['', Validators.required],
			PTOYearEarned: ['', Validators.required],
			PTOLengthOfService: ['', Validators.required],
			PTOCompensatoryLeave: ['', Validators.required],
			StartWorkingDate: [],
		});
	}

	ptoList = [];
	preLoadData(event?: any): void {
		this.policyPaidTimeOffProvider.read().then((resp) => {
			this.ptoList = resp['data'];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);

		if (this.id && this.item.Staff) {
			if (!this.staffDataSource.selected.some((d) => d.Id == this.item.Staff.Id)) this.staffDataSource.selected.push(this.item.Staff);
			// this.staffSelected = this.item.Staff;
			// this.staffListSelected.push(this.item.Staff);
		}
		// this.staffSearch();
		this.staffDataSource.initSearch();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}


	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Keyword: term 
		});
	});

	staffChange(e) {
		if (e) {
			this.formGroup.controls.StartWorkingDate.setValue(e.StartDate);
			this.formGroup.controls.StartWorkingDate.markAsDirty();
			this.saveChange();
		}
	}

	async saveChange() {
		super.saveChange2();
	}
}
