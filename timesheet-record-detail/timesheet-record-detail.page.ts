//TODO: payslip
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_PayrollTemplateProvider,
	HRM_PolSalaryProvider,
	HRM_StaffPayrollProvider,
	HRM_StaffRecordPayrollProvider,
	HRM_TimesheetCycleProvider,
	HRM_TimesheetRecordProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';
import { HRM_TimesheetRecordService } from '../staff-timesheet-record.service';
import { StaffTimesheetCalculationModalPage } from '../staff-timesheet-calculation-modal/staff-timesheet-calculation-modal.page';
import { StaffPayrollModalPage } from '../staff-payroll-modal/staff-payroll-modal.page';

@Component({
	selector: 'app-timesheet-record-detail',
	templateUrl: 'timesheet-record-detail.page.html',
	styleUrls: ['timesheet-record-detail.page.scss'],
	standalone: false,
})
export class TimesheetRecordDetailPage extends PageBase {
	isOpenPopover = false;
	IDTimesheet;
	cycle: any;
	jobTitleList: any = [];
	status:any = null;
	constructor(
		public pageProvider: HRM_TimesheetRecordProvider,
		public staffTimesheetRecordProvider: HRM_TimesheetRecordService,
		public timesheetCycleProvider: HRM_TimesheetCycleProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
		this.IDTimesheet = this.route.snapshot?.paramMap?.get('idtimesheet');
	}

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = 'Timesheet record';
		this.pageConfig.showSpinner = true;
		this.jobTitleList = lib.cloneObject(this.env.jobTitleList);
		Promise.all([this.timesheetCycleProvider.getAnItem(this.id)]).then((values) => {
			this.cycle = values[0];
			this.status = this.cycle?.Timesheets?.find(d=> d.IDTimesheet == parseInt(this.IDTimesheet))?.Status;
			super.preLoadData(event);
		});
	}

	loadData(event?: any): void {
		this.query = {
			IDTimesheetCycle: this.id,
			IDTimesheet: this.IDTimesheet,
			WorkingDateFrom: this.cycle?.Start,
			WorkingDateTo: this.cycle?.End,
		};
		super.loadData(event);
	}

	loadedData(event) {
		this.pageConfig.showSpinner = false;
		event?.target?.complete();
		console.log(this.items);

		this.items.forEach((i) => {
			i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i._Staff.JobTitle = lib.getAttrib(i._Staff.IDJobTitle, this.jobTitleList);
		});

		console.log('Items: ', this.items);
	}

	exportPayrollRecords(type = null): Promise<void> {
		let recordQuery = { IDTimesheet: this.IDTimesheet, ConfigUDFType: type, Lang: this.env.language.current, IDTimesheetCycle: this.id };
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.exportStaffimesheetRecord(recordQuery))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				this.submitAttempt = false;
			});
	}

	exportRecordSummary(type = null): Promise<void> {
		let recordQuery = { IDTimesheet: this.IDTimesheet, Lang: this.env.language.current, IDTimesheetCycle: this.id };
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.exportTimesheetRecordSummary(recordQuery))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				this.submitAttempt = false;
			});
	}

	@ViewChild('importfile') importfile: any;
	onClickImport() {
		this.importfile.nativeElement.value = '';
		this.importfile.nativeElement.click();
	}
	@ViewChild('importInputFile') importInputFile: any;
	onClickImportInput() {
		this.importInputFile.nativeElement.value = '';
		this.importInputFile.nativeElement.click();
	}
	importTimesheetRecords(event) {
		if (event.target.files.length == 0) return;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.import(event.target.files[0]))
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

	importPayrollRecordInput(event) {
		if (event.target.files.length == 0) return;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.importStaffimesheetRecordInput(event.target.files[0], this.id))
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

	@ViewChild('Popover') Popover!: HTMLIonPopoverElement;
	presentPopover(e) {
		this.Popover.event = e;
		this.isOpenPopover = !this.isOpenPopover;
	}

	async calculateTimesheet() {
		const modal = await this.popoverCtrl.create({
			component: StaffTimesheetCalculationModalPage,
			componentProps: {
				formDate: lib.dateFormat(this.cycle.Start, 'yyyy-MM-dd'),
				toDate: lib.dateFormat(this.cycle.End, 'yyyy-MM-dd'),
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

	async calculateStaffPayroll() {
		const modal = await this.popoverCtrl.create({
			component: StaffPayrollModalPage,
			componentProps: {
				IDTimesheet: parseInt(this.IDTimesheet),
				IDTimesheetCycle: parseInt(this.id),
			},
			cssClass: 'w300',
			translucent: true,
		});
		await modal.present();
	}
}
