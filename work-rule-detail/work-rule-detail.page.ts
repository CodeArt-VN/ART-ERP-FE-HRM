import { Component, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {  HRM_StaffProvider, HRM_WorkRuleGroupProvider, HRM_WorkRuleProvider,  } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { DynamicScriptLoaderService } from 'src/app/services/custom.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
declare var Quill:any;

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
	showEditorContent={
		DisciplinaryActions: true,
		ComplianceRules: true,
	};
	templateBeforeChange = {
		ComplianceRules:'',
		DisciplinaryActions:''
	};

	constructor(
		public pageProvider: HRM_WorkRuleProvider ,
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
			IDWorkRuleGroup: ['',Validators.required],
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
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
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
		if (this.item){
			this.templateBeforeChange.ComplianceRules = this.item.ComplianceRules;
			this.templateBeforeChange.DisciplinaryActions = this.item.DisciplinaryActions;
		} 
		// this.initQuill();
		if (this.item?.Id) {
			this.formGroup.get('IDBranch').markAsDirty();
		}
	}

	async saveChange() {
		super.saveChange2();
	}
	ngAfterViewInit() {
		this.quillElementComplianceRules.changes.subscribe((elements) => {
			if (typeof elements.first !== 'undefined') {
				this.loadQuillEditor();
			}
		});
		this.quillElementDisciplinaryAction.changes.subscribe((elements) => {
			if (typeof elements.first !== 'undefined') {
				this.loadQuillEditor();
			}
		});
	}

	initQuill() {
		if (typeof Quill !== 'undefined') {
			const existingToolbars = document.querySelectorAll('.ql-toolbar');
			if (existingToolbars && existingToolbars.length > 0) {
				existingToolbars.forEach((toolbar) => {
					toolbar.parentNode.removeChild(toolbar);
				});
			}
			this.editorDisciplinaryActions = new Quill('#quillEditorDisciplinaryActions', {
				modules: {
					toolbar: {
						container: [
							['bold', 'italic', 'underline', 'strike'], // toggled buttons
							['blockquote', 'code-block'],

							[{ header: 1 }, { header: 2 }], // custom button values
							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
							[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
							[{ direction: 'rtl' }], // text direction

							[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
							[{ header: [1, 2, 3, 4, 5, 6, false] }],

							[{ color: [] }, { background: [] }], // dropdown with defaults from theme
							[{ font: [] }],
							[{ align: [] }],
							['image', 'code-block'],

							['clean'], // remove formatting button
							['fullscreen'],
							['showhtml'],
						],
						handlers: {
							image: this.imageHandler.bind(this),
							// fullscreen: () => this.toggleFullscreen(),
							showhtml: () => this.showHtml(this.editorDisciplinaryActions,'DisciplinaryActions'),
						},
					},
				},
				theme: 'snow',
				placeholder: 'Typing ...',
			});
			this.editorComplianceRules = new Quill('#quillEditorComplianceRules', {
				modules: {
					toolbar: {
						container: [
							['bold', 'italic', 'underline', 'strike'], // toggled buttons
							['blockquote', 'code-block'],

							[{ header: 1 }, { header: 2 }], // custom button values
							[{ list: 'ordered' }, { list: 'bullet' }],
							[{ script: 'sub' }, { script: 'super' }], // superscript/subscript
							[{ indent: '-1' }, { indent: '+1' }], // outdent/indent
							[{ direction: 'rtl' }], // text direction

							[{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
							[{ header: [1, 2, 3, 4, 5, 6, false] }],

							[{ color: [] }, { background: [] }], // dropdown with defaults from theme
							[{ font: [] }],
							[{ align: [] }],
							['image', 'code-block'],

							['clean'], // remove formatting button
							['fullscreen'],
							['showhtml'],
						],
						handlers: {
							image: this.imageHandler.bind(this),
							// fullscreen: () => this.toggleFullscreen(),
							showhtml: () => this.showHtml(this.editorComplianceRules,'ComplianceRules'),
						},
					},
				},
				theme: 'snow',
				placeholder: 'Typing ...',
			});
			//choose image
			//this.editor.getModule("toolbar").addHandler("image", this.imageHandler.bind(this));

			const quillEditorDisciplinaryActionsContainer = document.querySelector('#quillEditorDisciplinaryActions .ql-editor') as HTMLElement;
			if (quillEditorDisciplinaryActionsContainer) {
				quillEditorDisciplinaryActionsContainer.style.backgroundColor = '#ffffff';
				quillEditorDisciplinaryActionsContainer.style.height = '100%';
				quillEditorDisciplinaryActionsContainer.style.width = '100%';
				quillEditorDisciplinaryActionsContainer.style.minHeight = 'calc(-400px + 100vh)';
			}
			const quillEditorDisciplinaryActionsParent = document.querySelector('#quillEditorDisciplinaryActions') as HTMLElement;
			if (quillEditorDisciplinaryActionsParent) {
				quillEditorDisciplinaryActionsParent.style.height = '100%';
				quillEditorDisciplinaryActionsParent.style.width = '100%';
			}


			const quillEditorComplianceRulesContainer = document.querySelector('#quillEditorComplianceRules .ql-editor') as HTMLElement;
			if (quillEditorComplianceRulesContainer) {
				quillEditorComplianceRulesContainer.style.backgroundColor = '#ffffff';
				quillEditorComplianceRulesContainer.style.height = '100%';
				quillEditorComplianceRulesContainer.style.width = '100%';
				quillEditorComplianceRulesContainer.style.minHeight = 'calc(-400px + 100vh)';
			}
			const quillEditorComplianceRulesParent = document.querySelector('#quillEditorComplianceRules') as HTMLElement;
			if (quillEditorComplianceRulesParent) {
				quillEditorComplianceRulesParent.style.height = '100%';
				quillEditorComplianceRulesParent.style.width = '100%';
			}


			this.editorDisciplinaryActions.on('text-change', (delta, oldDelta, source) => {
				if (typeof this.editorDisciplinaryActions.root.innerHTML !== 'undefined' && this.item.DisciplinaryActions !== this.editorDisciplinaryActions.root.innerHTML) {
					this.formGroup.controls.DisciplinaryActions.setValue(this.editorDisciplinaryActions.root.innerHTML);
					this.formGroup.controls.DisciplinaryActions.markAsDirty();
				}
				if (this.editorDisciplinaryActions.root.innerHTML == '<p><br></p>') {
					this.formGroup.controls.DisciplinaryActions.setValue(null);
				}
			});

			this.editorComplianceRules.on('text-change', (delta, oldDelta, source) => {
				if (typeof this.editorComplianceRules.root.innerHTML !== 'undefined' && this.item.ComplianceRules !== this.editorComplianceRules.root.innerHTML) {
					this.formGroup.controls.ComplianceRules.setValue(this.editorComplianceRules.root.innerHTML);
					this.formGroup.controls.ComplianceRules.markAsDirty();
				}
				if (this.editorComplianceRules.root.innerHTML == '<p><br></p>') {
					this.formGroup.controls.ComplianceRules.setValue(null);
				}
			});
			// icon fullscreen
			const toolbarCustomDisciplinaryActions = this.editorDisciplinaryActions.getModule('toolbar');
			const toolbarCustomComplianceRules = this.editorComplianceRules.getModule('toolbar');
			const fullscreenButtonDisciplinaryActions = toolbarCustomDisciplinaryActions.container.querySelector('button.ql-fullscreen');
			const fullscreenButtonComplianceRules = toolbarCustomComplianceRules.container.querySelector('button.ql-fullscreen');
			if (fullscreenButtonDisciplinaryActions) {
				const fullscreenIconDisciplinaryActions = document.createElement('ion-icon');
				fullscreenIconDisciplinaryActions.setAttribute('name', 'resize');
				fullscreenIconDisciplinaryActions.setAttribute('color', 'dark');
				fullscreenButtonComplianceRules.innerHTML = '';
				fullscreenButtonComplianceRules.appendChild(fullscreenIconDisciplinaryActions);
			}
			if (fullscreenButtonComplianceRules) {
				const fullscreenIconComplianceRules = document.createElement('ion-icon');
				fullscreenIconComplianceRules.setAttribute('name', 'resize');
				fullscreenIconComplianceRules.setAttribute('color', 'dark');
				fullscreenButtonComplianceRules.innerHTML = '';
				fullscreenButtonComplianceRules.appendChild(fullscreenIconComplianceRules);
			}
			// icon show HTML
			const showHtmlButtonDisciplinaryActions = toolbarCustomDisciplinaryActions.container.querySelector('button.ql-showhtml');
			const showHtmlButtonComplianceRules = toolbarCustomComplianceRules.container.querySelector('button.ql-showhtml');
			if (showHtmlButtonDisciplinaryActions) {
				const showHtmlIconDisciplinaryActions = document.createElement('ion-icon');
				showHtmlIconDisciplinaryActions.setAttribute('name', 'logo-html5');
				showHtmlIconDisciplinaryActions.setAttribute('color', 'dark');
				showHtmlButtonDisciplinaryActions.innerHTML = '';
				showHtmlButtonDisciplinaryActions.appendChild(showHtmlIconDisciplinaryActions);
			}
			if (showHtmlButtonComplianceRules) {
				const showHtmlIconComplianceRules = document.createElement('ion-icon');
				showHtmlIconComplianceRules.setAttribute('name', 'logo-html5');
				showHtmlIconComplianceRules.setAttribute('color', 'dark');
				showHtmlButtonComplianceRules.innerHTML = '';
				showHtmlButtonComplianceRules.appendChild(showHtmlIconComplianceRules);
			}
			const toolbar = document.querySelector('.ql-toolbar');
			toolbar.addEventListener('mousedown', (event) => {
				event.preventDefault();
			});
		}
	}

	loadQuillEditor() {
		if (typeof Quill !== 'undefined') {
			this.initQuill();
		} else {
			this.dynamicScriptLoaderService
				.loadResources(thirdPartyLibs.quill.source)
				.then(() => {
					this.initQuill();
				})
				.catch((error) => console.error('Error loading script', error));
		}
	}
	imageHandler(editor) {
		const imageUrl = prompt('Please enter the image URL:');
		if (imageUrl) {
			const range = editor.getSelection();
			editor.insertEmbed(range.index, 'image', imageUrl);
		}
	}

	showHtml(editor,controlName) {
		const editorContent = editor.root;
		const isHtmlMode = /&lt;|&gt;|&amp;|&quot;|&#39;/.test(editorContent.innerHTML);
		if (isHtmlMode) {
			const htmlContent = editorContent.textContent || '';
			editor.root.innerHTML = htmlContent;
		} else {
			const richTextContent = editor.root.innerHTML;
			editor.root.textContent = richTextContent;
		}

		this.formGroup.get(controlName).setValue(editor.root.innerHTML);
		if (editor.root.innerHTML == '<p><br></p>') {
			this.formGroup.get(controlName).setValue(null);
		}
		this.formGroup.get(controlName).markAsDirty();
		this.saveChange();
	}
	edit(editor,controlName) {
		this.showEditorContent[controlName] = true;
		this.item[controlName] = this.item[controlName]  ?? editor?.root?.innerHTML ?? '';
		this.templateBeforeChange[controlName] = this.item[controlName] ;
	}
	preView(editor,controlName) {
		this.showEditorContent[controlName] = false;
		this.templateBeforeChange[controlName] = this.item[controlName];
		this.item[controlName] = editor?.root?.innerHTML ?? '';
	}
}
