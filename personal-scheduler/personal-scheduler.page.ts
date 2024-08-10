import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
  HRM_OpenScheduleProvider,
  HRM_ShiftProvider,
  HRM_StaffScheduleProvider,
  HRM_StaffTimesheetEnrollmentProvider,
  HRM_TimesheetLogProvider,
  HRM_TimesheetProvider,
  OST_OfficeGateProvider,
  OST_OfficeProvider,
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typecateringg
import dayGridPlugin from '@fullcalendar/daygrid';

import { formatDate } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { PersonalSchedulerGeneratorPage } from '../personal-scheduler-generator/personal-scheduler-generator.page';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';

@Component({
  selector: 'app-personal-scheduler',
  templateUrl: 'personal-scheduler.page.html',
  styleUrls: ['personal-scheduler.page.scss'],
})
export class PersonalSchedulerPage extends PageBase {
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
    public timesheetProvider: HRM_TimesheetProvider,
    public officeProvider: OST_OfficeProvider,
    public shiftProvider: HRM_ShiftProvider,
    public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,

    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public route: ActivatedRoute,
    public navCtrl: NavController,
  ) {
    super();
    this.pageConfig.isShowFeature = false;
  }

  preLoadData(event?: any): void {
    Promise.all([this.env.getType('ShiftType'), this.shiftProvider.read(), this.env.getType('TimeOffType')]).then(
      (values) => {
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
      },
    );
  }

  loadData(event?: any): void {
    this.getCalendar();
    console.log(this.fc);

    this.query.WorkingDateFrom = lib.dateFormat(this.fc.view.activeStart);
    this.query.WorkingDateTo = lib.dateFormat(this.fc.view.activeEnd);

    this.query.IDStaff = this.env.user.StaffID;
    this.query.Take = 50000;
    this.clearData();
    super.loadData(event);
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
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
    this.calendarOptions.events = this.items;

    this.getCalendar();
    this.fc?.updateSize();
    super.loadedData(event, ignoredFromGroup);
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

      if (
        arg.event.extendedProps.IsBookBreakfastCatering ||
        arg.event.extendedProps.IsBookLunchCatering ||
        arg.event.extendedProps.IsBookDinnerCatering
      ) {
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
    //     that.env.showPrompt2('Bạn có chắc muốn xóa ca này?', null, 'Phân ca')
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
    if (!cData) {
      cData = {
        FromDate: this.query.WorkingDateFrom,
        ToDate: this.query.WorkingDateEnd,
      };
    }

    cData.staffList = this.calendarOptions.resources;
    cData.shiftList = this.shiftList;
    cData.timeoffTypeList = this.timeoffTypeList;

    const modal = await this.modalController.create({
      component: PersonalSchedulerGeneratorPage,
      componentProps: cData,
      cssClass: 'my-custom-class',
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(cData);
    if (data) {
      this.pageProvider.save(data).then((resp) => {
        this.loadData(null);
      });
    }
  }
}
