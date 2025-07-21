import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_UDFProvider } from 'src/app/services/static/services.service';
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
	groupRender: any = [];
	controlTypeList: any = [];
	groupSubTypeList: any = [];
	dataTypeList = [
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
	constructor(
		public pageProvider: HRM_UDFProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef
	) {
		super();
		this.pageConfig.isShowFeature = true;
		this.pageConfig.isFeatureAsMain = true;
		this.pageConfig.dividers = [
			{
				field: 'Group',
				dividerFn: (record, recordIndex, records) => {
					let a: any = recordIndex == 0 ? '' : records[recordIndex - 1].Group;
					let b: any = record.Group;
					if (a == b) {
						return null;
					}
					let group = this.groupList.find((d) => d.Code == record.Group);
					return group?.Name ?? group?.Code ?? 'No group';
				},
			},
		];
	}

	preLoadData(event?: any): void {
		this.pageConfig.sort = [
			{ Dimension: 'Group', Order: 'ASC' },
			{ Dimension: 'Sort', Order: 'ASC' },
		];

		Promise.all([this.env.getType('ControlType'), this.env.getType('UDFGroupsType',true)]).then((values: any) => {
			this.controlTypeList = values[0];
			this.groupList = values[1];
			this.groupRender = [
				{ Name: 'All', Code: 'All' },
				...this.groupList.map((d) => {
					return { Name: d.Name, Code: d.Code, Id: d.Id };
				}),
			];

			super.preLoadData(event);
		});
	}

	loadedData(event) {
		this.items.forEach((item) => {
			item.IsActive = !item.IsDisabled;
		});

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
				item: i,
				UDFList: this.items,
			},
			cssClass: 'my-custom-class',
		});
		return await modal.present();
	}

	currentTab = 'All';
	loadNode(i) {
		this.pageConfig.isSubActive = true;
		this.currentTab = '';
		this.query.Group = i.Code;
		if (i.Code == 'All') {
			delete this.query.Group;
			this.pageConfig.dividers = [
				{
					field: 'Group',
					dividerFn: (record, recordIndex, records) => {
						let a: any = recordIndex == 0 ? '' : records[recordIndex - 1].Group;
						let b: any = record.Group;
						if (a == b) {
							return null;
						}
						let group = this.groupList.find((d) => d.Code == record.Group);
						return group?.Name ?? group?.Code ?? 'No group';
					},
				},
			];
			this.pageConfig.sort = [
				{ Dimension: 'Group', Order: 'ASC' },
				{ Dimension: 'Sort', Order: 'ASC' },
			];
		} else {
			this.pageConfig.dividers = [
				{
					field: 'SubGroup',
					dividerFn: (record, recordIndex, records) => {
						let a: any = recordIndex == 0 ? '' : records[recordIndex - 1].SubGroup;
						let b: any = record.SubGroup;
						if (a == b) {
							return null;
						}
						let group = this.groupList.find((d) => d.Code == record.Group);
						if(group){
							let subGroup = this.groupList.find((d) => d.Code == record.SubGroup &&  d.IDParent == group.Id);
							return subGroup?.Name ?? subGroup?.Code ?? record.SubGroup ?? 'No sub group';

						}
						else return record.SubGroup ?? 'No sub group';
					},
				},
			];
			this.pageConfig.sort = [
				{ Dimension: 'SubGroup', Order: 'ASC' },
				{ Dimension: 'Sort', Order: 'ASC' },
			];
		}
		this.currentTab = i.Code;
		super.preLoadData(null);
	}
}
