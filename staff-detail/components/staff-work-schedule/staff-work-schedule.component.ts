import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';
import { FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import {
	HRM_OpenScheduleProvider,
	HRM_ShiftProvider,
	HRM_StaffRecordOvertimeProvider,
	HRM_StaffScheduleProvider,
	HRM_StaffTimesheetEnrollmentProvider,
	HRM_TimesheetProvider,
	OST_OfficeProvider,
} from 'src/app/services/static/services.service';
@Component({
	selector: 'app-staff-work-schedule',
	templateUrl: './staff-work-schedule.component.html',
	styleUrls: ['./staff-work-schedule.component.scss'],
	standalone: false
})
export class StaffWorkScheduleComponent extends PageBase {
	@Input() set sfId(value) {
		this.id = value;
		this.query.IDStaff = this.id;
	}

	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	officeList = [];
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
		public officeProvider: OST_OfficeProvider,
		public shiftProvider: HRM_ShiftProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,
		public env: EnvService,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('ShiftType'), this.shiftProvider.read(), this.env.getType('TimeOffType')]).then((values) => {
			//this.officeList = values[0]['data'];
			this.shifTypeList = values[0];
			//this.timesheetList = values[2]['data'];
			this.shiftList = values[1]['data'];
			this.timeoffTypeList = values[2];

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
			if (this.id) {
				this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
			}
			super.preLoadData(event);
		});
	}

	loadData(event?: any): void {
		// this.getCalendar();
		// console.log(this.fc);

		// this.query.WorkingDateFrom = lib.dateFormat(this.fc.view.activeStart);
		// this.query.WorkingDateTo = lib.dateFormat(this.fc.view.activeEnd);
		this.query.TimeOffType_ne = 'null';
		this.query.Take = 50000;
		this.clearData();
		super.loadData(event);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.query.IDStaff) {
			delete this.query.TimeOffType_ne;
			// this.query.StartDateFrom = this.query.WorkingDateFrom;
			// this.query.StartDateTo = this.query.WorkingDateTo;
			this.overtimeRecordProvider.read(this.query).then((values: any) => {
				console.log('tăng ca:');
				console.log(values?.data);
				// {
				// 	"id": 50979,
				// 	"title": "A2",
				// 	"start": "2025-04-01T00:00:00",
				// 	"resourceId": 2820,
				// 	"IDStaff": 2820,
				// 	"ShiftType": "AfternoonShift",
				// 	"IDTimesheet": 99,
				// 	"IDShift": 65,
				// 	"WorkingDate": "2025-04-01T00:00:00",
				// 	"Remark": null,
				// 	"IsPublished": false,
				// 	"TimeOffType": null,
				// 	"IsBookBreakfastCatering": false,
				// 	"IsBookLunchCatering": false,
				// 	"IsBookDinnerCatering": false,
				// 	"_CurrentDate": "2025-04-25T14:48:31.1819478"
				//   }
				values?.data?.forEach((i) => {
					this.items.push({
						title: 'OT',
						start: i.StartDate,
						IDStaff: i.IDStaff,
						TimeOffType: null,
						WorkingDate: lib.dateFormat(i.StartDate, 'dd-MM-yyyy'),
						ShiftStart: lib.dateFormat(i.StartDate, 'hh:MM'),
						ShiftEnd: lib.dateFormat(i.EndDate, 'hh:MM'),
					});
				});
				this.items.forEach((e) => {
					let shift = this.shiftList.find((d) => d.Id == e.IDShift);
					if (shift) {
						e.Color = shift.Color;
						e.ShiftStart = shift.Start;
						e.ShiftEnd = shift.End;
					}
					if (e.TimeOffType) {
						let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
						e.Color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
					}
				});
				// this.calendarOptions.events = this.items;

				// // this.getCalendar();
				// // this.fc?.updateSize();
				super.loadedData(event, ignoredFromGroup);
			});
			// this.query.EndDate = this.query.WorkingDateFrom;
		}
	}





	calendarOptions: any = {
		schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
		plugins: [dayGridPlugin],
		initialView: 'dayGridMonth',
		height: '100%',
		timeZone: 'Asia/Ho_Chi_Minh',
		aspectRatio: 1.5,
		headerToolbar: false,
		// headerToolbar: {
		//     start: 'title',
		//     center: '',
		//     end: 'today prev,next',

		//     // left: 'resourceTimelineWeek,dayGridMonth',
		//     // center: 'title',
		//     // right: 'today,prev,next'
		// },
		buttonIcons: {
			prev: 'chevron-left',
			next: 'chevron-right',
		},
		titleFormat: { year: 'numeric', month: 'numeric', omitCommas: true },
		// buttonText: {
		//     today: 'Hôm nay',
		//     month: 'Tháng',
		//     week: 'Tuần',
		// },

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
		views: {
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
		//resourceAreaWidth: '0',
		// resourceAreaHeaderContent: {
		//     html:
		//         '<div class="d-flex flex-column align-items-start">' + 'a</div>'
		// },
		// resourceAreaColumns: [

		//     {
		//         field: 'Code',
		//         headerContent: 'Mã NV',
		//         width: 100
		//     },
		//     {
		//         field: 'FullName',
		//         headerContent: 'Họ và tên',
		//         width: 200
		//     },
		//     {
		//         //group: true,
		//         field: 'JobTitle',
		//         headerContent: false,
		//         width: 150
		//     },
		// ],

		// eventColor: lib.getCssVariableValue('--ion-color-primary'),
		// eventBackgroundColor: lib.getCssVariableValue('--ion-color-primary'),
		eventDisplay: 'block',
		displayEventTime: false,
		editable: false,
		selectable: false,
		eventDurationEditable: false,
		//eventOverlap: false,

		eventContent: function (arg) {
			arg.backgroundColor = arg.event.extendedProps.Color;
			arg.borderColor = arg.event.extendedProps.Color;

			let html = `<span class='fc-event-custom-css' style='padding: 5px; display: block'><b>${arg.event.title}</b><br> <small>${arg.event.extendedProps.ShiftStart}<br>${arg.event.extendedProps.ShiftEnd}</small>`;

			if (arg.event.extendedProps.IsBookBreakfastCatering || arg.event.extendedProps.IsBookLunchCatering || arg.event.extendedProps.IsBookDinnerCatering) {
				let booked = arg.event.extendedProps.IsBookBreakfastCatering ? 'B' : '';
				booked += arg.event.extendedProps.IsBookLunchCatering ? 'L' : '';
				booked += arg.event.extendedProps.IsBookDinnerCatering ? 'D' : '';
				html += `<br><ion-icon class="lunch-booked" name="restaurant-outline"></ion-icon>(${booked})`;
			}

			html += `</span>`;
			if (arg.event.extendedProps.TimeOffType) {
				html = `<span class='fc-event-custom-css' style='padding: 5px; display: block'><b>${arg.event.extendedProps.TimeOffType}</b> </span>`;
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

	eventDidMount(arg) {
		// let that = this;
		// arg.el.querySelector('.del-event-btn').onclick = function (e) {
		//     e.preventDefault();
		//     e.stopPropagation()
		//     that.env.showPrompt('Bạn có chắc muốn xóa ca này?', null, 'Phân ca')
		//         .then(_ => {
		//             that.submitAttempt = true;
		//             that.pageProvider.delete([{ Id: parseInt(arg.event.id) }])
		//                 .then((savedItem: any) => {
		//                     arg.event.remove();
		//                     that.submitAttempt = false;
		//                 }).catch(err => {
		//                     that.submitAttempt = false;
		//                 });
		//         }).catch(e => { });
		// }
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
		});
	}

	toggleWeekends() {
		this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
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
		// if (!cData) {
		// 	cData = {
		// 		FromDate: this.query.WorkingDateFrom,
		// 		ToDate: this.query.WorkingDateEnd,
		// 	};
		// }
		// cData.staffList = this.calendarOptions.resources;
		// cData.shiftList = this.shiftList;
		// cData.timeoffTypeList = this.timeoffTypeList;
		// const modal = await this.modalController.create({
		// 	component: PersonalSchedulerGeneratorPage,
		// 	componentProps: cData,
		// 	cssClass: 'my-custom-class',
		// });
		// await modal.present();
		// const { data } = await modal.onWillDismiss();
		// console.log(cData);
		// if (data) {
		// 	this.pageProvider.save(data).then((resp) => {
		// 		this.loadData(null);
		// 	});
		// }
	}
}
