import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_PolEmployeeProvider, HRM_StaffProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-staff-decision-detail-modal',
	templateUrl: './staff-decision-detail-modal.html',
	styleUrls: ['./staff-decision-detail-modal.scss'],
	standalone: false,
})
export class StaffDecisionDetailModal extends PageBase {
	UDFGroups: any = [];
	UDFList: any = [];
	UDFListPolEmployee: any = [];
	branchList;
	jobTitleList;
	staffList: any = [];
	loadingUDFList = false;
	trackingPolEmplyee;
	IDPolEmployee;
	_staffDataSource;
	constructor(
		public pageProvider: HRM_UDFProvider,
		public UDFProvider: HRM_UDFProvider,
		public staffProvider: HRM_StaffProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
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
			StaffList: [[], Validators.required],
			IDDepartment: [''],
			IDJobTitle: [''],
			IsConcurrentPosition: [''],
			EmployeePolicyConfig: this.formBuilder.group({}),
			DecisionValue: [''],
		});
		this._staffDataSource = this.buildSelectDataSource((term) => {
			return this.staffProvider.search({ Take: 20, Skip: 0, Keyword: term  });
		});
	}

	preLoadData(event?: any): void {
		this.branchList = [...this.env.branchList];
		this.jobTitleList = [...this.env.jobTitleList];
		this.loadedData(event);
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.patchEmployeePolicyConfig();
		super.loadedData(event);
		if (this.item.IDStaff) {
			this._staffDataSource.selected = [];
			this._staffDataSource.selected.push({ Id: this.item.IDStaff, Code: this.item.StaffCode, Name: this.item.StaffName });
		}
		if (this.staffList.length > 0) {
			this.formGroup.get('StaffList').setValue( [...this.staffList.filter(d=> d).map(m=>m.Id)])
			this._staffDataSource.selected = [...this.staffList];
		}
		this._staffDataSource.initSearch();
	}

	patchEmployeePolicyConfig() {
		let group = new FormGroup({});
		(this.formGroup.controls as any).EmployeePolicyConfig = group;
		let values = this.formGroup.controls.DecisionValue.value ? JSON.parse(this.formGroup.controls.DecisionValue.value) : [];
		this.UDFList.forEach((d) => {
			let i = this.UDFListPolEmployee.find((j) => j.IDUDF == d.Id);
			let value = values?.find((j) => j.IDUDF == d.Id);
			if (i) d.IsRequired = i.IsRequired;
			let control: any = new FormControl(value?.Value ?? '', d.IsRequired ? Validators.required : null);
			control.IDUDF = d.Id;
			group.addControl(d.Code, control);
		});
		this.UDFList = this.UDFList.reduce((acc, item) => {
			let code = item.Group || 'No Group';
			let subGroup = item.SubGroup || 'No SubGroup';
			let groupName = this.UDFGroups.find((d) => d.Code == item.Group)?.Name || code;
			// Find or create the group
			let groupItem = acc.find((g) => g.Code === code);
			if (!groupItem) {
				groupItem = { Code: code, SubGroups: [], Name: groupName };
				acc.push(groupItem);
			}

			// Find or create the subGroup inside the group
			let subGroupItem = groupItem.SubGroups.find((sg) => sg.Code === subGroup);
			let subName = this.UDFGroups.find((d) => d.Code == subGroup)?.Name || subGroup;
			if (!subGroupItem) {
				subGroupItem = { Code: subGroup, Items: [], Name: subName, Key: code + '-' + subGroup };
				groupItem.SubGroups.push(subGroupItem);
				this.openedFields.push(subGroupItem.Key);
			}

			// Add the item
			subGroupItem.Items.push(item);
			return acc;
		}, []);
	}

	saveConfig() {
		let employeePolicyConfigFG = this.formGroup.get('EmployeePolicyConfig');
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
			let rs = [];
			 rs.push({ Code: 'IDJobTitle', Value: this.formGroup.controls.IDJobTitle.value });
			 rs.push({ Code: 'IDDepartment', Value: this.formGroup.controls.IDDepartment.value });
			// rs.push({ Code: 'Office', Value: this.formGroup.controls.Office.value });
			// rs.push({ Code: 'EmploymentType', Value: this.formGroup.controls.EmploymentType.value });
			// rs.push({ Code: 'PayrollPolicy', Value: this.formGroup.controls.PayrollPolicy.value });
			// rs.push({ Code: 'WorkType', Value: this.formGroup.controls.WorkType.value });
			// rs.push({ Code: 'BasicSalary', Value: this.formGroup.controls.BasicSalary.value });
			// rs.push({ Code: 'Salary', Value: this.formGroup.controls.Salary.value });
			// rs.push({ Code: 'IsNotApplySalary', Value: this.formGroup.controls.IsNotApplySalary.value });
			// rs.push({ Code: 'ConsultedPerson', Value: this.formGroup.controls.ConsultedPerson.value });
			// rs.push({ Code: 'DecisionSignDate', Value: this.formGroup.controls.DecisionSignDate.value });
			// rs.push({ Code: 'DecisionEffectiveDate', Value: this.formGroup.controls.DecisionEffectiveDate.value });
			// rs.push({ Code: 'ProbationPeriod', Value: this.formGroup.controls.ProbationPeriod.value });
			Object.keys(employeePolicyConfigFG['controls']).forEach((d) => {
				let control: any = employeePolicyConfigFG.get(d);
				let value = {
					IDUDF: control.IDUDF,
					Code: d,
					Value: control.value,
				};
				rs.push(value);
			});
			this.formGroup.get('DecisionValue').setValue(JSON.stringify(rs));
			this.formGroup.get('DecisionValue').markAsDirty();
	
		}
	}

	submit(){
		this.formGroup.updateValueAndValidity();

		if (!this.formGroup.valid) {
			let invalidControls = this.findInvalidControlsRecursive(this.formGroup);
			const translationPromises = invalidControls.map((control) => this.env.translateResource(control));
			Promise.all(translationPromises).then((values) => {
				let invalidControls = values;
				this.env.showMessage('Please recheck control(s): {{value}}', 'warning', invalidControls.join(' | '));
			});
			return;
		} 
		else{
			this.env.showPrompt('Do you want to submit?').then(()=>{
				this.saveConfig();
				let data = this.formGroup.getRawValue();
				this.modalController.dismiss(data);
			})
		}
	}
	changeStaff(e){

	}
	openedFields: any = [];
	accordionGroupChange(e) {
		this.openedFields = e.detail.value;
	}

	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
	}
}
