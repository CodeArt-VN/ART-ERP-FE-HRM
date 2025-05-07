import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider, HRM_StaffOvertimeRequestProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { HRM_StaffOvertimeRequest } from 'src/app/models/model-list-interface';
import { OvertimeRequestDetailPage } from '../overtime-request-detail/overtime-request-detail.page';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-overtime-request',
	templateUrl: './overtime-request.page.html',
	styleUrls: ['./overtime-request.page.scss'],
	standalone: false,
})
export class OvertimeRequestPage extends PageBase {
	staffList = [];
	imgPath = environment.staffAvatarsServer;
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffOvertimeRequestProvider,
		public shiftProvider: HRM_ShiftProvider,

		public modalController: ModalController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef
	) {
		super();
		//this.pageConfig.isDetailPage = true;
		// this.formGroup = formBuilder.group({
		// 	IDBranch: [this.env.selectedBranch, Validators.required],
		// 	IDTimesheet: ['', Validators.required],
		// 	IDRequester: ['', Validators.required],
		// 	Status: [''],
		// 	IsDisabled: [false],
		// 	CreatedBy: [true],
		// 	ModifiedBy: [''],
		// 	CreatedDate: [''],
		// 	ModifiedDate: [false],
		// 	Remark: [false],
		// 	Config: [false],
		// });
	}
	preLoadData(event?: any): void {
		this.query.SortBy = 'Id_desc';
		Promise.all([
			this.env.getStatus('StandardApprovalStatus')
		]).then((values) => {
			this.statusList = values[0];
			super.preLoadData(event);
		});
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.items.forEach((i) => {
			i.StatusText = lib.getAttrib(i.Status, this.statusList, 'Name', '--', 'Code');
			i.StatusColor = lib.getAttrib(i.Status, this.statusList, 'Color', 'dark', 'Code');
		});
		super.loadedData(event, ignoredFromGroup);
	}
	add(): void {
		let newItem = {
			Id: 0,
			IsDisabled: false,
		};
		this.showModal(newItem);
	}

	async showModal(i) {
		const modal = await this.modalController.create({
			component: OvertimeRequestDetailPage,
			componentProps: {
				id: i.Id,
				item: i,
			},
			cssClass: 'modal90',
		});
		return await modal.present();
	}
}
