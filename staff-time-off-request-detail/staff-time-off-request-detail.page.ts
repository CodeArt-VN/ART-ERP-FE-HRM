import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { CommonService } from 'src/app/services/core/common.service';
import { EnvService } from 'src/app/services/core/env.service';
import { lib } from 'src/app/services/static/global-functions';
import { BRA_BranchProvider, HRM_StaffProvider, HRM_StaffTimeOffRequestProvider, HRM_LeaveTypeProvider, HRM_PolicyHolidayProvider } from 'src/app/services/static/services.service';

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
		public holidayProvider: HRM_PolicyHolidayProvider,
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
			// TotalDays: new FormControl({ value: 0, disabled: true }),
			// TotalHours: new FormControl({ value: 0, disabled: true }),
			TotalDays: [''],
			TotalHours: [''],
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
	holidayDataSource = [];
	selectedStaff: any = null;

	preLoadData(event?: any): void {
		Promise.all([this.leaveTypeProvider.read(), this.holidayProvider.read(), this.env.getStatus('StandardApprovalStatus')]).then((values: any) => {
			this.leaveTypeDataSource = values[0].data;
			this.holidayDataSource = values[1].data;
			this.statusDataSource = values[2];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item.RequestDate) {
			this.formGroup.controls.RequestDate.setValue(this.item.RequestDate);
		} else {
			this.formGroup.controls.RequestDate.setValue(lib.dateFormat(new Date(), 'yyyy-mm-ddThh:MM:ss'));
			this.formGroup.controls.RequestDate.markAsDirty();
		}
		if (this.id && this.item._Staff) {
			if (!this.staffDataSource.selected.some((d) => d.Id == this.item._Staff.Id)) this.staffDataSource.selected.push(this.item._Staff);
		}
		if (!this.item._Staff) {
			this.formGroup.controls.IDStaff.setValue(this.env.user.StaffID);
			this.staffDataSource.selected.push({ FullName: this.env.user.FullName, Id: this.env.user.StaffID });
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

		const leaveTypeId = this.formGroup.get('IDLeaveType')?.value;
		const leaveTypeData = this.leaveTypeDataSource.find((x) => x.Id == leaveTypeId);
		const leaveTypeCode = leaveTypeData?.Code;
		if (leaveTypeCode === 'AL') {
			this.getSelectedStaff();
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
			Keyword: term ,
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

	validateStartEnd() {
		const startDateCtrl = this.formGroup.get('StartDate');
		const endDateCtrl = this.formGroup.get('EndDate');
		const leaveTypeId = this.formGroup.get('IDLeaveType')?.value;

		const startDate = startDateCtrl?.value ? new Date(startDateCtrl.value) : null;
		const endDate = endDateCtrl?.value ? new Date(endDateCtrl.value) : null;

		const leaveTypeData = this.leaveTypeDataSource.find((x) => x.Id == leaveTypeId);
		const leaveTypeCode = leaveTypeData?.Code;
		const maxDaysPerRequest = leaveTypeData?.MaxDaysPerRequest;
		const maxDaysPerYear = leaveTypeData?.MaxDaysPerYear;
		const minAdvanceDays = leaveTypeData?.MinAdvanceDays;

		// Kiểm tra ngày kết thúc phải >= ngày bắt đầu
		if (!startDate || !endDate) return;

		// check holiday
		this.validateHoliday();
		if (endDate < startDate) {
			this.env.showMessage('End date must be after or equal to start date', 'danger');
			endDateCtrl?.setValue('');
			endDateCtrl?.markAsDirty();
			return;
		}
		// tính số ngày nghỉ
		let days = 0;
		let leaveHours = 0;
		leaveHours = this.calcLeaveHours(startDate, endDate);

		days = leaveHours / 8;
		days = Math.round(days * 100) / 100;
		this.formGroup.get('TotalDays').setValue(days);
		this.formGroup.get('TotalDays').markAsDirty();
		this.formGroup.get('TotalHours').setValue(leaveHours);
		this.formGroup.get('TotalHours').markAsDirty();

		if (maxDaysPerRequest && days > maxDaysPerRequest) {
			this.env.showMessage('You can only request up to {value} days for this leave type', 'danger', { value: maxDaysPerRequest });
			endDateCtrl?.setValue('');
			endDateCtrl?.markAsDirty();
			return;
		}
		if (leaveTypeCode === 'AL') {
			const remainingDays = this.selectedStaff?.LeaveDaysRemaining ?? 0;
			if (days > remainingDays) {
				this.env.showMessage('You only have {value} annual leave days left, you cannot request {value1} days', 'danger', { value: remainingDays, value1: days });
				endDateCtrl?.setValue('');
				endDateCtrl?.markAsDirty();
				return;
			}
			if (maxDaysPerYear && days > maxDaysPerYear) {
				this.env.showMessage('You cannot request more than {value} days per year for this leave type', 'danger', { value: maxDaysPerYear });

				endDateCtrl?.setValue('');
				endDateCtrl?.markAsDirty();
				return;
			}
		}
		if (minAdvanceDays) {
			const today = new Date();
			const todayStart = new Date(today.setHours(0, 0, 0, 0)); // reset về 00:00 hôm nay
			const diffAdvance = (startDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24);
			if (diffAdvance < minAdvanceDays) {
				this.env.showMessage('You must request at least {value} days in advance', 'danger', { value: minAdvanceDays });
				startDateCtrl?.setValue('');
				startDateCtrl?.markAsDirty();
				return;
			}
		}

		this.saveChange();
	}

	private validateHoliday() {
		const startDateCtrl = this.formGroup.get('StartDate');
		const endDateCtrl = this.formGroup.get('EndDate');
		const leaveTypeId = this.formGroup.get('IDLeaveType')?.value;
		const start = startDateCtrl?.value ? new Date(startDateCtrl.value) : null;
		const end = endDateCtrl?.value ? new Date(endDateCtrl.value) : null;
		const leaveTypeData = this.leaveTypeDataSource.find((x) => x.Id == leaveTypeId);

		if (!start || !end || !leaveTypeData) return;

		let holidays = this.holidayDataSource;
		const beforeHoliday = leaveTypeData.BeforeHoliday ?? 0;
		const afterHoliday = leaveTypeData.AfterHoliday ?? 0;

		for (let holiday of holidays) {
			const holidayStart = new Date(holiday.FromDate);
			const holidayEnd = new Date(holiday.ToDate);
			if (!(end < holidayStart || start > holidayEnd)) {
				this.env.showMessage('You cannot request leave during holiday period', 'danger');
				this.formGroup.get('EndDate')?.setValue('');
				return;
			}
			// Trước kỳ nghỉ lễ
			if (end < holidayStart) {
				const diffDays = Math.floor((holidayStart.getTime() - end.getTime()) / (1000 * 3600 * 24));
				if (diffDays < beforeHoliday) {
					this.env.showMessage(`You must leave at least ${beforeHoliday} days before holiday (${holidayStart.toDateString()})`, 'danger');
					this.formGroup.get('EndDate')?.setValue('');
					return;
				}
			}

			// Sau kỳ nghỉ lễ
			if (start > holidayEnd) {
				const diffDays = Math.floor((start.getTime() - holidayEnd.getTime()) / (1000 * 3600 * 24));
				if (diffDays < afterHoliday) {
					this.env.showMessage(`You must leave at least ${afterHoliday} days after holiday (${holidayEnd.toDateString()})`, 'danger');
					this.formGroup.get('StartDate')?.setValue('');
					return;
				}
			}
		}
	}

	private calcLeaveHours(start: Date, end: Date): number {
		if (end <= start) return 0;

		let total = 0;
		let current = new Date(start);

		// chuẩn hoá về 0h đầu ngày của current
		current.setHours(0, 0, 0, 0);

		while (current <= end) {
			// ranh giới đầu & cuối của ngày hiện tại
			const dayStart = new Date(current);
			const dayEnd = new Date(current);
			dayEnd.setHours(23, 59, 59, 999);

			// khoảng nghỉ thực tế nằm trong ngày hiện tại
			const realStart = start > dayStart ? start : dayStart;
			const realEnd = end < dayEnd ? end : dayEnd;

			const hours = (realEnd.getTime() - realStart.getTime()) / 36e5; // ms → giờ
			total += Math.min(Math.max(hours, 0), 8); // không âm, max 8

			// sang ngày kế tiếp
			current.setDate(current.getDate() + 1);
		}
		return total;
	}

	getSelectedStaff() {
		const staffId = this.formGroup.get('IDStaff')?.value;
		return new Promise((resolve, reject) => {
			if (!staffId) {
				this.selectedStaff = null;
				resolve(null);
				return;
			}
			this.staffProvider
				.read({ Id: staffId })
				.then((staffRes: any) => {
					if (staffRes?.data?.length) {
						this.selectedStaff = staffRes.data[0];
						resolve(this.selectedStaff);
					} else {
						this.selectedStaff = null;
						resolve(null);
					}
				})
				.catch((err) => {
					this.selectedStaff = null;
					reject(err);
				});
		});
	}

	changeLeaveType(e) {
		if (e) {
			if (e.RequireDocument) {
				this.formGroup.controls.AttachmentPath.addValidators(Validators.required);
			} else {
				this.formGroup.controls.AttachmentPath.clearValidators();
			}
			this.formGroup.controls.AttachmentPath.updateValueAndValidity();
			this.formGroup.controls.IDLeaveType.setValue(e.Id);
			this.formGroup.controls.IDLeaveType.markAsDirty();
			this.validateHoliday();
			if (e.Code === 'AL') {
				this.getSelectedStaff()
					.then(() => {
						this.saveChange();
					})
					.catch(() => {
						this.saveChange();
					});
			} else {
				this.saveChange();
			}
		}
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
