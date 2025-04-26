import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import {  HRM_UDFProvider} from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { UDFDetailPage } from '../udf-detail/udf-detail.page';

@Component({
	selector: 'app-udf',
	templateUrl: 'udf.page.html',
	styleUrls: ['udf.page.scss'],
	standalone: false,
})
export class UDFPage extends PageBase {
	groupList: any = [];
	dataTypeList: any = [];
	controlTypeList: any = [];
	groupSubTypeList: any = [];
	constructor(
		public pageProvider: HRM_UDFProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
	) {
		super();
	}

	preLoadData(event?: any): void {
		this.dataTypeList = [
			{ Name: 'int' },
			{ Name: 'decimal' },
			{ Name: 'text' },
			{ Name: 'varchar' },
			{ Name: 'datetime' },
			{ Name: 'numeric' },
			{ Name: 'nchar' },
			{ Name: 'date' },
			{ Name: 'nvarchar' },
			{ Name: 'number' },
			{ Name: 'bit' },
			{ Name: 'formula' },
		];
		Promise.all([this.env.getType('ControlType'),this.env.getType('UDFGroupsType')]).then((values: any) => {
			this.controlTypeList = values[0];
			this.groupList = values[1];
			super.preLoadData(event);
		});
	}

	loadedData(event) {
		this.items.forEach((item) => {
			item.IsActive = !item.IsDisabled;
		})

		super.loadedData(event);
		console.log(this.pageConfig);
		
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
			component: UDFDetailPage,
			componentProps: {
				id: i.Id,
				item:i
			},
			cssClass: 'my-custom-class',
		});
		return await modal.present();
	}
	
}
