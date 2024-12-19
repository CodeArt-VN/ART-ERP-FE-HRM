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
} from 'src/app/services/static/services.service';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular'; // useful for typechecking
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
import { SchedulerGeneratorPage } from '../scheduler-generator/scheduler-generator.page';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-scheduler',
    templateUrl: 'scheduler.page.html',
    styleUrls: ['scheduler.page.scss'],
    standalone: false
})
export class SchedulerPage extends PageBase {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  officeList = [];
  timesheetList = [];
  selectedTimesheet = null;
  shiftList = [];
  shifTypeList = [];
  timeoffTypeList = [];
  fc: any = null;

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
    // this.pageConfig.isShowFeature = true;
  }

  preLoadData(event?: any): void {
    Promise.all([
      this.officeProvider.read(),
      this.env.getType('ShiftType'),
      this.timesheetProvider.read(),
      this.shiftProvider.read(),
      this.env.getType('TimeOffType'),
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
      if (this.id) {
        this.selectedTimesheet = this.timesheetList.find((d) => d.Id == this.id);
      } else if (this.timesheetList.length) {
        this.selectedTimesheet = this.timesheetList[0];
        this.id = this.selectedTimesheet.Id;
      }
      super.preLoadData(event);
    });
  }

  loadData(event?: any): void {
    this.getCalendar();

    this.query.WorkingDateFrom = lib.dateFormat(this.fc.view.activeStart);
    this.query.WorkingDateTo = lib.dateFormat(this.fc.view.activeEnd);
    this.query.IDTimesheet = this.id;
    this.query.IDShift = JSON.stringify(this.shiftList.filter((d) => d.isChecked).map((m) => m.Id));
    this.query.ShiftType = JSON.stringify(this.shifTypeList.filter((d) => d.isChecked).map((m) => m.Code));
    this.query.IDOffice = JSON.stringify(this.officeList.filter((d) => d.isChecked).map((m) => m.Id));
    this.query.Take = 50000;

    this.clearData();
    if (this.id) {
      this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.id }).then((resp) => {
        let resources = resp['data'];
        //resources.unshift({FullName: 'OPEN SHIFT', Code:'', Department: '', JobTitle: ''})

        this.calendarOptions.resources = resources;
      });
      super.loadData(event);
    } else {
      this.loadedData(event);
    }
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
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

    this.calendarOptions.events = this.items;
    this.getCalendar();
    this.fc?.updateSize();
    super.loadedData(event, ignoredFromGroup);
  }

  calendarOptions: any = {
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
    eventDurationEditable: false,
    eventOverlap: false,

    eventContent: function (arg) {
      let html = `<b>${arg.event.title}</b> <small>${arg.event.extendedProps.ShiftStart}-${arg.event.extendedProps.ShiftEnd}</small><ion-icon class="del-event-btn" name="trash-outline"></ion-icon>`;
      if (
        arg.event.extendedProps.IsBookBreakfastCatering ||
        arg.event.extendedProps.IsBookLunchCatering ||
        arg.event.extendedProps.IsBookDinnerCatering
      ) {
        let booked = arg.event.extendedProps.IsBookBreakfastCatering ? 'B' : '';
        booked += arg.event.extendedProps.IsBookLunchCatering ? 'L' : '';
        booked += arg.event.extendedProps.IsBookDinnerCatering ? 'D' : '';
        html = `<ion-icon class="lunch-booked" name="restaurant-outline"></ion-icon>(${booked}) - ` + html;
      }
      if (arg.event.extendedProps.TimeOffType) {
        html = `<b>${arg.event.extendedProps.TimeOffType}</b> <ion-icon class="del-event-btn" name="trash-outline"></ion-icon>`;
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
    eventClick: this.eventClick.bind(this),
    eventChange: this.eventChange.bind(this),
  };

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
            .delete([
              {
                Id: parseInt(arg.resource._resource.extendedProps.Id),
              },
            ])
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
    arg.el.querySelector('.del-event-btn').onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      that.env
        .showPrompt('Bạn có chắc muốn xóa ca này?', null, 'Phân ca')
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
    let newURL = '#/scheduler/';
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
}
