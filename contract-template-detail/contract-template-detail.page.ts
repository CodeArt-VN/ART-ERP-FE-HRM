import { Component, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_ContractTemplateProvider,
	HRM_PolEmployeeProvider,
	HRM_PolicyPaidTimeOffProvider,
	HRM_PolInsuranceProvider,
	HRM_PolTaxProvider,
	HRM_UDFProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-contract-template-detail',
	templateUrl: './contract-template-detail.page.html',
	styleUrls: ['./contract-template-detail.page.scss'],
	standalone: false,
})
export class ContractTemplateDetailPage extends PageBase {
	// polEmployeeList;
	// polInsuranceList;
	// polTaxList;
	UDFList: any = [];
	
	typeList = [];
	polEmployeeList = [];
	polInsuranceList = [];
	polTaxList = [];
	polPaidTimeOffList = [];
	showEditorContent = true;
	templateBeforeChange = '';
	constructor(
		public pageProvider: HRM_ContractTemplateProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public polTaxProvider: HRM_PolTaxProvider,
		public polPaidTimeOffProvider: HRM_PolicyPaidTimeOffProvider,
		public UDFProvider: HRM_UDFProvider,
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
			Id: new FormControl({ value: '', disabled: true }),
			Code: ['', Validators.required],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			Type: [''],
			IDPolTax: [''],
			IDPolInsurance: [''],
			IDPolEmployee: [''],
			IDPolPaidTimeOff:[''],
			ReminderBefore: [''],
			Config: [''],
			ArrayUDF : this.formBuilder.array([]),
			Template: [''],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([
			this.polEmployeeProvider.read(),
			this.polInsuranceProvider.read(),
			this.polTaxProvider.read(),
			this.env.getType('HRMContractTemplateType'),
			this.polPaidTimeOffProvider.read(),
			this.UDFProvider.read()
		]).then((resp: any) => {
			this.polEmployeeList = resp[0].data;
			this.polInsuranceList = resp[1].data;
			this.polTaxList = resp[2].data;
			this.typeList = resp[3];
			this.polPaidTimeOffList = resp[4].data;
			
			const newItems: any[] = [];
			const groupMap = new Map<string, string>(); // Group name -> UID
			const subGroupMap = new Map<string, string>(); // `${Group}::${SubGroup}` -> UID
			
			// Step 1: Create Group-level display entries
			const groups = [...new Set(resp[5].data.map(u => u.Group))];
			
			groups.forEach((groupName:any) => {
			  const groupId = lib.generateUID();
			  groupMap.set(groupName, groupId);
			
			  newItems.push({
				Id: groupId,
				Code: groupName,
				Group: groupName,
				Name :groupName,
				SubGroup: null,
				IDParent: null,
				disabled: true
			  });
			});
			
			// Step 2: Create SubGroup-level display entries
			const subGroups = [...new Set(resp[5].data.map(u => `${u.Group}::${u.SubGroup}`))];
			
			subGroups.forEach((key:any) => {
			  let [groupName, subGroupName] = key.split('::');
			  const subGroupId =  lib.generateUID();
			  subGroupMap.set(key, subGroupId);
			  subGroupName == 'null'? subGroupName = 'No sub group' : true;
			  newItems.push({
				Id: subGroupId,
				Code: subGroupName,
				Name :subGroupName,
				Group: groupName,
				SubGroup: subGroupName,
				IDParent: groupMap.get(groupName),
				disabled: true
			  });
			});
			
			// Step 3: Update UDFList items to assign IDParent
			resp[5].data.forEach(u => {
			  const subKey = `${u.Group}::${u.SubGroup}`;
			  u.IDParent = subGroupMap.get(subKey) || null;
			});
			
			// Step 4: Add all generated entries to UDFList
			resp[5].data.unshift(...newItems);
			this.buildFlatTree( resp[5].data,[]).then((rs:any)=>{
				this.UDFList = [...rs];
				super.preLoadData(event);

			})
		});
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item) this.templateBeforeChange = this.item.Template;
		this.patchConfig();
	}
	openedFields: any = [];
	accordionGroupChange(e) {
		this.openedFields = e.detail.value;
		console.log(this.openedFields);
	}
	public isDisabled = true;

	toggleReorder() {
		this.isDisabled = !this.isDisabled;
	}
	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
	}
	
	changeUDF(e, fg) {
		fg.get('Group').setValue(e?.Group);
		fg.get('SubGroup').setValue(e?.SubGroup);
		fg.get('Code').setValue(e?.Code);
		fg.get('Name').setValue(e?.Name);
		this.saveConfig();
	}

	patchConfig(){
		let groups = <FormArray>this.formGroup.controls.ArrayUDF;
		groups.clear();
		if(this.item.Config){
			let array = JSON.parse(this.item.Config);
			if (array && array.length > 0) {
				array.forEach((field) => {
					this.addConfig(field);
				});
			}
		}
	}
	addConfig(field, openField = false) {
		let matchField = this.UDFList.find(d=> d.Id == field.IDUDF);
		let groups = <FormArray>this.formGroup.controls.ArrayUDF;
		let group = this.formBuilder.group({
			Id: [lib.generateUID()],
			Name: new FormControl({ value: matchField?.Name, disabled: true }),
			IDUDF: [field?.IDUDF, Validators.required],
			Group : new FormControl({ value: matchField?.Group, disabled: true }),
			SubGroup : new FormControl({ value: matchField?.SubGroup, disabled: true }),
			IsRequired: [field?.IsRequired],
			DataSource :[JSON.parse(JSON.stringify(this.UDFList))],
			// Id: new FormControl({ value: field?.Id, disabled: true }),
			Code:[field?.Code],
		});
		if (openField) {
			this.openedFields.push(field?.Id.toString());
		}
		groups.push(group);
	}

	removeField(g, index) {
		let groups =  <FormArray>this.formGroup.controls.ArrayUDF;
		if (g.controls.Id.value) {
			this.env
				.showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa')
				.then((_) => {
					let values: any = JSON.parse(this.item.Config);
					const indexToRemove = values.findIndex((item) => item.IDUDF === g.controls.IDUDF.value);
					if (indexToRemove !== -1) {
						values.splice(indexToRemove, 1);
						groups.removeAt(index);
						this.formGroup.controls.Config.setValue(JSON.stringify(values));
						this.formGroup.controls.Config.markAsDirty();
						this.saveChange2();
					}
				})
				.catch((_) => {});
		} else groups.removeAt(index);
	}
	saveConfig() {
		let groups = this.formGroup.get('ArrayUDF') as FormArray;
		this.formGroup.updateValueAndValidity();

		if (!this.formGroup.valid) {
			let invalidControls = this.findInvalidControlsRecursive(this.formGroup);
			const translationPromises = invalidControls.map((control) => this.env.translateResource(control));
			Promise.all(translationPromises).then((values) => {
				let invalidControls = values;
				this.env.showMessage('Please recheck control(s): {{value}}', 'warning', invalidControls.join(' | '));
			});
			return;
		} else {
			let rs  = groups.controls.map((g:any)=>  {
				return{
					IDUDF: g.controls.IDUDF.value,
					Code: g.controls.Code.value,
					IsRequired: g.controls.IsRequired.value,
				}
			})
			this.formGroup.get('Config').setValue(JSON.stringify(rs));
			this.formGroup.get('Config').markAsDirty();
	
		}
		this.saveChange();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	async saveChange() {
		super.saveChange2();
	}

	onTemplateChange(value: string) {
		this.formGroup.get('Template')?.setValue(value);
		this.formGroup.get('Template')?.markAsDirty();
	}

	edit() {
		this.showEditorContent = true;
		this.templateBeforeChange = this.item.Template;
	}

	preView() {
		this.showEditorContent = false;
		this.templateBeforeChange = this.item.Template;
		this.item.Template = this.formGroup.get('Template')?.value ?? '';
	}
	
}
