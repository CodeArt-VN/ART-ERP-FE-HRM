import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetTemplateProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-timesheet-template-detail',
	templateUrl: 'timesheet-template-detail.page.html',
	styleUrls: ['timesheet-template-detail.page.scss'],
	standalone: false,
})
export class TimesheetTemplateDetailPage extends PageBase {
	UDFList: any = [];
	UDFDataSource: any = [];
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
		Promise.all([this.env.getType('UDFGroupsType', true), this.udfProvider.read({ Group: 'TimesheetRecordInformation' }), this.env.getType('PayrollTemplateType')]).then(
			(values: any) => {
				this.UDFGroups = values[0];
				this.UDFList = values[1].data;
				this.timesheetTemplateType = values[2];
				const newItems: any[] = [];
				const groupMap = new Map<string, string>(); // Group name -> UID
				const subGroupMap = new Map<string, string>(); // `${Group}::${SubGroup}` -> UID

				// Step 1: Create Group-level display entries
				const groups = [...new Set(this.UDFList.map((u) => u.Group))];

				groups.forEach((groupName: any) => {
					const groupId = lib.generateUID();
					groupMap.set(groupName, groupId);

					newItems.push({
						Id: groupId,
						Code: groupName,
						Group: groupName,
						Name: groupName,
						SubGroup: null,
						IDParent: null,
						disabled: true,
					});
				});

				// Step 2: Create SubGroup-level display entries
				const subGroups = [...new Set(values[1].data.map((u) => `${u.Group}::${u.SubGroup}`))];

				subGroups.forEach((key: any) => {
					let [groupName, subGroupName] = key.split('::');
					const subGroupId = lib.generateUID();
					subGroupMap.set(key, subGroupId);
					subGroupName == 'null' ? (subGroupName = 'No sub group') : true;
					newItems.push({
						Id: subGroupId,
						Code: subGroupName,
						Name: subGroupName,
						Group: groupName,
						SubGroup: subGroupName,
						IDParent: groupMap.get(groupName),
						disabled: true,
					});
				});

				// Step 3: Update UDFList items to assign IDParent
				values[1].data.forEach((u) => {
					const subKey = `${u.Group}::${u.SubGroup}`;
					u.IDParent = subGroupMap.get(subKey) || null;
				});

				// Step 4: Add all generated entries to UDFList
				values[1].data.unshift(...newItems);
				this.buildFlatTree(values[1].data, []).then((rs: any) => {
					this.UDFDataSource = [...rs];
					super.preLoadData(event);
				});
			}
		);
	}
	loadedData(event) {
		if (!this.item?.Id) this.segmentView = 's2';
		super.loadedData(event);
		this.patchUDF();
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
	addTimesheetTemplateDetail(line, openField = false) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let udf = this.UDFDataSource.find((u) => u.Id == line.IDUDF);
		let group = this.formBuilder.group({
			IDTimesheetTemplate: [this.item.Id],
			Id: [line?.Id],
			IDUDF: [line?.IDUDF, Validators.required],
			// Id: new FormControl({ value: field?.Id, disabled: true }),
			Type: [line?.Type, Validators.required],
			UDFValue: [line.UDFValue?? udf?.DefaultValue],
			Code: new FormControl({ value: line.Code, disabled: true }),
			Name: new FormControl({ value: line.Name, disabled: true }),
			Remark: [line.Remark],
			DataType: new FormControl({ value: line.DataType, disabled: true }),
			ControlType: new FormControl({ value: line.ControlType, disabled: true }),
			IsHidden: [line.IsHidden],
			IsLock: [line.IsLock],
			Sort: [line.Sort],
			DefaultValue: new FormControl({ value: udf?.DefaultValue, disabled: true }),
			IsDisabled: new FormControl({
				value: line.IsDisabled,
				disabled: true,
			}),
			IsDeleted: new FormControl({
				value: line.IsDeleted,
				disabled: true,
			}),
			CreatedBy: new FormControl({
				value: line.CreatedBy,
				disabled: true,
			}),
			CreatedDate: new FormControl({
				value: line.CreatedDate,
				disabled: true,
			}),
			ModifiedBy: new FormControl({
				value: line.ModifiedBy,
				disabled: true,
			}),
			ModifiedDate: new FormControl({
				value: line.ModifiedDate,
				disabled: true,
			}),
		});
		if (line.IsDisabled) group.disable();
		this.changeType({Code:line.Type}, group, false);
		group.get('IDTimesheetTemplate').markAsDirty();
		if (openField) {
			this.openedFields.push(line?.Id.toString());
		}
		groups.push(group);
	}

	changeUDF(e, fg) {
		fg.get('DataType').setValue(e?.DataType);
		fg.get('DefaultValue').setValue(e?.DefaultValue);
		let udf = this.UDFDataSource.find((u) => u.Id == fg.controls.IDUDF.value);
		if(!fg.controls.UDFValue.value && udf?.DefaultValue){
			fg.get('UDFValue').setValue(fg.controls.UDFValue.value?? udf?.DefaultValue);	
			fg.get('UDFValue').markAsDirty();
		}

		if(fg.controls.Type.value != 'Formula'){
			fg.get('ControlType').setValue(e?.ControlType);
		}
		
		fg.get('Name').setValue(e?.Name);
		fg.get('Code').setValue(e?.Code);
		// fg.get('Name').markAsDirty();
		// fg.get('Code').markAsDirty();
		this.saveChange2();
	}
	changeType(e,fg,markAsDirty = true) {
		if(e?.Code == 'Formula'){
			fg.controls.ControlType.setValue('formula');
		}
		else{
			let udf = this.UDFDataSource.find((u) => u.Id == fg.controls.IDUDF.value);
			fg.controls.ControlType.setValue(udf?.ControlType);
		}
		if(markAsDirty) this.saveChange2();
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
		let groups = this.formGroup.get('Lines') as FormArray;
		let idsBeforeSaving = new Set(groups.controls.map((g) => g.get('Id').value));
		this.item = savedItem;

		if (this.item.Lines?.length > 0) {
			let newIds = new Set(this.item.Lines.map((i) => i.Id));
			const diff = [...newIds].filter((item) => !idsBeforeSaving.has(item));
			if (diff?.length > 0) {
				if(diff.length > 1){
					diff.forEach((d) => {
						this.openedFields = [...this.openedFields, d.toString()];
					});
					this.loadedData(null);
				}
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
