import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetTemplateProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-timesheet-template-detail',
	templateUrl: 'timesheet-template-detail.page.html',
	styleUrls: ['timesheet-template-detail.page.scss'],
	standalone: false,
})
export class TimesheetTemplateDetailPage extends PageBase {
	UDFList: any[] = [];
	UDFDataSource: any[] = [];
	UDFGroups: any[] = [];
	arrayUDFGroup: any[] = [];
	statusList: any[] = [];
	timesheetTemplateType: any[] = [];
	summaryItems: any[] = [];
	private udfLookup = new Map<any, any>();
	alwaysReturnProps = ['Id', 'IDBranch', 'IDTimesheetCycle', 'IDTimesheet'];

	methodSummary = ['COUNT','COUNT_DISTINCT', 'SUM', 'MAX', 'MIN', 'AVG'].map((x) => ({
		Code: x,
		Name: x,
	}));

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
			IsCheckOutRequired: [''],
			WorkingHoursPerDay: ['', Validators.required],
			Manager: [''],
			IsRequiredApproveToEnroll: [''],
			IsRequiredApproveToTransfer: [''],
			IsRequiredApproveToSwitch: [''],
			Lines: this.formBuilder.array([]),
			DeletedLines: [[]],
		});
	}

	preLoadData(event?: any): void {
		if (this.UDFDataSource.length && this.timesheetTemplateType.length) {
			super.preLoadData(event);
			return;
		}

		Promise.all([this.env.getType('UDFGroupsType', true), this.udfProvider.read({ Group: 'TimesheetRecordInformation' }), this.env.getType('PayrollTemplateType')]).then(
			(values: any) => {
				this.UDFGroups = values[0];

				const rawUdfList = (values[1]?.data || []).filter((u) => (!u.SubGroup || u.SubGroup == 'tbl_HRM_TimesheetRecord') && u.IsDisabled == false);
				this.UDFList = [...rawUdfList];
				this.udfLookup = new Map(this.UDFList.map((u) => [u.Id, u]));
				this.timesheetTemplateType = values[2];

				const newItems: any[] = [];
				const groupMap = new Map<string, string>();
				const subGroupMap = new Map<string, string>();
				const treeSource = rawUdfList.map((u) => ({ ...u }));
				const groups = [...new Set(treeSource.map((u) => u.Group))];

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

				const subGroups = [...new Set(treeSource.map((u) => `${u.Group}::${u.SubGroup}`))];

				subGroups.forEach((key: any) => {
					let [groupName, subGroupName] = key.split('::');
					const subGroupId = lib.generateUID();
					subGroupMap.set(key, subGroupId);
					subGroupName = subGroupName == 'null' ? 'No sub group' : subGroupName;

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

				treeSource.forEach((u) => {
					const subKey = `${u.Group}::${u.SubGroup}`;
					u.IDParent = subGroupMap.get(subKey) || null;
				});

				treeSource.unshift(...newItems);
				this.buildFlatTree(treeSource, []).then((rs: any) => {
					this.UDFDataSource = [...rs];
					super.preLoadData(event);
				});
			}
		);
	}

	loadedData(event) {
		if (!this.item?.Id) this.segmentView = 's3';
		super.loadedData(event);
		this.patchUDF();
	}

	patchUDF() {
		this.arrayUDFGroup = [];
		let groups = this.formGroup.get('Lines') as FormArray;
		groups.clear();

		if (this.item?.Lines?.length > 0) {
			this.item.Lines.forEach((item) => {
				this.addTimesheetTemplateDetail(item);
			});
		}

		this.setSummaryItems();
	}

	addTimesheetTemplateDetail(line: any = {}, openField = false, isSummary = false, markAsDirty = false) {
		const udf = this.udfLookup.get(line?.IDUDF);
		const lineId = line?.Id ?? 0;
		const accordionKey = (lineId || lib.generateUID()).toString();
		const group = this.formBuilder.group({
			IDTimesheetTemplate: [line?.IDTimesheetTemplate ?? this.item?.Id ?? 0],
			Id: [lineId],
			AccordionKey: [accordionKey],
			IDUDF: [line?.IDUDF, Validators.required],
			Type: [line?.Type ?? 'Auto', Validators.required],
			UDFValue: [line?.UDFValue ?? udf?.DefaultValue],
			SummaryMethod: [line?.SummaryMethod ?? line?.UDFValue ?? ''],
			IsSummary: [line?.IsSummary ?? isSummary],
			Code: new FormControl({ value: line?.Code, disabled: true }),
			Name: new FormControl({ value: line?.Name, disabled: true }),
			Remark: [line?.Remark],
			DataType: new FormControl({ value: line?.DataType ?? udf?.DataType, disabled: true }),
			ControlType: new FormControl({ value: line?.ControlType ?? udf?.ControlType, disabled: true }),
			IsHidden: [line?.IsHidden ?? false],
			IsLock: [line?.IsLock ?? line?.IsLocked ?? false],
			Sort: [line?.Sort ?? (this.formGroup.get('Lines') as FormArray).length + 1],
			DefaultValue: new FormControl({ value: udf?.DefaultValue, disabled: true }),
		});
		if (!this.pageConfig.canEdit || line?.IsDisabled) group.disable();
		this.changeType({ Code: group.controls.Type.value }, group, false);
		if (markAsDirty) {
			group.get('IDTimesheetTemplate')?.markAsDirty();
			group.get('Type')?.markAsDirty();
			group.get('Sort')?.markAsDirty();
			if (group.get('IDUDF')?.value) group.get('IDUDF')?.markAsDirty();
			if (group.get('UDFValue')?.value) group.get('UDFValue')?.markAsDirty();
			if (group.get('SummaryMethod')?.value) group.get('SummaryMethod')?.markAsDirty();
			if (group.get('IsSummary')?.value) group.get('IsSummary')?.markAsDirty();
		}

		if (openField) {
			this.openAccordion(accordionKey);
		}

		(<FormArray>this.formGroup.controls.Lines).push(group);
		this.setSummaryItems();
	}

	changeUDF(e, fg: FormGroup) {
		fg.get('DataType')?.setValue(e?.DataType);
		fg.get('DefaultValue')?.setValue(e?.DefaultValue);

		if (fg.controls.Type.value != 'Formula') {
			fg.get('ControlType')?.setValue(e?.ControlType);
		}

		fg.get('Name')?.setValue(e?.Name);
		fg.get('Code')?.setValue(e?.Code);

		if (!fg.get('IsSummary')?.value && !fg.get('UDFValue')?.value) {
			fg.get('UDFValue')?.setValue(e?.DefaultValue);
		}

		this.setSummaryItems();
		this.saveChange2();
	}

	changeType(e, fg: FormGroup, markAsDirty = true) {
		if (e?.Code == 'Formula') {
			fg.controls.ControlType.setValue('formula');
		} else {
			const udf = this.udfLookup.get(fg.controls.IDUDF.value);
			fg.controls.ControlType.setValue(udf?.ControlType);
		}

		if (markAsDirty) this.saveChange2();
	}

	removeField(g, index) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		const actualIndex = groups.controls.indexOf(g);

		if (g.controls.Id.value) {
			this.env
				.showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa')
				.then((_) => {
					if (actualIndex > -1) groups.removeAt(actualIndex);
					if (actualIndex > -1) this.item.Lines.splice(actualIndex, 1);
					let deletedLines = this.formGroup.get('DeletedLines')?.value;
					deletedLines.push(g.controls.Id.value);

					this.formGroup.get('DeletedLines')?.setValue(deletedLines);
					this.formGroup.get('DeletedLines')?.markAsDirty();
					this.setSummaryItems();
					this.saveChange2();
				})
				.catch(() => {});
		} else {
			if (actualIndex > -1) groups.removeAt(actualIndex);
			this.setSummaryItems();
		}
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	openedFields: string[] = [];
	accordionGroupChange(e) {
		const value = e.detail.value;
		this.openedFields = Array.isArray(value) ? value : value ? [value] : [];
	}

	openAccordion(id: string) {
		if (!id) return;

		const key = id.toString();
		if (!this.openedFields.includes(key)) {
			this.openedFields = [...this.openedFields, key];
		}
	}

	getAccordionValue(g: FormGroup): string {
		return (g.get('AccordionKey')?.value ?? g.get('Id')?.value ?? '').toString();
	}

	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
	}

	getLinePreview(g: FormGroup): string {
		if (this.segmentView === 's2') {
			return g.get('SummaryMethod')?.value ?? '';
		}

		const type = String(g.get('Type')?.value ?? '').toLowerCase();

		if (type === 'auto') {
			const udf = this.udfLookup.get(g.get('IDUDF')?.value);
			return udf?.DefaultValue ?? '';
		}

		return g.get('DefaultValue')?.value ?? g.get('UDFValue')?.value ?? '';
	}

	trackLineBy = (_index: number, g: FormGroup) => this.getAccordionValue(g);

	setSummaryItems() {
		let groups = <FormArray>this.formGroup.controls.Lines;
		this.summaryItems = groups.controls.filter((g: FormGroup) => !!g.get('IsSummary')?.value);
	}

	async addRecordLine() {
		this.isOpenPopover = false;
		this.segmentView = 's1';
		this.addTimesheetTemplateDetail({ IDTimesheetTemplate: this.item?.Id ?? 0, Id: 0 }, true, false, true);
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
		const groups = this.formGroup.get('Lines') as FormArray;
		const idsBeforeSaving = new Set(groups.controls.map((g) => g.get('Id')?.value).filter((id) => !!id));
		this.item = savedItem;
		groups.controls.forEach((g: FormGroup) => {
			if (!g.get('IDTimesheetTemplate')?.value && this.item?.Id) {
				g.get('IDTimesheetTemplate')?.setValue(this.item.Id);
			}
		});

		if (this.item?.Lines?.length > 0) {
			const newIds = new Set(this.item.Lines.map((i) => i.Id));
			const diff = [...newIds].filter((item) => !idsBeforeSaving.has(item));

			if (diff?.length > 0) {
				if (diff.length > 1) {
					diff.forEach((d) => this.openAccordion(d.toString()));
					this.loadedData(null);
					return;
				}

				const pendingGroup = groups.controls.find((d) => !d.get('Id')?.value);
				pendingGroup?.get('Id')?.setValue(diff[0]);
				pendingGroup?.get('AccordionKey')?.setValue(diff[0].toString());
				this.openAccordion(diff[0].toString());
			}
		}

		this.setSummaryItems();
	}

	isOpenPopover = false;
	@ViewChild('popover') popover!: HTMLIonPopoverElement;
	presentCopyPopover(e) {
		this.popover.event = e;
		this.isOpenPopover = true;
	}
	addAllTimesheetTemplateDetail() {
		if (!this.item?.Id) return;
		this.env.showPrompt('Do you want to add all timesheet template detail?', 'Add all timesheet template detail to this template.', 'Add').then(() => {
			this.env
				.showLoading('Please wait for a few moments', this.pageProvider.commonService.connect('GET', 'HRM/TimesheetTemplate/AddAllDetail/' + this.item.Id, {}).toPromise())
				.then((res) => {
					if (res) {
						this.isOpenPopover = false;
						this.preLoadData();
					}
				})
				.catch((err) => {
					this.env.showErrorMessage(err);
				});
		});
	}

	show = false;
}
