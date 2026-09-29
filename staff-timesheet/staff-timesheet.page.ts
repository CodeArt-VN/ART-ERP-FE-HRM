import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetCycleProvider, HRM_TimesheetRecordProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';
import { HRM_TimesheetRecordService } from '../staff-timesheet-record.service';
import {
	buildDetailColumns,
	buildSummaryColumnsFromHeaders,
	buildTimesheetRecordColumnsQuery,
	buildTimesheetRecordDetailExportQuery,
	buildTimesheetRecordSummaryExportQuery,
	formatTimesheetNumber,
	formatTimesheetDateTime,
	formatTimesheetDate,
	markNumericColumns,
	resolveTimesheetCycleConfigTarget,
	staffTimesheetJobTitleId,
	staffTimesheetStaffColumn,
	StaffTimesheetColumn,
} from './staff-timesheet.columns';

@Component({
	selector: 'app-staff-timesheet',
	templateUrl: 'staff-timesheet.page.html',
	styleUrls: ['staff-timesheet.page.scss'],
	standalone: false,
})
export class StaffTimesheetPage extends PageBase {
	segmentView: 'summary' | 'detail' = 'summary';
	cycleList: any[] = [];
	selectedCycle: any = null;
	timesheetOptions: any[] = [];
	selectedTimesheet: any = null;
	columns: StaffTimesheetColumn[] = [];
	staffColumnWidth = staffTimesheetStaffColumn.width;
	jobTitleId = staffTimesheetJobTitleId;
	jobTitleList: any[] = [];
	private lastCycleId: any = null;
	private lastTimesheetId: any = null;
	private summaryLoading = false;
	private hasEnteredOnce = false;

	constructor(
		public pageProvider: HRM_TimesheetRecordProvider,
		public timesheetCycleProvider: HRM_TimesheetCycleProvider,
		public staffTimesheetRecordProvider: HRM_TimesheetRecordService,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
		this.pageConfig.ShowSearch = false;
		this.pageConfig.ShowExport = false;
	}

	ionViewWillEnter() {
		super.ionViewWillEnter();
		if (!this.hasEnteredOnce) {
			this.hasEnteredOnce = true;
			return;
		}
		if (this.selectedCycle?.Id && this.selectedTimesheet?.IDTimesheet) {
			this.reloadList();
		}
	}

	preLoadData(event?: any): void {
		this.jobTitleList = lib.cloneObject(this.env.jobTitleList);
		this.query.SortBy = 'WorkingDate_desc';

		this.env
			.showLoading(
				'Loading...',
				this.timesheetCycleProvider.read({ SortBy: 'Id_desc', Take: 200 })
			)
			.then((resp: any) => {
				this.cycleList = resp?.data || [];
				if (this.cycleList.length) {
					this.selectedCycle = this.cycleList[0];
					this.applyCycleSelection(false);
				}
				super.preLoadData(event);
			})
			.catch((err) => {
				console.log(err);
				super.preLoadData(event);
			});
	}

	applyCycleSelection(reload = true) {
		this.lastCycleId = this.selectedCycle?.Id ?? null;
		this.timesheetOptions = this.selectedCycle?.Timesheets || [];
		if (this.timesheetOptions.length) {
			const stillValid = this.timesheetOptions.find((t) => t.IDTimesheet == this.selectedTimesheet?.IDTimesheet);
			this.selectedTimesheet = stillValid || this.timesheetOptions[0];
		} else {
			this.selectedTimesheet = null;
		}
		this.lastTimesheetId = this.selectedTimesheet?.IDTimesheet ?? null;
		if (reload) this.reloadList();
	}

	changeCycle() {
		const nextId = this.selectedCycle?.Id ?? null;
		if (nextId === this.lastCycleId) return;
		this.lastCycleId = nextId;
		this.lastTimesheetId = null;
		this.applyCycleSelection(true);
	}

	changeTimesheet() {
		const nextId = this.selectedTimesheet?.IDTimesheet ?? null;
		if (nextId === this.lastTimesheetId) return;
		this.lastTimesheetId = nextId;
		this.reloadList();
	}

	segmentChanged(ev: any) {
		const next = ev?.detail?.value;
		if (!next || next === this.segmentView) return;
		this.segmentView = next;
		this.columns = [];
		this.items = [];
		this.reloadList();
	}

	/** PageBase.refresh bỏ qua khi spinner đang bật, nên tắt cờ trước khi tải lại. */
	private reloadList() {
		this.summaryLoading = false;
		this.columns = [];
		this.pageConfig.showSpinner = false;
		this.pageConfig.isEndOfData = false;
		this.refresh();
	}

	loadData(event?: any): void {
		if (!this.selectedCycle?.Id || !this.selectedTimesheet?.IDTimesheet) {
			this.items = [];
			this.columns = [];
			this.loadedData(event);
			return;
		}

		this.query.IDTimeSheetCycle = this.selectedCycle.Id;
		delete this.query.IDTimesheetCycle;
		this.query.IDTimesheet = this.selectedTimesheet.IDTimesheet;
		this.query.WorkingDateFrom = this.selectedCycle.Start;
		this.query.WorkingDateTo = this.selectedCycle.End;

		if (this.segmentView === 'summary') {
			if (this.summaryLoading || this.pageConfig.isEndOfData) {
				this.loadedData(event);
				return;
			}
			this.loadSummaryData(event);
			return;
		}

		this.loadDetailData(event);
	}

	loadDetailData(event?: any) {
		if (this.summaryLoading || this.pageConfig.isEndOfData) {
			this.loadedData(event);
			return;
		}

		const query = {
			IDTimesheet: this.selectedTimesheet.IDTimesheet,
			IDTimeSheetCycle: this.selectedCycle.Id,
			WorkingDateFrom: this.selectedCycle.Start,
			WorkingDateTo: this.selectedCycle.End,
			SortBy: this.query.SortBy,
			Skip: this.items?.length || 0,
			Take: this.query.Take || 200,
		};

		this.summaryLoading = true;
		this.pageConfig.showSpinner = !this.items?.length;
		const columnsQuery = buildTimesheetRecordColumnsQuery({
			IDTimesheet: query.IDTimesheet,
			IDTimesheetCycle: this.selectedCycle.Id,
		});
		if (!columnsQuery) {
			this.summaryLoading = false;
			this.pageConfig.isEndOfData = true;
			this.loadedData(event);
			this.env.showMessage('Please select timesheet cycle and timesheet', 'warning');
			return;
		}

		const columnsReady = this.columns?.length
			? Promise.resolve(this.columns)
			: this.staffTimesheetRecordProvider.getTimesheetRecordColumns(columnsQuery).then((cols: any) => {
					this.columns = buildDetailColumns(cols);
					return this.columns;
				});

		columnsReady
			.then(() => this.staffTimesheetRecordProvider.getTimesheetRecordDetail(query))
			.then((rows: any) => {
				const page = rows || [];
				page.forEach((i) => this.enrichStaff(i));
				this.items = this.dataManagementService.appendPaginatedItems(this.items, page);
				this.columns = markNumericColumns(this.columns, this.items);
				this.markEndOfDataIfLastPage(page.length);
				this.summaryLoading = false;
				this.loadedData(event);
			})
			.catch((err) => {
				console.log(err);
				this.summaryLoading = false;
				this.pageConfig.isEndOfData = true;
				this.loadedData(event);
				this.env.showMessage('Cannot load timesheet detail', 'danger');
			});
	}

	loadSummaryData(event?: any) {
		const query = {
			IDTimesheet: this.selectedTimesheet.IDTimesheet,
			IDTimesheetCycle: this.selectedCycle.Id,
			Lang: this.env.language?.current,
		};

		this.summaryLoading = true;
		this.pageConfig.showSpinner = true;
		this.staffTimesheetRecordProvider
			.getTimesheetRecordSummary(query)
			.then((resp: any) => {
				const rows = resp?.rows || [];
				rows.forEach((i) => this.enrichStaff(i));
				this.items = rows;
				this.columns = markNumericColumns(buildSummaryColumnsFromHeaders(resp?.headers), rows);
				this.pageConfig.isEndOfData = true;
				this.summaryLoading = false;
				this.loadedData(event);
			})
			.catch((err) => {
				console.log(err);
				this.items = [];
				this.columns = [];
				this.pageConfig.isEndOfData = true;
				this.summaryLoading = false;
				this.loadedData(event);
				this.env.showMessage('Cannot load timesheet summary', 'danger');
			});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.pageConfig.showSpinner = false;
		event?.target?.complete?.();

		super.loadedData(event, ignoredFromGroup);
		// Cùng reference thì datatable không tắt spinner cuối bảng khi đã hết trang.
		if (this.pageConfig.isEndOfData && this.items) {
			this.items = this.items.slice();
		}
	}

	enrichStaff(i: any) {
		if (!i?._Staff) return;
		i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
		i._Staff.JobTitle = lib.getAttrib(i._Staff.IDJobTitle, this.jobTitleList);
	}

	async openCycleConfig() {
		const target = resolveTimesheetCycleConfigTarget(this.selectedTimesheet);
		if (!this.selectedCycle?.Id || !this.selectedTimesheet?.IDTimesheet || !target) {
			this.env.showMessage('Please select timesheet cycle and timesheet', 'warning');
			return;
		}

		this.navCtrl.navigateForward('/timesheet-template/cycle-config/' + target.idTimesheetCycleDetail, {
			queryParams: {
				name: target.timesheetName,
				status: target.status,
				back: 'staff-timesheet',
			},
		});
	}

	async calculateTimesheet() {
		if (!this.selectedCycle || !this.selectedTimesheet?.IDTimesheet) {
			this.env.showMessage('Please select timesheet cycle and timesheet', 'warning');
			return;
		}

		const fromDate = lib.dateFormat(this.selectedCycle.Start, 'yyyy-mm-dd');
		const toDate = lib.dateFormat(this.selectedCycle.End, 'yyyy-mm-dd');

		try {
			await this.env.showPrompt(
				{ code: 'Calculate timesheet from {value} to {value1}?', value: { value: fromDate, value1: toDate } },
				null,
				'Calculation timesheet'
			);
		} catch {
			return;
		}

		const data: any = {
			FromDate: fromDate,
			ToDate: toDate,
			IDTimesheet: this.selectedTimesheet.IDTimesheet,
			WaitReturn: true,
		};

		this.env
			.showLoading(
				'Loading...',
				this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/CalculationTimesheet', data).toPromise()
			)
			.then(() => this.refresh())
			.catch((err) => {
				console.log(err);
				this.env.showMessage('Cannot calculate timesheet', 'danger');
			});
	}

	exportSummary() {
		const query = buildTimesheetRecordSummaryExportQuery({
			IDTimesheet: this.selectedTimesheet?.IDTimesheet,
			IDTimesheetCycle: this.selectedCycle?.Id,
			Lang: this.env.language?.current,
		});
		if (!query) {
			this.env.showMessage('Please select timesheet cycle and timesheet', 'warning');
			return;
		}
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.exportTimesheetRecordSummary(query))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				console.log(err);
				this.submitAttempt = false;
				this.env.showMessage('Cannot export', 'danger');
			});
	}

	exportDetail() {
		const query = buildTimesheetRecordDetailExportQuery({
			IDTimesheet: this.selectedTimesheet?.IDTimesheet,
			IDTimesheetCycle: this.selectedCycle?.Id,
			WorkingDateFrom: this.selectedCycle?.Start,
			WorkingDateTo: this.selectedCycle?.End,
			Lang: this.env.language?.current,
		});
		if (!query) {
			this.env.showMessage('Please select timesheet cycle and timesheet', 'warning');
			return;
		}
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffTimesheetRecordProvider.exportStaffimesheetRecord(query))
			.then((response: any) => {
				this.downloadURLContent(response);
				this.submitAttempt = false;
			})
			.catch((err) => {
				console.log(err);
				this.submitAttempt = false;
				this.env.showMessage('Cannot export', 'danger');
			});
	}

	isNumericColumn(c: StaffTimesheetColumn): boolean {
		return !!c?.numeric && !c?.dateTime;
	}

	isDateTimeColumn(c: StaffTimesheetColumn): boolean {
		return !!c?.dateTime;
	}

	isDateColumn(c: StaffTimesheetColumn): boolean {
		return !!c?.date && !c?.dateTime;
	}

	formatNumber(value: any): string {
		return formatTimesheetNumber(value, this.env.language?.current);
	}

	formatDateTime(value: any): string {
		return formatTimesheetDateTime(value);
	}

	formatDate(value: any): string {
		return formatTimesheetDate(value);
	}
}
