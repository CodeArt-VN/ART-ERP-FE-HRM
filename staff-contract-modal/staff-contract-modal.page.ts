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

	async saveChange() {
		return super.saveChange2().then((_)=> this.closeModal());
	}
}
