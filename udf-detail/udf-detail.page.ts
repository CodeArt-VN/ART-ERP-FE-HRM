import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_UDFProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-udf-detail',
	templateUrl: './udf-detail.page.html',
	styleUrls: ['./udf-detail.page.scss'],
	standalone: false,
})
export class UDFDetailPage extends PageBase {
	groupList: any = [];
	dataTypeList: any = [];
	controlTypeList: any = [];
	subGroupList: any = [];
	UDFGroupsType :any =  [];
	constructor(
		public pageProvider: HRM_UDFProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navParams: NavParams,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public modalController: ModalController,
		public loadingController: LoadingController
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			Code: ['', Validators.required],
			Name: ['', Validators.required],
			Group: ['', Validators.required],
			DefaultValue:[''],
			SubGroup: [''],
			ControlType: ['', Validators.required],
			DataType: ['', Validators.required],
			IsActive: [true],
			Remark: [''],
			Sort: [''],
		});
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
		];
		Promise.all([this.env.getType('ControlType'), this.env.getType('UDFGroupsType',true)]).then((values: any) => {
			this.controlTypeList = values[0];
			this.UDFGroupsType = values[1];
			this.groupList = values[1].filter(d=> !values[1].some(s=>d.IDParent == s.Id));
			if (this.navParams) {
				this.id = this.navParams.data.id;
				this.item = this.navParams.data.item;
				this.loadedData(event);
			}
			else super.preLoadData(event);
			
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if(this.item.Group){
			let group = this.groupList.find((i) => i.Code == this.item.Group);
			if(group) this.subGroupList = this.UDFGroupsType.filter((item) => item.IDParent == group.Id);
		}
		super.loadedData(event);
	}
	changeGroup(ev) {
		if (this.formGroup.controls.SubGroup.value) {
			this.formGroup.controls.SubGroup.setValue(null);
			this.formGroup.controls.SubGroup.markAsDirty();
		}
		if (ev != null) {
			this.subGroupList = this.UDFGroupsType.filter((i:any) => i.IDParent == ev.Id);
		}
	}
	changeName() {
		let name = this.formGroup.get('Name')?.value || '';
		let code = name
			.split(' ')
			.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');
			code = lib.rempveSpecialCharacter(code);
		this.formGroup.controls.Code.setValue(code);
		this.formGroup.controls.Code.markAsDirty();
		this.saveChange2();
	}
}
