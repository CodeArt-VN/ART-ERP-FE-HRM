import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolBenefitProvider, HRM_StaffProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-staff-policy-enrollment-detail-modal',
	templateUrl: './staff-policy-enrollment-detail-modal.page.html',
	styleUrls: ['./staff-policy-enrollment-detail-modal.page.scss'],
	standalone: false,
})
export class StaffPolicyEnrollmentDetailModalPage extends PageBase {

	Items;
	IDEnrollment;
	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});
	constructor(
		// public pageProvider: HRM_PolBenefitProvider,
		public staffProvider: HRM_StaffProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public modalController: ModalController
	) {
		super();
		this.formGroup = formBuilder.group({
			IDStaffList: [],
			IDEnrollment:[this.IDEnrollment,Validators.required],
			Remark:['']
		});
	}
	preLoadData(event?: any): void {
		this.pageConfig.showSpinner = true;
		this.loadedData();
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.Items) {
			this.formGroup.controls.IDStaffList.setValue(this.Items.map((e) => e.IDStaff));
			this.Items.forEach((e) => {
				if (e._Staff) {
					this.staffDataSource.selected.push(e._Staff);
				}
			});
		}
		this.pageConfig.showSpinner = false;
		this.staffDataSource.initSearch();
	}

	dismiss() {
		this.modalController.dismiss();
	}

	submitModal() {
		const formData = this.formGroup.getRawValue();
		const result = formData.IDStaffList.map((id) => ({
			IDStaff: id,
			IDEnrollment: this.IDEnrollment,
			Remark: formData.Remark
		}));
		this.modalController.dismiss(result);
	}
}
