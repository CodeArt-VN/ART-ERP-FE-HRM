import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_PolInsuranceProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/core/common.service';
import { InsurancePolicyDetailModalPage } from './insurance-policy-detail-modal/insurance-policy-detail-modal.page';

@Component({
	selector: 'app-insurance-policy-detail',
	templateUrl: 'insurance-policy-detail.page.html',
	styleUrls: ['insurance-policy-detail.page.scss'],
	standalone: false,
})
export class InsurancePolicyDetailPage extends PageBase {
	calculationMethodTypeList = [];
	typeList = [];
	constructor(
		public pageProvider: HRM_PolInsuranceProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public route: ActivatedRoute,
		public cdr: ChangeDetectorRef,
		public router: Router,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.buildFormGroup();
	}

	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			Name: [''],
			Code: ['', Validators.pattern('^[a-zA-Z0-9.\\-]+$')],
			Remark: [''],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			EffectiveDate: [''],
			DateOfExpiry: [''],
			Lines: this.formBuilder.array([]),
			DeletedLines: [''],
		});
	}

	preLoadData() {
		super.preLoadData();
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	loadedData(event?) {
		super.loadedData(event);
		this.setLines();
	}
	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange();
		this.item = savedItem;
	}
	saveChange() {
		return super.saveChange2();
	}

	setLines() {
		this.formGroup.controls.Lines = new FormArray([]);
		if (this.item?.Lines?.length)
			this.item?.Lines.forEach((i) => {
				this.addLine(i);
			});
	}

	addLine(line, openModal = false) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			Id: [line.Id],
			Type: [line.Type, Validators.required],
			CalculationMethodType: [line.CalculationMethodType, Validators.required],
			RateCo: [line.RateCo, Validators.required],
			RateEm: [line.RateEm, Validators.required],
			IsManagerCanCreateInsurance: [line.IsManagerCanCreateInsurance],
		});
		groups.push(group);
		if (openModal) this.showModal(group);
	}

	removeLine(i) {
		this.env.showPrompt('Are you sure you want to delete selected insurance?', null, 'Delete').then((_) => {
			this.formGroup.get('DeletedLines').setValue([i.Id]);
			this.formGroup.get('DeletedLines').markAsDirty();
			this.saveChange2().then((savedItem) => {
				this.item = savedItem;
				this.loadedData();
			});
		});
	}

	
	editLine(i) {
		const groups = <FormArray>this.formGroup.controls.Lines;
		const group = groups.controls.find((x) => x.get('Id').value === i.Id);
		this.showModal(group);
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
		if (data) {
			const groups = <FormArray>this.formGroup.controls.Lines;
			const existingIndex = groups.controls.findIndex((x) => x.get('Id').value === data.Id);
			if (existingIndex >= 0) {
				Object.keys(i).forEach((key) => {
					if (groups.at(existingIndex).get(key) && i[key] != groups.at(existingIndex).get(key)?.value) {
						groups.at(existingIndex).get(key).setValue(i[key]);
						groups.at(existingIndex).get(key).markAsDirty();
					}
				});
			} else {
				this.addLine(data);
			}
			this.saveChange();
		}
	}
}
