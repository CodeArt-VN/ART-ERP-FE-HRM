import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_ShiftProvider, HRM_TimesheetCycleProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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
		this.formGroup = formBuilder.group(
			{
				IDBranch: [env.selectedBranch],
				Id: [''],
				Name: ['', Validators.required],
				Start: ['', Validators.required],
				End: ['', Validators.required],
				Status: ['Draft'],
				Timesheets: [[], Validators.required],
				IsCheckAllTimesheet: [false],
			},
			{ validators: this.dateRangeValidator() }
		);
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
		if (!this.item?.Id) {
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
	onCheckAllTimesheetChange(event: any) {
		const isChecked = this.formGroup.get('IsCheckAllTimesheet').value;
		if (isChecked) {
			this.formGroup.get('Timesheets').setValue(this.timesheetList.map((t) => t.Id));
		} else {
			this.formGroup.get('Timesheets').setValue([]);
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
	delete(publishEventCode = this.pageConfig.pageName) { //override pagebase để ko goback
		if (this.pageConfig.ShowDelete) {
			this.env
				.actionConfirm('delete', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
					this.pageProvider.delete(this.pageConfig.isDetailPage ? this.item : this.selectedItems)
				)
				.then((_) => {
					this.env.showMessage('DELETE_RESULT_SUCCESS', 'success');
					this.env.publishEvent({ Code: publishEventCode });
					this.closeModal();
					
				})
				.catch((err: any) => {
					if (err != 'User abort action') this.env.showMessage('DELETE_RESULT_FAIL', 'danger');
					console.log(err);
				});
		}
	}
}
