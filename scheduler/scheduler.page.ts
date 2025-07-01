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

@Component({
	selector: 'app-scheduler',
	templateUrl: 'scheduler.page.html',
	styleUrls: ['scheduler.page.scss'],
	standalone: false,
})
export class SchedulerPage extends PageBase {
	@ViewChild('calendar') calendarComponent: FullCalendarComponent;
	@ViewChild('checkinLog') checkinLog: CheckinLogComponent;
	@ViewChild('timesheetCycle') timesheetCycle: TimesheetCycleDetailComponent;
	idCycle: any = 0;
	officeList = [];
	timesheetList = [];
	selectedTimesheet = null;
	shiftList = [];
	shifTypeList = [];
	timeoffTypeList = [];
	OTStatusList = [];
	fc: any = null;
	isOpenPopover = false;
	staffList = [];
	navigateObj: any = {};
	allResources = [];

	constructor(
		public pageProvider: HRM_StaffScheduleProvider,
		public openScheduleProvider: HRM_OpenScheduleProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public overtimeRequestProvider: HRM_StaffOvertimeRequestProvider,
		public staffRecordOvertimeProvider: HRM_StaffRecordOvertimeProvider,
		public officeProvider: OST_OfficeProvider,
		public shiftProvider: HRM_ShiftProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,
		public timesheetCycleDetailProvider: HRM_TimesheetCycleDetailProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public router: Router,
		public navCtrl: NavController
	) {
		super();
		// this.pageConfig.isShowFeature = true;
		this.pageConfig.ShowSearch = false;
	}

	async openCycleModal() {
		this.getTimesheetCycle();
		// let popover = await this.popoverCtrl.create({
		// 	component: TimesheetCycleSelectModalComponent,
		// 	componentProps: { _timesheetCycleList: this._timesheetCycleList },
		// 	cssClass: 'w300',
		// 	translucent: true,
		// });
		// popover.onDidDismiss().then((result: any) => {
		// 	if (result.data && result.data.IDCycle) {
		// 		this.idCycle = result.data.IDCycle;
		// 	}
		// });
		// await popover.present();
	}

	getTimesheetCycle() {
		this.timesheetCycleDetailProvider.read({ IDTimesheet: this.id, Date: this.pickedDate ? new Date(this.pickedDate) : new Date() }).then(async (resp) => {
			if (resp['data'] && resp['data'].length > 1) {
				this._timesheetCycleList = resp['data'].map((d) => d._TimesheetCycle);
				let popover = await this.popoverCtrl.create({
					component: TimesheetCycleSelectModalComponent,
					componentProps: { _timesheetCycleList: resp['data'].map((d) => d._TimesheetCycle) },
					cssClass: 'w300',
					translucent: true,
				});
				popover.onDidDismiss().then((result: any) => {
					if (result.data && result.data.IDCycle) {
						this.idCycle = result.data.IDCycle;
						this.segmentView = 's3';
					}
				});
				await popover.present();
			} else if (resp['data'] && resp['data'].length == 1) {
				this.idCycle = resp['data'][0]?.IDTimesheetCycle;
				this.segmentView = 's3';
			} else {
				// this.idCycle = 0;
				this.segmentView = 's3';
				this.env.showMessage('No timesheet cycle found for this date', 'warning');
			}
		});
	}

	segmentView = 's1';
	_timesheetCycleList: any[] = [];
	segmentChanged(ev: any) {
		if (ev.detail.value == 's3') {
			// let date = this.pickedDate ? new Date(this.pickedDate) : new Date();
			// const matchedCycle = this._timesheetCycleList.some((item) => {
			// 	const start = new Date(item.Start);
			// 	const end = new Date(item.End);
			// 	return date >= start && date <= end;
			// });
			if (!this.idCycle) {
				this.getTimesheetCycle();
			} else {
				this.segmentView = ev.detail.value;
			}
		} else if (ev.detail.value == 's1') {
			this.segmentView = ev.detail.value;
			if (this.pickedDate) this.fc?.gotoDate(this.pickedDate);
			this.loadData();
		} else {
			this.segmentView = ev.detail.value;
		}
	}

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = '';
		this.route.queryParams.subscribe((params) => {
			this.navigateObj = this.router.getCurrentNavigation().extras.state;
			if (this.navigateObj) {
				this.id = this.navigateObj?.id;
				this.idCycle = this.navigateObj?.IDCycle;
			}
		});
		Promise.all([
			this.officeProvider.read(),
			this.env.getType('ShiftType'),
			this.timesheetProvider.read(),
			this.shiftProvider.read(),
			this.env.getType('TimeOffType'),
			this.env.getStatus('StandardApprovalStatus'),
		]).then((values) => {
			this.officeList = values[0]['data'];
			this.shifTypeList = values[1];
			this.timesheetList = values[2]['data'];
			this.shiftList = values[3]['data'];
			this.timeoffTypeList = values[4];
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
			this.OTStatusList = values[5];
			if (this.id) {
				this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
			} else if (this.timesheetList.length) {
				this.selectedTimesheet = this.timesheetList[0];
				this.id = this.selectedTimesheet.Id;
			}
			super.preLoadData(event);
		});
	}
	async showLoading() {
		const loading = await this.loadingController.create({
			message: 'Loading...',
		});

		loading.present();
	}

	loadData(event?: any) {
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
			if (this.navigateObj && this.navigateObj?.id && this.navigateObj?.segmentView) {
				this.pageConfig.showSpinner = false;
				this.segmentChanged({ detail: { value: this.navigateObj.segmentView } });
				this.navigateObj = null; // Reset navigateObj after using it
				// this.loadedData(event);
			}
			else if(this.segmentView != 's1') {
				this.pageConfig.showSpinner = false;
				this.segmentChanged({ detail: { value: this.segmentView } });
				
				return;
			}
			else {
				this.env.showLoading('Loading...',this.staffTimesheetEnrollmentProvider
				.read({ IDTimesheet: this.id }))
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
		} else {
			this.loadedData(event);
		}
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		const currentViewDate = this.pickedDate ? new Date(this.pickedDate) : new Date(this.fc?.view?.activeStart);

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
				this.patchItems();
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
				if (this.pickedDate) this.fc?.gotoDate(this.pickedDate);
				super.loadedData(event, ignoredFromGroup);
			})
			.catch((err) => {
				this.patchItems();
				this.calendarOptions.events = this.items;
				this.getCalendar();
				this.fc?.updateSize();
				super.loadedData(event, ignoredFromGroup);
			})
			.finally(() => {
				if (this.navigateObj && this.navigateObj?.id) {
					this.segmentChanged({ detail: { value: 's3' } });
				}
				this.loadingController.dismiss();
			});
	}
	patchItems() {
		this.items.forEach((e) => {
			let shift = this.shiftList.find((d) => d.Id == e.IDShift);
			if (shift) {
				e.color = shift.color;

				if (e.TimeOffType) {
					let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
					e.color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
				}

				e.ShiftStart = shift.Start;
				e.ShiftEnd = shift.End;
			}
			if (e.TimeOffType) {
				let toType = this.timeoffTypeList.find((d) => d.Code == e.TimeOffType);
				if (toType) {
					e.color = lib.getCssVariableValue('--ion-color-' + toType.Color?.toLowerCase());
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
				field: 'LeaveDaysRemaining',
				headerContent: 'Ngày phép',
				width: 80,
			},
		],

		//resourceAreaHeaderContent: 'Nhân sự',
		resourceLabelContent: function (arg) {
			//console.log(arg.resource.extendedProps);
			let imgpath = environment.staffAvatarsServer + arg.resource.extendedProps.Code + '.jpg';
			let html = `
            <div class="staff-resource">
                <span class="name">
                    <span class="code">${arg.resource.extendedProps.Code} </span>
                </span>
                <ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>
            </div>`;
			return { html: html };
		},
		// resourceLabelContent: function (arg) {
		//     console.log(arg.resource.extendedProps);
		//     let imgpath = environment.staffAvatarsServer + arg.resource.extendedProps.Code + '.jpg';
		//     let html = `
		//     <div class="staff-resource">
		//         <ion-avatar class="avatar" slot="start"><img #img src="${imgpath}"  onerror="this.src = 'assets/avartar-empty.jpg';" ></ion-avatar>
		//         <span class="name">
		//             <span class="full-name">${arg.resource.extendedProps.FullName}</span>
		//             <span class="code">${arg.resource.extendedProps.Code} </span>
		//         </span>
		//         <ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>
		//     </div>`;
		//     return { html: html };
		// },
		resourceLabelDidMount: this.resourceLabelDidMount.bind(this),
		eventMinWidth: 200,
		eventColor: lib.getCssVariableValue('--ion-color-primary'),
		displayEventTime: false,
		editable: true,
		selectable: true,
		eventDurationEditable: true, // Cho phép kéo dài sự kiện
		eventOverlap: true,
		droppable: true,

		eventContent: (arg) => {
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
		},
		// eventAllow: function (dropInfo, draggedEvent) {
		//     console.log(dropInfo, draggedEvent);

		//     return true;
		// },

		eventDidMount: this.eventDidMount.bind(this),
		select: this.select.bind(this),
		dateClick: this.dateClick.bind(this), // bind is important!
		eventClick: null, //this.eventClick.bind(this),
		eventChange: this.eventChange.bind(this),
		eventDrop: this.eventDrop.bind(this),
		eventResize: this.eventResize.bind(this),
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
		let that = this;
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
						let ids = `[${parseInt(arg.event.id)}]`;
						that.pageProvider.commonService
							.connect('PUT', 'HRM/StaffSchedule/DeleteSchedule/' + ids, null)
							.toPromise()
							.then((savedItem: any) => {
								try {
									let obj = JSON.parse(savedItem);
									console.log(obj);
									if (obj.IDRequest) {
										that.env.showPrompt('This leave request has been approved. Do you want to navigate to the leave request page?', null, null).then((_) => {
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

		if (this.segmentView == 's3') {
			this.timesheetCycle.changeTimesheet(this.selectedTimesheet);
		} else if (this.segmentView == 's2') {
			this.checkinLog.changeTimesheet(this.selectedTimesheet);
		} else {
			let newURL = '#/scheduler/';
			if (this.selectedTimesheet) {
				newURL += this.selectedTimesheet.Id;
				this.loadData(null);
			} else {
				this.id = 0;
			}
			history.pushState({}, null, newURL);
		}
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
		if (this.segmentView == 's2') {
			this.checkinLog.fcToday();
			this.pickedDate = this.checkinLog.fc?.view?.activeStart ? new Date(this.checkinLog.fc.view.activeStart) : null;
		} else if (this.segmentView == 's3') {
			this.timesheetCycle.fcToday();
			this.pickedDate = this.timesheetCycle.fc?.view?.activeStart ? new Date(this.timesheetCycle.fc.view.activeStart) : null;
		} else {
			this.getCalendar();
			this.fc?.today();
			this.pickedDate = this.fc?.view?.activeStart ? new Date(this.fc.view.activeStart) : null;
			this.loadData();
		}
	}
	fcNext() {
		if (this.segmentView == 's2') {
			this.checkinLog.fcNext();
			this.pickedDate = this.checkinLog.fc?.view?.activeStart ? new Date(this.checkinLog.fc.view.activeStart) : null;
		} else if (this.segmentView == 's3') {
			this.timesheetCycle.fcNext();
			this.pickedDate = this.timesheetCycle.fc?.view?.activeStart ? new Date(this.timesheetCycle.fc.view.activeStart) : null;
		} else {
			this.getCalendar();
			this.fc?.next();
			this.pickedDate = this.fc?.view?.activeStart ? new Date(this.fc.view.activeStart) : null;
			this.loadData();
		}
	}
	fcPrev() {
		if (this.segmentView == 's2') {
			this.checkinLog.fcPrev();
			this.pickedDate = this.checkinLog.fc?.view?.activeStart ? new Date(this.checkinLog.fc.view.activeStart) : null;
		} else if (this.segmentView == 's3') {
			this.timesheetCycle.fcPrev();
			this.pickedDate = this.timesheetCycle.fc?.view?.activeStart ? new Date(this.timesheetCycle.fc.view.activeStart) : null;
		} else {
			this.getCalendar();
			this.fc?.prev();
			this.pickedDate = this.fc?.view?.activeStart ? new Date(this.fc.view.activeStart) : null;
			this.loadData();
		}
	}

	import(event: any): Promise<void> {
		if (this.segmentView == 's2') {
			this.checkinLog.import(event);
		} else if (this.segmentView == 's3') {
			this.timesheetCycle.import(event);
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

	refresh(event?: any): void {
		if (this.segmentView == 's2') {
			this.checkinLog.refresh(event);
		} else if (this.segmentView == 's3') {
			this.timesheetCycle.refresh(event);
		} else {
			super.refresh(event);
		}
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
	async export() {
		if (this.segmentView == 's2') {
			return this.checkinLog.export();
		} else if (this.segmentView == 's3') {
			// this.getAdvaneTimesheetFilterConfig();
			// 	const modal = await this.modalController.create({
			// 	component: AdvanceFilterModalComponent,
			// 	cssClass: 'modal90',
			// 	componentProps: {
			// 		_AdvanceConfig: this.query._AdvanceConfig,
			// 		schemaType: 'Form',
			// 		selectedSchema: this.schemaPage,
			// 		confirmButtonText: 'Export',
			// 		renderGroup: { Filter: ['TimeFrame', 'Transform'] },
			// 	},
			// });
			// await modal.present();
			// const { data } = await modal.onWillDismiss();
			// if (data && data.data) {
			// 	if (data.isApplyFilter) this.query._AdvanceConfig = data?.data;
			// 	if (data.schema) this.schemaPage = data?.schema;
			// 	return this.timesheetCycle.export();
			// }
			return this.timesheetCycle.export();
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
				if (this.segmentView == 's2') {
					this.checkinLog.dismissDatePicker(this.pickedDate);
					this.isOpenPickDatePopover = false;
				} else if (this.segmentView == 's3') {
					this.timesheetCycle.dismissDatePicker(this.pickedDate);
					this.isOpenPickDatePopover = false;
				} else {
					this.fc?.gotoDate(this.pickedDate);
					this.isOpenPickDatePopover = false;
					// this.fc.view.activeEnd = this.dateEnd;
					this.loadData();
				}
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
}
