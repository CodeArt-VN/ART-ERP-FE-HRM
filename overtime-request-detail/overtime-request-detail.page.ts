import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { FormBuilder, Validators, FormControl, FormArray, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { HRM_StaffOvertimeRequestProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';
import { StaffPickerPage } from '../staff-picker/staff-picker.page';
@Component({
	selector: 'app-overtime-request-detail',
	templateUrl: './overtime-request-detail.page.html',
	styleUrls: ['./overtime-request-detail.page.scss'],
	standalone: false,
})
export class OvertimeRequestDetailPage extends PageBase {
	typeList = [];
	timesheetList = [];
	branchList;
	_staffDataSource;
	maxOvertimeHour = 8;
	isFromModal = false;
	staffList = [];
	constructor(
		public pageProvider: HRM_StaffOvertimeRequestProvider,
		public timesheetProvider: HRM_TimesheetProvider,
		public env: EnvService,
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
			IDTimesheet: ['', Validators.required],
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
			StaffDataSource:[[]],
			TimeFrames: this.formBuilder.array([]),
			StartDate: [new Date().toISOString()],
			EndDate: [new Date().toISOString()],
			IsTransferToDayOff: [''],
			CanTransferToDayOff: [''],
		});
	}

	preLoadData(event?: any): void {
		
		this.branchList = [...this.env.rawBranchList];
		this.branchList
			.filter((d) => d.disabled)
			.forEach((b) => {
				b.disabled = false;
			});
		let queryTimesheet = {}
		queryTimesheet['IDBranch'] = this.query.IDBranch;
		Promise.all([this.timesheetProvider.read(queryTimesheet)]).then((values:any)=>{
			if (values && values[0]) this.timesheetList = values[0].data;
			super.preLoadData(event);
		});
		
	}
	loadedData() {
		if (!this.item?.Id) {
			this.item.IDRequester = this.env.user.StaffID;
			this.item._Requester = { Id: this.env.user.StaffID, FullName: this.env.user.FullName };
		}
		
		this.patchConfig();
		super.loadedData();
		if(!this.item?.Id){
			this.formGroup.get('IDRequester').markAsDirty();
			this.formGroup.get('StartDate').markAsDirty();
			this.formGroup.get('EndDate').markAsDirty();
			this.formGroup.get('Status').markAsDirty();
		} 
		if(this.staffList.length>0){
			this.formGroup.get('StaffDataSource').setValue([this.staffList]);
		}
			// if (this.item._Requester) {
			// 		this._staffDataSource.selected.push(lib.cloneObject(this.item._Requester));
			// 	}
		
	}
	patchConfig() {
		let staffsGroup = this.formGroup.get('Staffs');
		staffsGroup.setValue([]);
		let staffDataSouce = this.formGroup.get('StaffDataSource');
		staffDataSouce.setValue([]);
		let timeFramesGroup = this.formGroup.get('TimeFrames') as FormArray;
		timeFramesGroup.clear();
		if (this.item?.Config) {
			let valueConfig = JSON.parse(this.item.Config);
			let staffs = valueConfig.Staffs ? valueConfig.Staffs : [];
			staffsGroup.setValue(staffs);
			valueConfig.TimeFrames.forEach((i) => {
				this.addTimeFrame(i);
			});
			this.formGroup.get('IsTransferToDayOff').setValue(valueConfig.IsTransferToDayOff);
			this.formGroup.get('CanTransferToDayOff').setValue(valueConfig.CanTransferToDayOff);
		}
		if(this.item?._StaffDataSource) this.formGroup.get('StaffDataSource').setValue(this.item._StaffDataSource);
		if (!this.pageConfig.canEdit) timeFramesGroup.disable();
	}

	addTimeFrame(line) {
		let groups = this.formGroup.get('TimeFrames') as FormArray;
		let group = this.formBuilder.group({
			Start:[line.Start, Validators.required],
			End:[line.End, Validators.required],
		}, {validators: this.dateRangeValidator()});
		groups.push(group);
	}

	removeTimeFrame(g){
		this.env.showPrompt('Do you want to remove this time frame?', 'Remove time frame', 'Remove', 'OK').then((res) => {
			let groups = this.formGroup.get('TimeFrames') as FormArray;
			groups.removeAt(g);
			this.saveConfig();
		})
	
	}

	removeStaff(g){
		this.env.showPrompt('Do you want to remove this staff?', 'Remove Staff', 'Remove', 'OK').then((res) => {
			this.formGroup.get('StaffDataSource').setValue(this.formGroup.get('StaffDataSource').value.filter(d=> d != g));
			this.formGroup.get('Staffs').setValue(this.formGroup.get('Staffs').value.filter(d=> d != g.Id));
			this.saveConfig();
		})
	
	}
	saveConfig(){
		let groups = this.formGroup.get('TimeFrames') as FormArray;
		let timeFrames = groups.controls.map((i) => {
			return {
				Start: i.get('Start').value,
				End: i.get('End').value,
			};
		});
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

	async showStaffPickerModal() {
		const modal = await this.modalController.create({
			component: StaffPickerPage,
			componentProps: {
				ids : this.formGroup.get('Staffs').value,
			},
			cssClass: 'modal90',
		});

		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data && data.length) {
			this.formGroup.get('Staffs').setValue(data.map((i) => i.Id));
			this.formGroup.get('StaffDataSource').setValue(data);
		}
		else {
			this.formGroup.get('StaffDataSource').setValue([]);
			this.formGroup.get('Staffs').setValue([]);
		}
		this.saveConfig();
	}


	async saveChange() {
		if(!this.isFromModal) super.saveChange2();
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
			this.env.showMessage('End date must be after Start date.', 'danger',4000);
	  
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
	
}
