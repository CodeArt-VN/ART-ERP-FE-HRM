import { Component, ChangeDetectorRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolBenefitProvider,
	HRM_PolEmployeeProvider,
	HRM_StaffPolEmployeeDecisionProvider,
	HRM_UDFProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { DynamicScriptLoaderService } from 'src/app/services/custom.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
import { lib } from 'src/app/services/static/global-functions';

declare var Quill: any;

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
	@ViewChildren('quillEditor') quillElement: QueryList<ElementRef>;
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
		this.initQuill();
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

		this.formGroup.controls.Content.setValue(this.editor.root.innerHTML);
		if (this.editor.root.innerHTML == '<p><br></p>') {
			this.formGroup.controls.Content.setValue(null);
		}
		this.formGroup.controls.Content.markAsDirty();
		this.saveChange();
	}
	edit() {
		this.showEditorContent = true;
		this.item.Remark = this.item.Remark ?? this.editor?.root?.innerHTML ?? '';
		this.remarkBeforeChange = this.item.Remark;
	}
	preView() {
		this.showEditorContent = false;
		this.remarkBeforeChange = this.item.Remark;
		this.item.Remark = this.editor?.root?.innerHTML ?? '';
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
			const editorContainer = document.querySelector('#editor .ql-editor') as HTMLElement;
			if (editorContainer) {
				editorContainer.style.backgroundColor = '#ffffff';
				editorContainer.style.height = '100%';
				editorContainer.style.width = '100%';
				editorContainer.style.minHeight = 'calc(-400px + 100vh)';
			}
			const editorParent = document.querySelector('#editor') as HTMLElement;
			if (editorParent) {
				editorParent.style.height = '100%';
				editorParent.style.width = '100%';
			}
			this.editor.on('text-change', (delta, oldDelta, source) => {
				if (typeof this.editor.root.innerHTML !== 'undefined' && this.item.Remark !== this.editor.root.innerHTML) {
					this.formGroup.controls.Remark.setValue(this.editor.root.innerHTML);
					this.formGroup.controls.Remark.markAsDirty();
				}
				if (this.editor.root.innerHTML == '<p><br></p>') {
					this.formGroup.controls.Remark.setValue(null);
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
