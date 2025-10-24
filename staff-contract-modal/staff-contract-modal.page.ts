import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	HRM_ContractTemplateProvider,
	HRM_PolBenefitProvider,
	HRM_PolEmployeeProvider,
	HRM_PolInsuranceProvider,
	HRM_PolTaxProvider,
	HRM_StaffContractProvider,
	HRM_StaffProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
@Component({
	selector: 'app-staff-contract-modal',
	templateUrl: './staff-contract-modal.page.html',
	styleUrls: ['./staff-contract-modal.page.scss'],
	standalone: false,
})
export class StaffContractModalPage extends PageBase {
	statusList = [];
	contractTemplateList = [];
	HRMEffectiveTimeTypeList = [];
	contractTypeList = [];
	UDFList = [];
	contractValue: any;
	insuranceList = [];
	//polBefitUFLList = [];
	//arrayUDFGroup = [];
	// UDFGroups = [];
	// isCustomTemplate = false;
	trackingTemplate;
	Items;
	
	constructor(
		public pageProvider: HRM_StaffContractProvider,
		public staffProvider: HRM_StaffProvider,
		public polTaxProvider: HRM_PolTaxProvider,
		public polInsurance: HRM_PolInsuranceProvider,
		public polBenefit: HRM_PolBenefitProvider,
		public polEmployee: HRM_PolEmployeeProvider,
		public hrmUDF: HRM_UDFProvider,
		public contractTemplateProvider: HRM_ContractTemplateProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public modalController: ModalController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();
		this.formGroup = formBuilder.group({
			IDStaffList: [],
			ContractValue: [],
			IDContractTemplate: ['', Validators.required],
			ApplyType: [''],
			Status: ['Draft', Validators.required],
			ContractType: ['', Validators.required],
			EffectiveDate: ['', Validators.required],
			EndDate: [''],
			ContractDate: ['', Validators.required],
			PolTax: this.formBuilder.group({
				Id: [],
				Type: [],
				ContributionRate: [],
			}),
			PolInsurance: this.formBuilder.array([]),
			PolEmployee: this.formBuilder.group({
				Id: [],
				Remark: [],
			}),
			PolBenefit: this.formBuilder.array([]),
			UDFConfig:  this.formBuilder.group({}), // From config of Contact template
			_ContractContent: [],
		});
	}

	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});

	preLoadData(event?: any): void {
		Promise.all([
			this.env.getStatus('StandardApprovalStatus'),
			this.contractTemplateProvider.read(),
			this.env.getType('HRMContractType'),
			this.hrmUDF.read(), //{ Group: 'Benefits' }
			this.env.getType('HRMEffectiveTimeType'),
			//this.env.getType('UDFGroupsType', true),
		]).then((res: any) => {
			this.statusList = res[0];
			this.contractTemplateList = res[1].data;
			this.contractTypeList = res[2];
			this.UDFList = res[3].data;
			this.HRMEffectiveTimeTypeList = res[4];
			//this.UDFGroups = res[5];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if(this.Items.length){
			this.formGroup.controls.IDStaffList.setValue(this.Items.map((e) => e.Id));
			this.Items.forEach((e) => {
				this.staffDataSource.selected.push(e);
			});
			this.formGroup.controls.IDStaffList.markAsDirty();
			this.formGroup.controls.Status.markAsDirty();
		}
		this.staffDataSource.initSearch();
	}

	// patchConfigValue() {
	// 	if (this.item.ContractValue) {
	// 		let value = JSON.parse(this.item.ContractValue);
	// 		this.contractValue = value;
	// 	}
	// 	this.patchUDFConfig();
	// }

	// patchUDFConfig(config = null) {
	// 	let group = new FormGroup({});
	// 	(this.formGroup.controls as any).UDFConfig = group;

	// 	if (this.item._ContractTemplate?.Config) {
	// 		let values = [];
	// 		let udfConfigList = JSON.parse(this.item._ContractTemplate.Config) || [];
	// 		udfConfigList = udfConfigList.filter((u) => !this.polBefitUFLList.map((s) => s.IDUDF).includes(u.IDUDF));
	// 		if (this.item.ContractValue) values = JSON.parse(this.item.ContractValue)?.UDFConfig || [];
	// 		udfConfigList.forEach((i) => {
	// 			let UDF = this.UDFList.find((d) => d.Id == i.IDUDF);
	// 			let value = values.find((d) => d.IDUDF == i.IDUDF);
	// 			if (UDF) {
	// 				let control: any = new FormControl(value?.Value ?? '', i?.IsRequired ? Validators.required : null);
	// 				control.IDUDF = UDF.Id;
	// 				group.addControl(UDF.Code, control);
	// 			}
	// 		});
	// 		this.arrayUDFGroup = this.UDFList.filter((u) => udfConfigList.map((s) => s.IDUDF).includes(u.Id)).reduce((acc, item) => {
	// 			let code = item.Group || 'No Group';
	// 			let subGroup = item.SubGroup || 'No SubGroup';
	// 			let groupName = this.UDFGroups.find((d) => d.Code == item.Group)?.Name || code;
	// 			// Find or create the group
	// 			let groupItem = acc.find((g) => g.Code === code);
	// 			if (!groupItem) {
	// 				groupItem = { Code: code, SubGroups: [], Name: groupName };
	// 				acc.push(groupItem);
	// 			}

	// 			// Find or create the subGroup inside the group
	// 			let subGroupItem = groupItem.SubGroups.find((sg) => sg.Code === subGroup);
	// 			let subName = this.UDFGroups.find((d) => d.Code == subGroup)?.Name || subGroup;
	// 			if (!subGroupItem) {
	// 				subGroupItem = { Code: subGroup, Items: [], Name: subName, Key: code + '-' + subGroup };
	// 				groupItem.SubGroups.push(subGroupItem);
	// 			}
	// 			// Add the item
	// 			subGroupItem.Items.push(item);
	// 			return acc;
	// 		}, []);
	// 	}
	// }

	loadPolicies(event) {
		return Promise.all([
			this.polTaxProvider.getAnItem(event.IDPolTax),
			this.polInsurance.getAnItem(event.IDPolInsurance),
			this.polEmployee.getAnItem(event.IDPolEmployee),
		]).then((result: any) => {
			this.formGroup.controls.PolTax.patchValue(result[0]);
			// this.formGroup.controls.PolInsurance.patchValue(result[1]);
			this.formGroup.controls.PolEmployee.patchValue(result[2]);
			if (result[2].PolBenefitLines?.length > 0) {
				(this.formGroup.controls.PolBenefit as FormArray).clear();
				for (let i of result[2].PolBenefitLines) {
					let groups = <FormArray>this.formGroup.controls.PolBenefit;
					let group = this.formBuilder.group({
						IDUDF: [i.IDUDF],
						Id: [i.Id],
						Code: [this.UDFList.find((d) => d.Id == i.IDUDF).Code],
						Label: [this.UDFList.find((d) => d.Id == i.IDUDF).Name],
						ControlType: [this.UDFList.find((d) => d.Id == i.IDUDF).ControlType],
						Value: i.Value,
					});
					group.addControl(this.UDFList.find((d) => d.Id == i.IDUDF).Code, new FormControl(i.Value));
					groups.push(group);
				}
			}
			if (result[1]) {
				this.insuranceList = result[1].Lines;
				let groups = <FormArray>this.formGroup.controls.PolInsurance;
				(this.formGroup.controls.PolInsurance as FormArray).clear();
				result[1].Lines.forEach((i) => {
					let group = this.formBuilder.group({
						Id: new FormControl({ value: i.Id, disabled: true }),
						Type: [i.Type, Validators.required],
						CalculationMethodType: [i.CalculationMethodType, Validators.required],
						RateCo: [i.RateCo, Validators.required],
						RateEm: [i.RateEm, Validators.required],
						IsManagerCanCreateInsurance: [i.IsManagerCanCreateInsurance],
					});
					groups.push(group);
				});
			}
			console.log(this.formGroup);
		});
	}

	changeTemplate(event) {
		if (this.formGroup.controls.ContractValue.value) {
			this.env
				.showPrompt('Changing the contract template will erase the values of the modified policies. Are you sure you want to proceed?', null, 'Change contract template')
				.then((_) => {
					this.formGroup.controls.ContractValue.setValue(null);
					this.formGroup.controls.ContractValue.markAsDirty();
					//this.arrayUDFGroup = [];
					this.loadPolicies(event).then((_) => {
						this.formGroup.controls._ContractContent.setValue(event.Remark);
						this.saveConfig();
					});
					this.trackingTemplate = event.Id;
				})
				.catch((err) => {
					if (this.trackingTemplate) {
						this.formGroup.controls.IDContractTemplate.setValue(this.trackingTemplate);
					}
				});
		} else {
			this.loadPolicies(event).then((_) => {
				this.formGroup.controls._ContractContent.setValue(event.Remark);
				this.saveConfig();
			});
			this.trackingTemplate = event.Id;
		}
	}

	saveConfig() {
		const polTaxValue = this.formGroup.controls.PolTax.value;
		const polInsuranceValue = this.formGroup.controls.PolInsurance.getRawValue();
		const polEmployee = this.formGroup.controls.PolEmployee.value;
		const polBenefitValue = this.formGroup.controls.PolBenefit.value.map((group) => {
			const controlCode = group.Code;
			return {
				IDUDF: group.IDUDF,
				Code: controlCode,
				Value: group[controlCode],
			};
		});

		let udfConfig = [];
		let group = this.formGroup.get('UDFConfig') as FormGroup;
		Object.keys(group['controls']).forEach((d) => {
			let control: any = group.get(d);
			let value = {
				IDUDF: control.IDUDF,
				Code: d,
				Value: control.value,
			};
			udfConfig.push(value);
		});
		const contractValue = {
			PolTax: polTaxValue,
			PolInsurance: polInsuranceValue,
			PolEmployee: polEmployee,
			PolBenefit: polBenefitValue,
			UDFConfig: udfConfig,
		};

		this.formGroup.controls.ContractValue.setValue(JSON.stringify(contractValue));
		this.formGroup.controls.ContractValue.markAsDirty();
		this.contractValue = contractValue;
		this.saveChange();
	}
	async saveChange() {
		return super.saveChange2();
	}
}
