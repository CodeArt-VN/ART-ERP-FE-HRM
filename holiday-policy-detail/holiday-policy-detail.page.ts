import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolicyHolidayProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-holiday-policy-detail',
	templateUrl: './holiday-policy-detail.page.html',
	styleUrls: ['./holiday-policy-detail.page.scss'],
	standalone: false,
})
export class HolidayPolicyDetailPage extends PageBase {
	constructor(
		public pageProvider: HRM_PolicyHolidayProvider,
		public env: EnvService,
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
			IDBranch: [this.env.selectedBranch],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			FromDate: ['', Validators.required],
			ToDate: ['', Validators.required],
			Remark: [],
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.id) {
			this.item.FromDate = lib.dateFormat(this.item.FromDate);
			this.item.ToDate = lib.dateFormat(this.item.ToDate);
		}
		super.loadedData(event, ignoredFromGroup);
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	async saveChange() {
		super.saveChange2();
	}
}
