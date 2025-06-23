import { Component, Input, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_OpenScheduleProvider,
	HRM_ShiftProvider,
	HRM_StaffTimesheetEnrollmentProvider,
	HRM_TimesheetCycleProvider,
	HRM_TimesheetProvider,
	OST_OfficeGateProvider,
	OST_OfficeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { lib } from 'src/app/services/static/global-functions';
import { PointModalPage } from '../../point-modal/point-modal.page';
import { StaffPayrollModalPage } from '../../staff-payroll-modal/staff-payroll-modal.page';
import dayGridPlugin from '@fullcalendar/daygrid';
@Component({
	selector: 'app-timesheet-cycle-detail-component',
	templateUrl: './timesheet-cycle-detail.page.html',
	styleUrls: ['./timesheet-cycle-detail.page.scss'],
	standalone: false,
})
export class TimesheetCycleDetailComponent extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;

	@Input() IDTimesheet;
	@Input() idCycle;
	officeList = [];
	gateList = [];
	timesheetList = [];
	selectedTimesheet = null;
	shiftList = [];
	shifTypeList = [];
	timeoffTypeList = [];
	fc = null;

	constructor(
		public pageProvider: HRM_TimesheetCycleProvider,
		public cycleProvider: HRM_TimesheetCycleProvider,
		public openScheduleProvider: HRM_OpenScheduleProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public officeProvider: OST_OfficeProvider,
		public gateProvider: OST_OfficeGateProvider,
		public shiftProvider: HRM_ShiftProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,

		public modalController: ModalController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController
	) {
		super();
		// this.IDTimesheet = this.route.snapshot?.paramMap?.get('idtimesheet');
	}

	preLoadData(event?: any): void {
		this.id = this.idCycle;
		Promise.all([
			this.officeProvider.read(),
			this.env.getType('ShiftType'),
			this.timesheetProvider.read(),
			this.shiftProvider.read(),
			this.env.getType('TimeOffType'),
			this.cycleProvider.getAnItem(this.id),
			//this.gateProvider.read(),
		]).then((values) => {
			this.officeList = values[0]['data'];

			this.shifTypeList = values[1];
			this.timesheetList = values[2]['data'];
			this.shiftList = values[3]['data'];
			this.timeoffTypeList = values[4];
			this.item = values[5];

			this.timesheetList = this.timesheetList.filter((d) => this.item.Timesheets.indexOf(d.Id) > -1);

			this.shiftList.forEach((s) => {
				let shiftType = this.shifTypeList.find((d) => d.Code == s.Type);
				if (shiftType) {
					s.Color = shiftType.Color;
					s.color = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase());
					s.ShiftType = shiftType.Name;
				}

				s.Start = lib.dateFormat('2000-01-01 ' + s.Start, 'hh:MM');
				s.End = lib.dateFormat('2000-01-01 ' + s.End, 'hh:MM');
			});
			// this.gateList = values[4]['data'];
			// this.gateList.forEach(g=>{
			//     g.Office = this.officeList.find(d=>d.Id == g.IDOffice);
			// });

			if (this.IDTimesheet) {
				this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.IDTimesheet);
				if (!this.selectedTimesheet) {
					this.IDTimesheet = 0;
					let resources = [];
					this.calendarOptions.resources = resources;
				}
			}
			if (!this.IDTimesheet && this.timesheetList.length) {
				this.selectedTimesheet = this.timesheetList[0];
				this.IDTimesheet = this.selectedTimesheet.Id;
			}
			super.preLoadData(event);
		});
	}

	loadData(event?: any): void {
		this.getCalendar();

		this.query.WorkingDateFrom = lib.dateFormat(this.fc.view.activeStart);
		this.query.WorkingDateEnd = lib.dateFormat(this.fc.view.activeEnd);
		this.query.IDTimesheet = this.IDTimesheet;
		this.query.IDCycle = this.id;
		this.query.IDShift = JSON.stringify(this.shiftList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.ShiftType = JSON.stringify(this.shifTypeList.filter((d) => d.isChecked).map((m) => m.Code));
		this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.Take = 50000;

		this.clearData();
		if (this.IDTimesheet) {
			this.query.CC = true;
			this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.IDTimesheet }).then((resp) => {
				let resources = resp['data'];
				//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
				this.calendarOptions.resources = resources;
				this.getCalendar();
				this.fc?.gotoDate(this.item.Start);
			});
			super.loadData(event);
		} else {
			this.loadedData(event);
		}
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.items.forEach((e) => {
			//id	IDStaff	Code	FullName	IDShift	Name	WorkingDate	WorkingStart	WorkingEnd	LogFrom	LogTo	WorkTime	StandardPoint	Breaks	EarliestCheckin	LatestCheckin	EarliestCheckout	LatestCheckout
			///CTESID	LogCount	Checkin	Checkout	ChecinLate	CheckoutEarly	StdTimeIn	StdTimeOut
			//CTESID	MinutesOfWorked	HolidayLeave	AnnualLeave	MaternityLeave	Quit	TrainingOutside	PaidLeave	CompensateLeave	UnpaidLeave	Advance	Deduction	Addition	Point

			let timesheet = this.timesheetList.find((d) => d.Id == e.IDTimesheet);
			let shift = this.shiftList.find((d) => d.Id == e.IDShift);
			if (shift && timesheet) {
				e.color = shift.color;
				e.resourceId = e.IDStaff;
				e.start = e.WorkingDate;
				e.Shift = shift;
				e.Timesheet = timesheet;

				e.Checkin = lib.dateFormat(e.Checkin, 'hh:MM');
				e.Checkout = lib.dateFormat(e.Checkout, 'hh:MM');

				if (new Date(e.WorkingDate) < new Date()) {
					let point = 0;
					if (e.Point) point = Math.round(e.Point * 100) / 100;

					e.Color = 'success';
					e.Icon = 'checkmark-circle-outline';
					e.Title = `${e.Checkin}→${e.Checkout}`;
					e.Badge = `${e.MinutesOfWorked}-${point}`;

					//  else if (e.LogCount == 1) {
					// 	e.Color = 'danger';
					// 	e.Icon = 'help-circle-outline';
					// 	e.Title = `${e.Checkin}`;
					// 	e.Badge = `?`;
					// }
					// if (e.LogCount > 2) {
					// 	e.Color = 'warning';
					// 	e.Icon = 'alert-circle-outline';
					// 	e.Title = `F:<b>${e.Checkin}</b>→L:<b>${e.Checkout}</b>`;
					// 	e.Badge = `${e.MinutesOfWorked}-${point}`;
					// } else
					if (!e.LogCount) {
						e.Color = 'danger';
						e.Icon = 'alert-circle-outline';
						e.Title = `Q`;
						e.Badge = `0`;
					}

					if (e.TimeOffType) {
						let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
						e.Color = toType.Color;
						e.Icon = 'alert-circle-outline';
						e.Title = `${e.TimeOffType}`;
						e.Badge = `${point}`;
					}
				} else {
					e.Color = 'medium';
					e.Icon = 'timer-outline';
					e.Title = `${shift.Name}`;
					e.Badge = `${shift.Start}→${shift.End}`;
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
				} else {
					console.log(e);
				}
			}
		});

		this.calendarOptions.events = this.items;
		this.getCalendar();
		this.fc?.updateSize();
		super.loadedData(event, ignoredFromGroup);
	}
	// plugins: [dayGridPlugin],//[resourceTimelinePlugin],
	// initialView:'dayGridMonth', //'resourceTimelineWeek',

	async export() {
		super.export();
	}

	dismissDatePicker(isApply, pickedDate) {
		if (isApply) {
			this.fc?.gotoDate(pickedDate);
			this.loadData();
		}
	}

	calendarOptions: any = {
		plugins: [resourceTimelinePlugin], //[resourceTimelinePlugin],
		schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
		locale: 'vi',
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
				//slotDuration: '24:00',
				slotDuration: { days: 1 },
				slotMinWidth: 230,
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
		// resourceGroupField: 'JobTitle',
		resourceAreaWidth: '352px',
		// resourceAreaHeaderContent: {
		//     html:
		//         '<div class="d-flex flex-column align-items-start">' + 'a</div>'
		// },
		resourceAreaColumns: [
			{
				field: 'Code',
				headerContent: 'Mã NV',
				width: 100,
			},
			{
				field: 'FullName',
				headerContent: 'Họ và tên',
				width: 200,
			},
			{
				field: 'LeaveDaysRemaining',
				headerContent: 'Ngày phép',
				width: 80,
			},
			// {
			//     //group: true,
			//     field: 'JobTitle',
			//     headerContent: false,
			//     width: 150
			// },
		],
		eventMinWidth: 230,
		eventColor: lib.getCssVariableValue('--ion-color-primary') + '22',
		eventTextColor: lib.getCssVariableValue('--ion-color-dark'),
		displayEventTime: false,
		editable: false,
		selectable: false,
		eventDurationEditable: false,
		eventOverlap: false,

		eventContent: function (arg) {
			return {
				html: arg.event.extendedProps.html,
			};
		},
		eventClick: this.eventClick.bind(this),
	};

	eventClick(arg) {
		if (arg.event.extendedProps.TimeOffType) {
			return;
		}
		this.showPointModal(arg);
	}

	toggleWeekends() {
		this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
	}

	changeTimesheet() {
		if (this.selectedTimesheet) {
			this.IDTimesheet = this.selectedTimesheet.Id;
		} else {
			this.IDTimesheet = 0;
		}

		this.loadData(null);

		// let newURL = '#/timesheet-cycle/';
		// if (this.selectedTimesheet) {
		//     newURL += this.selectedTimesheet.Id;
		//     this.id = this.selectedTimesheet.Id;
		//     this.loadData(null);
		// }
		// else {
		//     this.id = 0;
		// }
		// history.pushState({}, null, newURL);
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
	}
	fcNext() {
		this.getCalendar();
		this.fc?.next();
	}
	fcPrev() {
		this.getCalendar();
		this.fc?.prev();
	}

	async showPointModal(cData = null) {
		const modal = await this.modalController.create({
			component: PointModalPage,
			componentProps: {
				cData: cData,
				IDCycle: parseInt(this.id),
			},
			cssClass: 'modal-hrm-point',
		});
		await modal.present();
	}

	async openModalPayroll() {
		const modal = await this.modalController.create({
			component: StaffPayrollModalPage,
			componentProps: {
				IDTimesheet: parseInt(this.IDTimesheet),
				IDTimesheetCycle: parseInt(this.id),
			},
			cssClass: 'modal30',
		});
		await modal.present();
	}
}
