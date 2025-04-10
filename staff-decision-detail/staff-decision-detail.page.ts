import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolSalaryProvider,
	HRM_StaffDecisionProvider,
	HRM_StaffPolEmployeeDecisionProvider,
	HRM_StaffProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { s } from '@fullcalendar/core/internal-common';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-decision-detail',
	templateUrl: './staff-decision-detail.page.html',
	styleUrls: ['./staff-decision-detail.page.scss'],
	standalone: false,
})
export class StaffDecisionDetailPage extends PageBase {
	statusList = [];
	branchList = [];
	jobTitleList = [];
	polSalaryList = [];
	polEmployeeDecisionList = [];
	employmentTypeList = [];
	workAreaTypeList = [];
	workTypeList = [];
	constructor(
		public pageProvider: HRM_StaffDecisionProvider,
		public polEmployeeDecisionProvider: HRM_StaffPolEmployeeDecisionProvider,
		public staffProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public polSalaryProvider: HRM_PolSalaryProvider,
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
			IDDepartment: [''],
			IDJobTitle: [''],
			IDPolEmployeeDecision: [''],
			IDStaff: ['', Validators.required],
			IDRequester: ['', Validators.required],
			IDPolSalary: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: ['', Validators.required],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			Status: new FormControl({ value: 'Draft', disabled: true }),
			IsConcurrentPosition: [false],
			Area: [''],
			Office: [''],
			EmploymentType: [''],
			PayrollPolicy: [''],
			WorkType: [''],
			BasicSalary: [''],
			Salary: [''],
			IsNotApplySalary: [false],
			ConsultedPerson: [''],
			DecisionSignDate: [''],
			DecisionEffectiveDate: [''],
			ProbationPeriod: [''],
		});
	}
	// branchList = this.buildSelectDataSource((term) => {
	// 	return this.branchProvider.search({ SortBy: ['Id_desc'], Take: 20, Skip: 0, Term: term });
	// });
	staffList = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});

	preLoadData(event?: any): void {
		this.jobTitleList = [...this.env.jobTitleList];
		this.branchList = [...this.env.branchList];
		Promise.all([
			this.env.getStatus('StandardApprovalStatus'),
			this.polSalaryProvider.read(),
			this.polEmployeeDecisionProvider.read(),
			this.env.getType('TimesheetType'),
			this.env.getType('WorkAreaType'),
			this.env.getType('HRMWorkType'),
		]).then((res: any) => {
			this.statusList = res[0];
			this.polSalaryList = res[1].data;
			this.polEmployeeDecisionList = res[2].data;
			this.employmentTypeList = res[3];
			this.workAreaTypeList = res[4];
			this.workTypeList = res[5];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item) {
			if (this.item.EmploymentType) {
				this.formGroup.controls.EmploymentType.setValue(JSON.parse(this.item.EmploymentType));
			}
			this.staffList.selected = [];
			this.staffList.selected.push(this.item._Staff);
		} else {
			this.formGroup.controls.IDRequester.setValue(this.env.user.StaffID);
			this.formGroup.controls.IDRequester.markAsDirty();
			this.formGroup.controls.Status.markAsDirty();
		}

		this.staffList.initSearch();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}
	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		if (savedItem.EmploymentType) {
			this.formGroup.controls.EmploymentType.setValue(JSON.parse(savedItem.EmploymentType));
		} else {
			this.formGroup.controls.EmploymentType.setValue(JSON.parse(this.item.EmploymentType));
		}
	}

	async saveChange() {
		if (this.formGroup.controls.EmploymentType.value != '') {
			this.formGroup.controls.EmploymentType.setValue(JSON.stringify(this.formGroup.controls.EmploymentType.value));
		}
		super.saveChange2();
	}
}
