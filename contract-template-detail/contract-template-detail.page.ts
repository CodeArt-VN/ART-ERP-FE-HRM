import { Component, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_ContractTemplateProvider,
	HRM_PolEmployeeProvider,
	HRM_PolInsuranceProvider,
	HRM_PolTaxProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
import { DynamicScriptLoaderService } from 'src/app/services/custom.service';

declare var Quill: any;

@Component({
	selector: 'app-contract-template-detail',
	templateUrl: './contract-template-detail.page.html',
	styleUrls: ['./contract-template-detail.page.scss'],
	standalone: false,
})
export class ContractTemplateDetailPage extends PageBase {
	// polEmployeeList;
	// polInsuranceList;
	// polTaxList;
	typeList = [];
	polEmployeeList = [];
	polInsuranceList = [];
	polTaxList = [];
	showEditorContent = true;
	editor: any;
	templateBeforeChange = '';
	@ViewChildren('quillEditor') quillElement: QueryList<ElementRef>;
	constructor(
		public pageProvider: HRM_ContractTemplateProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public polTaxProvider: HRM_PolTaxProvider,
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
			Id: new FormControl({ value: '', disabled: true }),
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
			Type: [''],
			IDPolTax: [''],
			IDPolInsurance: [''],
			IDPolEmployee: [''],
			ReminderBefore: [''],
			Config: [''],
			Template: [''],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.polEmployeeProvider.read(), this.polInsuranceProvider.read(), this.polTaxProvider.read(), this.env.getType('HRMContractTemplateType')]).then(
			(resp: any) => {
				this.polEmployeeList = resp[0].data;
				this.polInsuranceList = resp[1].data;
				this.polTaxList = resp[2].data;
				this.typeList = resp[3];
				super.preLoadData(event);
			}
		);
	}
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item) this.templateBeforeChange = this.item.Template;
		this.initQuill();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	async saveChange() {
		super.saveChange2();
	}

	ngAfterViewInit() {
		this.quillElement.changes.subscribe((elements) => {
			if (typeof elements.first !== 'undefined') {
				this.loadQuillEditor();
			}
		});
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
	imageHandler() {
		const imageUrl = prompt('Please enter the image URL:');
		if (imageUrl) {
			const range = this.editor.getSelection();
			this.editor.insertEmbed(range.index, 'image', imageUrl);
		}
	}

	showHtml() {
		const editorContent = this.editor.root;
		const isHtmlMode = /&lt;|&gt;|&amp;|&quot;|&#39;/.test(editorContent.innerHTML);
		if (isHtmlMode) {
			const htmlContent = editorContent.textContent || '';
			this.editor.root.innerHTML = htmlContent;
		} else {
			const richTextContent = this.editor.root.innerHTML;
			this.editor.root.textContent = richTextContent;
		}

		this.formGroup.controls.Template.setValue(this.editor.root.innerHTML);
		if (this.editor.root.innerHTML == '<p><br></p>') {
			this.formGroup.controls.Template.setValue(null);
		}
		this.formGroup.controls.Template.markAsDirty();
		this.saveChange();
	}
	edit() {
		this.showEditorContent = true;
		this.item.Template = this.item.Template ?? this.editor?.root?.innerHTML ?? '';
		this.templateBeforeChange = this.item.Template;
	}
	preView() {
		this.showEditorContent = false;
		this.templateBeforeChange = this.item.Template;
		this.item.Template = this.editor?.root?.innerHTML ?? '';
	}
	initQuill() {
		if (typeof Quill !== 'undefined') {
			const existingToolbar = document.querySelector('.ql-toolbar');
			if (existingToolbar) {
				existingToolbar.parentNode.removeChild(existingToolbar);
			}
			this.editor = new Quill('#editor', {
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
							showhtml: () => this.showHtml(),
						},
					},
				},
				theme: 'snow',
				placeholder: 'Typing ...',
			});
			//choose image
			//this.editor.getModule("toolbar").addHandler("image", this.imageHandler.bind(this));

			this.editor.on('text-change', (delta, oldDelta, source) => {
				if (typeof this.editor.root.innerHTML !== 'undefined' && this.item.Template !== this.editor.root.innerHTML) {
					this.formGroup.controls.Template.setValue(this.editor.root.innerHTML);
					this.formGroup.controls.Template.markAsDirty();
				}
				if (this.editor.root.innerHTML == '<p><br></p>') {
					this.formGroup.controls.Template.setValue(null);
				}
			});

			// icon fullscreen
			const toolbarCustom = this.editor.getModule('toolbar');
			const fullscreenButton = toolbarCustom.container.querySelector('button.ql-fullscreen');
			if (fullscreenButton) {
				const fullscreenIcon = document.createElement('ion-icon');
				fullscreenIcon.setAttribute('name', 'resize');
				fullscreenIcon.setAttribute('color', 'dark');
				fullscreenButton.innerHTML = '';
				fullscreenButton.appendChild(fullscreenIcon);
			}

			// icon show HTML
			const showHtmlButton = toolbarCustom.container.querySelector('button.ql-showhtml');
			if (showHtmlButton) {
				const showHtmlIcon = document.createElement('ion-icon');
				showHtmlIcon.setAttribute('name', 'logo-html5');
				showHtmlIcon.setAttribute('color', 'dark');
				showHtmlButton.innerHTML = '';
				showHtmlButton.appendChild(showHtmlIcon);
			}
			const toolbar = document.querySelector('.ql-toolbar');
			toolbar.addEventListener('mousedown', (event) => {
				event.preventDefault();
			});
		}
	}
}
