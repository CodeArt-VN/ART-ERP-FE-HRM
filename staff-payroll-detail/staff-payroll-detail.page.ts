import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {
	HRM_PayrollTemplateProvider,
	HRM_PolSalaryProvider,
	HRM_StaffPayrollProvider,
	HRM_StaffRecordPayrollProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';
import { HRM_StaffRecordPayrollService } from '../staff-recordpayroll.service';

@Component({
	selector: 'app-staff-payroll-detail',
	templateUrl: 'staff-payroll-detail.page.html',
	styleUrls: ['staff-payroll-detail.page.scss'],
	standalone: false,
})
export class StaffPayrollDetailPage extends PageBase {
	jobTitleList = [];
	isOpenPopover = false;
	constructor(
		public pageProvider: HRM_StaffPayrollProvider,
		public staffRecordPayrollProvider: HRM_StaffRecordPayrollService,
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
		this.pageConfig.isDetailPage = true;
	}

	preLoadData(event?: any): void {
		this.pageConfig.pageTitle = 'Staff record payroll';
		this.jobTitleList = lib.cloneObject(this.env.jobTitleList);

		super.preLoadData(event);
	}
	loadedData(event) {
		this.pageConfig.showSpinner = false;
		event?.target?.complete();
		console.log(this.item);
		this.item.StaffRecordPayroll.forEach((i) => {
			i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			i._Staff.JobTitle = lib.getAttrib(i._Staff.IDJobTitle, this.jobTitleList);
		});
		if(['Submitted', 'Approved','Cancelled'].includes(this.item.Status)) {
			this.pageConfig.canEdit= false;
		}
	}

	exportPayrollRecords(type = null): Promise<void> {
		let recordQuery = { IDStaffPayroll: this.id, ConfigUDFType: type };
		if (this.submitAttempt) return;
		this.submitAttempt = true;
		this.env
			.showLoading('Please wait for a few moments', this.staffRecordPayrollProvider.exportStaffRecordPayroll(recordQuery))
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
	importPayrollRecords(event) {
		if (event.target.files.length == 0) return;
		this.env
			.showLoading('Please wait for a few moments', this.staffRecordPayrollProvider.importStaffRecordPayroll(event.target.files[0], this.id))
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
			.showLoading('Please wait for a few moments', this.staffRecordPayrollProvider.importStaffRecordInput(event.target.files[0], this.id))
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

	calcSalary() {}
}
