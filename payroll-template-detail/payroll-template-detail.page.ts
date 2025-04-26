import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PayrollTemplateProvider, HRM_PolSalaryProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-payroll-template-detail',
	templateUrl: 'payroll-template-detail.page.html',
	styleUrls: ['payroll-template-detail.page.scss'],
	standalone: false,
})
export class PayrollTemplateDetailPage extends PageBase {
	calculationMethodList: any = [];
	payrollTemplateType: any = [];
	polSalaryList: any = [];
	UDFList: any = [];
	statusList: any = [];
	trackingIDPolSalary;
	arrayUDFGroup: any = [];
	openedFieldValues = [];
	constructor(
		public pageProvider: HRM_PayrollTemplateProvider,
		public polSalaryProvider: HRM_PolSalaryProvider,
		public udfProvider: HRM_UDFProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.id = this.route.snapshot.paramMap.get('id');
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDPolSalary: ['', Validators.required],
			SalaryCalculationMethod: [''],
			Code: [''],
			Name: [''],
			Remark: [''],
			Status: ['Draft'],
			PayrollTemplateDetails: this.formBuilder.array([]),
			Sort: [''],
			IsDeleted: [''],
			IsDisabled: [''],
			CreatedBy: [''],
			CreatedDate: [''],
			ModifiedBy: [''],
			ModifiedDate: [''],
			DeletedPayrollTemplateDetails: [[]],
		});
	}
	UDFGroups;
	preLoadData(event?: any): void {
		Promise.all([
			this.env.getType('CalculationMethodType'),
			this.env.getType('PayrollTemplateType'),
			this.env.getStatus('PurchaseRequest'),
			this.env.getType('UDFGroupsType', true),
		]).then((values: any) => {
			this.calculationMethodList = values[0];
			this.payrollTemplateType = values[1];
			this.statusList = values[2];
			this.UDFGroups = values[3];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		if (this.item?.IDPolSalary) {
			this.getUDFList(this.item?.IDPolSalary).then((res: any) => {
				this.patchUDF();
				super.loadedData(event);
			});
		} else {
			this.patchUDF();
			super.loadedData(event);
		}
		this.polSalaryProvider.read({}).then((res: any) => {
			if (res && res.data && res.data.length > 0) {
				this.polSalaryList = res.data;
			}
		});

		if (!this.item.Id) {
			this.formGroup.controls.Status.markAsDirty();
		}
		this.trackingIDPolSalary = this.item?.IDPolSalary;
	}

	patchUDF() {
		let groups = this.formGroup.get('PayrollTemplateDetails') as FormArray;
		groups.clear();
		if (this.item?.PayrollTemplateDetails?.length > 0) {
			this.item.PayrollTemplateDetails.forEach((item) => {
				this.addPayrollTemplateDetail(item);
			});

			console.log(this.arrayUDFGroup);
		}
		this.arrayUDFGroup = this.UDFList.filter((u) => this.item?.PayrollTemplateDetails?.map((s) => s.IDUDF).includes(u.Id)).reduce((acc, item) => {
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
				this.openedFieldValues.push(subGroupItem.Key);
			}
			// Add the item
			subGroupItem.Items.push(groups.controls.find((d) => d.get('IDUDF').value == item.Id));
			return acc;
		}, []);
	}
	parseItem(i) {
		console.log(i);
		console.log(i.get('UDFValue').value);
		console.log(i.get('ControlType').value);
		console.log(i.get('Name').value);
	}
	addPayrollTemplateDetail(field, openField = false) {
		let groups = <FormArray>this.formGroup.controls.PayrollTemplateDetails;
		if (this.UDFList.length > 0) {
			field.ControlType = this.UDFList.find((d) => d.Id == field.IDUDF)?.ControlType;
		}
		let group = this.formBuilder.group({
			IDPayrollTemplate: [this.item.Id],
			Id: [field?.Id],
			IDUDF: [field?.IDUDF, Validators.required],
			// Id: new FormControl({ value: field?.Id, disabled: true }),
			Type: ['', Validators.required],
			Code: new FormControl({ value: field.Code, disabled: true }),
			Name: new FormControl({ value: field.Name, disabled: true }),
			Remark: [field.Remark],

			UDFValue: [field.UDFValue],
			DataType: new FormControl({ value: field.DataType, disabled: true }),
			ControlType: new FormControl({ value: field.ControlType, disabled: true }),
			IsHidden: [field.IsHidden],
			IsLock: [field.IsLock],
			Sort: [field.Sort],

			IsDisabled: new FormControl({
				value: field.IsDisabled,
				disabled: true,
			}),
			IsDeleted: new FormControl({
				value: field.IsDeleted,
				disabled: true,
			}),
			CreatedBy: new FormControl({
				value: field.CreatedBy,
				disabled: true,
			}),
			CreatedDate: new FormControl({
				value: field.CreatedDate,
				disabled: true,
			}),
			ModifiedBy: new FormControl({
				value: field.ModifiedBy,
				disabled: true,
			}),
			ModifiedDate: new FormControl({
				value: field.ModifiedDate,
				disabled: true,
			}),
		});
		if (field.IsDisabled) group.disable();
		group.get('IDPayrollTemplate').markAsDirty();
		if (openField) {
			this.openedFields.push(field?.Id.toString());
		}
		groups.push(group);
	}
	changePolSalary(e) {
		let groups = this.formGroup.get('PayrollTemplateDetails') as FormArray;
		if (groups.controls.length > 0) {
			this.env
				.showPrompt('Change policy salary will remove all items in this template. Do you want to continue?', 'Warning', 'Remove all items!', 'No')
				.then((res: any) => {
					let ids = groups.controls.filter((d) => d.value.Id).map((d) => d.value.Id);
					this.formGroup.get('DeletedPayrollTemplateDetails').setValue(ids);
					this.formGroup.get('DeletedPayrollTemplateDetails').markAsDirty();
					groups.clear();
					this.getUDFList(e.Id).finally(() => this.saveChange2());
					this.trackingIDPolSalary = e.Id;
				})
				.catch((err) => {
					this.formGroup.get('IDPolSalary').setValue(this.trackingIDPolSalary);
				});
		} else {
			this.getUDFList(e.Id).finally(() => this.saveChange2());
			this.trackingIDPolSalary = e.Id;
		}
	}
	getUDFList(IDPolSalary) {
		return new Promise((resolve, reject) => {
			this.polSalaryProvider.getAnItem(IDPolSalary).then((res: any) => {
				if (res) {
					this.UDFList = res.UDFs;
				}
				resolve(true);
			});
		});
	}

	changeUDF(e, fg) {
		fg.get('DataType').setValue(e?.DataType);
		fg.get('ControlType').setValue(e?.ControlType);
		fg.get('Name').setValue(e?.Name);
		fg.get('Code').setValue(e?.Code);

		fg.get('Name').markAsDirty();
		fg.get('Code').markAsDirty();
		this.saveChange2();
	}

	removeField(g, index) {
		let groups = <FormArray>this.formGroup.controls.PayrollTemplateDetails;
		if (g.controls.Id.value) {
			this.env
				.showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa')
				.then((_) => {
					//groups.controls[index].get('IsDeleted').setValue(true);
					groups.removeAt(index);
					this.item.PayrollTemplateDetails.splice(index, 1);
					let DeletedPayrollTemplateDetails = this.formGroup.get('DeletedPayrollTemplateDetails').value;
					let deletedId = g.controls.Id.value;
					DeletedPayrollTemplateDetails.push(deletedId);

					this.formGroup.get('DeletedPayrollTemplateDetails').setValue(DeletedPayrollTemplateDetails);
					this.formGroup.get('DeletedPayrollTemplateDetails').markAsDirty();
					//  groups.controls[index].markAsDirty();
					// groups.controls[index].get('IsDeleted').markAsDirty()
					this.saveChange2();
				})
				.catch((_) => {});
		} else groups.removeAt(index);
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	openedFields: any = [];
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
		this.saveChange2();
	}

	savedChange(savedItem = null, form = this.formGroup) {
		super.savedChange(savedItem);
		let groups = this.formGroup.get('PayrollTemplateDetails') as FormArray;
		let idsBeforeSaving = new Set(groups.controls.map((g) => g.get('Id').value));
		this.item = savedItem;

		if (this.item.PayrollTemplateDetails?.length > 0) {
			let newIds = new Set(this.item.PayrollTemplateDetails.map((i) => i.Id));
			const diff = [...newIds].filter((item) => !idsBeforeSaving.has(item));
			if (diff?.length > 0) {
				groups.controls
					.find((d) => !d.get('Id').value)
					?.get('Id')
					.setValue(diff[0]);
				this.openedFields = [...this.openedFields, diff[0].toString()];
				console.log(this.openedFields);
			}
		}
	}
}
