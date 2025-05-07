import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_WorkRuleGroupProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-work-rule-group-detail',
	templateUrl: './work-rule-group-detail.page.html',
	styleUrls: ['./work-rule-group-detail.page.scss'],
	standalone: false,
})
export class WorkRuleGroupDetailPage extends PageBase {
	formGroup: FormGroup;

	constructor(
		public pageProvider: HRM_WorkRuleGroupProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,

		public modalController: ModalController,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.id = this.route.snapshot.paramMap.get('id');
		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			Id: [''],
			Code: [''],
			Name: ['', Validators.required],
			Sort: [''],
			Remark: [''],
		});
	}

	preLoadData() {
		if (this.navParams) {
			this.item = JSON.parse(JSON.stringify(this.navParams.data.item));
			
			this.id = this.navParams.data.id;

			this.cdr.detectChanges();

		}
		this.loadedData();

	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (!this.item.Id) this.formGroup.get('IDBranch').markAsDirty();
	}
	refresh(event?: any): void {
		this.preLoadData();
	}


	async saveChange() {
		super.saveChange2();
	}

}
