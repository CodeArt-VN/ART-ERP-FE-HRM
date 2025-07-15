import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetTemplateProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-timesheet-template-detail',
	templateUrl: 'timesheet-template-detail.page.html',
	styleUrls: ['timesheet-template-detail.page.scss'],
	standalone: false,
})
export class TimesheetTemplateDetailPage extends PageBase {
	UDFList: any = [];
	UDFGroups: any = [];
	arrayUDFGroup: any = [];
	statusList: any = [];
	timesheetTemplateType = [];
	alwaysReturnProps = ['Id', 'IDBranch', 'IDTimesheetCycle', 'IDTimesheet'];
	constructor(
		public pageProvider: HRM_TimesheetTemplateProvider,
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
			IDBranch: [this.env.selectedBranch],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: [''],
			Remark: [''],
			Sort: [''],
			IsDeleted: [''],
			IsDisabled: [''],
			CreatedBy: [''],
			CreatedDate: [''],
			ModifiedBy: [''],
			ModifiedDate: [''],
			Type: ['', Validators.required],
			CheckInPolicy: ['', Validators.required],
			NumberOfShiftPerDay: ['', Validators.required],
			IsCheckOutRequired: ['', Validators.required],
			WorkingHoursPerDay: ['', Validators.required],
			Manager: [''],
			IsRequiredApproveToEnroll: ['', Validators.required],
			IsRequiredApproveToTransfer: ['', Validators.required],
			IsRequiredApproveToSwitch: ['', Validators.required],
			Lines: this.formBuilder.array([]),
			DeletedLines: [[]],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('UDFGroupsType', true), this.udfProvider.read(), this.env.getType('PayrollTemplateType')]).then((values: any) => {
			this.UDFGroups = values[0];
			this.UDFList = values[1].data;
			this.timesheetTemplateType = values[2];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		// if (['Submitted', 'Approved', 'Cancelled'].includes(this.item.Status)) {
		// 	this.pageConfig.canEdit = false;
		// }
		this.patchUDF();
		super.loadedData(event);
		// this.polSalaryProvider.read({}).then((res: any) => {
		// 	if (res && res.data && res.data.length > 0) {
		// 		this.polSalaryList = res.data;
		// 	}
		// });
		// if (!this.item.Id) {
		// 	this.formGroup.controls.Status.markAsDirty();
		// }
	}
	openedFieldValues = [];
	patchUDF() {
		let groups = this.formGroup.get('Lines') as FormArray;
		this.arrayUDFGroup = [];
		groups.clear();
		if (this.item?.Lines?.length > 0) {
			this.item.Lines.forEach((item) => {
				this.addTimesheetTemplateDetail(item);
			});
		}
	}
	addTimesheetTemplateDetail(field, openField = false) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			IDTimesheetTemplate: [this.item.Id],
			Id: [field?.Id],
			IDUDF: [field?.IDUDF, Validators.required],
			// Id: new FormControl({ value: field?.Id, disabled: true }),
			Type: ['', Validators.required],
			UDFValue: [field.UDFValue],
			Code: new FormControl({ value: field.Code, disabled: true }),
			Name: new FormControl({ value: field.Name, disabled: true }),
			Remark: [field.Remark],
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
		group.get('IDTimesheetTemplate').markAsDirty();
		if (openField) {
			this.openedFields.push(field?.Id.toString());
		}
		groups.push(group);
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
		let groups = <FormArray>this.formGroup.controls.Lines;
		if (g.controls.Id.value) {
			this.env
				.showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa')
				.then((_) => {
					//groups.controls[index].get('IsDeleted').setValue(true);
					groups.removeAt(index);
					this.item.Lines.splice(index, 1);
					let DeletedLines = this.formGroup.get('DeletedLines').value;
					let deletedId = g.controls.Id.value;
					DeletedLines.push(deletedId);

					this.formGroup.get('DeletedLines').setValue(DeletedLines);
					this.formGroup.get('DeletedLines').markAsDirty();
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
		// let groups = this.formGroup.get('StaffPayrollConfig') as FormArray;
		// let idsBeforeSaving = new Set(groups.controls.map((g) => g.get('Id').value));
		this.item = savedItem;

		// if (this.item.StaffPayrollConfig?.length > 0) {
		// 	let newIds = new Set(this.item.StaffPayrollConfig.map((i) => i.Id));
		// 	const diff = [...newIds].filter((item) => !idsBeforeSaving.has(item));
		// 	if (diff?.length > 0) {
		// 		groups.controls
		// 			.find((d) => !d.get('Id').value)
		// 			?.get('Id')
		// 			.setValue(diff[0]);
		// 		this.openedFields = [...this.openedFields, diff[0].toString()];
		// 		console.log(this.openedFields);
		// 	}
		// }
	}
}
