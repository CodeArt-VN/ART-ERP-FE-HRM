import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_OpenScheduleProvider,
	HRM_ShiftProvider,
	HRM_StaffRecordOvertimeProvider,
	HRM_StaffScheduleProvider,
	HRM_StaffTimesheetEnrollmentProvider,
	HRM_TimesheetCycleProvider,
	HRM_TimesheetLogProvider,
	HRM_TimesheetProvider,
	HRM_TimesheetRecordProvider,
	OST_OfficeGateProvider,
	OST_OfficeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typecateringg
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { lib } from 'src/app/services/static/global-functions';
import { PersonalSchedulerGeneratorPage } from '../personal-scheduler-generator/personal-scheduler-generator.page';
import { PopoverPage } from '../../SYS/popover/popover.page';

@Component({
	selector: 'app-personal-scheduler',
	templateUrl: 'personal-scheduler.page.html',
	styleUrls: ['personal-scheduler.page.scss'],
	standalone: false,
})
export class PersonalSchedulerPage extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	officeList = [];
	gateList = [];
	timesheetList = [];
	selectedTimesheet = null;
	shiftList = [];
	shifTypeList = [];
	timeoffTypeList = [];
	fc = null;
	viewTitle: any;

	constructor(
		public pageProvider: HRM_StaffScheduleProvider,
		public openScheduleProvider: HRM_OpenScheduleProvider,
		public overtimeRecordProvider: HRM_StaffRecordOvertimeProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public timesheetRecordProvider: HRM_TimesheetRecordProvider,
		public timesheetCycleProvider: HRM_TimesheetCycleProvider,
		public officeProvider: OST_OfficeProvider,
		public gateProvider: OST_OfficeGateProvider,
		public shiftProvider: HRM_ShiftProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,

		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController
	) {
		super();
		this.pageConfig.isShowFeature = false;
	}

	preLoadData(event?: any): void {
		Promise.all([
			this.env.getType('ShiftType'),
			this.shiftProvider.read(),
			this.env.getType('TimeOffType'),
			this.officeProvider.read(),
			this.gateProvider.read(),
			this.timesheetProvider.read(),
		]).then((values) => {
			this.officeList = values[3]['data'];
			this.gateList = values[4]['data'];
			this.shifTypeList = values[0];
			this.shiftList = values[1]['data'];
			this.timeoffTypeList = values[2];
			this.timesheetList = values[5]['data'];

			this.shiftList.forEach((s) => {
				let shiftType = this.shifTypeList.find((d) => d.Code == s.Type);
				if (shiftType) {
					s.Color = shiftType.Color;
					s.Color = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase());
					s.ShiftType = shiftType.Name;
				}

				s.Start = lib.dateFormat('01-01-01 ' + s.Start, 'hh:MM');
				s.End = lib.dateFormat('01-01-01 ' + s.End, 'hh:MM');
			});
			// if (this.id) {
			// 	this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
			// }
			super.preLoadData(event);
		});
	}

	loadData(event?: any): void {
		this.getCalendar();
		console.log(this.fc);

		this.query.WorkingDateFrom = lib.dateFormat(this.fc.view.activeStart);
		this.query.WorkingDateTo = lib.dateFormat(this.fc.view.activeEnd);
		//if (!this.pickedDate) this.pickedDate = this.query.WorkingDateFrom;

		this.query.IDStaff = this.env.user.StaffID;
		this.query.Take = 50000;
		this.clearData();
		super.loadData(event);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.query.IDStaff) {
			this.query.StartDateFrom = this.query.WorkingDateFrom;
			this.query.StartDateTo = this.query.WorkingDateTo;
			this.query.LogTimeFrom = this.query.WorkingDateFrom;
			this.query.LogTimeTo = this.query.WorkingDateTo;
			Promise.all([this.overtimeRecordProvider.read(this.query), this.timesheetLogProvider.read(this.query), this.timesheetRecordProvider.read(this.query)]).then(
				(values: any) => {
					console.log(values);
					values[0]?.data?.forEach((i) => {
						let item: any = {
							ShiftName: 'OT',
							IDStaff: i.IDStaff,
							TimeOffType: null,
							ShiftStart: lib.dateFormat(i.StartDate, 'hh:MM'),
							ShiftEnd: lib.dateFormat(i.EndDate, 'hh:MM'),
							start: i.StartDate,
							end: i.EndDate,
						};
						this.items.push(item);
					});
					if (values[1]?.data?.length > 0) {
						values[1]?.data?.forEach((i) => {
							let logDate = new Date(i.LogTime).toDateString();
							let item = this.items.find((d) => d.IDStaff == i.IDStaff && new Date(d.start).toDateString() == logDate);
							if (item) {
								let log = {
									ShiftName: 'Checkin',
									start: i.LogTime, //i.StartDate,
									IDStaff: i.IDStaff,
									TimeOffType: null,
									ShiftStart: lib.dateFormat(i.LogTime, 'hh:MM'),
									Remark: i.Remark,
								};
								if (item.CheckinLog) item.CheckinLog.push(log);
								else item.CheckinLog = [log];
							}
						});
					}
					this.items.forEach((e) => {
						let shift = this.shiftList.find((d) => d.Id == e.IDShift);
						let timesheet = this.timesheetList.find((d) => d.Id == e.IDTimesheet);
						if (e.TimeOffType) {
							let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
							if (toType) {
								e.Color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
								e.color = e.Color;
								e.resourceId = e.IDStaff;
								e.ShiftName = e.TimeOffType;
								e.Badge = '';
								e.html = `<span class="v-align-middle">${e.Title}</span>`;
							} else {
								console.log(e);
							}
						} else if (shift && timesheet) {
							e.Color = shift.Color;
							e.color = e.Color;
							e.resourceId = e.IDStaff;
							e.ShiftName = shift.Name;
							e.ShiftStart = shift.Start;
							e.ShiftEnd = shift.End;

							e.Shift = shift;
							e.Timesheet = timesheet;
							e.html = `<ion-icon color="${e.Color}" name="${e.Icon}"></ion-icon> <span class="v-align-middle">${e.Title}</span><ion-badge color="${e.Color}" class="float-right">${e.Badge}</ion-badge>`;
							if (values[2]?.data?.length > 0) {
								let i = values[2].data.find((d) => d.IDStaff == e.IDStaff && d.WorkingDate == e.WorkingDate);
								if (i) {
									if (shift && timesheet) {
										e.Color = shift.Color;
										e.resourceId = e.IDStaff;
										e.Shift = shift;
										e.Timesheet = timesheet;

										e.Checkin = lib.dateFormat(i.Checkin, 'hh:MM');
										e.Checkout = lib.dateFormat(i.Checkout, 'hh:MM');

										if (new Date(i.WorkingDate) < new Date()) {
											let point = 0;
											if (e.Point) point = Math.round(e.Point * 100) / 100;

											e.Color = 'success';
											e.Icon = 'checkmark-circle-outline';
											e.CheckData = ` ${e.Checkin}→${e.Checkout}`;
											e.Badge = `${i.MinutesOfWorked}-${point}`;

											if (!i.LogCount) {
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
										e.PointObject = {
											Point: i.Point,
											MinutesOfWorked: i.MinutesOfWorked,
											LogCount: i.LogCount,
											StdTimeIn: i.StdTimeIn,
											StdTimeOut: i.StdTimeOut,
											Breaks: i.Breaks,
										};
										e.color = lib.getCssVariableValue('--ion-color-' + e.Color) + '22';
									}
								}
							}
						}
					});
					this.calendarOptions.events = this.items;

					this.getCalendar();
					this.fc?.updateSize();
					super.loadedData(event, ignoredFromGroup);
					console.log(this.items);
				}
			);

			// this.query.EndDate = this.query.WorkingDateFrom;
		}
	}

	calendarOptions: any = {
		plugins: [dayGridPlugin, timeGridPlugin],
		initialView: 'dayGridMonth',
		height: '100%',
		timeZone: 'Asia/Ho_Chi_Minh',
		aspectRatio: 1.5,

		buttonIcons: {
			prev: 'chevron-left',
			next: 'chevron-right',
		},
		titleFormat: { year: 'numeric', month: 'numeric', omitCommas: true },

		firstDay: 1,
		weekends: true,
		nowIndicator: true,

		businessHours: {
			daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
			startTime: '06:00',
			endTime: '24:00',
		},

		// events: [
		//     { title: 'event 1', date: '2019-04-01' },
		//     { title: 'event 2', date: '2019-04-02' }
		// ],
		headerToolbar: {
			left: '',
			center: 'title',
			right: 'dayGridMonth timeGridWeek timeGridDay', // thứ tự hiển thị nút
		},

		views: {
			dayGridMonth: {
				buttonText: 'Month',
				titleFormat: { year: 'numeric', month: 'long' }, // Ví dụ: June 2025
			},
			timeGridWeek: {
				buttonText: 'Week',
				titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }, // Ví dụ: Jun 23 – 29, 2025

				slotMinTime: '00:00:00', // Bắt đầu từ 6h sáng
				slotMaxTime: '24:00:00', // Kết thúc lúc nửa đêm
				columnHeaderFormat: { weekday: 'short', day: '2-digit', month: '2-digit' },
			},
			timeGridDay: {
				buttonText: 'Day',
				titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
				slotMinTime: '00:00:00',
				slotMaxTime: '24:00:00',
				columnHeaderFormat: { weekday: 'short' },
			},

			resourceTimelineDay: {
				slotDuration: '03:00',
			},
			resourceTimelineWeek: {
				slotDuration: '06:00',
				//slotDuration: { days: 1 },
				dayHeaderFormat: {
					weekday: 'short',
					month: 'numeric',
					day: 'numeric',
					omitCommas: true,
				},
			},
		},
		slotLabelFormat: {
			hour: 'numeric',
			minute: '2-digit',
			hour12: false, // nếu muốn hiển thị 24h
		},
		// slotLabelFormat: [
		// 	//{ week: "short" }, // top level of text
		// 	{
		// 		weekday: 'short',
		// 		day: '2-digit',
		// 		month: '2-digit',
		// 		omitCommas: true,
		// 	}, // lower level of text
		// ],
		eventColor: lib.getCssVariableValue('--ion-color-primary') + '22',
		eventTextColor: lib.getCssVariableValue('--ion-color-dark'),
		eventDisplay: 'block',
		displayEventTime: false,
		editable: false,
		selectable: false,
		eventDurationEditable: false,

		//eventOverlap: false,
		eventContent: function (arg) {
			// arg.backgroundColor = arg.event.extendedProps.Color;
			// arg.borderColor = arg.event.extendedProps.Color;
			let shiftEnd = arg.event.extendedProps.ShiftEnd;
			let shiftStart = arg.event.extendedProps.ShiftStart;
			let isOvernight = arg.event.extendedProps.Shift?.IsOvernightShift;

			// <b>${arg.event.title}</b>&nbsp;
			let html = `<span class="v-align-middle">${arg.event.extendedProps.ShiftName}</span><small> &nbsp;${shiftStart ? shiftStart : ''}${shiftEnd ? ' - ' + shiftEnd : ''}</small>`;
			if (isOvernight) {
				html += `<br><small style="color: orange;">(Ca qua đêm)</small>`;
			}
			if (arg.event.extendedProps.CheckData) {
				let icon = `${arg.event.extendedProps.Icon ? '<ion-icon color="' + arg.event.extendedProps.Color + '" name="' + arg.event.extendedProps.Icon + '"></ion-icon>' : ''}`;
				let checkData = `${arg.event.extendedProps.CheckData ? '<span class="v-align-middle">' + arg.event.extendedProps.CheckData + '</span>' : ''}`;
				let badge = `${arg.event.extendedProps.Badge ? '<ion-badge color="' + arg.event.extendedProps.Color + '" class="float-right">' + arg.event.extendedProps.Badge + '</ion-badge>' : ''}`;
				html += `<br>${icon}${checkData}${badge}`;
			}

			if (arg.event.extendedProps.IsBookBreakfastCatering || arg.event.extendedProps.IsBookLunchCatering || arg.event.extendedProps.IsBookDinnerCatering) {
				let booked = arg.event.extendedProps.IsBookBreakfastCatering ? 'B' : '';
				booked += arg.event.extendedProps.IsBookLunchCatering ? 'L' : '';
				booked += arg.event.extendedProps.IsBookDinnerCatering ? 'D' : '';
				html += `<br><ion-icon class="lunch-booked" name="restaurant-outline"></ion-icon>(${booked})`;
			}

			return {
				html: html,
			};
		},
		// eventAllow: function (dropInfo, draggedEvent) {
		//     console.log(dropInfo, draggedEvent);

		//     return true;
		// },

		//eventDidMount: this.eventDidMount.bind(this),
		//select: this.select.bind(this),
		//dateClick: this.dateClick.bind(this), // bind is important!
		eventClick: this.eventClick.bind(this),
	};

	eventDidMount(arg) {}
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
		this.massShiftAssignment({
			FromDate: arg.event.startStr.substr(0, 10),
			ToDate: arg.event.startStr.substr(0, 10),
			DaysOfWeek: [arg.event.start.getDay()],
			Id: arg.event.id,
			IDShift: arg.event.extendedProps.IDShift,
			TimeOffType: arg.event.extendedProps.TimeOffType,
			Staffs: [parseInt(arg.event.extendedProps.IDStaff)],
			IsAllStaff: false,
			IsOpenShift: false,
			IsBookLunchCatering: arg.event.extendedProps.IsBookLunchCatering,
			IsBookBreakfastCatering: arg.event.extendedProps.IsBookBreakfastCatering,
			IsBookDinnerCatering: arg.event.extendedProps.IsBookDinnerCatering,
			ShiftStart: arg.event.extendedProps.ShiftStart,
			ShiftEnd: arg.event.extendedProps.ShiftEnd,
			CheckingLog: arg.event.extendedProps.CheckinLog,
			PointObject: arg.event.extendedProps.PointObject,
		});
	}

	toggleWeekends() {
		this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
	}
	// Lưu lại ngày đầu/tháng khi chuyển view để load đúng range dữ liệu
	handleDatesSet(arg) {
		// Cập nhật lại range ngày khi chuyển view hoặc gotoDate
		this.query.WorkingDateFrom = lib.dateFormat(arg.start);
		this.query.WorkingDateTo = lib.dateFormat(arg.end);
		this.loadData();
	}

	ngAfterViewInit() {
		// Gắn sự kiện khi chuyển view hoặc gotoDate
		this.calendarOptions.datesSet = this.handleDatesSet.bind(this);
	}
	changeTimesheet() {
		let newURL = '#/personal-scheduler/';
		if (this.selectedTimesheet) {
			newURL += this.selectedTimesheet.Id;
			this.id = this.selectedTimesheet.Id;
			this.loadData(null);
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
		this.viewTitle = this.fc.currentData.viewTitle;
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
	isOpenPickDatePopover = false;
	pickedDate;
	@ViewChild('pickDatePopover') pickDatePopover!: HTMLIonPopoverElement;
	// presentPickDatePopover(e) {
	// 	this.pickDatePopover.event = e;
	// 	this.isOpenPickDatePopover = !this.isOpenPickDatePopover;
	// }
	async presentPickDatePopover(ev: any) {
		let popover = await this.popoverCtrl.create({
			component: PopoverPage,
			componentProps: {
				popConfig: {
					type: 'PopSingleDate',
					isShowSingleDate: true,
					singleDateLabel: 'Ngày',
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
				this.loadData();
			}
		});
		this.pickDatePopover = popover;
		return await popover.present();
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
		cData.officeList = this.officeList;
		cData.gateList = this.gateList;
		const modal = await this.modalController.create({
			component: PersonalSchedulerGeneratorPage,
			componentProps: cData,
			cssClass: 'my-custom-class',
		});

		await modal.present();
		const { data } = await modal.onWillDismiss();
		console.log(cData);
		if (data) {
			let submitData: any = { Id: data.Id };
			if (data.TimeSpan && data.IDGate && data.IDOffice && data.Remark) {
				submitData = {
					IsAdditional: true,
					IDStaff: cData.Staffs[0],
					IDGate: data.IDGate,
					LogTime: `${cData.FromDate}T${data.TimeSpan}:00`,
					TimeSpan: data.TimeSpan,
					IDOffice: data.IDOffice,
					IPAddress: data.IPAddress,
					Remark: data.Remark,
				};
				this.timesheetLogProvider.save(submitData).then((resp) => {
					this.loadData(null);
				});
			} else {
				let dirtyFields = ['IsBookLunchCatering', 'IsBookBreakfastCatering', 'IsBookDinnerCatering'];
				let isSave = false;
				dirtyFields.forEach((f) => {
					if (data[f] != cData[f]) {
						submitData[f] = data[f];
						isSave = true;
					}
				});
				if (isSave) {
					this.pageProvider.save(submitData).then((resp) => {
						this.loadData(null);
					});
				}
			}
		}
	}
}
