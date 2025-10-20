import { Component, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolBenefitProvider,
	HRM_PolEmployeeProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { DynamicScriptLoaderService } from 'src/app/services/custom/custom.service';
import { lib } from 'src/app/services/static/global-functions';


@Component({
	selector: 'app-employee-policy-detail',
	templateUrl: './employee-policy-detail.page.html',
	styleUrls: ['./employee-policy-detail.page.scss'],
	standalone: false,
})
export class EmployeePolicyDetaillPage extends PageBase {
	typeList = [];
	statusList = [];
	UDFList = [];
	branchList = [];
	showEditorContent = true;
	editor: any;
	remarkBeforeChange = '';
	polBenefitList = [];
	constructor(
		public pageProvider: HRM_PolEmployeeProvider,
		public udfProvider: HRM_UDFProvider,
		public branchProvider: BRA_BranchProvider,
		public polBenefitProvider: HRM_PolBenefitProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public alertCtrl: AlertController,
		public route: ActivatedRoute,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		private dynamicScriptLoaderService: DynamicScriptLoaderService
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
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
			Status: new FormControl({ value: 'Draft', disabled: true }, Validators.required),
			Type: ['', Validators.required],
			Icon: [''],
			Color: [''],
			IsAllowEmployeeCreateRequest: [''],
			IsAllowManagerCreateRequest: [''],
			ApplyTo: [''],
			UDFList: [''], //json
			UDFListArray: this.formBuilder.array([]),
			IDPolBenefit: [''],
		});
	}

	preLoadData(event?: any): void {
		this.branchList = [...this.env.branchList];
		Promise.all([this.env.getType('HRPolicyType'), this.env.getStatus('StandardApprovalStatus'), this.polBenefitProvider.read()]).then((values: any) => {
			this.typeList = values[0];
			this.statusList = values[1];
			this.polBenefitList = values[2].data;
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.udfProvider.read({}).then((res: any) => {
			if (res && res.data && res.data.length > 0) {
				this.UDFList = res.data;
				if (this.item.UDFList) {
					let udfList = JSON.parse(this.item.UDFList);
					udfList.forEach((i) => {
						let UDF = this.UDFList.find((d) => d.Id == i.IDUDF);
						if (UDF) {
							Object.assign(i, { ...UDF }); // clone all fields from UDF into i
							delete i.Id; // remove Id
						}
						console.log(i);
					});
					this.item.UDFListArray = udfList;
					this.patchUDFList();
				}
			}
		});
		super.loadedData(event, ignoredFromGroup);
		if (this.item.ApplyTo) {
			this.formGroup.controls.ApplyTo.setValue(JSON.parse(this.item.ApplyTo));
		}
		if (this.item) this.remarkBeforeChange = this.item.Remark;
	}

	patchUDFList() {
		let groups = this.formGroup.get('UDFListArray') as FormArray;
		groups.clear();
		if (this.item?.UDFListArray?.length > 0) {
			this.item.UDFListArray.forEach((item) => {
				this.addUDFList(item);
			});
		}
	}
	openedFields: any = [];
	addUDFList(field, openField = false) {
		let groups = <FormArray>this.formGroup.controls.UDFListArray;
		let group = this.formBuilder.group({
			Id: [lib.generateUID()],
			IDUDF: [field?.IDUDF, Validators.required],
			IsRequired: [field.IsRequired || false],
			Group: new FormControl({ value: field.Group, disabled: true }),
			SubGroup: new FormControl({ value: field.SubGroup, disabled: true }),
			Code: new FormControl({ value: field.Code, disabled: true }),
			Name: new FormControl({ value: field.Name, disabled: true }),
			DataType: new FormControl({ value: field.DataType, disabled: true }),
			ControlType: new FormControl({ value: field.ControlType, disabled: true }),
			Sort: [field.Sort],
		});
		if (openField) {
			this.openedFields.push(group.controls.Id.value.toString());
		}
		groups.push(group);
	}

	changeUDF(e, fg) {
		if (!this.openedFields.includes(fg.get('Id').value.toString())) {
			this.openedFields.push(fg.get('Id').value.toString());
		}
		fg.get('IDUDF').setValue(e?.Id);
		fg.get('DataType').setValue(e?.DataType);
		fg.get('ControlType').setValue(e?.ControlType);
		fg.get('Name').setValue(e?.Name);
		fg.get('Code').setValue(e?.Code);

		fg.get('Name').markAsDirty();
		fg.get('Code').markAsDirty();
		this.saveConfig();
	}

	removeField(g, index) {
		let groups = <FormArray>this.formGroup.controls.UDFListArray;
		if (g.controls.IDUDF.value) {
			this.env
				.showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa')
				.then((_) => {
					//groups.controls[index].get('IsDeleted').setValue(true);
					groups.removeAt(index);
					this.saveConfig();
				})
				.catch((_) => {});
		} else {
			groups.removeAt(index);
			this.saveConfig();
		}
	}

	saveConfig() {
		let groups = <FormArray>this.formGroup.controls.UDFListArray;
		let data = groups.getRawValue().map((i) => ({ IDUDF: i.IDUDF, IsRequired: i.IsRequired, Sort: i.Sort }));
		console.log(data);
		this.formGroup.controls.UDFList.setValue(JSON.stringify(data));
		this.formGroup.get('UDFList').markAsDirty();
		this.saveChange2();
	}
	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		if (savedItem.ApplyTo) {
			this.formGroup.controls.ApplyTo.setValue(JSON.parse(savedItem.ApplyTo));
		} else {
			this.formGroup.controls.ApplyTo.setValue(JSON.parse(this.item.ApplyTo));
		}
	}

	async saveChange() {
		if (this.formGroup.controls.ApplyTo.value != '') {
			this.formGroup.controls.ApplyTo.setValue(JSON.stringify(this.formGroup.controls.ApplyTo.value));
		}
		super.saveChange2();
	}

	onTemplateChange(value: string) {
		this.formGroup.get('Remark')?.setValue(value);
		this.formGroup.get('Remark')?.markAsDirty();
	}

	edit() {
		this.showEditorContent = true;
		this.remarkBeforeChange = this.item.Remark;
	}

	preView() {
		this.showEditorContent = false;
		this.remarkBeforeChange = this.item.Remark;
		this.item.Remark = this.formGroup.get('Remark')?.value ?? '';
	}

	accordionGroupChange(e) {
		this.openedFields = e.detail.value;
		console.log(this.openedFields);
	}

	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
	}
	public isDisabled = true;

	toggleReorder() {
		this.isDisabled = !this.isDisabled;
	}
	doReorder(ev, groups) {
		groups = ev.detail.complete(groups);
		for (let i = 0; i < groups.length; i++) {
			const g = groups[i];
			g.controls.Sort.setValue(i + 1);
			g.controls.Sort.markAsDirty();
		}
		this.saveConfig();
	}
}
