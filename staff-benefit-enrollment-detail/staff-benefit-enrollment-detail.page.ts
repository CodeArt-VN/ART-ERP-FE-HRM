import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_PolBenefitProvider, HRM_StaffPolBenefitEnrollmentProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { StaffBenefitEnrollmentDetailModalPage } from './staff-benefit-enrollment-detail-modal/staff-benefit-enrollment-detail-modal.page';
import { environment } from 'src/environments/environment';
import { lib } from 'src/app/services/static/global-functions';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
@Component({
	selector: 'app-staff-benefit-enrollment-detail',
	templateUrl: './staff-benefit-enrollment-detail.page.html',
	styleUrls: ['./staff-benefit-enrollment-detail.page.scss'],
	standalone: false,
})
export class StaffBenefitEnrollmentDetailPage extends PageBase {
	HRMEffectiveTimeTypeList = [];
	statusList = [];
	polBenefitList = [];
	UDFList = [];
	UDFUsedList = [];
	trackingIDPolBenefit;
	initStaffPolBenefitEnrollmentDetails;
	initPolBenefit;
	constructor(
		public pageProvider: HRM_StaffPolBenefitEnrollmentProvider,
		public polBenefitProvider: HRM_PolBenefitProvider,
		public udfProvider: HRM_UDFProvider,
		public branchProvider: BRA_BranchProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public modalController: ModalController,
		public router: Router
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDPolBenefit: ['', Validators.required],
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
			ApplyType: ['', Validators.required],
			Status: new FormControl({ value: 'Draft', disabled: true }),
			EnrollmentDate: ['', Validators.required],
			StaffPolBenefitEnrollmentDetails: this.formBuilder.array([]),
			DeletedLines: [],
		});
	}
	preLoadData(event?: any): void {
		Promise.all([
			this.env.getStatus('StandardApprovalStatus'),
			this.polBenefitProvider.read(),
			this.udfProvider.read({ Group: 'Benefits' }),
			this.env.getType('HRMEffectiveTimeType'),
		]).then((res: any) => {
			this.statusList = res[0];
			this.polBenefitList = res[1].data;
			this.UDFList = res[2].data;
			this.HRMEffectiveTimeTypeList = res[3];
			super.preLoadData(event);
		});
		this.route.queryParams.subscribe(() => {
			const navigation = this.router.getCurrentNavigation();
			if (navigation?.extras?.state?.StaffList) {
				this.initStaffPolBenefitEnrollmentDetails = navigation.extras.state.StaffList;
				this.initPolBenefit = navigation.extras.state.IDPol;
			}
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.item.Id == 0) if (this.initStaffPolBenefitEnrollmentDetails) this.item.StaffPolBenefitEnrollmentDetails = this.initStaffPolBenefitEnrollmentDetails;
		this.patchFormArray();

		super.loadedData(event, ignoredFromGroup);
		if (this.item.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
			if (this.initPolBenefit) {
				this.formGroup.controls.IDPolBenefit.setValue(parseInt(this.initPolBenefit));
				this.formGroup.controls.IDPolBenefit.markAsDirty();
			}
			if (this.item.StaffPolBenefitEnrollmentDetails) {
				let groups = this.formGroup.controls.StaffPolBenefitEnrollmentDetails as FormArray;
				groups.controls.forEach((control: any) => {
					Object.keys(control.controls).forEach((key) => {
						control.get(key).markAsDirty();
					});
				});
				// data.forEach((i) => {
				// 	let staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
				// 	if (!staffControl) {
				// 		this.addLine(i);
				// 		staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
				// 		staffControl.get('Id').markAsDirty();
				// 		staffControl.get('IDStaff').markAsDirty();
				// 		staffControl.get('IDStaffPolBenefitEnrollment').markAsDirty();
				// 		staffControl.get('BenefitEnrollmentValue').markAsDirty();
				// 	} else {
				// 		Object.keys(i).forEach((key) => {
				// 			if (staffControl.get(key) && i[key] != staffControl.get(key)?.value) {
				// 				staffControl.get(key).setValue(i[key]);
				// 				staffControl.get(key).markAsDirty();
				// 			}
				// 		});
				// 	}
			}
		}
		if (['Approved', 'Submitted'].includes(this.item.Status)) {
			this.pageConfig.canEdit = false;
		}
	}

	patchFormArray() {
		let groups = this.formGroup.controls.StaffPolBenefitEnrollmentDetails as FormArray;
		groups.clear();
		if (this.item.StaffPolBenefitEnrollmentDetails?.length > 0)
			this.item.StaffPolBenefitEnrollmentDetails.forEach((i) => {
				this.addLine(i);
				i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
			});
	}

	addLine(line) {
		let groups = this.formGroup.controls.StaffPolBenefitEnrollmentDetails as FormArray;
		let group = this.formBuilder.group({
			Id: [line.Id ?? 0],
			IDStaff: [line.IDStaff],
			IDStaffPolBenefitEnrollment: [line.IDStaffPolBenefitEnrollment ?? this.id],
			BenefitEnrollmentValue: [line.BenefitEnrollmentValue],
		});
		groups.push(group);
		this.patchBenefitEnrollmentConfig(line);
		// this.showModal(line);
	}

	removeSelectedLine() {
		let groups = <FormArray>this.formGroup.controls.StaffPolBenefitEnrollmentDetails;

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
		let groups = <FormArray>this.formGroup.controls.StaffPolBenefitEnrollmentDetails;

		if (groups.controls[index].get('Id').value) {
			this.env
				.showPrompt('Are you sure you want to delete this staff benefit?', null, 'Delete staff benefit')
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

	patchBenefitEnrollmentConfig(line) {
		line.BenefitEnrollmentConfig = {};
		let values: any = line.BenefitEnrollmentValue ? JSON.parse(line.BenefitEnrollmentValue) : [];
		values.forEach((e) => {
			let item = this.UDFList.find((d) => d.Id == e.IDUDF);
			if (item)
				if (!this.UDFUsedList.some((d) => d.Id == item.Id)) {
					this.UDFUsedList.push(item);
				}
			line.BenefitEnrollmentConfig[item.Code] = e.Value;
		});
		// this.UDFUsedList =
		// this.UDFList.forEach((e) => {
		// 	let item = values.find((d) => d.IDUDF == e.Id);
		// 	line.BenefitEnrollmentConfig[e.Code] = item.Value;
		// });
	}

	editLine(i) {
		this.showModal([i]);
	}

	editSelectedLine() {
		this.showModal(this.selectedItems);
	}

	async showModal(line) {
		if (!line) {
			const modal1 = await this.modalController.create({
				component: StaffPickerEnrollmentPage,
				backdropDismiss: false,
				cssClass: 'modal90',
				componentProps: {
					dataSource: this.polBenefitList.filter((d) => d.Id == this.formGroup.controls.IDPolBenefit.value),
				},
			});
			await modal1.present();
			const { data } = await modal1.onWillDismiss();
			if (data) line = data.StaffList;
		}
		const modal = await this.modalController.create({
			component: StaffBenefitEnrollmentDetailModalPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				IDPolBenefit: this.item.IDPolBenefit,
				UDFList: this.UDFList,
				UDFUsedList: this.UDFUsedList,
				Items: line,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let groups = this.formGroup.controls.StaffPolBenefitEnrollmentDetails as FormArray;
			data.forEach((i) => {
				let staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
				if (!staffControl) {
					this.addLine(i);
					staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
					staffControl.get('Id').markAsDirty();
					staffControl.get('IDStaff').markAsDirty();
					staffControl.get('IDStaffPolBenefitEnrollment').markAsDirty();
					staffControl.get('BenefitEnrollmentValue').markAsDirty();
				} else {
					Object.keys(i).forEach((key) => {
						if (staffControl.get(key) && i[key] != staffControl.get(key)?.value) {
							staffControl.get(key).setValue(i[key]);
							staffControl.get(key).markAsDirty();
						}
					});
				}
			});
			this.saveChange();
		}
	}

	// applyBenefitEnrollment() {
	// 	this.env.showPrompt(null, 'Do you want to approve benefit enrollment?', 'Benefit enrollment').then((_) => {
	// 		this.env
	// 			.showLoading(
	// 				'Please wait for a few moments',
	// 				this.pageProvider.commonService.connect('PUT', 'HRM/StaffPolBenefitEnrollment/ApplyBenefitEnrollment/' + parseInt(this.id), null).toPromise()
	// 			)
	// 			.then((res) => {
	// 				if (res) this.env.showMessage('Approved');
	// 			});
	// 	});
	// }

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}
	changeBenefitPolicy() {
		if (this.item.StaffPolBenefitEnrollmentDetails?.some((d) => d.BenefitEnrollmentValue)) {
			this.env
				.showPrompt(null, 'Changing the policy will delete all assigned benefit data for employees. Are you sure?', 'Benefit policy change')
				.then((_) => {
					let groups = this.formGroup.controls.StaffPolBenefitEnrollmentDetails as FormArray;
					groups.controls
						.filter((d) => d.value.BenefitEnrollmentValue)
						.forEach((control) => {
							control.get('BenefitEnrollmentValue').setValue(null);
							control.get('BenefitEnrollmentValue').markAsDirty();
						});
					this.UDFUsedList = [];
					this.saveChange();
				})
				.catch((_) => {
					this.formGroup.controls.IDPolBenefit.setValue(this.trackingIDPolBenefit);
				});
		} else {
			this.saveChange();
		}
		this.trackingIDPolBenefit = this.formGroup.controls.IDPolBenefit.value;
	}

	checkAllSelectedItems(event) {
		const isChecked = event.target.checked;
		this.selectedItems = [];
		if (isChecked) {
			this.selectedItems = [];
			this.item.StaffPolBenefitEnrollmentDetails.forEach((i) => {
				this.selectedItems.push(i);
			});
		}
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		this.selectedItems = [];
		this.item = lib.cloneObject(savedItem);
		this.item.StaffPolBenefitEnrollmentDetails = [...savedItem.StaffPolBenefitEnrollmentDetails];
		super.savedChange(savedItem);
		this.loadedData();
		this.cdr.detectChanges();
	}

	async saveChange() {
		super.saveChange2();
	}
}
