import { Component, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	HRM_ContractTemplateProvider,
	HRM_PolBenefitProvider,
	HRM_PolEmployeeProvider,
	HRM_PolInsuranceProvider,
	HRM_PolTaxProvider,
	HRM_StaffContractProvider,
	HRM_StaffProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { thirdPartyLibs } from 'src/app/services/static/thirdPartyLibs';
import { InsurancePolicyDetailModalPage } from '../insurance-policy-detail/insurance-policy-detail-modal/insurance-policy-detail-modal.page';
import { DynamicScriptLoaderService } from 'src/app/services/custom/custom.service';

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
	HRMEffectiveTimeTypeList = [];
	contractTypeList = [];
	taxTypeList = [];
	insuranceTypeList = [];
	calculationMethodTypeList = [];
	UDFList = [];
	editor: any;
	remarkBeforeChange = '';
	showEditorContent = false;
	contractValue: any;
	insuranceList = [];
	polBefitUFLList = [];
	arrayUDFGroup =[];
	UDFGroups = [];
	isCustomTemplate = false;
	trackingTemplate;
	@ViewChildren('quillEditor')  quillElement: QueryList<ElementRef>;
	constructor(
		public pageProvider: HRM_StaffContractProvider,
		public staffProvider: HRM_StaffProvider,
		public polTaxProvider: HRM_PolTaxProvider,
		public polInsurance: HRM_PolInsuranceProvider,
		public polBenefit: HRM_PolBenefitProvider,
		public polEmployee: HRM_PolEmployeeProvider,
		public hrmUDF: HRM_UDFProvider,
		public contractTemplateProvider: HRM_ContractTemplateProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public modalController: ModalController,
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
			ApplyType: [''],
			Status: ['Draft', Validators.required],
			ContractType: ['', Validators.required],
			IDContractor: new FormControl({ value: '', disabled: true }),
			ContractValue: [],
			PolTax: this.formBuilder.group({
				Id: [],
				Type: [],
				ContributionRate: [],
			}),
			PolInsurance: this.formBuilder.array([]),
			PolEmployee: this.formBuilder.group({
				Id: [],
				Remark: [],
			}),
			PolBenefit: this.formBuilder.array([]),
			UDFConfig:  this.formBuilder.group({}), // From config of Contact template
			_ContractContent: [],
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
			this.hrmUDF.read(),//{ Group: 'Benefits' }
			this.env.getType('HRMEffectiveTimeType'),
			this.env.getType('UDFGroupsType', true),
		]).then((res: any) => {
			this.statusList = res[0];
			this.contractTemplateList = res[1].data;
			this.contractTypeList = res[2];
			this.taxTypeList = res[3];
			this.calculationMethodTypeList = res[4];
			this.insuranceTypeList = res[5];
			this.UDFList = res[6].data;
			this.HRMEffectiveTimeTypeList = res[7];
			this.UDFGroups= res[8]
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (['Approved', 'Submitted'].includes(this.item.Status)) {
			this.pageConfig.canEdit = false;
			this.showEditorContent = false;
		}
		super.loadedData(event, ignoredFromGroup);
		if (this.item?.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
		} else {
			this.staffDataSource.selected = [this.item._Staff];
			if (this.item._Contractor) {
				this.staffDataSource.selected.push(this.item._Contractor);
			}
			
		
			if (this.item._ContractTemplate?.Template) {
				this.formGroup.controls._ContractContent.patchValue(this.item._ContractTemplate?.Template);
			}
			this.patchConfigValue();
		
			this.trackingTemplate = this.item.IDContractTemplate;
		}
		this.staffDataSource.initSearch();
		
	}

	patchConfigValue(){
		if (this.item.ContractValue) {
			let value = JSON.parse(this.item.ContractValue);
			this.contractValue = value;
			this.formGroup.controls.PolTax.patchValue(value.PolTax);
			this.formGroup.controls.PolEmployee.patchValue(value.PolEmployee);
		}
		this.patchPolBenefit();
		this.patchPolInsurance();
		this.patchUDFConfig();
	}
	patchPolInsurance(){
		let groups = <FormArray>this.formGroup.controls.PolInsurance;
		groups.clear();
		if (this.item.PolInsuranceDetail?.Lines) this.insuranceList = this.item.PolInsuranceDetail.Lines;
		let values = [];
		if(this.item.ContractValue){
			values = JSON.parse(this.item.ContractValue)?.PolInsurance;
			this.insuranceList = values;
		}
		else values = this.insuranceList;
		values.forEach((i) => {
			let group = this.formBuilder.group({
				Id: new FormControl({ value: i.Id, disabled: true }),
				Type: [i.Type, Validators.required],
				CalculationMethodType: [i.CalculationMethodType, Validators.required],
				RateCo: [i.RateCo, Validators.required],
				RateEm: [i.RateEm, Validators.required],
				IsManagerCanCreateInsurance: [i.IsManagerCanCreateInsurance],
			});
			groups.push(group);
		});

	}
	patchPolBenefit(){
		let groups = <FormArray>this.formGroup.controls.PolBenefit;
		groups.clear();
		if (this.item.PolBenefitDetails?.Lines) {
			this.polBefitUFLList = this.item.PolBenefitDetails?.Lines;
		}
		if(this.polBefitUFLList.length > 0){
			let values = [];
			if(this.item.ContractValue) values = JSON.parse(this.item.ContractValue)?.PolBenefit;

			this.polBefitUFLList.forEach((line) => {
				if(values.find(d=> d.IDUDF == line.IDUDF)) line = values.find(d=> d.IDUDF == line.IDUDF);
				const group = this.formBuilder.group({
					IDUDF: [line.IDUDF],
					Code: [this.UDFList.find((d) => d.Id == line.IDUDF).Code],
					Label: [this.UDFList.find((d) => d.Id == line.IDUDF).Name],
					Value: [line.Value],
					ControlType: [this.UDFList.find((d) => d.Id === line.IDUDF)?.ControlType],
				});
				group.addControl(this.UDFList.find((d) => d.Id == line.IDUDF).Code, new FormControl(line.Value));
				(this.formGroup.controls.PolBenefit as FormArray).push(group);
			});
		
		}
	}

	patchUDFConfig(config = null){
		let group = new FormGroup({});
		(this.formGroup.controls as any).UDFConfig = group;
		
		if(this.item._ContractTemplate?.Config){
			let values = [];
			let udfConfigList = JSON.parse(this.item._ContractTemplate.Config) || [];
			udfConfigList = udfConfigList.filter(u=> !this.polBefitUFLList.map(s=> s.IDUDF).includes(u.IDUDF));
			if(this.item.ContractValue) values = JSON.parse(this.item.ContractValue)?.UDFConfig || [];
			udfConfigList.forEach((i) => {
				let UDF = this.UDFList.find(d=> d.Id == i.IDUDF);
				let value = values.find(d => d.IDUDF == i.IDUDF);
				if (UDF) {

					let control: any = new FormControl(value?.Value ?? '', i?.IsRequired ? Validators.required : null);
					control.IDUDF = UDF.Id;
					group.addControl(UDF.Code, control);
				}
			});
			this.arrayUDFGroup = this.UDFList.filter(u=>udfConfigList.map(s=> s.IDUDF).includes(u.Id)).reduce((acc, item) => {
				let code = item.Group || 'No Group';
				let subGroup = item.SubGroup || 'No SubGroup';
				let groupName = this.UDFGroups.find((d) => d.Code == item.Group)?.Name || code;
				// Find or create the group
				let groupItem = acc.find((g) => g.Code === code);
				if (!groupItem) {
					groupItem = { Code: code, SubGroups: [], Name: groupName };
					acc.push(groupItem);
				}
	
				// Find or create the subGroup inside the group
				let subGroupItem = groupItem.SubGroups.find((sg) => sg.Code === subGroup);
				let subName = this.UDFGroups.find((d) => d.Code == subGroup)?.Name || subGroup;
				if (!subGroupItem) {
					subGroupItem = { Code: subGroup, Items: [], Name: subName, Key: code + '-' + subGroup };
					groupItem.SubGroups.push(subGroupItem);
					this.openedFields.push(subGroupItem.Key);
				}
				// Add the item
				subGroupItem.Items.push(item);
				return acc;
			}, []);
		}
	
	}

	loadPolicies(event) {
		return Promise.all([
			this.polTaxProvider.getAnItem(event.IDPolTax),
			this.polInsurance.getAnItem(event.IDPolInsurance),
			this.polEmployee.getAnItem(event.IDPolEmployee),
		]).then((result: any) => {
			this.formGroup.controls.PolTax.patchValue(result[0]);
			// this.formGroup.controls.PolInsurance.patchValue(result[1]);
			this.formGroup.controls.PolEmployee.patchValue(result[2]);
			if (result[2].PolBenefitLines?.length > 0) {
				(this.formGroup.controls.PolBenefit as FormArray).clear();
				for (let i of result[2].PolBenefitLines) {
					let groups = <FormArray>this.formGroup.controls.PolBenefit;
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
			}
			if (result[1]) {
				this.insuranceList = result[1].Lines;
				let groups = <FormArray>this.formGroup.controls.PolInsurance;
				(this.formGroup.controls.PolInsurance as FormArray).clear();
				result[1].Lines.forEach((i) => {
					let group = this.formBuilder.group({
						Id: new FormControl({ value: i.Id, disabled: true }),
						Type: [i.Type, Validators.required],
						CalculationMethodType: [i.CalculationMethodType, Validators.required],
						RateCo: [i.RateCo, Validators.required],
						RateEm: [i.RateEm, Validators.required],
						IsManagerCanCreateInsurance: [i.IsManagerCanCreateInsurance],
					});
					groups.push(group);
				});
			}
			console.log(this.formGroup);
		});
	}

	changeTemplate(event) {
		if (this.formGroup.controls.ContractValue.value) {
			this.env
				.showPrompt('Changing the contract template will erase the values of the modified policies. Are you sure you want to proceed?', null, 'Change contract template')
				.then((_) => {
					this.formGroup.controls.ContractValue.setValue(null);
					this.formGroup.controls.ContractValue.markAsDirty();
					this.arrayUDFGroup = [];
					this.loadPolicies(event).then((_) => {
						this.formGroup.controls._ContractContent.setValue(event.Remark);
						this.saveConfig();
					});
					this.trackingTemplate = event.Id;
				})
				.catch((err) => {
					if (this.trackingTemplate) {
						this.formGroup.controls.IDContractTemplate.setValue(this.trackingTemplate);
					}
				});
		} else {
			this.loadPolicies(event).then((_) => {
				this.formGroup.controls._ContractContent.setValue(event.Remark);
				this.saveConfig();
			});
			this.trackingTemplate = event.Id;
		}
	}

	saveContractContent(){
		this.formGroup.controls.Template.setValue(this.formGroup.controls._ContractContent.value);
		this.formGroup.controls.isCustomTemplate.setValue(true);
		this.formGroup.controls.isCustomTemplate.markAsDirty();
		this.formGroup.controls.Template.markAsDirty();
		this.saveConfig();
	}

	saveConfig() {
		const polTaxValue = this.formGroup.controls.PolTax.value;
		const polInsuranceValue = this.formGroup.controls.PolInsurance.getRawValue();
		const polEmployee = this.formGroup.controls.PolEmployee.value;
		const polBenefitValue = this.formGroup.controls.PolBenefit.value.map((group) => {
			const controlCode = group.Code;
			return {
				IDUDF: group.IDUDF,
				Code: controlCode,
				Value: group[controlCode],
			};
		});

		
		let udfConfig = [];
		let group = this.formGroup.get('UDFConfig') as FormGroup;
		Object.keys(group['controls']).forEach((d) => {
			let control: any = group.get(d);
			let value = {
				IDUDF: control.IDUDF,
				Code: d,
				Value: control.value,
			};
			udfConfig.push(value);
		});
		const contractValue = {
			PolTax: polTaxValue,
			PolInsurance: polInsuranceValue,
			PolEmployee: polEmployee,
			PolBenefit: polBenefitValue,
			UDFConfig: udfConfig,
		};

		this.formGroup.controls.ContractValue.setValue(JSON.stringify(contractValue));
		this.formGroup.controls.ContractValue.markAsDirty();
		this.contractValue = contractValue;
		this.saveChange();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem);
		this.item = savedItem;
		this.loadedData();
	}

	async saveChange() {
		return super.saveChange2();
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
			this.formGroup.controls.Template.setValue(this.editor.root.innerHTML);
		}
		this.saveConfig();
	}
	edit() {
		this.isCustomTemplate = true;
		if (this.item?._ContractContent) {
			this.item._ContractContent = this.item._ContractContent ?? this.editor?.root?.innerHTML ?? '';
			this.remarkBeforeChange = this.item._ContractContent;
		}
	}
	preView() {
		this.isCustomTemplate = false;
		if (this.item?._ContractContent) {
			this.remarkBeforeChange = this.item._ContractContent;
			this.item._ContractContent= this.editor?.root?.innerHTML ?? '';
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

			// Set default background color to white for the editor area
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
			//choose image
			//this.editor.getModule("toolbar").addHandler("image", this.imageHandler.bind(this));

			this.editor.on('text-change', (delta, oldDelta, source) => {
				if (typeof this.editor.root.innerHTML !== 'undefined' && this.item.Template.value !== this.editor.root.innerHTML) {
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

	editInsuranceLine(i) {
		const groups = <FormArray>this.formGroup.controls.PolInsurance;
		const group = groups.controls.find((x) => x.get('Id').value === i.Id);
		this.showModal(group);
	}

	removeInsuranceLine(i) {
		this.env.showPrompt('Are you sure you want to delete selected insurance?', null, 'Delete').then((_) => {
			const polInsuranceArray = this.formGroup.controls.PolInsurance as FormArray;
			const indexToRemove = polInsuranceArray.controls.findIndex((control) => control.get('Id').value === i.Id);
			if (indexToRemove !== -1) {
				polInsuranceArray.removeAt(indexToRemove);
				this.formGroup.controls.PolInsurance.markAsDirty();
			}
			this.saveConfig();
		});
	}

	async showModal(i) {
		const modal = await this.modalController.create({
			component: InsurancePolicyDetailModalPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				line: i,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.saveConfig();
	}

	openedFields: any = [];
	accordionGroupChange(e) {
		this.openedFields = e.detail.value;
	}

	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
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
