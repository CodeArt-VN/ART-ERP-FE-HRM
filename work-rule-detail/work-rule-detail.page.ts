import { Component, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffProvider, HRM_WorkRuleGroupProvider, HRM_WorkRuleProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { DynamicScriptLoaderService } from 'src/app/services/custom/custom.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
declare var Quill: any;

@Component({
	selector: 'app-work-rule-detail',
	templateUrl: './work-rule-detail.page.html',
	styleUrls: ['./work-rule-detail.page.scss'],
	standalone: false,
})
export class WorkRuleDetailPage extends PageBase {
	@ViewChildren('quillEditorComplianceRules') quillElementComplianceRules: QueryList<ElementRef>;
	@ViewChildren('quillEditorDisciplinaryActions') quillElementDisciplinaryAction: QueryList<ElementRef>;
	workRuleGroupList = [];
	editorComplianceRules: any;
	editorDisciplinaryActions: any;
	showEditorContent = {
		DisciplinaryActions: true,
		ComplianceRules: true,
	};
	templateBeforeChange = {
		ComplianceRules: '',
		DisciplinaryActions: '',
	};

	constructor(
		public pageProvider: HRM_WorkRuleProvider,
		public workRuleGroupProvider: HRM_WorkRuleGroupProvider,
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
			IDWorkRuleGroup: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			Supervisor: [''],
			EffectiveDate: [''],
			Overview: [''],
			ComplianceRules: [''],
			DisciplinaryActions: [''],
			TemplateFileUrl: [''],
			IsViolationTracked: [''],
			PenaltyMax: [''],
			PenaltyMin: [''],
			Bonus: [''],
			Version: [''],
			IsActivedVersion: [''],
			IsPublished: [''],
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
		Promise.all([this.workRuleGroupProvider.read({})]).then((values: any) => {
			if (values[0] && values[0].data) {
				this.workRuleGroupList = values[0].data;
			}
		});
		super.preLoadData(event);
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item) {
			this.templateBeforeChange.ComplianceRules = this.item.ComplianceRules;
			this.templateBeforeChange.DisciplinaryActions = this.item.DisciplinaryActions;
		}
		if (this.item?.Id) {
			this.formGroup.get('IDBranch').markAsDirty();
		}
	}

	async saveChange() {
		super.saveChange2();
	}



	edit(editor, controlName) {
		this.showEditorContent[controlName] = true;
		this.item[controlName] = this.item[controlName] ?? editor?.root?.innerHTML ?? '';
		this.templateBeforeChange[controlName] = this.item[controlName];
	}
	preView(editor, controlName) {
		this.showEditorContent[controlName] = false;
		this.templateBeforeChange[controlName] = this.item[controlName];
		this.item[controlName] = editor?.root?.innerHTML ?? '';
	}

	onTemplateChange(value: string, controlName) {
		this.formGroup.get(controlName)?.setValue(value);
		this.formGroup.get(controlName)?.markAsDirty();
	}
}
