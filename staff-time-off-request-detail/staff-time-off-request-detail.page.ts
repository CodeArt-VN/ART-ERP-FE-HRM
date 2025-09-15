import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { lib } from 'src/app/services/static/global-functions';
import { BRA_BranchProvider, HRM_StaffProvider, HRM_StaffTimeOffRequestProvider, HRM_LeaveTypeProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-time-off-request-detail',
	templateUrl: './staff-time-off-request-detail.page.html',
	styleUrls: ['./staff-time-off-request-detail.page.scss'],
	standalone: false,
})
export class StaffTimeOffRequestDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_StaffTimeOffRequestProvider,
		public staffProvider: HRM_StaffProvider,
		public leaveTypeProvider: HRM_LeaveTypeProvider,
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
			IDLeaveType: ['', Validators.required],
			IDStaff: ['', Validators.required],
			IDReplacementStaff: [''],
			StartDate: ['', Validators.required],
			EndDate: ['', Validators.required],
			TotalDays: ['', Validators.required],
			TotalHours: ['', Validators.required],
			RequestDate: [lib.dateFormat(new Date()), Validators.required],
			Reason: ['', Validators.required],
			ContactInfo: [''],
			HandoverNotes: [''],
			AttachmentPath: [''],
			AttachmentDescription: [''],
			Status: ['Draft'],
		});
	}

	statusDataSource = [];
	leaveTypeDataSource = [];

	preLoadData(event?: any): void {
		Promise.all([this.leaveTypeProvider.read(), this.env.getStatus('StandardApprovalStatus')]).then((values: any) => {
			this.leaveTypeDataSource = values[0].data;
			this.statusDataSource = values[1];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.item.Id) {
			this.item.RequestDate = lib.dateFormat(this.item.RequestDate);
			this.item.StartDate = lib.dateFormat(this.item.StartDate);
			this.item.EndDate = lib.dateFormat(this.item.EndDate);
		}

		super.loadedData(event, ignoredFromGroup);
		if (this.id && this.item._Staff) {
			if (!this.staffDataSource.selected.some((d) => d.Id == this.item._Staff.Id)) this.staffDataSource.selected.push(this.item._Staff);
		}
		if(!this.item._Staff){
			this.formGroup.controls.IDStaff.setValue(this.env.user.StaffID);
			this.staffDataSource.selected.push({FullName: this.env.user.FullName, Id: this.env.user.StaffID});
			this.formGroup.controls.IDStaff.markAsDirty();
		}
		this.staffDataSource.initSearch();

		if (this.id && this.item._ReplacementStaff) {
			if (!this.replacementStaffDataSource.selected.some((d) => d.Id == this.item._ReplacementStaff.Id))
				this.replacementStaffDataSource.selected.push(this.item._ReplacementStaff);
		}
		this.replacementStaffDataSource.initSearch();
		if (!this.item.Id) {
			this.formGroup.controls.Status.markAsDirty();
			this.formGroup.controls.RequestDate.markAsDirty();
		}
	}

	staffChange(e) {
		if (e) {
			this.formGroup.controls.IDStaff.setValue(e.Id);
			this.formGroup.controls.IDStaff.markAsDirty();
			this.saveChange();
		}
	}

	replacementStaffChange(e) {
		if (e) {
			this.formGroup.controls.IDReplacementStaff.setValue(e.Id);
			this.formGroup.controls.IDReplacementStaff.markAsDirty();
			this.saveChange();
		}
	}
	staffDataSource = this.buildSelectDataSource((term) => {
		const replacementId = this.formGroup.get('IDReplacementStaff')?.value;
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Term: term,
			Id_ne: replacementId ? replacementId : null,
		});
	});

	replacementStaffDataSource = this.buildSelectDataSource((term) => {
		const staffId = this.formGroup.get('IDStaff')?.value;
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Term: term,
			Id_ne: staffId ? staffId : null,
		});
	});

	checkStartEnd(changedField?: string) {
		const startDateCtrl = this.formGroup.get('StartDate');
		const endDateCtrl = this.formGroup.get('EndDate');
		const totalDaysCtrl = this.formGroup.get('TotalDays');
		const totalHoursCtrl = this.formGroup.get('TotalHours');

		const oldStart = this.item?.StartDate;
		const oldEnd = this.item?.EndDate;

		const startDate = startDateCtrl?.value;
		const endDate = endDateCtrl?.value;
		let totalDays = totalDaysCtrl?.value;
		let totalHours = totalHoursCtrl?.value;

		// Check date logic
		if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
			this.env.showMessage('End date must be after start date', 'warning');
			startDateCtrl?.setValue(oldStart);
			startDateCtrl?.markAsDirty();
			endDateCtrl?.setValue(oldEnd);
			endDateCtrl?.markAsDirty();
			return;
		}

		// StartDate, EndDate
		if (changedField === 'StartDate' || changedField === 'EndDate') {
			if (startDate && endDate) {
				const start = new Date(startDate);
				const end = new Date(endDate);
				const diffMs = end.getTime() - start.getTime();
				const calcDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
				const calcHours = Math.floor(diffMs / (1000 * 60 * 60));

				totalDaysCtrl?.setValue(calcDays > 0 ? calcDays : 0);
				totalDaysCtrl?.markAsDirty();
				totalHoursCtrl?.setValue(calcHours > 0 ? calcHours : 0);
				totalHoursCtrl?.markAsDirty();
			}
		}

		// TotalDays
		if (changedField === 'TotalDays') {
			if (startDate && totalDays && totalDays > 0) {
				const start = new Date(startDate);
				const newEnd = new Date(start);
				newEnd.setDate(start.getDate() + totalDays - 1);
				endDateCtrl?.setValue(lib.dateFormat(newEnd));
				endDateCtrl?.markAsDirty();

				const calcHours = totalDays * 24;
				totalHoursCtrl?.setValue(calcHours);
				totalHoursCtrl?.markAsDirty();
			} else if (!startDate && endDate && totalDays && totalDays > 0) {
				const end = new Date(endDate);
				const newStart = new Date(end);
				newStart.setDate(end.getDate() - totalDays + 1);
				startDateCtrl?.setValue(lib.dateFormat(newStart));
				startDateCtrl?.markAsDirty();

				const calcHours = totalDays * 24;
				totalHoursCtrl?.setValue(calcHours);
				totalHoursCtrl?.markAsDirty();
			}
		}

		// TotalHours
		if (changedField === 'TotalHours') {
			if (startDate && totalHours && totalHours > 0) {
				const start = new Date(startDate);
				const newEnd = new Date(start.getTime() + totalHours * 60 * 60 * 1000);
				endDateCtrl?.setValue(lib.dateFormat(newEnd));
				endDateCtrl?.markAsDirty();

				const calcDays = Math.floor(totalHours / 24) + (totalHours % 24 > 0 ? 1 : 0);
				totalDaysCtrl?.setValue(calcDays);
				totalDaysCtrl?.markAsDirty();
			} else if (!startDate && endDate && totalHours && totalHours > 0) {
				const end = new Date(endDate);
				const newStart = new Date(end.getTime() - totalHours * 60 * 60 * 1000);
				startDateCtrl?.setValue(lib.dateFormat(newStart));
				startDateCtrl?.markAsDirty();

				const calcDays = Math.floor(totalHours / 24) + (totalHours % 24 > 0 ? 1 : 0);
				totalDaysCtrl?.setValue(calcDays);
				totalDaysCtrl?.markAsDirty();
			}
		}

		this.saveChange();
	}

	async saveChange() {
		super.saveChange2();
	}

	savedChange(savedItem = null, form = this.formGroup) {
		super.savedChange(savedItem, form);
		this.item = savedItem;
		this.loadedData();
	}
}
