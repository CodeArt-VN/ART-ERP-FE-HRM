import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_ShiftProvider, HRM_TimesheetCycleProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-timesheet-cycle-modal',
	templateUrl: './timesheet-cycle-modal.page.html',
	styleUrls: ['./timesheet-cycle-modal.page.scss'],
	standalone: false,
})
export class TimesheetCycleModalPage extends PageBase {
	timesheetList = [];
	constructor(
		public pageProvider: HRM_TimesheetCycleProvider,

		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.formGroup = formBuilder.group({
			IDBranch: [env.selectedBranch],
			Id: [''],
			Name: ['', Validators.required],
			Start: ['', Validators.required],
			End: ['', Validators.required],
			Status: ['Draft'],
			Timesheets: [[], Validators.required],
		});
	}

	preLoadData(event?: any): void {
		this.timesheetList = this.navParams.data.timesheetList;
		this.item = this.navParams.data.item;
		this.id = this.navParams.data.id;
		this.loadedData(event);
	}

	loadedData(event) {
		// this.items.forEach(i => {
		//     i.IssueDate = i.IssueDate? lib.dateFormat(i.IssueDate, 'yyyy-mm-dd') : '';
		// });
		super.loadedData(event);
		if(!this.item?.Id){
			this.formGroup.get('Status').markAsDirty();
		}
	}

	submitForm() {
		this.formGroup.updateValueAndValidity();
		if (!this.formGroup.valid) {
			this.env.showMessage('Please recheck information highlighted in red above', 'warning');
		} else {
			let submitItem = this.formGroup.value; //this.getDirtyValues(this.formGroup);
			this.modalController.dismiss(submitItem);
		}
	}
}
