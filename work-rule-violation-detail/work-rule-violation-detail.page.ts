import { Component, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_WorkRuleProvider, HRM_StaffProvider, HRM_StaffWorkRuleViolationProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { DynamicScriptLoaderService } from 'src/app/services/custom/custom.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
declare var Quill: any;

@Component({
	selector: 'app-work-rule-violation-detail',
	templateUrl: './work-rule-violation-detail.page.html',
	styleUrls: ['./work-rule-violation-detail.page.scss'],
	standalone: false,
})
export class WorkRuleViolationDetailPage extends PageBase {
	@ViewChildren('quillEditor') quillElement: QueryList<ElementRef>;
	editor;
	showEditorContent = true;
	workRuleList = [];
	editorComplianceRules: any;
	editorDisciplinaryActions: any;
	templateBeforeChange;
	constructor(
		public pageProvider: HRM_StaffWorkRuleViolationProvider,
		public workRuleProvider: HRM_WorkRuleProvider,
		public staffProvider: HRM_StaffProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		private dynamicScriptLoaderService: DynamicScriptLoaderService
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDStaff: ['', Validators.required],
			IDWorkRule: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			ViolationDate: [''],
			PenaltyDate: [''],
			Amount: [''],
			AttachmentURL: [''],
			Status: ['Draft'],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
		});
	}
	_staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Keyword: term  });
	});

	preLoadData(event?: any) {
		Promise.all([this.workRuleProvider.read({})]).then((values: any) => {
			this.workRuleList = values[0].data;
			super.preLoadData(event);
		});
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (!this.item.Id) {
			this.formGroup.controls.IDBranch.markAsDirty();
			this.formGroup.controls.Status.markAsDirty();
		}
		if (this.item._Staff) this._staffDataSource.selected.push(this.item._Staff);
		this._staffDataSource.initSearch();
		if (this.item) this.templateBeforeChange = this.item.Template;
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
