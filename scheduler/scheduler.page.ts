import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_OpenScheduleProvider,
	HRM_ShiftProvider,
	HRM_StaffScheduleProvider,
	HRM_StaffTimesheetEnrollmentProvider,
	HRM_TimesheetProvider,
	OST_OfficeProvider,
	HRM_StaffOvertimeRequestProvider,
	HRM_StaffRecordOvertimeProvider,
	HRM_TimesheetCycleDetailProvider,
	OST_OfficeGateProvider,
	HRM_TimesheetLogProvider,
	HRM_TimesheetCycleProvider,
	HRM_TimesheetRecordProvider,
	HRM_LeaveTypeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
import { SchedulerGeneratorPage } from '../scheduler-generator/scheduler-generator.page';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';

import { OvertimeRequestDetailPage } from '../overtime-request-detail/overtime-request-detail.page';
import { AdvanceFilterModalComponent } from 'src/app/modals/advance-filter-modal/advance-filter-modal.component';
import { CheckinLogComponent } from './checkin-log/checkin-log.page';
import { TimesheetCycleDetailComponent } from './timesheet-cycle/timesheet-cycle-detail.page';
import { TimesheetCycleSelectModalComponent } from './timesheet-cycle-select-modal/timesheet-cycle-select-modal.page';
import { PopoverPage } from '../../SYS/popover/popover.page';
import { LogGeneratorPage } from '../log-generator/log-generator.page';
import { PointModalPage } from '../point-modal/point-modal.page';
import { TimesheetLogPage } from './timesheet-log/timesheet-log.page';
import { StaffPayrollModalPage } from '../staff-payroll-modal/staff-payroll-modal.page';
import { StaffTimesheetCalculationModalPage } from '../staff-timesheet-calculation-modal/staff-timesheet-calculation-modal.page';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { el, ew } from '@fullcalendar/core/internal-common';

@Component({
	selector: 'app-scheduler',
	templateUrl: 'scheduler.page.html',
	styleUrls: ['scheduler.page.scss'],
	standalone: false,
})
export class SchedulerPage extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	idCycle: any = 0;
	officeList = [];
	timesheetList = [];
	selectedTimesheet = null;
	shiftList = [];
	shifTypeList = [];
	timeoffTypeList: any = [];
	OTStatusList = [];
	fc: any = null;
	isOpenPopover = false;
	staffList = [];
	navigateObj: any = {};
	allResources = [];
	gateList = [];
	cycle: any;
	formGroupDate: any;
	tooltipResource = '';
	constructor(
		public pageProvider: HRM_StaffScheduleProvider,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public timesheetCycleProvider: HRM_TimesheetCycleProvider,
		public timesheetRecordProvider: HRM_TimesheetRecordProvider,
		public openScheduleProvider: HRM_OpenScheduleProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public overtimeRequestProvider: HRM_StaffOvertimeRequestProvider,
		public staffRecordOvertimeProvider: HRM_StaffRecordOvertimeProvider,
		public officeProvider: OST_OfficeProvider,
		public shiftProvider: HRM_ShiftProvider,
		public leaveTypeProvider: HRM_LeaveTypeProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,
		public timesheetCycleDetailProvider: HRM_TimesheetCycleDetailProvider,
		public gateProvider: OST_OfficeGateProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public router: Router,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public translate: TranslateService
	) {
		super();
		// this.pageConfig.isShowFeature = true;
		this.pageConfig.ShowSearch = false;
		const today = new Date().toISOString().split('T')[0];
		console.log('today', today);
		this.formGroupDate = this.formBuilder.group({
			singleDate: [today],
		});

		this.translate.get('The employee has been removed from the work schedule.').subscribe((text) => {
			this.tooltipResource = text;
		});
	}

	async openCycleModal() {
		await this.getTimesheetCycle();
		this.loadData();
	}
	async getTimesheetCycle(): Promise<void> {
		this._timesheetCycleList = [];
		const resp = await this.timesheetCycleDetailProvider.read({
			IDTimesheet: this.id,
			Date: new Date(this.fc?.view.activeStart),
		});

		if (resp['data'] && resp['data'].length > 1) {
			this._timesheetCycleList = resp['data'].map((d) => d._TimesheetCycle);

			const popover = await this.popoverCtrl.create({
				component: TimesheetCycleSelectModalComponent,
				componentProps: { _timesheetCycleList: this._timesheetCycleList },
				cssClass: 'w300',
				translucent: true,
			});
			await popover.present();

			const result = await popover.onDidDismiss();
			if (result.data && result.data.IDCycle) {
				this.idCycle = result.data.IDCycle;
				this.segmentView = 's3';
			}
		} else if (resp['data'] && resp['data'].length == 1) {
			this.idCycle = resp['data'][0]?.IDTimesheetCycle;
			this.segmentView = 's3';
		} else {
			this.segmentView = 's3';
			this.env.showMessage('No timesheet cycle found for this date', 'warning');
		}
	}

	segmentView = 's1';
	_timesheetCycleList: any[] = [];
	async segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
		if (ev.detail.value == 's3') {
			if (!this.idCycle) {
				// await this.getTimesheetCycle(); // đợi xong mới gọi loadData
				this.loadData();
			} else {
				this.loadData();
			}
		} else {
			this.loadData();
		}
	}

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = '';
		this.route.queryParams.subscribe((params) => {
			this.navigateObj = this.router.getCurrentNavigation()?.extras.state;
			if (this.navigateObj) {
				this.id = this.navigateObj?.id;
				this.idCycle = this.navigateObj?.IDCycle;
				this.segmentView = 's3';
				this.timesheetCycleProvider.getAnItem(this.idCycle).then((result) => {
					this.cycle = result;
				});
				this.env
					.showLoading('Loading...', this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id }))
					.then((resp) => {
						this.allResources = resp['data'];
						//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
						this.staffList = this.allResources.map((m) => m.IDStaff);
					})
					.catch((err) => {
						console.log(err);
						this.env.showMessage('Error loading staff timesheet enrollment data', 'danger');
					})
					.finally(() => {
						if (this.segmentView == 's1' && !this.navigateObj) {
							super.loadData(event);
						}
					});
			}
		});

		Promise.all([
			this.officeProvider.read(),
			this.env.getType('ShiftType'),
			this.timesheetProvider.read(),
			this.leaveTypeProvider.read(),
			this.env.getStatus('StandardApprovalStatus'),
			this.gateProvider.read(),
		]).then((values) => {
			this.officeList = values[0]['data'];
			this.shifTypeList = values[1];
			this.timesheetList = values[2]['data'];
			this.timeoffTypeList = values[3]['data'];

			this.OTStatusList = values[4];
			this.gateList = values[5]['data'];
			if (this.id) {
				this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
				if (!this.selectedTimesheet) {
					this.id = null;
					return super.loadedData(event);
				}
			} else if (this.timesheetList.length) {
				this.selectedTimesheet = this.timesheetList[0];
				this.id = this.selectedTimesheet.Id;
			}

			super.preLoadData(event);
		});
	}

	loadData(event?: any) {
		//const loading = this.showLoading();
		let option = this.selectedTimesheet?.Option ? JSON.parse(this.selectedTimesheet.Option) : null;
		this.shiftProvider.read({ Skip: 0, Take: 5000, AllParent: true, Id: option?.ShiftList ?? 0 }).then((value: any) => {
			this.shiftList = value['data'];
			this.shiftList.forEach((s) => {
				let shiftType = this.shifTypeList.find((d) => d.Code == s.Type);
				if (shiftType) {
					s.Color = shiftType.Color;
					s.color = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase());
					s.ShiftType = shiftType.Name;
					s.TextColor = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase() + '-contrast');
				}

				s.Start = lib.dateFormat('2000-01-01 ' + s.Start, 'hh:MM');
				s.End = lib.dateFormat('2000-01-01 ' + s.End, 'hh:MM');
			});
		});
		this.env.showLoading('Loading...', this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id })).then((resp: any) => {
			this.allResources = resp['data'].map((d) => ({
				...d,
				LeaveDays: d.LeaveDaysRemaining - d.LeaveDaysScheduled, // gán giá trị bạn muốn
			}));
			//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
			this.staffList = this.allResources.map((m) => m.IDStaff);
			if (this.segmentView == 's1') this.loadSchedulerData(event);
			else if (this.segmentView == 's2') this.loadCheckinLogData(event);
			else this.loadTimesheetCycle(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.calendarOptions.select = null;
		this.calendarOptions.eventClick = null;
		this.calendarOptions.dateClick = null;
		this.calendarOptions.eventChange = null;
		this.calendarOptions.eventDrop = null;
		this.calendarOptions.eventResize = null;
		this.calendarOptions.eventDidMount = null;
		if (this.segmentView == 's1') this.loadedSchedulerData(event, ignoredFromGroup);
		else if (this.segmentView == 's2') this.loadedCheckinLogData(event, ignoredFromGroup);
		else this.loadedTimesheetCycle(event, ignoredFromGroup);
		this.calendarOptions.resources = this.allResources.filter((resource) => {
			if (resource.EndDate == null) return true;
			resource.isDeleted = true;
			const endDate = new Date(resource.EndDate);
			const hasData = this.items.some((item) => item.IDStaff === resource.IDStaff);
			if (!hasData && new Date(this.fc?.view?.activeStart) > endDate) {
				return hasData; // Chỉ giữ nếu còn dữ liệu2
			}
			return true; // Chưa xóa => giữ
		});
		this.calendarOptions.resourceLabelContent = (arg) => {
			let imgpath = environment.staffAvatarsServer + arg.resource.extendedProps.Code + '.jpg';
			let html = '';
			if (!arg.resource.extendedProps.isDeleted) {
				html = `
						<div class="staff-resource">
							<span class="name">
								<span class="code">${arg.resource.extendedProps.Code} </span>
							</span>
							<ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>
						</div>`;
			} else {
				html = `
						<div class="staff-resource">
							<span class="name">
								<span class="code">${arg.resource.extendedProps.Code} </span>
							</span>
						</div>`;
			}
			return { html: html };
		};
		// this.loadingController.dismiss();
	}

	//load data scheduler
	loadSchedulerData(event) {
		this.getCalendar();

		this.query.WorkingDateFrom = lib.dateFormat(this.fc?.view.activeStart);
		this.query.WorkingDateTo = lib.dateFormat(this.fc?.view.activeEnd);
		this.query.IDTimesheet = this.id;
		this.query.IDShift = JSON.stringify(this.shiftList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.ShiftType = JSON.stringify(this.shifTypeList.filter((d) => d.isChecked).map((m) => m.Code));
		this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.Take = 50000;
		this.query.ParseOvertimeConfig = true;
		this.clearData();

		if (this.id) {
			super.loadData();
		} else {
			this.loadedData(event);
		}
	}

	loadedSchedulerData(event?: any, ignoredFromGroup?: boolean) {
		this.calendarOptions.eventContent = (arg) => {
			let htmlRemoveButton = ``;
			if (this.pageConfig.canEdit) {
				htmlRemoveButton = `<ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>`;
			}
			if (!this.pageConfig.canEditPassDay) {
				let d1 = lib.dateFormat(arg.event.extendedProps.WorkingDate);
				let d2 = lib.dateFormat(arg.event.extendedProps._CurrentDate);
				if (d1 <= d2) {
					htmlRemoveButton = '';
				}
			}
			let html = `<ion-text class="click-event-btn clickable"><b>${arg.event.title}</b> <small>${arg.event.extendedProps.ShiftStart}-${arg.event.extendedProps.ShiftEnd}</small> ${htmlRemoveButton} </ion-text>`;
			if (arg.event.extendedProps.IsBookBreakfastCatering || arg.event.extendedProps.IsBookLunchCatering || arg.event.extendedProps.IsBookDinnerCatering) {
				let booked = arg.event.extendedProps.IsBookBreakfastCatering ? 'B' : '';
				booked += arg.event.extendedProps.IsBookLunchCatering ? 'L' : '';
				booked += arg.event.extendedProps.IsBookDinnerCatering ? 'D' : '';
				html = `<ion-icon class="lunch-booked" name="restaurant-outline"></ion-icon>(${booked}) - ` + html;
			}
			if (arg.event.extendedProps.TimeOffType) {
				if (!this.pageConfig.canEditLeaveDay) htmlRemoveButton = '';
				html = `<ion-text class="click-event-btn clickable"><b>${arg.event.extendedProps.TimeOffType}</b></ion-text>  ${htmlRemoveButton}`;
			}

			return {
				html: html,
			};
		};
		this.calendarOptions.eventDidMount = this.eventDidMount.bind(this);
		this.calendarOptions.select = this.select.bind(this);
		this.calendarOptions.dateClick = this.dateClick.bind(this); // bind is important!
		this.calendarOptions.eventClick = null; //this.eventClick.bind(this),
		this.calendarOptions.eventChange = this.eventChange.bind(this);
		this.calendarOptions.eventDrop = this.eventDrop.bind(this);
		this.calendarOptions.eventResize = this.eventResize.bind(this);
		this.overtimeRequestProvider
			.read(this.query)
			.then((values: any) => {
				console.log('tăng ca:');
				console.log(values?.data);
				values?.data?.forEach((e) => {
					e.PolRates.forEach((i) => {
						this.items.push({
							id: lib.generateUID(),
							IDTimeSheet: this.id,
							resourceId: i.IDStaff,
							IDOTRequest: e.Id,
							ShiftType: 'OT',
							title: 'OT',
							start: i.Start,
							IDStaff: i.IDStaff,
							TimeOffType: null,
							color: lib.getCssVariableValue('--ion-color-' + this.OTStatusList.find((d) => d.Code == e.Status)?.Color.toLowerCase()),
							ShiftStart: lib.dateFormat(i.Start, 'hh:MM'),
							ShiftEnd: lib.dateFormat(i.End, 'hh:MM'),
						});
					});
				});
				this.getCalendar();
				this.patchItems();
				this.fc?.removeAllEvents();
				this.fc?.addEventSource(this.items);

				this.fc?.updateSize();
				super.loadedData(event, ignoredFromGroup);
			})
			.catch((err) => {
				this.patchItems();
				this.calendarOptions.events = this.items;
				this.getCalendar();
				this.fc?.updateSize();
				super.loadedData(event, ignoredFromGroup);
			});
	}

	loadCheckinLogData(event) {
		this.getCalendar();

		this.query.LogTimeFrom = lib.dateFormat(this.fc.view.activeStart);
		this.query.LogTimeTo = lib.dateFormat(this.fc.view.activeEnd);
		this.query.IDTimesheet = this.id;

		this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.Take = 50000;

		this.clearData();
		if (this.id) {
			this.query.IDStaff = JSON.stringify(this.allResources.map((m) => m.IDStaff));
			this.timesheetLogProvider.read(this.query).then((result: any) => {
				this.items = result.data;
				this.loadedData(event);
			});
			// this.env.showLoading('Loading...', this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id })).then((resp) => {
			// 	let resources = resp['data'];
			// 	//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
			// 	// this.calendarOptions.resources = resources;
			// 	this.allResources = resources;
			// 	this.query.IDStaff = JSON.stringify(this.allResources.map((m) => m.IDStaff));
			// 	super.loadData(event);
			// });
		}
	}

	loadedCheckinLogData(event?: any, ignoredFromGroup?: boolean) {
		this.calendarOptions.slotLabelContent = (arg) => {
			let texts = arg.text.split(' ');
			let html = `<b>${texts[0].toUpperCase()}</b><br><small>${texts[1]}</small>`;
			return { html: html };
		};
		this.calendarOptions.eventContent = (arg) => {
			let html = '';
			let ltime = lib.dateFormat(arg.event.extendedProps.LogTime, 'hh:MM');
			let gate = this.gateList.find((d) => d.Id == arg.event.extendedProps.IDGate);
			if (this.pageConfig.canEdit) {
				html = `<b>${ltime}</b> <small>${gate?.Name}</small><ion-icon class="del-event-btn" name="trash-outline"></ion-icon>`;
			} else {
				html = `<b>${arg.event.title}</b> <small>${arg.event.extendedProps.ShiftStart}-${arg.event.extendedProps.ShiftEnd}</small>`;
			}
			return { html: html };
		};
		this.calendarOptions.eventDidMount = (arg) => {
			let that = this;
			arg.el.querySelector('ion-icon').onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				that.env
					.showPrompt('Bạn có chắc muốn xóa không?', null, 'Checkin logs')
					.then((_) => {
						that.submitAttempt = true;
						that.pageProvider
							.delete([{ Id: parseInt(arg.event.id) }])
							.then((savedItem: any) => {
								arg.event.remove();
								that.submitAttempt = false;
							})
							.catch((err) => {
								that.submitAttempt = false;
							});
					})
					.catch((e) => {});
			};
		};

		this.calendarOptions.select = (arg) => {
			arg.end.setDate(arg.end.getDate() - 1);

			this.massShiftAssignmentCheckinLog({
				FromDate: arg.startStr.substr(0, 10),
				ToDate: arg.end.toISOString().substr(0, 10),
				Staffs: [parseInt(arg.resource.id)],
			});
		};

		this.calendarOptions.eventClick = (arg) => {
			this.massShiftAssignmentCheckinLog({
				FromDate: arg.event.startStr,
				ToDate: arg.event.startStr,
				TimeSpan: arg.event.extendedProps.LogTime.substr(11, 5),

				IDStaff: arg.event.extendedProps.IDStaff,
				Id: arg.event.extendedProps.Id,
				IDOffice: arg.event.extendedProps.IDOffice,
				IDGate: arg.event.extendedProps.IDGate,

				Image: arg.event.extendedProps.Image,
				IPAddress: arg.event.extendedProps.IPAddress,
				UUID: arg.event.extendedProps.UUID,
				IsValidLog: arg.event.extendedProps.IsValidLog,
				IsOpenLog: arg.event.extendedProps.IsOpenLog,
				IsMockLocation: arg.event.extendedProps.IsOpenLog,
			});
		};

		this.items.forEach((e) => {
			e.start = e.LogTime;
			e.color = lib.getCssVariableValue('--ion-color-success');
			e.textColor = lib.getCssVariableValue('--ion-color-success-contrast');
			if (!e.IsValidLog && !e.SeftClaim) {
				e.color = lib.getCssVariableValue('--ion-color-danger');
				e.textColor = lib.getCssVariableValue('--ion-color-danger-contrast');
			}
			if (!e.IsValidLog && e.SeftClaim) {
				e.color = lib.getCssVariableValue('--ion-color-warning');
				e.textColor = lib.getCssVariableValue('--ion-color-warning-contrast');
			}

			e.allDay = true;
		});
		this.getCalendar();
		this.fc?.removeAllEvents();
		this.fc?.addEventSource(this.items);
		this.fc?.updateSize();
		super.loadedData(event, ignoredFromGroup);
	}

	loadTimesheetCycle(event) {
		this.getCalendar();
		this.query.WorkingDateFrom = lib.dateFormat(this.fc?.view.activeStart);
		this.query.WorkingDateTo = lib.dateFormat(this.fc?.view.activeEnd);
		// this.query.IDTimesheet = this.id;
		// this.query.IDCycle = this.idCycle;
		// this.query.IDShift = JSON.stringify(this.shiftList.filter((d) => d.isChecked).map((m) => m.Id));
		// this.query.ShiftType = JSON.stringify(this.shifTypeList.filter((d) => d.isChecked).map((m) => m.Code));
		// this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
		// this.query.Take = 50000;
		let query: any = {};

		query.WorkingDateFrom = lib.dateFormat(this.fc?.view.activeStart);
		query.WorkingDateTo = lib.dateFormat(this.fc?.view.activeEnd);
		query.IDTimesheet = this.id;
		query.Take = 50000;

		if (this.cycle) {
			query.WorkingDateFrom = lib.dateFormat(this.cycle.Start);
			query.WorkingDateTo = lib.dateFormat(this.cycle.End);
		}

		this.clearData();
		// if (this.idCycle == 0) {
		// 	this.loadedData(event);
		// }
		if (this.id) {
			// this.query.CC = true;
			// this.timesheetCycleProvider.read(this.query).then((result: any) => {
			// 	this.items = result.data;
			// 	this.loadedData(event);
			// });
			this.timesheetRecordProvider.read(query).then((result: any) => {
				this.items = result.data;
				this.loadedData(event);
			});
		} else {
			this.loadedData(event);
		}
	}

	loadedTimesheetCycle(event?: any, ignoredFromGroup?: boolean) {
		this.calendarOptions.eventContent = (arg) => {
			return {
				html: arg.event.extendedProps.html,
			};
		};
		this.calendarOptions.eventClick = (arg) => {
			if (arg.event.extendedProps.TimeOffType) {
				return;
			}
			this.showPointModal(arg);
		};
		// this.calendarOptions.eventTextColor = lib.getCssVariableValue('--ion-color-dark');
		this.calendarOptions.select = null;
		this.calendarOptions.dateClick = null; // bind is important!
		this.calendarOptions.eventChange = null;
		this.calendarOptions.eventDrop = null;
		this.calendarOptions.eventResize = null;
		this.calendarOptions.eventDidMount = null;
		this.items.forEach((e) => {
			let timesheet = this.timesheetList.find((d) => d.Id == e.IDTimesheet);
			let shift = this.shiftList.find((d) => d.Id == e.IDShift);
			if (shift && timesheet) {
				e.color = shift.color;
				e.resourceId = e.IDStaff;
				e.start = e.WorkingDate;
				e.Shift = shift;
				e.Timesheet = timesheet;
				e.textColor = shift.TextColor;
				e.Checkin = lib.dateFormat(e.Checkin, 'hh:MM');
				e.Checkout = lib.dateFormat(e.Checkout, 'hh:MM');

				if (new Date(e.WorkingDate) < new Date()) {
					let point = 0;
					if (e.Point) point = Math.round(e.Point * 100) / 100;

					e.Color = 'success';
					e.Icon = 'checkmark-circle-outline';
					e.Title = `${e.Checkin}→${e.Checkout}`;
					e.Badge = `${e.MinutesOfWorked}-${point}`;
					e.textColor = lib.getCssVariableValue('--ion-color-success-contrast');
					if (!e.Checkin && !e.Checkout && e.ShiftType != 'WorkFromHomeShift') {
						e.Color = 'danger';
						e.Icon = 'alert-circle-outline';
						e.Title = `Q`;
						e.Badge = `0`;
						e.textColor = lib.getCssVariableValue('--ion-color-danger-contrast');
					}
					if (e.ShiftType == 'WorkFromHomeShift') {
						e.Title = `WFH`;
						e.Badge = `${point}`;
					}

					if (e.Point > e.StandardPoint) {
						e.Color = 'danger';
					} else if (e.Point < e.StandardPoint && e.Point != 0) {
						e.Color = 'warning';
					}

					if (e.TimeOffType) {
						let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
						e.Color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
						e.Icon = 'alert-circle-outline';
						e.Title = `${e.TimeOffType}`;
						e.Badge = `${point}`;
						e.textColor = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase() + '-contrast');
					}
				} else {
					e.Color = 'medium';
					e.Icon = 'timer-outline';
					e.Title = `${shift.Name}`;
					e.Badge = `${shift.Start}→${shift.End}`;
					e.textColor = lib.getCssVariableValue('--ion-color-medium-contrast');
				}

				e.StdTimeIn = lib.dateFormat(e.StdTimeIn, 'hh:MM dd/mm/yyyy');
				e.StdTimeOut = lib.dateFormat(e.StdTimeOut, 'hh:MM dd/mm/yyyy');
				e.WorkingDate = lib.dateFormat(e.WorkingDate, 'dd/mm/yyyy');
				e.html = `<ion-icon color="${e.Color}" name="${e.Icon}"></ion-icon> <span class="v-align-middle">${e.Title}</span><ion-badge color="${e.Color}" class="float-right">${e.Badge}</ion-badge>`;
				e.color = lib.getCssVariableValue('--ion-color-' + e.Color) + '22';
			} else if (e.TimeOffType) {
				let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
				if (toType) {
					e.color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
					e.resourceId = e.IDStaff;
					e.Title = e.TimeOffType;
					e.start = e.WorkingDate;
					e.Badge = '';
					e.html = `<span class="v-align-middle">${e.Title}</span>`;
					e.textColor = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase() + '-contrast');
				} else {
					console.log(e);
				}
			}
		});

		this.getCalendar();
		this.fc?.removeAllEvents();
		this.fc?.addEventSource(this.items);
		if (this.cycle) {
			this.fc?.gotoDate(this.cycle.Start);
			this.formGroupDate.controls['singleDate'].setValue(new Date(this.cycle.Start).toISOString().split('T')[0]);
			this.cycle = null;
		}
		this.fc?.updateSize();
		super.loadedData(event, ignoredFromGroup);
	}

	savePickDate() {
		if (this.formGroupDate.value.singleDate) {
			this.pickedDate = this.formGroupDate.value.singleDate;
			this.fc?.gotoDate(this.pickedDate);
			this.loadData();
		}
	}

	patchItems() {
		this.items.forEach((e) => {
			let shift = this.shiftList.find((d) => d.Id == e.IDShift);
			if (shift) {
				e.color = shift.color;
				e.textColor = lib.getCssVariableValue('--ion-color-' + shift.color + '-contrast'); // shift.TextColor;

				if (e.TimeOffType) {
					let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
					e.color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
					e.textColor = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase() + '-contrast');
				}

				e.ShiftStart = shift.Start;
				e.ShiftEnd = shift.End;
			}else{
				return;
			}
			if (e.TimeOffType) {
				let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
				if (toType) {
					e.color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
					e.textColor = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase() + '-contrast');
				} else {
					console.log(e);
				}
			}
		});
	}

	calendarOptions: any = {
		plugins: [resourceTimelinePlugin, interactionPlugin],
		schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
		initialView: 'resourceTimelineWeek',
		height: '100%',
		timeZone: 'Asia/Ho_Chi_Minh',
		aspectRatio: 1.5,
		headerToolbar: false,
		// headerToolbar: {
		//     left: 'today prev,next',
		//     center: 'title',
		//     right: 'resourceTimelineDay,resourceTimelineWeek'
		// },

		firstDay: 1,
		weekends: true,
		nowIndicator: true,

		businessHours: {
			daysOfWeek: [0, 1, 2, 3, 4, 5, 6, 7],
			startTime: '06:00',
			endTime: '24:00',
		},

		// events: [
		//     { title: 'event 1', date: '2019-04-01' },
		//     { title: 'event 2', date: '2019-04-02' }
		// ],
		views: {
			resourceTimelineDay: {
				slotDuration: '03:00',
			},
			resourceTimelineWeek: {
				// slotDuration: '06:00'
				slotDuration: { days: 1 },
				slotMinWidth: 200,
				dayHeaderFormat: {
					weekday: 'short',
					month: 'numeric',
					day: 'numeric',
					omitCommas: true,
				},
			},
		},

		slotLabelFormat: [
			//{ week: "short" }, // top level of text
			{
				weekday: 'short',
				day: '2-digit',
				month: '2-digit',
				omitCommas: true,
			}, // lower level of text
		],
		//resourceGroupField: 'JobTitle',
		resourceAreaWidth: '256px',
		// resourceAreaHeaderContent: {
		//     html:
		//         '<div class="d-flex flex-column align-items-start">' + 'a</div>'
		// },
		resourceOrder: 'JobTitle,Code',

		resourceAreaColumns: [
			{
				headerDidMount: this.headerDidMount.bind(this),
				field: 'Code',
				headerClassNames: 'Code',
				headerContent: 'Mã NV',
				width: 100,
			},
			{
				headerDidMount: this.headerDidMount.bind(this),
				field: 'FullName',
				headerClassNames: 'FullName',
				headerContent: 'Họ và tên',
				width: 200,
				cellContent: (arg) => {
					const el = document.createElement('div');
					el.innerText = arg.resource.extendedProps.FullName;
					if (arg.resource.extendedProps.isDeleted) {
						el.innerText = el.innerText + '!';
						el.title = this.tooltipResource;
						el.style.color = lib.getCssVariableValue('--ion-color-danger');
					}
					return { domNodes: [el] };
				},
			},
			{
				//group: true,
				headerDidMount: this.headerDidMount.bind(this),
				field: 'JobTitle',
				headerClassNames: 'JobTitle',
				headerContent: 'Chức danh',
				width: 150,
			},
			{
				headerDidMount: this.headerDidMount.bind(this),
				field: 'LeaveDays',
				headerContent: 'Ngày phép',
				width: 80,
			},
		],

		resourceLabelDidMount: this.resourceLabelDidMount.bind(this),
		// eventMinWidth: 200,
		eventColor: lib.getCssVariableValue('--ion-color-primary'),
		displayEventTime: false,
		editable: true,
		selectable: true,
		eventDurationEditable: true, // Cho phép kéo dài sự kiện
		eventOverlap: true,
		droppable: true,
	};

	eventResize(info) {
		const event = info.event; // Sự kiện sau khi được kéo dài
		const newStart = event.start; // Thời gian bắt đầu mới
		const newEnd = event.end; // Thời gian kết thúc mới

		// Cập nhật dữ liệu sự kiện
		const updatedEvent = {
			Id: event.id,
			WorkingDate: newStart?.toISOString(),
			EndDate: newEnd ? newEnd.toISOString() : null,
		};

		// Gửi dữ liệu cập nhật lên server
		this.pageProvider
			.save(updatedEvent)
			.then(() => {
				this.env.showMessage('Event updated successfully', 'success');
			})
			.catch((err) => {
				this.env.showMessage('Error updating event', 'danger');
				console.error(err);
				info.revert(); // Hoàn tác nếu có lỗi
			});
	}

	headerDidMount(arg) {
		let that = this;
		arg.el.onclick = function (e) {
			let field = e.currentTarget.className.replace('fc-datagrid-cell ', '');
			e.currentTarget.classList.remove(field);
			if (field.indexOf('desc') > -1) {
				field = field.replace('desc', '');
			} else {
				field = 'desc' + field;
			}

			e.currentTarget.classList.add(field);

			that.getCalendar();
			that.fc?.setOption('resourceOrder', field.replace('desc', '-'));
		};
	}

	resourceLabelDidMount(arg) {
		if (arg.resource.extendedProps.isDeleted) {
			arg.el.style.color = lib.getCssVariableValue('--ion-color-danger');
		}
		let that = this;
		if (arg.el.querySelector('.del-event-btn')) {
			arg.el.querySelector('.del-event-btn').onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				that.env
					.showPrompt('Bạn có chắc muốn xóa nhân sự này?', null, 'Phân ca')
					.then((_) => {
						that.submitAttempt = true;
						console.log(arg);

						that.staffTimesheetEnrollmentProvider
							.save({
								DeletedID: parseInt(arg.resource._resource.extendedProps.Id),
							})
							.then((savedItem: any) => {
								arg.resource.remove();
								that.submitAttempt = false;
							})
							.catch((err) => {
								that.submitAttempt = false;
							});
					})
					.catch((e) => {});
			};
		}
	}
	eventDidMount(arg) {
		let that = this;
		if (arg.el.querySelector('.del-event-btn')) {
			arg.el.querySelector('.del-event-btn').onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				that.env
					.showPrompt('Bạn có chắc muốn xóa ca này?', null, 'Phân ca')
					.then((_) => {
						that.submitAttempt = true;
						if (arg.event.extendedProps.ShiftType == 'OT') {
							that.overtimeRequestProvider
								.delete([{ Id: arg.event.extendedProps.IDOTRequest }])
								.then(() => {
									arg.event.remove();
								})
								.finally(() => (that.submitAttempt = false));
						} else {
							let ids = `[${parseInt(arg.event.id)}]`;
							that.pageProvider.commonService
								.connect('PUT', 'HRM/StaffSchedule/DeleteSchedule/' + ids, null)
								.toPromise()
								.then((savedItem: any) => {
									try {
										let obj = JSON.parse(savedItem);
										console.log(obj);
										if (obj.IDRequest) {
											that.env
												.showPrompt('This leave request has been approved. Do you want to navigate to the leave request page?', null, null)
												.then((_) => {
													that.navCtrl.navigateForward('/request/' + obj.IDRequest);
												});
										}
									} catch (err) {
										arg.event.remove();
										that.submitAttempt = false;
									}
								})
								.catch((err) => {
									that.submitAttempt = false;
								});
						}
					})
					.catch((e) => {});
			};
		}

		arg.el.querySelector('.click-event-btn').onclick = function (e) {
			e.preventDefault();
			e.stopPropagation();
			that.eventClick(arg);
		};
	}
	dateClick(dateClickInfo) {
		this.massShiftAssignment({
			FromDate: dateClickInfo.dateStr.substr(0, 10),
			ToDate: dateClickInfo.dateStr.substr(0, 10),
			DaysOfWeek: [dateClickInfo.date.getDay()],
			Staffs: [parseInt(dateClickInfo.resource.id)],
			IsAllStaff: false,
			IsOpenShift: false,
			IsBookLunchCatering: false,
			IsBookBreakfastCatering: false,
			IsBookDinnerCatering: false,
		});
	}

	eventClick(arg) {
		if (arg.event.extendedProps.ShiftType == 'OT') {
			this.massOTAssignment(arg?.event?.extendedProps);
		} else {
			this.massShiftAssignment({
				FromDate: arg.event.startStr.substr(0, 10),
				ToDate: arg.event.startStr.substr(0, 10),
				DaysOfWeek: [arg.event.start.getDay()],
				IDShift: arg.event.extendedProps.IDShift,
				TimeOffType: arg.event.extendedProps.TimeOffType,
				Staffs: [parseInt(arg.event.extendedProps.IDStaff)],
				Id: arg.event.id,
				IsAllStaff: false,
				IsOpenShift: false,
				IsBookLunchCatering: arg.event.extendedProps.IsBookLunchCatering,
				IsBookBreakfastCatering: arg.event.extendedProps.IsBookBreakfastCatering,
				IsBookDinnerCatering: arg.event.extendedProps.IsBookDinnerCatering,
			});
		}
	}
	eventDrop(info) {
		const event = info.event; // The event after being dropped
		const oldEvent = info.oldEvent; // The event's data before being dropped
		const newStart = event.start;
		const newEnd = event.end;
		const targetResourceId = event._def.resourceIds[0];
		const oldResourceId = oldEvent._def.resourceIds[0];
		// Check if there's already an event in the target cell
		const overlappingEvent = this.fc.getEvents().find((e) => {
			return (
				e._def.resourceIds[0] === targetResourceId && e.start?.toISOString() === newStart?.toISOString() && e.id !== event.id // Ensure it's not the same event
			);
		});

		if (overlappingEvent) {
			// Swap the data between the two events
			const updatedEvent1 = {
				Id: event.id,
				IDStaff: overlappingEvent._def.resourceIds[0],
				WorkingDate: overlappingEvent.start?.toISOString(),
				EndDate: overlappingEvent.end ? overlappingEvent.end.toISOString() : null,
			};

			const updatedEvent2 = {
				Id: overlappingEvent.id,
				IDStaff: oldResourceId, // Use the old resource ID
				WorkingDate: oldEvent.start?.toISOString(),
				EndDate: oldEvent.end ? oldEvent.end.toISOString() : null,
			};

			Promise.all([this.pageProvider.save(updatedEvent1), this.pageProvider.save(updatedEvent2)])
				.then(() => {
					this.env.showMessage('Events swapped successfully', 'success');
					this.loadData(); // Reload data to reflect changes
				})
				.catch((err) => {
					this.env.showMessage('Error swapping events', 'danger');
					console.error(err);
					info.revert(); // Revert the drag if there's an error
				});
		} else {
			// Update the event normally if no overlapping event exists
			const updatedEvent = {
				Id: event.id,
				IDStaff: targetResourceId,
				WorkingDate: newStart?.toISOString(),
				EndDate: newEnd ? newEnd.toISOString() : null,
			};

			this.pageProvider
				.save(updatedEvent)
				.then(() => {
					this.env.showMessage('Event updated successfully', 'success');
				})
				.catch((err) => {
					this.env.showMessage('Error updating event', 'danger');
					console.error(err);
					info.revert();
				});
		}
	}

	select(selectionInfo) {
		selectionInfo.end.setDate(selectionInfo.end.getDate() - 1);
		if (selectionInfo.end.toISOString() != selectionInfo.start.toISOString()) {
			this.massShiftAssignment({
				Id: selectionInfo.id,
				FromDate: selectionInfo.startStr,
				ToDate: selectionInfo.end.toISOString().substr(0, 10),
				DaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
				Staffs: [parseInt(selectionInfo.resource.id)],
				IsAllStaff: false,
				IsOpenShift: false,
				IsBookLunchCatering: false,
				IsBookBreakfastCatering: false,
				IsBookDinnerCatering: false,
			});
		}
	}

	eventChange(changeInfo) {
		let ev = {
			Id: changeInfo.event.id,
			IDStaff: changeInfo.event._def.resourceIds[0],
			WorkingDate: changeInfo.event.startStr,
		};

		this.pageProvider.save(ev).then((_) => {
			this.env.showMessage('Shifts updated', 'warning');
		});
	}

	toggleWeekends() {
		this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
	}

	changeTimesheet() {
		this.id = this.selectedTimesheet.Id;
		let newURL = '#/scheduler/';
		if (this.selectedTimesheet) {
			newURL += this.selectedTimesheet.Id;
			this.env
				.showLoading('Loading...', this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id }))
				.then((resp) => {
					this.allResources = resp['data'];
					//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
					this.staffList = this.allResources.map((m) => m.IDStaff);
				})
				.catch((err) => {
					console.log(err);
					this.env.showMessage('Error loading staff timesheet enrollment data', 'danger');
				})
				.finally(() => {
					this.loadData(null);
				});
		} else {
			this.id = 0;
		}
		history.pushState({}, null, newURL);
	}

	changeFilter() {
		this.refresh();
	}

	getCalendar() {
		this.fc = this.calendarComponent?.getApi();
	}

	showFilter() {
		this.pageConfig.isShowFeature = !this.pageConfig.isShowFeature;
		setTimeout(() => {
			this.getCalendar();
			this.fc?.updateSize();
		}, 1);
	}
	ionViewDidEnter(): void {
		this.getCalendar();
		this.fc?.updateSize();
	}

	fcToday() {
		this.getCalendar();
		this.fc?.today();
		this.loadData();
	}
	fcNext() {
		this.getCalendar();
		this.fc?.next();
		this.loadData();
	}
	fcPrev() {
		this.getCalendar();
		this.fc?.prev();
		this.loadData();
	}
	async importCustom(event, provider) {
		if (event.target.files.length == 0) return;
		this.env
			.showLoading('Please wait for a few moments', this.pageProvider.import(event.target.files[0]))
			.then((resp: any) => {
				this.refresh();
				if (resp.ErrorList && resp.ErrorList.length) {
					let message = '';
					for (let i = 0; i < resp.ErrorList.length && i <= 5; i++)
						if (i == 5) message += '<br> Còn nữa...';
						else {
							const e = resp.ErrorList[i];
							message += '<br> ' + e.Id + '. Tại dòng ' + e.Line + ': ' + e.Message;
						}
					this.env
						.showPrompt(
							{
								code: 'Có {{value}} lỗi khi import: {{value1}}',
								value: { value: resp.ErrorList.length, value1: message },
							},
							'Bạn có muốn xem lại các mục bị lỗi?',
							'Có lỗi import dữ liệu'
						)
						.then((_) => {
							this.downloadURLContent(resp.FileUrl);
						})
						.catch((e) => {});
				} else {
					this.env.showMessage('Import completed!', 'success');
				}
			})
			.catch((err) => {
				if (err.statusText == 'Conflict') {
					// var contentDispositionHeader = err.headers.get('Content-Disposition');
					// var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
					// this.downloadContent(result.replace(/"/g, ''),err._body);
					this.downloadURLContent(err._body);
				}
			});
	}

	import(event: any): Promise<void> {
		if (this.segmentView == 's2') {
			return this.importCustom(event, this.timesheetLogProvider);
		} else if (this.segmentView == 's3') {
			return this.importCustom(event, this.timesheetCycleProvider);
		} else {
			return super.import(event);
		}
	}

	async showStaffPickerModal() {
		const modal = await this.modalController.create({
			component: StaffPickerPage,
			componentProps: {
				id: this.id,
			},
			cssClass: 'modal90',
		});

		await modal.present();
		const { data } = await modal.onWillDismiss();

		if (data && data.length) {
			this.staffTimesheetEnrollmentProvider
				.save({
					IDTimesheet: this.id,
					StaffList: data.map((m) => m.Id),
				})
				.then((resp) => {
					this.refresh();
				});
		}
	}

	async massShiftAssignment(cData = null) {
		if (!cData) {
			cData = {
				FromDate: this.query.WorkingDateFrom,
				ToDate: this.query.WorkingDateEnd,
			};
		}

		cData.staffList = this.calendarOptions.resources;
		cData.shiftList = this.shiftList;
		cData.timeoffTypeList = this.timeoffTypeList;
		cData.currentDate = this.items[0]?._CurrentDate;
		const modal = await this.modalController.create({
			component: SchedulerGeneratorPage,
			componentProps: cData,
			cssClass: 'my-custom-class',
		});
		console.log(cData);
		await modal.present();
		const { data } = await modal.onWillDismiss();

		if (data) {
			data.IDTimesheet = this.id;
			console.log(data);
			this.pageProvider.save(data).then((resp) => {
				this.loadData(null);
			});
		}
	}

	async massShiftAssignmentCheckinLog(cData) {
		cData.staffList = this.calendarOptions.resources;
		cData.officeList = this.officeList;
		cData.gateList = this.gateList;
		cData.currentDate = this.items[0]?._CurrentDate;
		const modal = await this.modalController.create({
			component: LogGeneratorPage,
			componentProps: cData,
			cssClass: 'my-custom-class',
		});

		await modal.present();
		const { data } = await modal.onWillDismiss();

		if (data) {
			data.IDTimesheet = this.id;
			if (data.Id) data.LogTime = data.FromDate + ' ' + data.TimeSpan + ':00.0000000';

			this.timesheetLogProvider.save(data).then((resp) => {
				this.loadData(null);
			});
		}
	}

	async massOTAssignment(cData = null) {
		if (cData) {
			cData = {
				id: cData.IDOTRequest,
			};
		} else {
			cData = {
				id: 0,
				item: {
					Config: JSON.stringify({ TimeFrames: [], Staffs: [] }),
					IDTimesheet: parseInt(this.id),
					Id: 0,
				},
			};
		}

		const modal = await this.modalController.create({
			component: OvertimeRequestDetailPage,
			componentProps: cData,
			cssClass: 'modal90',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.refresh();
		// if (data) {
		// 	data.IDTimesheet = this.id;
		// 	console.log(data);
		// 	this.pageProvider.save(data).then((resp) => {
		// 		this.loadData(null);
		// 	});
		// }
	}

	async showPointModal(cData = null) {
		const modal = await this.modalController.create({
			component: PointModalPage,
			componentProps: {
				cData: cData,
				IDCycle: this.idCycle,
				IDTimesheet: this.id,
			},
			cssClass: 'modal-hrm-point',
		});
		await modal.present();
	}

	refresh(event?: any): void {
		super.refresh(event);
	}
	getColor(code) {
		switch (code) {
			case 'warning':
				return lib.getCssVariableValue('--ion-color-warning');
			case 'danger':
				return lib.getCssVariableValue('--ion-color-danger');
			case 'dark':
				return lib.getCssVariableValue('--ion-color-dark');
		}
		return;
	}

	@ViewChild('importfile') importfile: any;
	onClickImport() {
		this.importfile.nativeElement.value = '';
		this.importfile.nativeElement.click();
	}

	importOvertimeRecords(event) {
		if (event.target.files.length == 0) return;
		this.env
			.showLoading('Please wait for a few moments', this.staffRecordOvertimeProvider.import(event.target.files[0]))
			.then((resp: any) => {
				this.refresh();
				if (resp.ErrorList && resp.ErrorList.length) {
					let message = '';
					for (let i = 0; i < resp.ErrorList.length && i <= 5; i++)
						if (i == 5) message += '<br> Còn nữa...';
						else {
							const e = resp.ErrorList[i];
							message += '<br> ' + e.Id + '. Tại dòng ' + e.Line + ': ' + e.Message;
						}
					this.env
						.showPrompt(
							{
								code: 'Có {{value}} lỗi khi import: {{value1}}',
								value: { value: resp.ErrorList.length, value1: message },
							},
							'Bạn có muốn xem lại các mục bị lỗi?',
							'Có lỗi import dữ liệu'
						)
						.then((_) => {
							this.downloadURLContent(resp.FileUrl);
						})
						.catch((e) => {});
				} else {
					this.env.showMessage('Import completed!', 'success');
				}
			})
			.catch((err) => {
				if (err.statusText == 'Conflict') {
					// var contentDispositionHeader = err.headers.get('Content-Disposition');
					// var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
					// this.downloadContent(result.replace(/"/g, ''),err._body);
					this.downloadURLContent(err._body);
				}
			});
	}

	exportOvertimeRecords() {
		if (this.submitAttempt) return;
		let queryRecord = {
			IDStaff: JSON.stringify(this.staffList),
		};
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffRecordOvertimeProvider.export(queryRecord))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				this.submitAttempt = false;
			});
	}

	exportCustom(provider: any) {
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', provider.export(this.query))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				this.submitAttempt = false;
			});
	}

	async export() {
		if (this.segmentView == 's2') {
			return this.exportCustom(this.timesheetLogProvider);
		} else if (this.segmentView == 's3') {
			return this.exportCustom(this.timesheetCycleProvider);
		} else {
			this.getAdvaneFilterConfig();
			const modal = await this.modalController.create({
				component: AdvanceFilterModalComponent,
				cssClass: 'modal90',
				componentProps: {
					_AdvanceConfig: this.query._AdvanceConfig,
					schemaType: 'Form',
					selectedSchema: this.schemaPage,
					confirmButtonText: 'Export',
					renderGroup: { Filter: ['TimeFrame', 'Transform'] },
				},
			});
			await modal.present();
			const { data } = await modal.onWillDismiss();
			if (data && data.data) {
				if (data.isApplyFilter) this.query._AdvanceConfig = data?.data;
				if (data.schema) this.schemaPage = data?.schema;
				super.export();
			}
		}
	}
	@ViewChild('Popover') Popover!: HTMLIonPopoverElement;
	presentPopover(e) {
		this.Popover.event = e;
		this.isOpenPopover = !this.isOpenPopover;
	}

	pickedDate;
	isOpenPickDatePopover = false;
	@ViewChild('pickDatePopover') pickDatePopover!: HTMLIonPopoverElement;

	async presentPickDatePopover(ev: any) {
		let popover = await this.popoverCtrl.create({
			component: PopoverPage,
			componentProps: {
				popConfig: {
					type: 'PopSingleDate',
					isShowIonDateTime: true,
					// singleDateLabel: 'Ngày',
					submitButtonLabel: 'Chọn',
				},
				popData: {
					singleDate: this.pickedDate,
				},
			},
			event: ev,
			cssClass: 'delivery-review-filter',
			translucent: true,
		});
		popover.onDidDismiss().then((result: any) => {
			console.log(result);
			if (result.data) {
				this.pickedDate = result.data.singleDate;
				this.fc?.gotoDate(this.pickedDate);
				this.isOpenPickDatePopover = false;
				// this.fc.view.activeEnd = this.dateEnd;
				this.loadData();
			}
		});
		this.pickDatePopover = popover;
		return await popover.present();
	}

	dismissDatePicker(isApply) {}
	//scheduler
	getAdvaneFilterConfig() {
		let start = new Date(this.fc?.view.activeStart);
		start.setHours(0, 0, 0, 0);
		let end = new Date(this.fc?.view.activeEnd);
		end.setHours(23, 59, 59, 999);
		if (!this.query._AdvanceConfig) {
			this.query._AdvanceConfig = {
				Schema: {
					Type: 'Form',
					Code: 'HRM_StaffSchedule',
				},
				TimeFrame: {
					Dimension: 'WorkingDate',
					From: {
						Type: 'Absolute',
						IsPastDate: false,
						Period: 'Day',
						Amount: 0,
						Value: start.toISOString(),
					},
					To: {
						Type: 'Absolute',
						IsPastDate: false,
						Period: 'Day',
						Amount: 0,
						Value: end.toISOString(),
					},
				},
				CompareTo: {
					Type: 'Relative',
					IsPastDate: true,
					Period: 'Day',
					Amount: 0,
				},
				Interval: {},
				CompareBy: [
					// {
					// 	Property: 'IDShift',
					// 	Title: 'Shift',
					// },
					// {
					// 	Property: 'TimeOffType',
					// 	Title: 'TimeOff',
					// },
				],
				MeasureBy: [],
				Transform: {
					Filter: {
						Dimension: 'logical',
						Operator: 'AND',
						Value: null,
						Logicals: [
							{ Dimension: 'IDTimesheet', Operator: '=', Value: this.id },
							{ Dimension: 'IsDeleted', Operator: '=', Value: false },
							{ Dimension: 'IsDisabled', Operator: '=', Value: false },
						],
					},
				},
			};
		}
		//this.refresh();
		// this.pageProvider.read(this.query).then((resp) => {});
	}

	//timesheet
	getAdvaneTimesheetFilterConfig() {
		let start = new Date(this.fc?.view.activeStart);
		start.setHours(0, 0, 0, 0);
		let end = new Date(this.fc?.view.activeEnd);
		end.setHours(23, 59, 59, 999);
		if (!this.query._AdvanceConfig) {
			this.query._AdvanceConfig = {
				Schema: {
					Type: 'Form',
					Code: 'HRM_TimesheetCycle',
				},
				TimeFrame: {
					Dimension: 'WorkingDate',
					From: {
						Type: 'Absolute',
						IsPastDate: false,
						Period: 'Day',
						Amount: 0,
						Value: start.toISOString(),
					},
					To: {
						Type: 'Absolute',
						IsPastDate: false,
						Period: 'Day',
						Amount: 0,
						Value: end.toISOString(),
					},
				},
				CompareTo: {
					Type: 'Relative',
					IsPastDate: true,
					Period: 'Day',
					Amount: 0,
				},
				Interval: {},
				CompareBy: [
					// {
					// 	Property: 'IDShift',
					// 	Title: 'Shift',
					// },
					// {
					// 	Property: 'TimeOffType',
					// 	Title: 'TimeOff',
					// },
				],
				MeasureBy: [],
				Transform: {
					Filter: {
						Dimension: 'logical',
						Operator: 'AND',
						Value: null,
						Logicals: [
							{ Dimension: 'IDTimesheet', Operator: '=', Value: this.id },
							{ Dimension: 'IsDeleted', Operator: '=', Value: false },
							{ Dimension: 'IsDisabled', Operator: '=', Value: false },
						],
					},
				},
			};
		}
		//this.refresh();
		// this.pageProvider.read(this.query).then((resp) => {});
	}

	async openCheckinLogListModal() {
		const modal = await this.modalController.create({
			component: TimesheetLogPage,
			componentProps: {
				idStaffList: this.allResources.map((m) => m.IDStaff),
			},
			cssClass: 'modal90',
		});

		await modal.present();
		const { data } = await modal.onWillDismiss();
	}

	async openModalPayroll() {
		const modal = await this.modalController.create({
			component: StaffPayrollModalPage,
			componentProps: {
				IDTimesheet: parseInt(this.id),
				IDTimesheetCycle: this.idCycle,
			},
			cssClass: 'modal30',
		});
		await modal.present();
	}

	async calculateTimesheet() {
		console.log('To Date', this.fc?.view.activeEnd);
		const modal = await this.popoverCtrl.create({
			component: StaffTimesheetCalculationModalPage,
			componentProps: {
				formDate: lib.dateFormat(this.fc?.view.activeStart, 'yyyy-mm-dd'),
				toDate: lib.dateFormat(this.fc?.view.activeEnd, 'yyyy-mm-dd'),
			},
			cssClass: 'w300',
			translucent: true,
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			data.IDTimesheet = this.id;
			data.WaitReturn = true;
			this.env
				.showLoading('Loading...', this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/CalculationTimesheet', data).toPromise())
				.then((resp) => {
					this.refresh();
				})
				.catch((err) => this.env.showErrorMessage(err));
		}
	}
}
