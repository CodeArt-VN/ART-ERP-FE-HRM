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
	HRM_LeaveTypeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typecateringg
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { lib } from 'src/app/services/static/global-functions';
import { PersonalSchedulerGeneratorPage } from '../personal-scheduler-generator/personal-scheduler-generator.page';
import { PopoverPage } from '../../SYS/popover/popover.page';
import { BarcodeScannerService } from 'src/app/services/util/barcode-scanner.service';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { CateringVoucherModalPage } from '../catering-voucher-modal/catering-voucher-modal.page';
import { HttpClient } from '@angular/common/http';
import { ScanCheckinModalPage } from '../scan-checkin-modal/scan-checkin-modal.page';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'app-personal-scheduler',
	templateUrl: 'personal-scheduler.page.html',
	styleUrls: ['personal-scheduler.page.scss'],
	standalone: false,
})
export class PersonalSchedulerPage extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	formGroupDate;
	officeList = [];
	gateList = [];
	timesheetList = [];
	selectedTimesheet = null;
	shiftList = [];
	shifTypeList = [];
	timeoffTypeList = [];
	fc = null;
	viewTitle: any;
	myIP = '';
	constructor(
		public pageProvider: HRM_StaffScheduleProvider,
		public openScheduleProvider: HRM_OpenScheduleProvider,
		public overtimeRecordProvider: HRM_StaffRecordOvertimeProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public timesheetLogProvider: HRM_TimesheetLogProvider,
		public timesheetRecordProvider: HRM_TimesheetRecordProvider,
		public timesheetCycleProvider: HRM_TimesheetCycleProvider,
		public leaveTypeProvider: HRM_LeaveTypeProvider,
		public officeProvider: OST_OfficeProvider,
		public gateProvider: OST_OfficeGateProvider,
		public shiftProvider: HRM_ShiftProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,

		private http: HttpClient,
		public formBuilder: FormBuilder,

		public scanner: BarcodeScannerService,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public translate: TranslateService
	) {
		super();
		this.pageConfig.isShowFeature = false;
		this.formGroupDate = this.formBuilder.group({
			singleDate: [new Date().toISOString().split('T')[0]],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([
			this.env.getType('ShiftType'),
			this.shiftProvider.read(),
			this.leaveTypeProvider.read(),
			this.officeProvider.read(),
			this.gateProvider.read(),
			this.timesheetProvider.read(),
		]).then((values) => {
			this.shifTypeList = values[0];
			this.shiftList = values[1]['data'];
			this.timeoffTypeList = values[2]['data'];
			this.officeList = values[3]['data'];
			this.gateList = values[4]['data'];
			this.timesheetList = values[5]['data'];

			this.shiftList.forEach((s) => {
				let shiftType = this.shifTypeList.find((d) => d.Code == s.Type);
				if (shiftType) {
					s.Color = shiftType.Color;
					s.Color = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase());
					s.ShiftType = shiftType.Name;
					s.TextColor = lib.getCssVariableValue('--ion-color-' + shiftType.Color?.toLowerCase() + '-contrast');
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
			Promise.all([
				this.overtimeRecordProvider.read(this.query),
				this.timesheetLogProvider.read(this.query),
				this.timesheetRecordProvider.read(this.query),
				this.translate.get('There is no schedule').toPromise(),
			]).then((values: any) => {
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
						textColor: '#000000',
					};
					this.items.push(item);
				});
				if (values[1]?.data?.length > 0) {
					values[1]?.data?.forEach((i) => {
						let logDate = new Date(i.LogTime).toDateString();
						let gateName = this.gateList?.find((d) => d.Id == i.IDGate)?.Name || '';
						let item = this.items.find((d) => d.IDStaff == i.IDStaff && new Date(d.start).toDateString() == logDate);
						let index = this.items.findIndex((d) => d.IDStaff == i.IDStaff && new Date(d.start).toDateString() == logDate);
						let log: any = {
							ShiftName: 'Checkin',
							start: i.LogTime, //i.StartDate,
							end: i.LogTime,
							IDStaff: i.IDStaff,
							TimeOffType: null,
							ShiftStart: lib.dateFormat(i.LogTime, 'hh:MM'),
							ShiftEnd: lib.dateFormat(i.LogTime, 'hh:MM'),
							Remark: i.Remark,
							IDGate: i.IDGate,
							GateName: gateName,
							allDay: true,
						};
						log.color = lib.getCssVariableValue('--ion-color-success');
						log.textColor = lib.getCssVariableValue('--ion-color-success-contrast');
						if (!i.IsValidLog && !i.SeftClaim) {
							log.color = lib.getCssVariableValue('--ion-color-danger');
							log.textColor = lib.getCssVariableValue('--ion-color-danger-contrast');
						}
						if (!i.IsValidLog && i.SeftClaim) {
							log.color = lib.getCssVariableValue('--ion-color-warning');
							log.textColor = lib.getCssVariableValue('--ion-color-warning-contrast');
						}
						if (item) {
							this.items.splice(index + 1, 0, log);
							if (item.CheckinLog) item.CheckinLog.push(log);
							else item.CheckinLog = [log];
						} else {
							this.items.push(log);
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
							e.textColor = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase() + '-contrast');
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
						e.textColor = shift.TextColor;

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
									e.textColor = shift.TextColor;
									e.Checkin = lib.dateFormat(i.Checkin, 'hh:MM');
									e.Checkout = lib.dateFormat(i.Checkout, 'hh:MM');

									if (new Date(i.WorkingDate) < new Date()) {
										let point = 0;
										if (i.Point) point = Math.round(i.Point * 100) / 100;

										e.Color = 'success';
										e.Icon = 'checkmark-circle-outline';
										e.CheckData = ` ${e.Checkin}→${e.Checkout}`;
										e.Badge = `${i.MinutesOfWorked}-${point}`;
										e.textColor = lib.getCssVariableValue('--ion-color-success-contrast');
										if (!i.LogCount && e.ShiftType != 'WorkFromHomeShift') {
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

										if (e.TimeOffType) {
											let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
											e.Color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase()); //toType.Color;
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

				this.calendarOptions.views.listMonth.noEventsContent = values[3];
				this.calendarOptions.events = this.items;

				this.getCalendar();
				this.fc?.updateSize();
				super.loadedData(event, ignoredFromGroup);
				console.log('items: ', this.items);
			});

			// this.query.EndDate = this.query.WorkingDateFrom;
		}
	}

	calendarOptions: any = {
		plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
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
		headerToolbar: false,
		// headerToolbar: {
		// 	left: '',
		// 	center: 'title',
		// 	//right: 'dayGridMonth timeGridWeek timeGridDay listMonth', // thứ tự hiển thị nút
		// },

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
			listMonth: {
				buttonText: 'List',
				noEventsContent: 'There is no schedule',
				eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
				listDaySideFormat: { weekday: 'long' }, // phải
            	listDayFormat: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }, // trái
				displayEventEnd: true, // Giờ kết thúc
				eventOrder: 'title', // Sắp xếp
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
		// eventTextColor: lib.getCssVariableValue('--ion-color-dark'),
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
				if (arg.event.extendedProps.ShiftType == 'WorkFromHomeShift') {
					html += `<br>${icon}${badge}`;
				}else {
					html += `<br>${icon}${checkData}${badge}`;
				}
			}

			if (arg.event.extendedProps.ShiftName == 'Checkin') {
				html = `<b>${shiftStart}</b> <small>${arg.event.extendedProps.GateName}</small><ion-icon class="del-event-btn" name="trash-outline"></ion-icon>`;
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
		if (arg.event.extendedProps.ShiftName == 'Checkin') {
			return;
		}
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

	// ngAfterViewInit() {
	// 	// Gắn sự kiện khi chuyển view hoặc gotoDate
	// 	this.calendarOptions.datesSet = this.handleDatesSet.bind(this);
	// }
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
					isShowIonDateTime: true,
					// singleDateLabel: 'Ngày',
					submitButtonLabel: 'Chọn',
				},
				popData: {
					singleDate: this.pickedDate,
				},
			},
			event: ev,
			cssClass: 'w300',
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

	savePickDate() {
		if (this.formGroupDate.value.singleDate) {
			this.pickedDate = this.formGroupDate.value.singleDate;
			this.fc?.gotoDate(this.pickedDate);
			this.loadData();
		}
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
					SeftClaim: true,
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

	async scanQRCodeBS() {
		// this.pageProvider.commonService
		// 	.connect('GET', ApiSetting.apiDomain('Account/MyIP'), null)
		// 	.toPromise()
		// 	.then((resp: any) => {
		// 		this.myIP = resp;
		// 		console.log(this.myIP);
		// 	});
		this.env.showLoading('Loading ...', this.http.get('https://api.ipify.org/?format=json').toPromise()).then(async (resp: any) => {
			this.myIP = resp.ip;

			const modal = await this.modalController.create({
				component: ScanCheckinModalPage,
				componentProps: {
					myIP: this.myIP,
				},
				cssClass: 'my-custom-class',
			});

			await modal.present();
			const { data } = await modal.onWillDismiss();
			this.loadData(null);
			console.log('Public IP:', this.myIP);
		});
	}

	async scanQRCode() {
		try {
			if (Capacitor.getPlatform() == 'web') {
				this.scanQRCodeBS();
				return;
			}
			let code = await this.scanner.scan();

			let gateCode = '';
			if (code.indexOf('G:') == 0) {
				gateCode = code.replace('G:', '');
			} else {
				this.env
					.showPrompt('Please scan valid QR code', 'Invalid QR code', null, 'Retry', 'Cancel')
					.then(() => {
						setTimeout(() => this.scanQRCode(), 0);
					})
					.catch(() => {});
				return;
			}

			const loading = await this.loadingController.create({
				cssClass: 'my-custom-class',
				message: 'Vui lòng chờ kiểm tra checkin',
			});
			await loading.present().then(async () => {
				let logItem = {
					IDStaff: this.env.user.StaffID,
					GateCode: gateCode,
					Lat: null,
					Long: null,
					UUID: '',
					IPAddress: this.myIP,
					IsMockLocation: false,
				};

				if (Capacitor.isPluginAvailable('Device')) {
					let UID = await Device.getId();
					logItem.UUID = UID.identifier;
				}
				Geolocation.getCurrentPosition({
					timeout: 5000,
					enableHighAccuracy: true,
				})
					.then((resp) => {
						logItem.Lat = resp.coords.latitude;
						logItem.Long = resp.coords.longitude;
						console.log(resp);
					})
					.catch((err) => {
						console.log(err);
					})
					.finally(() => {
						this.pageProvider
							.save(logItem)
							.then((resp: any) => {
								console.log(resp);
								if (loading) loading.dismiss();

								this.refresh();
								if (resp.Id) {
									let i = resp;
									i.Time = lib.dateFormat(i.LogTime, 'hh:MM');
									i.Date = lib.dateFormat(i.LogTime, 'dd/mm/yyyy');
									i.Gate = this.gateList.find((d) => d.Id == i.IDGate);
									this.env.showMessage('Check-in completed', 'success');
									this.showLog(i);
								} else if (resp != 'OK') {
									this.showLogMessage(resp);
								} else {
									this.env.showMessage('Check-in completed', 'success');
								}
							})
							.catch((err) => {
								if (loading) loading.dismiss();
								// this.env.showMessage(err, 'danger');
							});
					});
			});
		} catch (error) {
			console.error(error);
		}
	}

	async showLog(cData) {
		const modal = await this.modalController.create({
			component: CateringVoucherModalPage,
			componentProps: cData,
			cssClass: 'modal-catering-voucher',
		});
		await modal.present();
	}

	showRemark(i) {
		if (!i.IsValidLog && i.Remark) {
			this.showLogMessage(i.Remark);
		}
	}

	showLogMessage(message) {
		if (message.indexOf('Invalid IP') > -1) {
			this.env.showMessage('IP is invalid. Please use companys wify when checking in', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid gate coordinate') > -1) {
			this.env.showMessage('Check-in gates coordintates are invalid.', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid coordinate') > -1) {
			this.env.showMessage('Cannot verify check-in location, please turn on GPS during chech-in', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid distance') > -1) {
			this.env.showMessage('Please check in at specified location', 'warning', null, 0, true);
		} else if (message.indexOf('Invalid LogTime') > -1) {
			this.env.showMessage('Check-in time is invalid, please check-in at specfied time', 'warning', null, 0, true);
		} else if (message.indexOf('No pre-ordered') > -1) {
			this.env.showMessage('You have not register for meals. Please register at least 01 day in advance', 'warning', null, 0, true);
		} else if (message.indexOf('Schedule not found') > -1) {
			this.env.showMessage('You do not have working schedule', 'warning', null, 0, true);
		} else if (message.indexOf('Catering voucher has been used') > -1) {
			this.env.showMessage('Meal Check-in completed', 'warning', null, 0, true);
		}
	}

	isOpenPopover = false;
	@ViewChild('popover') popover!: HTMLIonPopoverElement;
	presentPopover(e) {
		this.popover.event = e;
		this.isOpenPopover = !this.isOpenPopover;
	}

	changeCalendarView(viewName: string) {
		this.fc?.changeView(viewName);
	}
}
