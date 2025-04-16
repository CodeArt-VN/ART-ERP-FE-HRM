import { Component, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_ContractTemplateProvider,
	HRM_PolBenefitProvider,
	HRM_PolEmployeeProvider,
	HRM_PolInsuranceProvider,
	HRM_PolTaxProvider,
	HRM_StaffContractProvider,
	HRM_StaffProvider,
	HRM_UDFProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { HRM_PolEmployee, HRM_PolTax } from 'src/app/models/model-list-interface';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
import { DynamicScriptLoaderService } from 'src/app/services/custom.service';

declare var Quill: any;

@Component({
	selector: 'app-staff-contract-detail',
	templateUrl: './staff-contract-detail.page.html',
	styleUrls: ['./staff-contract-detail.page.scss'],
	standalone: false,
})
export class StaffContractDetailPage extends PageBase {
	statusList = [];
	contractTemplateList = [];
	typeList = [];
	contractTypeList = [];
	taxTypeList = [];
	insuranceTypeList = [];
	calculationMethodTypeList = [];
	UDFList = [];
	editor: any;
	remarkBeforeChange = '';
	showEditorContent = true;
	contractValue: any;
	@ViewChildren('quillEditor') quillElement: QueryList<ElementRef>;
	constructor(
		public pageProvider: HRM_StaffContractProvider,
		public staffProvider: HRM_StaffProvider,
		public polTaxProvider: HRM_PolTaxProvider,
		public polInsurance: HRM_PolInsuranceProvider,
		public polWelfare: HRM_PolBenefitProvider,
		public polEmployee: HRM_PolEmployeeProvider,
		public hrmUDF: HRM_UDFProvider,
		public contractTemplateProvider: HRM_ContractTemplateProvider,
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
			Code: [''],
			Name: ['', Validators.required],
			Remark: [''],
			Sort: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			IDStaff: ['', Validators.required],
			IDContractTemplate: ['', Validators.required],
			EffectiveDate: ['', Validators.required],
			ContractDate: ['', Validators.required],
			EndDate: [''],
			Type: [''],
			Status: ['Draft', Validators.required],
			ContractType: [''],
			IDContractor: new FormControl({ value: '', disabled: true }),
			ContractValue: [],
			PolTax: this.formBuilder.group({
				Id: [],
				Type: [],
				ContributionRate: [],
			}),
			PolInsurance: this.formBuilder.group({
				Id: [],
				Type: [],
				CalculationMethodType: [],
				RateCo: [],
				RateEm: [],
			}),
			PolEmployee: this.formBuilder.group({
				Id: [],
				Remark: [],
			}),
			PolWelfare: this.formBuilder.array([]),
		});
	}

	staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Term: term });
	});

	preLoadData(event?: any): void {
		Promise.all([
			this.env.getStatus('StandardApprovalStatus'),
			this.contractTemplateProvider.read(),
			this.env.getType('HRMContractType'),
			this.env.getType('HRPolicyTaxType'),
			this.env.getType('CalculationMethodType'),
			this.env.getType('HRMInsuranceType'),
			this.hrmUDF.read({ Group: 'Benefits' }),
		]).then((res: any) => {
			this.statusList = res[0];
			this.contractTemplateList = res[1].data;
			this.contractTypeList = res[2];
			this.taxTypeList = res[3];
			this.calculationMethodTypeList = res[4];
			this.insuranceTypeList = res[5];
			this.UDFList = res[6].data;

			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item?.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
		} else {
			this.staffDataSource.selected = [];
			this.staffDataSource.selected.push(this.item._Staff);
			if (this.item._Contractor) {
				this.staffDataSource.selected.push(this.item._Contractor);
			}
			if (this.item.PolWelfareDetails?.Lines) {
				const polWelfareLines = this.item.PolWelfareDetails.Lines;
				(this.formGroup.controls.PolWelfare as FormArray).clear();
				polWelfareLines.forEach((line) => {
					const group = this.formBuilder.group({
						IDUDF: [line.IDUDF],
						Code: [this.UDFList.find((d) => d.Id == line.IDUDF).Code],
						Label: [this.UDFList.find((d) => d.Id == line.IDUDF).Name],
						Value: [line.Value],
						ControlType: [this.UDFList.find((d) => d.Id === line.IDUDF)?.ControlType],
					});
					group.addControl(this.UDFList.find((d) => d.Id == line.IDUDF).Code, new FormControl(line.Value));
					(this.formGroup.controls.PolWelfare as FormArray).push(group);
				});
			}
			if (this.item.ContractValue) {
				let value = JSON.parse(this.item.ContractValue);
				this.contractValue = value;
				this.formGroup.controls.PolTax.patchValue(value.PolTax);
				this.formGroup.controls.PolInsurance.patchValue(value.PolInsurance);
				this.formGroup.controls.PolEmployee.patchValue(value.PolEmployee);
				(this.formGroup.controls.PolWelfare as FormArray).clear();
				if (value.PolWelfare) {
					value.PolWelfare.forEach((welfare) => {
						let groups = <FormArray>this.formGroup.controls.PolWelfare;
						let group = this.formBuilder.group({
							IDUDF: [welfare.IDUDF],
							Code: [welfare.Code],
							Value: [welfare.Value],
							ControlType: [this.UDFList.find((d) => d.Id == welfare.IDUDF).ControlType],
						});
						group.addControl(welfare.Code, new FormControl(welfare.Value));
						groups.push(group);
					});
				}
			}
		}
		this.staffDataSource.initSearch();
		console.log(this.formGroup);
	}

	changeTemplate(event) {
		Promise.all([this.polTaxProvider.getAnItem(event.IDPolTax), this.polInsurance.getAnItem(event.IDPolInsurance), this.polEmployee.getAnItem(event.IDPolEmployee)]).then(
			(result: any) => {
				this.formGroup.controls.PolTax.patchValue(result[0]);
				this.formGroup.controls.PolInsurance.patchValue(result[1]);
				this.formGroup.controls.PolEmployee.patchValue(result[2]);
				if (result[2].IDPolWelfare) {
					this.polWelfare.getAnItem(result[2].IDPolWelfare).then((items: any) => {
						(this.formGroup.controls.PolWelfare as FormArray).clear();
						for (let i of items.Lines) {
							let groups = <FormArray>this.formGroup.controls.PolWelfare;
							let group = this.formBuilder.group({
								IDUDF: [i.IDUDF],
								Id: [i.Id],
								Code: [this.UDFList.find((d) => d.Id == i.IDUDF).Code],
								Label: [this.UDFList.find((d) => d.Id == i.IDUDF).Name],
								ControlType: [this.UDFList.find((d) => d.Id == i.IDUDF).ControlType],
								Value: i.Value,
							});
							group.addControl(this.UDFList.find((d) => d.Id == i.IDUDF).Code, new FormControl(i.Value));
							groups.push(group);
						}
						console.log(this.formGroup);
					});
				}
				console.log(this.formGroup);
			}
		);

		if (this.formGroup.controls.PolTax.value.Id) {
			this.env
				.showPrompt('Changing the contract template will erase the values of the modified policies. Are you sure you want to proceed?', null, 'Change contract template')
				.then((_) => {
					this.formGroup.controls.ContractValue.setValue(null);
					this.formGroup.controls.ContractValue.markAsDirty();
					this.saveChange();
				})
				.catch((err) => {
					return; // Ensure the function exits here
				});
		} else {
			this.saveChange();
		}
	}

	saveConfig() {
		const polTaxValue = this.formGroup.controls.PolTax.value;
		const polInsuranceValue = this.formGroup.controls.PolInsurance.value;
		const polEmployee = this.formGroup.controls.PolEmployee.value;
		const polWelfareValue = this.formGroup.controls.PolWelfare.value.map((group) => {
			const controlCode = group.Code;
			return {
				IDUDF: group.IDUDF,
				Code: controlCode,
				Value: group[controlCode],
			};
		});

		const contractValue = {
			PolTax: polTaxValue,
			PolInsurance: polInsuranceValue,
			PolEmployee: polEmployee,
			PolWelfare: polWelfareValue,
		};

		this.formGroup.controls.ContractValue.setValue(JSON.stringify(contractValue));
		this.formGroup.controls.ContractValue.markAsDirty();
		this.saveChange();
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

		this.formGroup.controls.PolEmployee.get('Remark').setValue(this.editor.root.innerHTML);
		if (this.editor.root.innerHTML == '<p><br></p>') {
			this.formGroup.controls.PolEmployee.get('Remark').setValue(this.editor.root.innerHTML);
		}
		this.saveConfig();
	}
	edit() {
		this.showEditorContent = true;
		if (this.contractValue && this.contractValue.PolEmployee) {
			this.contractValue.PolEmployee.Remark = this.contractValue.PolEmployee.Remark ?? this.editor?.root?.innerHTML ?? '';
			this.remarkBeforeChange = this.contractValue.PolEmployee.Remark;
		}
	}
	preView() {
		this.showEditorContent = false;
		if (this.contractValue && this.contractValue.PolEmployee) {
			this.remarkBeforeChange = this.contractValue.PolEmployee.Remark;
			this.contractValue.PolEmployee.Remark = this.editor?.root?.innerHTML ?? '';
		}
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
				if (typeof this.editor.root.innerHTML !== 'undefined' && this.item.PolEmployee?.Remark !== this.editor.root.innerHTML) {
					this.formGroup.controls.PolEmployee.get('Remark').setValue(this.editor.root.innerHTML);
					this.formGroup.controls.PolEmployee.get('Remark').markAsDirty();
				}
				if (this.editor.root.innerHTML == '<p><br></p>') {
					this.formGroup.controls.PolEmployee.get('Remark').setValue(null);
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

	// applyPolicyFromContract() {
	// 	this.env.showPrompt(null, 'Do you want to approve contract?', 'Staff contract').then((_) => {
	// 		this.env
	// 			.showLoading(
	// 				'Please wait for a few moments',
	// 				this.pageProvider.commonService.connect('PUT', 'HRM/StaffContract/ApplyPolicyFromContract/' + parseInt(this.id), null).toPromise()
	// 			)
	// 			.then((res) => {
	// 				if (res) this.env.showMessage('Approved');
	// 			});
	// 	});
	// }
}
