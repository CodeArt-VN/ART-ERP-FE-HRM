import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolInsuranceProvider,
	HRM_StaffPolInsuranceEnrollmentProvider,
	HRM_StaffProvider,
	WMS_ZoneProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { environment } from 'src/environments/environment';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { InsuranceEnrollmentDetailModalPage } from './insurance-enrollment-detail-modal/insurance-enrollment-detail-modal.page';

@Component({
	selector: 'app-insurance-enrollment-detail',
	templateUrl: './insurance-enrollment-detail.page.html',
	styleUrls: ['./insurance-enrollment-detail.page.scss'],
	standalone: false,
})
export class InsuranceEnrollmentDetailPage extends PageBase {
	statusList = [];
	HRMEffectiveTimeTypeList = [];
	polInsuranceList = [];
	initStaffPolInsuranceEnrollmentDetails = [];
	initIDPolInsurance;
	constructor(
		public pageProvider: HRM_StaffPolInsuranceEnrollmentProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public staffProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public router: Router,
		public modalController: ModalController
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDPolInsurance: ['', Validators.required],
			IDSignedBy: [''],
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
			EnrollmentDate: ['', Validators.required],
			EnrollmentEffectiveDate: ['', Validators.required],
			EnrollmentSignDate: [''],
			ApplyType: ['', Validators.required],
			Status: ['Draft', Validators.required],
			StaffPolInsuranceEnrollmentDetails: this.formBuilder.array([]),
			DeletedLines: [],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.polInsuranceProvider.read(), this.env.getType('HRMEffectiveTimeType')]).then((values: any) => {
			this.statusList = values[0];
			this.polInsuranceList = values[1].data;
			this.HRMEffectiveTimeTypeList = values[2];
			super.preLoadData(event);
		});

		this.route.queryParams.subscribe(() => {
			const navigation = this.router.getCurrentNavigation();
			if (navigation?.extras?.state?.StaffList) {
				this.initStaffPolInsuranceEnrollmentDetails = navigation.extras.state.StaffList;
				this.initIDPolInsurance = navigation.extras.state.IDPol;
			}
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.item.Id == 0) if (this.initStaffPolInsuranceEnrollmentDetails) this.item.StaffPolInsuranceEnrollmentDetails = this.initStaffPolInsuranceEnrollmentDetails;
		super.loadedData(event, ignoredFromGroup);
		this.patchFormArray();
		if (this.item?.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
			this.formGroup.controls.IDBranch.markAsDirty();
			if (this.initIDPolInsurance) {
				this.formGroup.controls.IDPolInsurance.setValue(parseInt(this.initIDPolInsurance));
				this.formGroup.controls.IDPolInsurance.markAsDirty();
			}
			if (this.item.StaffPolInsuranceEnrollmentDetails) {
				let groups = this.formGroup.controls.StaffPolInsuranceEnrollmentDetails as FormArray;
				groups.controls.forEach((control: any) => {
					Object.keys(control.controls).forEach((key) => {
						control.get(key).markAsDirty();
					});
				});
			}
		}
	}

	patchFormArray() {
		let groups = this.formGroup.controls.StaffPolInsuranceEnrollmentDetails as FormArray;
		groups.clear();
		if (this.item.StaffPolInsuranceEnrollmentDetails?.length > 0)
			this.item.StaffPolInsuranceEnrollmentDetails.forEach((i) => {
				this.addLine(i);
				i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			});
	}
	editSelectedLine() {
		this.showModal(this.selectedItems);
	}
	editLine(i) {
		this.showModal([i]);
	}

	addLine(line) {
		let groups = this.formGroup.controls.StaffPolInsuranceEnrollmentDetails as FormArray;
		let group = this.formBuilder.group({
			Id: [line.Id ?? 0],
			IDStaff: [line.IDStaff],
			IDStaffPolInsuranceEnrollment: [line.IDStaffPolInsuranceEnrollment ?? this.id],
			InsuranceSalary: [line.InsuranceSalary],
		});
		groups.push(group);
	}

	removeSelectedLine() {
		let groups = <FormArray>this.formGroup.controls.StaffPolInsuranceEnrollmentDetails;

		if (this.selectedItems.length > 0) {
			this.env
				.showPrompt('Are you sure you want to delete this staff benefit?', null, 'Delete staff benefit')
				.then((_) => {
					let Ids = [];
					Ids = this.selectedItems.map((e) => e.Id);
					if (Ids && Ids.length > 0) {
						this.formGroup.get('DeletedLines').setValue(Ids);
						this.formGroup.get('DeletedLines').markAsDirty();
						this.saveChange().then((s) => {
							Ids.forEach((id) => {
								let index = groups.controls.findIndex((x) => x.get('Id').value == id);
								if (index >= 0) groups.removeAt(index);
							});
						});
					}
				})
				.catch((_) => {});
		}
	}

	removeLine(index) {
		let groups = <FormArray>this.formGroup.controls.StaffPolInsuranceEnrollmentDetails;

		if (groups.controls[index].get('Id').value) {
			this.env
				.showPrompt('Are you sure you want to delete this staff insurance?', null, 'Delete staff insurance')
				.then((_) => {
					let Ids = [];
					Ids.push(groups.controls[index].get('Id').value);
					if (Ids && Ids.length > 0) {
						this.formGroup.get('DeletedLines').setValue(Ids);
						this.formGroup.get('DeletedLines').markAsDirty();
						this.saveChange().then((s) => {
							Ids.forEach((id) => {
								let index = groups.controls.findIndex((x) => x.get('Id').value == id);
								if (index >= 0) groups.removeAt(index);
							});
						});
					}
				})
				.catch((_) => {});
		}
	}

	async showModal(i) {
		if (!i) {
			const modal1 = await this.modalController.create({
				component: StaffPickerEnrollmentPage,
				backdropDismiss: false,
				cssClass: 'modal90',
				componentProps: {
					dataSource: this.polInsuranceList.filter((d) => d.Id == this.formGroup.controls.IDPolInsurance.value),
				},
			});
			await modal1.present();
			const { data } = await modal1.onWillDismiss();
			if (data) i = data.StaffList;
		}
		const modal = await this.modalController.create({
			component: InsuranceEnrollmentDetailModalPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				Items: i,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let groups = this.formGroup.controls.StaffPolInsuranceEnrollmentDetails as FormArray;
			data.forEach((i) => {
				let staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
				if (!staffControl) {
					this.addLine(i);
					staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
					staffControl.get('Id').markAsDirty();
					staffControl.get('IDStaff').markAsDirty();
					staffControl.get('IDStaffPolInsuranceEnrollment').markAsDirty();
					staffControl.get('InsuranceSalary').markAsDirty();
				} else {
					Object.keys(i).forEach((key) => {
						if (staffControl.get(key) && i[key] != staffControl.get(key)?.value) {
							staffControl.get(key).setValue(i[key]);
							staffControl.get(key).markAsDirty();
						}
					});
					staffControl.get('Id').markAsDirty();
				}
			});
			this.saveChange();
		}
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		console.log('savedChange', savedItem);
		super.savedChange(savedItem, form);
		this.loadedData();

	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	saveChange() {
		return super.saveChange2();
	}
}
