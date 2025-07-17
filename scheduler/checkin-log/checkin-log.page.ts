import { Component, Input, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
	HRM_StaffTimesheetEnrollmentProvider,
	HRM_TimesheetLogProvider,
	HRM_TimesheetProvider,
	OST_OfficeGateProvider,
	OST_OfficeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

import { lib } from 'src/app/services/static/global-functions';
import { LogGeneratorPage } from '../../log-generator/log-generator.page';
import { TimesheetLogPage } from '../timesheet-log/timesheet-log.page';

@Component({
	selector: 'app-checkin-log-component',
	templateUrl: 'checkin-log.page.html',
	styleUrls: ['checkin-log.page.scss'],
	standalone: false,
})
export class CheckinLogComponent extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	@Input() idTimesheet;
	@Input() pickedDate;
	officeList = [];
	gateList = [];
	timesheetList = [];
	selectedTimesheet = null;
	allResources = [];

	fc = null;

	constructor(
		public pageProvider: HRM_TimesheetLogProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public officeProvider: OST_OfficeProvider,
		public gateProvider: OST_OfficeGateProvider,
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
		// this.pageConfig.isShowFeature = true;
	}
	async showLoading() {
		const loading = await this.loadingController.create({
			message: 'Loading...',
		});

		loading.present();
	}

	preLoadData(event?: any): void {
		this.id = this.idTimesheet;

		Promise.all([this.officeProvider.read(), this.timesheetProvider.read(), this.gateProvider.read()]).then((values) => {
			this.officeList = values[0]['data'];
			this.timesheetList = values[1]['data'];
			this.gateList = values[2]['data'];
			if (this.id) {
				this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
			}
			super.preLoadData(event);
		});
	}

	loadData(event?: any): void {
		this.getCalendar();
		if (this.pickedDate) this.fc?.gotoDate(this.pickedDate);
		this.query.LogTimeFrom = lib.dateFormat(this.fc.view.activeStart);
		this.query.LogTimeTo = lib.dateFormat(this.fc.view.activeEnd);
		this.query.IDTimesheet = this.id;

		this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
		this.query.Take = 50000;

		this.clearData();
		if (this.id) {
			this.env.showLoading('Loading...', this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id })).then((resp) => {
				let resources = resp['data'];
				//resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})
				// this.calendarOptions.resources = resources;
				this.allResources = resources;
				this.query.IDStaff = JSON.stringify(this.allResources.map((m) => m.IDStaff));
				super.loadData(event);
			});
		} else {
			this.loadedData(event);
		}
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		const currentViewDate = this.pickedDate ? new Date(this.pickedDate) : new Date(this.fc?.view?.activeStart);
		this.items.forEach((e) => {
			e.start = e.LogTime;
			e.allDay = true;
			// let shift = this.shiftList.find(d => d.Id == e.IDShift);
			// if (shift) {
			//     e.color = shift.color;
			//     //e.title += ' '+shift.Start.substring(0,5) +'-'+shift.End.substring(0,5)+'';
			//     e.ShiftStart = shift.Start;
			//     e.ShiftEnd = shift.End;
			//     // e.start = lib.dateFormat(e.WorkingDate) + 'T'+shift.Start;
			//     // if(shift.IsOvernightShift)
			//     //     e.end = lib.dateFormat(e.WorkingDate) + 'T'+shift.End;
			//     // else
			//     //     e.end = lib.dateFormat(e.WorkingDate) + 'T'+shift.End;
			// }
		});
		this.calendarOptions.events = this.items;
		this.calendarOptions.resources = this.allResources.filter((resource) => {
			if (resource.EndDate == null) return true;
			const endDate = new Date(resource.EndDate);
			const hasData = this.items.some((item) => item.IDStaff === resource.IDStaff);
			if (!hasData && currentViewDate > endDate) {
				return hasData; // Chỉ giữ nếu còn dữ liệu2
			}

			return true; // Chưa xóa => giữ
		});
		this.getCalendar();
		this.fc?.updateSize();
		// if (this.pickedDate) this.fc?.gotoDate(this.pickedDate);
		super.loadedData(event, ignoredFromGroup);
	}

	async export() {
		super.export();
	}

	dismissDatePicker(pickedDate) {
		this.pickedDate = pickedDate;
		this.fc?.gotoDate(pickedDate);
		this.preLoadData();
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
			startTime: '00:00',
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
				slotDuration: '24:00',
				//slotDuration: { days: 1 },
				dayHeaderFormat: {
					weekday: 'short',
					month: 'numeric',
					day: 'numeric',
					omitCommas: true,
				},
				eventMaxStack: 2,
			},
			resourceTimelineMonth: {
				// slotDuration: '06:00'
				slotDuration: { days: 1 },
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
				//group: true,
				field: 'JobTitle',
				headerContent: 'Chức danh',
				width: 150,
			},
		],

		eventColor: lib.getCssVariableValue('--ion-color-primary') + '22',
		eventTextColor: lib.getCssVariableValue('--ion-color-dark'),
		displayEventTime: false,
		editable: false,
		selectable: true,
		eventDurationEditable: false,
		eventOverlap: true,
		slotLabelContent: function (arg) {
			let texts = arg.text.split(' ');
			let html = `<b>${texts[0].toUpperCase()}</b><br><small>${texts[1]}</small>`;
			return { html: html };
		},
		eventContent: this.eventContent.bind(this),
		// eventAllow: function (dropInfo, draggedEvent) {
		//     console.log(dropInfo, draggedEvent);

		//     return true;
		// },

		eventDidMount: this.eventDidMount.bind(this),
		select: this.select.bind(this),
		eventClick: this.eventClick.bind(this),
	};

	eventContent(arg) {
		let html = '';
		let ltime = lib.dateFormat(arg.event.extendedProps.LogTime, 'hh:MM');
		let gate = this.gateList.find((d) => d.Id == arg.event.extendedProps.IDGate);
		if (this.pageConfig.canEdit) {
			html = `<b>${ltime}</b> <small>${gate?.Name}</small><ion-icon class="del-event-btn" name="trash-outline"></ion-icon>`;
		} else {
			html = `<b>${arg.event.title}</b> <small>${arg.event.extendedProps.ShiftStart}-${arg.event.extendedProps.ShiftEnd}</small>`;
		}
		return { html: html };
	}
	eventDidMount(arg) {
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
	}

	eventClick(arg) {
		this.massShiftAssignment({
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
	}

	select(arg) {
		arg.end.setDate(arg.end.getDate() - 1);

		this.massShiftAssignment({
			FromDate: arg.startStr.substr(0, 10),
			ToDate: arg.end.toISOString().substr(0, 10),
			//TimeSpan: arg.event.extendedProps.LogTime.substr(11, 5),
			Staffs: [parseInt(arg.resource.id)],
			// Id: arg.event.extendedProps.Id,
			// IDOffice: arg.event.extendedProps.IDOffice,
			// IDGate: arg.event.extendedProps.IDGate,
			// Image: arg.event.extendedProps.Image,
			// IPAddress: arg.event.extendedProps.IPAddress,
			// UUID: arg.event.extendedProps.UUID,
			// IsValidLog: arg.event.extendedProps.IsValidLog,
			// IsOpenLog: arg.event.extendedProps.IsOpenLog,
			// IsMockLocation: arg.event.extendedProps.IsOpenLog
		});
	}

	toggleWeekends() {
		this.calendarOptions.weekends = !this.calendarOptions.weekends; // toggle the boolean!
	}

	changeTimesheet(selectedTimesheet) {
		let newURL = '#/checkin-log/';
		if (selectedTimesheet) {
			// newURL += selectedTimesheet.Id;
			this.id = selectedTimesheet.Id;
			this.loadData(null);
		} else {
			this.id = 0;
		}
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
		console.log('fcToday CheckinLog');
		this.getCalendar();
		this.fc?.today();
		this.pickedDate = this.fc?.view?.activeStart;
		this.loadData();
	}
	fcNext() {
		this.getCalendar();
		this.fc?.next();
		this.pickedDate = this.fc?.view?.activeStart;
		this.loadData();
	}
	fcPrev() {
		this.getCalendar();
		this.fc?.prev();
		this.pickedDate = this.fc?.view?.activeStart;
		this.loadData();
	}

	async massShiftAssignment(cData) {
		cData.staffList = this.calendarOptions.resources;
		cData.officeList = this.officeList;
		cData.gateList = this.gateList;

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

			this.pageProvider.save(data).then((resp) => {
				this.loadData(null);
			});
		}
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
}
