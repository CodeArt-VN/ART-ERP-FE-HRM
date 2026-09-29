import { ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetTemplateProvider, HRM_UDFProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lib } from 'src/app/services/static/global-functions';
import { buildResetTemplatePromptInputs, resolveResetTemplateId } from './timesheet-template-detail.cycle';
import { HRM_TimesheetCycleService } from '../hrm-timesheet-cycle.service';

@Component({
	selector: 'app-timesheet-template-detail',
	templateUrl: 'timesheet-template-detail.page.html',
	styleUrls: ['timesheet-template-detail.page.scss'],
	standalone: false,
})
export class TimesheetTemplateDetailPage extends PageBase {
	/** When set, this page edits cycle snapshot columns (same UI as template). */
	@Input() idTimesheetCycleDetail: number = null;
	@Input() timesheetName = '';
	@Input() cycleStatus = 'Draft';

	UDFList: any[] = [];
	UDFDataSource: any[] = [];
	UDFGroups: any[] = [];
	arrayUDFGroup: any[] = [];
	statusList: any[] = [];
	timesheetTemplateType: any[] = [];
	summaryItems: any[] = [];
	private udfLookup = new Map<any, any>();
	alwaysReturnProps = ['Id', 'IDBranch', 'IDTimesheetCycle', 'IDTimesheet'];
	isSummaryReorderDisabled = true;
	cycleConfigDirty = false;
	/** Linked timesheet's template — used as default when resetting cycle columns only. */
	cycleIDTimesheetTemplate: number = null;

	methodSummary = ['COUNT', 'COUNT_DISTINCT', 'SUM', 'MAX', 'MIN', 'AVG'].map((x) => ({
		Code: x,
		Name: x,
	}));

	get isCycleConfigMode(): boolean {
		return !!this.idTimesheetCycleDetail;
	}

	constructor(
		public pageProvider: HRM_TimesheetTemplateProvider,
		public timesheetCycleProvider: HRM_TimesheetCycleService,
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
		const cycleDetailId = this.route.snapshot.paramMap.get('idTimesheetCycleDetail');
		if (cycleDetailId) {
			this.idTimesheetCycleDetail = parseInt(cycleDetailId, 10);
			this.timesheetName = this.route.snapshot.queryParamMap.get('name') || '';
			this.cycleStatus = this.route.snapshot.queryParamMap.get('status') || 'Draft';
			this.pageConfig.pageName = this.route.snapshot.queryParamMap.get('back') || 'staff-timesheet';
			this.pageConfig.pageTitle = this.timesheetName || 'UDF columns';
		} else {
			this.id = this.route.snapshot.paramMap.get('id');
		}
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
		this.pageConfig.showSpinner = true;
		const afterUdfReady = () => {
			if (this.isCycleConfigMode) {
				this.loadCycleConfig(event);
				return;
			}
			super.preLoadData(event);
		};

		if (this.UDFDataSource.length && this.timesheetTemplateType.length) {
			afterUdfReady();
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
					afterUdfReady();
				});
			}
		).catch((err) => {
			console.log(err);
			this.pageConfig.showSpinner = false;
			this.env.showMessage('Cannot load UDF columns', 'danger');
			event?.target?.complete?.();
		});
	}

	loadCycleConfig(event?: any) {
		this.pageConfig.pageTitle = this.timesheetName || 'UDF columns';
		this.pageConfig.showSpinner = true;
		this.segmentView = 's1';
		this.timesheetCycleProvider
			.getConfig(this.idTimesheetCycleDetail)
			.then((cfg: any) => {
				this.cycleStatus = cfg?.Status || this.cycleStatus;
				this.pageConfig.canEdit = !!cfg?.CanEdit;
				this.cycleIDTimesheetTemplate = cfg?.IDTimesheetTemplate ? Number(cfg.IDTimesheetTemplate) : null;
				if (!Number.isFinite(this.cycleIDTimesheetTemplate) || this.cycleIDTimesheetTemplate <= 0) {
					this.cycleIDTimesheetTemplate = null;
				}
				this.item = {
					Id: cfg?.Id || this.idTimesheetCycleDetail,
					Name: this.timesheetName || cfg?.TimesheetName || '',
					Code: '',
					Remark: '',
					Status: this.cycleStatus,
					Type: 'Cycle',
					CheckInPolicy: '-',
					NumberOfShiftPerDay: 1,
					WorkingHoursPerDay: 8,
					Lines: cfg?.Lines || [],
				};
				this.id = this.item.Id;
				this.formGroup.controls.Type.clearValidators();
				this.formGroup.controls.CheckInPolicy.clearValidators();
				this.formGroup.controls.NumberOfShiftPerDay.clearValidators();
				this.formGroup.controls.WorkingHoursPerDay.clearValidators();
				this.formGroup.controls.Type.updateValueAndValidity({ emitEvent: false });
				this.formGroup.controls.CheckInPolicy.updateValueAndValidity({ emitEvent: false });
				this.formGroup.controls.NumberOfShiftPerDay.updateValueAndValidity({ emitEvent: false });
				this.formGroup.controls.WorkingHoursPerDay.updateValueAndValidity({ emitEvent: false });
				this.loadedData(event);
			})
			.catch((err) => {
				console.log(err);
				this.pageConfig.showSpinner = false;
				this.env.showMessage(err?.error?.Message || 'Cannot load UDF columns', 'danger');
				event?.target?.complete?.();
			});
	}

	loadedData(event) {
		if (!this.isCycleConfigMode && !this.item?.Id) this.segmentView = 's3';
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
			UDFSlot: new FormControl({ value: line?.UDFSlot ?? udf?.UDF, disabled: true }),
			IsHidden: [line?.IsHidden ?? false],
			IsLock: [line?.IsLock ?? line?.IsLocked ?? false],
			Sort: [line?.Sort ?? (this.formGroup.get('Lines') as FormArray).length + 1],
			SummarySort: [line?.SummarySort ?? null],
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
			if (group.get('SummarySort')?.value) group.get('SummarySort')?.markAsDirty();
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
		fg.get('UDFSlot')?.setValue(e?.UDF);

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
				.showPrompt('Are you sure you want to delete?', null, 'Delete')
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

	toggleAccordion(g: FormGroup) {
		const key = this.getAccordionValue(g);
		if (!key) return;
		if (this.openedFields.includes(key)) {
			this.openedFields = this.openedFields.filter((k) => k !== key);
			return;
		}
		this.openedFields = [...this.openedFields, key];
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
		const groups = <FormArray>this.formGroup.controls.Lines;
		const summaryGroups = groups.controls.filter((g: FormGroup) => !!g.get('IsSummary')?.value) as FormGroup[];
		let nextSummarySort = 1;

		summaryGroups
			.sort((a: FormGroup, b: FormGroup) => {
				const aSort = Number(a.get('SummarySort')?.value ?? Number.MAX_SAFE_INTEGER);
				const bSort = Number(b.get('SummarySort')?.value ?? Number.MAX_SAFE_INTEGER);
				if (aSort !== bSort) return aSort - bSort;
				return Number(a.get('Sort')?.value ?? 0) - Number(b.get('Sort')?.value ?? 0);
			})
			.forEach((g: FormGroup) => {
				if (!g.get('SummarySort')?.value) {
					g.get('SummarySort')?.setValue(nextSummarySort);
				}
				nextSummarySort++;
			});

		groups.controls
			.filter((g: FormGroup) => !g.get('IsSummary')?.value && !!g.get('SummarySort')?.value)
			.forEach((g: FormGroup) => g.get('SummarySort')?.setValue(null));

		this.summaryItems = [...summaryGroups].sort(
			(a: FormGroup, b: FormGroup) => Number(a.get('SummarySort')?.value ?? 0) - Number(b.get('SummarySort')?.value ?? 0)
		);
	}

	onSummaryChange(g: FormGroup) {
		if (g.get('IsSummary')?.value && !g.get('SummarySort')?.value) {
			const maxSummarySort = this.summaryItems.reduce((max, item: FormGroup) => Math.max(max, Number(item.get('SummarySort')?.value ?? 0)), 0);
			g.get('SummarySort')?.setValue(maxSummarySort + 1);
			g.get('SummarySort')?.markAsDirty();
		}

		if (!g.get('IsSummary')?.value && g.get('SummarySort')?.value) {
			g.get('SummarySort')?.setValue(null);
			g.get('SummarySort')?.markAsDirty();
		}

		this.setSummaryItems();
		this.saveChange2();
	}

	async addRecordLine() {
		this.isOpenPopover = false;
		this.segmentView = 's1';
		this.addTimesheetTemplateDetail({ IDTimesheetTemplate: this.item?.Id ?? 0, Id: 0 }, true, false, true);
	}

	async addSummaryLine() {
		this.isOpenPopover = false;
		const groups = this.formGroup.get('Lines') as FormArray;
		const candidates = groups.controls.filter((g: FormGroup) => !g.get('IsSummary')?.value && !!g.get('Name')?.value);

		if (!candidates.length) {
			this.env.showMessage('No available fields to add to summary', 'warning');
			return;
		}

		const inputs = candidates.map((g: FormGroup) => ({
			type: 'checkbox',
			label: g.get('Name')?.value || g.get('Code')?.value,
			value: this.getAccordionValue(g),
			checked: false,
		}));

		try {
			const selectedKeys: string[] = (await this.env.showPrompt('Select fields to add to summary', null, 'Add', 'Add', 'Cancel', inputs)) as string[];

			if (!selectedKeys?.length) return;

			candidates
				.filter((g: FormGroup) => selectedKeys.includes(this.getAccordionValue(g)))
				.forEach((g: FormGroup, index: number) => {
					g.get('IsSummary')?.setValue(true);
					g.get('IsSummary')?.markAsDirty();
					g.get('SummarySort')?.setValue(this.summaryItems.length + index + 1);
					g.get('SummarySort')?.markAsDirty();

					if (!g.get('SummaryMethod')?.value) {
						g.get('SummaryMethod')?.setValue('COUNT');
						g.get('SummaryMethod')?.markAsDirty();
					}

					this.openAccordion(this.getAccordionValue(g));
				});

			this.setSummaryItems();
			this.segmentView = 's2';
			this.saveChange2();
		} catch (error) {}
	}

	public isDisabled = true;

	toggleReorder() {
		this.isDisabled = !this.isDisabled;
	}

	toggleSummaryReorder() {
		this.isSummaryReorderDisabled = !this.isSummaryReorderDisabled;
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

	doSummaryReorder(ev) {
		const reorderedSummary = ev.detail.complete([...this.summaryItems]);
		reorderedSummary.forEach((g: FormGroup, index: number) => {
			g.get('SummarySort')?.setValue(index + 1);
			g.get('SummarySort')?.markAsDirty();
		});

		this.setSummaryItems();
		this.saveChange2();
	}

	saveChange2(form = this.formGroup, publishEventCode = this.pageConfig.pageName, provider = this.pageProvider) {
		if (this.isCycleConfigMode) {
			return this.saveCycleConfig();
		}
		return super.saveChange2(form, publishEventCode, provider);
	}

	private mapCycleLines() {
		const groups = this.formGroup.get('Lines') as FormArray;
		return groups.controls.map((g: FormGroup) => {
			const raw = g.getRawValue();
			const udf = this.udfLookup.get(raw.IDUDF);
			return {
				Id: raw.Id || 0,
				IDUDF: raw.IDUDF,
				Code: raw.Code || '',
				Name: raw.Name || '',
				Type: raw.Type || '',
				UDFSlot: raw.UDFSlot || udf?.UDF || '',
				DataType: raw.DataType || udf?.DataType || '',
				ControlType: raw.ControlType || udf?.ControlType || '',
				UDFValue: raw.UDFValue ?? '',
				Remark: raw.Remark || '',
				Sort: raw.Sort,
				SummarySort: raw.SummarySort,
				SummaryMethod: raw.SummaryMethod || '',
				IsSummary: !!raw.IsSummary,
				IsLocked: !!raw.IsLock,
				IsHidden: !!raw.IsHidden,
			};
		});
	}

	saveCycleConfig() {
		if (!this.pageConfig.canEdit || this.submitAttempt) {
			return Promise.reject('cannot save');
		}
		this.submitAttempt = true;
		return this.timesheetCycleProvider
			.saveConfig(this.idTimesheetCycleDetail, {
				Lines: this.mapCycleLines(),
				DeletedIds: this.formGroup.get('DeletedLines')?.value || [],
			})
			.then((cfg: any) => {
				this.cycleConfigDirty = true;
				this.submitAttempt = false;
				this.formGroup.get('DeletedLines')?.setValue([]);
				this.item = {
					...this.item,
					Lines: cfg?.Lines || [],
					Status: cfg?.Status || this.cycleStatus,
				};
				this.pageConfig.canEdit = !!cfg?.CanEdit;
				this.patchUDF();
				this.env.showMessage('Saving completed!', 'success');
				return cfg;
			})
			.catch((err) => {
				this.submitAttempt = false;
				this.env.showMessage(err?.error?.Message || 'Cannot save, please try again', 'danger');
				throw err;
			});
	}

	async resetCycleConfig() {
		try {
			const resp: any = await this.pageProvider.read({ Take: 200, SortBy: 'Name' });
			const templates = resp?.data || [];
			const inputs = buildResetTemplatePromptInputs(
				templates,
				this.cycleIDTimesheetTemplate,
				' (' + (await this.env.translateResource('current')) + ')'
			);
			if (!inputs.length) {
				this.env.showMessage('No timesheet template available', 'warning');
				return;
			}

			const selected = await this.env.showPrompt(
				'Select a timesheet template to reload columns for this cycle only. Values in UDF slots are kept. The timesheet link is not changed.',
				null,
				'Reset from template',
				'Reset',
				'Cancel',
				inputs
			);

			const idTemplate = resolveResetTemplateId(selected, inputs);
			if (!idTemplate) {
				this.env.showMessage('Please select a timesheet template', 'warning');
				return;
			}

			await this.env.showLoading(
				'Please wait for a few moments',
				this.timesheetCycleProvider.resetConfig(this.idTimesheetCycleDetail, idTemplate)
			);
			this.cycleConfigDirty = true;
			this.formGroup.get('DeletedLines')?.setValue([]);
			this.openedFields = [];
			this.env.showMessage('Reset completed', 'success');
			// Full reload so accordion / form lines match the new snapshot.
			this.loadCycleConfig();
		} catch (err) {
			if (err === false || err === 'User abort action') return;
			console.log(err);
			this.env.showMessage(err?.error?.Message || err?.message || 'Cannot save, please try again', 'danger');
		}
	}

	reopenCycleConfig() {
		this.env
			.showPrompt('Reopen this timesheet in the cycle to edit the frozen column set?', null, 'Reopen')
			.then(() => {
				this.timesheetCycleProvider.reopen([this.idTimesheetCycleDetail]).then(() => {
					this.cycleConfigDirty = true;
					this.cycleStatus = 'Draft';
					this.pageConfig.canEdit = true;
					this.item.Status = 'Draft';
					(this.formGroup.get('Lines') as FormArray).controls.forEach((c) => c.enable());
					this.env.showMessage('Reopened', 'success');
				});
			})
			.catch(() => {});
	}

	async closeCycleConfigModal() {
		// Kept for PageBase compatibility; full-page mode uses ion-back-button.
		if (this.isCycleConfigMode) {
			this.navCtrl.navigateBack('/' + (this.pageConfig.pageName || 'staff-timesheet'));
			return;
		}
		await this.modalController.dismiss({ saved: this.cycleConfigDirty });
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
		if (this.isCycleConfigMode || !this.item?.Id) return;
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
