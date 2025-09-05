import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { FormBuilder, Validators, FormControl, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { HRM_StaffOvertimeRequestProvider, HRM_StaffTimesheetEnrollmentProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';
@Component({
	selector: 'app-overtime-request-detail',
	templateUrl: './overtime-request-detail.page.html',
	styleUrls: ['./overtime-request-detail.page.scss'],
	standalone: false,
})
export class OvertimeRequestDetailPage extends PageBase {
	typeList = [];
	timesheetList = [];
	IDTimesheet = null;
	branchList;
	trackingTimesheet;
	_staffDataSource;
	maxOvertimeHour = 8;
	isFromModal = false;
	staffList = [];
	constructor(
		public pageProvider: HRM_StaffOvertimeRequestProvider,
		public staffTimesheetEnrollmentProvider: HRM_StaffTimesheetEnrollmentProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public env: EnvService,
		public navParams: NavParams,
		public modalController: ModalController,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch, Validators.required],
			IDTimesheet: [this.IDTimesheet, Validators.required],
			IDRequester: ['', Validators.required],
			Id: [''],
			Status: ['Draft'],
			CreatedBy: [''],
			ModifiedBy: [''],
			CreatedDate: [''],
			ModifiedDate: [''],
			Remark: [''],
			Config: [''],
			Staffs: [[]],
			StaffDataSource: [[]],
			TimeFrames: this.formBuilder.array([]),
			StartDate: [new Date().toISOString()],
			EndDate: [new Date().toISOString()],
			IsTransferToDayOff: [''],
			CanTransferToDayOff: [''],
			IsForceSave: [false],
		});
	}

	preLoadData(event?: any): void {
		this.selectedRows = [];
		this.branchList = [...this.env.user.BranchList];
		this.branchList
			.filter((d) => d.disabled)
			.forEach((b) => {
				b.disabled = false;
			});
		let queryTimesheet = {};
		queryTimesheet['IDBranch'] = this.query.IDBranch;
		Promise.all([this.timesheetProvider.read(queryTimesheet)]).then((values: any) => {
			if (values && values[0]) this.timesheetList = values[0].data;
			//if (this.navParams) {
			this.route.params.subscribe((params) => {
				this.id = params['id'];
			});
			if (this.navParams.data) {
				this.id = this.navParams.data.id;
				//	console.log(this.navParams.data);
			}
			super.preLoadData(event);
		});
	}

	loadedData(event = null) {
		if (!this.item?.Id) {
			this.item.IDRequester = this.env.user.StaffID;
			this.item._Requester = { Id: this.env.user.StaffID, FullName: this.env.user.FullName };
		}
		if (this.item?.IDTimesheet) {
			this.trackingTimesheet = this.item.IDTimesheet;
			this.staffTimesheetEnrollmentProvider.read({ IDTimesheet: this.item?.IDTimesheet }).then((resp) => {
				this.staffList = resp['data'];
				if (!this.pageConfig.canEdit) {
					this.staffList.forEach((i) => {
						i.disabled = true;
					});
				}
				console.log(this.staffList);
				this.patchConfig();
			});
		} else this.patchConfig();
		if (['Submitted', 'Canceled', 'Approved'].includes(this.item.Status)) {
			this.pageConfig.canEdit = false;
		}
		super.loadedData(event);
		if (!this.item?.Id) {
			this.formGroup.get('IDRequester').markAsDirty();
			this.formGroup.get('IDBranch').markAsDirty();
			this.formGroup.get('IDTimesheet').markAsDirty();
			this.formGroup.get('StartDate').markAsDirty();
			this.formGroup.get('EndDate').markAsDirty();
			this.formGroup.get('Status').markAsDirty();
		}

		// if(this.staffList.length>0){
		// 	this.formGroup.get('StaffDataSource').setValue([this.staffList]);
		// }
		// if (this.item._Requester) {
		// 		this._staffDataSource.selected.push(lib.cloneObject(this.item._Requester));
		// 	}
	}
	patchConfig() {
		let staffsGroup = this.formGroup.get('Staffs');
		staffsGroup.setValue([]);
		// let staffDataSouce = this.formGroup.get('StaffDataSource');
		// staffDataSouce.setValue([]);
		let timeFramesGroup = this.formGroup.get('TimeFrames') as FormArray;
		timeFramesGroup.clear();
		if (this.item?.Config) {
			let valueConfig = JSON.parse(this.item.Config);
			let staffs = valueConfig.Staffs ? valueConfig.Staffs : [];
			this.staffList.forEach((i) => {
				i.Id = i.id;
				if (staffs.includes(i.Id)) {
					i.checked = true;
					this.changeSelection(i);
				}
			});
			staffsGroup.setValue(staffs);
			valueConfig.TimeFrames.forEach((i) => {
				this.addTimeFrame(i);
			});
			this.formGroup.get('IsTransferToDayOff').setValue(valueConfig.IsTransferToDayOff);
			this.formGroup.get('CanTransferToDayOff').setValue(valueConfig.CanTransferToDayOff);
		}

		if (!this.pageConfig.canEdit) timeFramesGroup.disable();
	}

	addTimeFrame(line) {
		let groups = this.formGroup.get('TimeFrames') as FormArray;
		let group = this.formBuilder.group(
			{
				Start: [line.Start, Validators.required],
				End: [line.End, Validators.required],
			},
			{ validators: this.dateRangeValidator() }
		);
		groups.push(group);
	}

	removeTimeFrame(g) {
		this.env.showPrompt('Do you want to remove this time frame?', 'Remove time frame', 'Remove', 'OK').then((res) => {
			let groups = this.formGroup.get('TimeFrames') as FormArray;
			groups.removeAt(g);
			// this.saveConfig();
		});
	}

	// removeStaff(g) {
	// 	this.env.showPrompt('Do you want to remove this staff?', 'Remove Staff', 'Remove', 'OK').then((res) => {
	// 		this.formGroup.get('StaffDataSource').setValue(this.formGroup.get('StaffDataSource').value.filter((d) => d != g));
	// 		this.formGroup.get('Staffs').setValue(this.formGroup.get('Staffs').value.filter((d) => d != g.Id));
	// 		this.saveConfig();
	// 	});
	// }
	saveConfig() {
		let groups = this.formGroup.get('TimeFrames') as FormArray;
		let timeFrames = groups.controls.map((i) => {
			return {
				Start: i.get('Start').value,
				End: i.get('End').value,
			};
		});
		this.formGroup.get('Staffs').setValue(this.selectedRows.map((x) => x.Id));
		let staffs = this.formGroup.get('Staffs').value;
		let config = {
			IsTransferToDayOff: this.formGroup.get('IsTransferToDayOff').value,
			CanTransferToDayOff: this.formGroup.get('CanTransferToDayOff').value,
			Staffs: staffs,
			TimeFrames: timeFrames,
		};
		this.formGroup.get('Config').setValue(JSON.stringify(config));
		this.formGroup.get('Config').markAsDirty();
		this.saveChange();
	}
	changeTimesheet() {
		let promise: Promise<any>;
		if (this.formGroup.controls.Staffs.value.length > 0) {
			promise = this.env.showPrompt('Do you want to change timesheet?', 'Change Timesheet', 'Change', 'OK');
		} else promise = Promise.resolve(true);
		promise
			.then(() => {
				this.formGroup.controls.Staffs.setValue([]);
				this.formGroup.controls.Staffs.markAsDirty();
				this.item.IDTimesheet = this.formGroup.controls.IDTimesheet.value;
				this.loadedData();

				// this.saveConfig()
				// 	.then((savedItem) => {
				// 		this.item = savedItem;
				// 	})
			})
			.catch((err) => {
				this.formGroup.controls.IDTimesheet.setValue(this.trackingTimesheet);
			});
	}
	// async showStaffPickerModal() {
	// 	const modal = await this.modalController.create({
	// 		component: StaffPickerPage,
	// 		componentProps: {
	// 			ids : this.formGroup.get('Staffs').value,
	// 		},
	// 		cssClass: 'modal90',
	// 	});

	// 	await modal.present();
	// 	const { data } = await modal.onWillDismiss();
	// 	if (data && data.length) {
	// 		this.formGroup.get('Staffs').setValue(data.map((i) => i.Id));
	// 		this.formGroup.get('StaffDataSource').setValue(data);
	// 	}
	// 	else {
	// 		this.formGroup.get('StaffDataSource').setValue([]);
	// 		this.formGroup.get('Staffs').setValue([]);
	// 	}
	// 	this.saveConfig();
	// }

	async saveChange() {
		return super.saveChange2();
	}

	savedChange(savedItem = null, form = this.formGroup) {
		if (savedItem) {
			if (Array.isArray(savedItem)) {
				// xử lý error
				let message = '';
					for (let i = 0; i < savedItem.length && i <= 5; i++)
						if (i == 5) message += '<br> Còn nữa...';
						else {
							const e = savedItem[i];
							message += '<br> ' + e.Id + '. Tại dòng ' + e.Line + ': ' + e.Message;
						}
					this.env
						.showPrompt(
							{
								code: 'Có {{value}} lỗi khi import: {{value1}}',
								value: { value: savedItem.length, value1: message },
							},
							'Bạn có muốn xem lại các mục bị lỗi?',
							'Có lỗi import dữ liệu'
						).then(()=>{
							this.formGroup.get('IsForceSave').setValue(true);
							this.formGroup.get('IsForceSave').markAsDirty();
							this.submitAttempt = false;
							this.saveChange();
						})
						
			} else {
				if (form.controls.Id && savedItem.Id && form.controls.Id.value != savedItem.Id) form.controls.Id.setValue(savedItem.Id);

				if (this.pageConfig.isDetailPage && form == this.formGroup && this.id == 0) {
					this.item = savedItem;
					this.id = savedItem.Id;
				}
				this.formGroup.get('IsForceSave').setValue(false);
				form.markAsPristine();
				this.cdr.detectChanges();
				this.submitAttempt = false;
				this.env.showMessage('Saving completed!', 'success');
				this.modalController.dismiss(savedItem);
			}
		}
	}

	dateRangeValidator(): ValidatorFn {
		return (group: AbstractControl): ValidationErrors | null => {
			const startCtrl = group.get('Start');
			const endCtrl = group.get('End');

			if (!startCtrl || !endCtrl) return null;

			const start = startCtrl.value;
			const end = endCtrl.value;

			if (start && end && new Date(end) <= new Date(start)) {
				// Set error on End control
				endCtrl.setErrors({ endBeforeStart: true });

				// Optionally show message (you can throttle this if needed)
				this.env.showMessage('End date must be after Start date.', 'danger', 4000);

				return null; // Return null to avoid marking the whole group invalid
			}

			// If no error, clear it from End control
			if (endCtrl.hasError('endBeforeStart')) {
				const currentErrors = { ...endCtrl.errors };
				delete currentErrors['endBeforeStart'];

				if (Object.keys(currentErrors).length === 0) {
					endCtrl.setErrors(null);
				} else {
					endCtrl.setErrors(currentErrors);
				}
			}

			return null;
		};
	}

	checkAllSelectedItems(event) {
		const isChecked = event.target.checked;
		this.selectedRows = [];
		if (isChecked) {
			this.selectedRows = [];
			this.staffList.forEach((i) => {
				this.selectedRows.push(i);
			});
		}
		this.formGroup.get('Staffs').setValue(this.selectedRows.map((x) => x.Id));
		//this.saveConfig();
	}
	isAllRowChecked = false;
	selectedRows = [];
	changeSelection(i, e = null) {
		if (e && e.shiftKey) {
			let from = this.staffList.indexOf(this.lastchecked);
			let to = this.staffList.indexOf(i);

			let start = Math.min(from, to);
			let end = Math.max(from, to) + 1;

			let itemsToCheck = this.staffList.slice(start, end);
			for (let j = 0; j < itemsToCheck.length; j++) {
				const it = itemsToCheck[j];

				it.checked = this.lastchecked.checked;
				const index = this.selectedRows.indexOf(it, 0);

				if (this.lastchecked.checked && index == -1) {
					this.selectedRows.push(it);
				} else if (!this.lastchecked.checked && index > -1) {
					this.selectedRows.splice(index, 1);
				}
			}
		} else if (e) {
			if (e.target.checked) {
				this.selectedRows.push(i);
			} else {
				const index = this.selectedRows.indexOf(i, 0);
				if (index > -1) {
					this.selectedRows.splice(index, 1);
				}
			}
		} else {
			if (i.checked) {
				this.selectedRows.push(i);
			} else {
				const index = this.selectedRows.indexOf(i, 0);
				if (index > -1) {
					this.selectedRows.splice(index, 1);
				}
			}
		}

		this.selectedRows = [...this.selectedRows];
		this.lastchecked = i;

		//e?.preventDefault();
		e?.stopPropagation();
		// if (isSave) {
		// 	this.formGroup.get('Staffs').setValue(this.selectedRows.map((x) => x.Id));
		// 	this.saveConfig();
		// }
	}
}
