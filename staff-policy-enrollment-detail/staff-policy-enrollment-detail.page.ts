import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_StaffEnrollmentProvider,
	HRM_PolBenefitProvider,
	HRM_PolInsuranceProvider,
	HRM_PolEmployeeProvider,
	HRM_PolicyPaidTimeOffProvider,
	HRM_StaffProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { environment } from 'src/environments/environment';
import { StaffPickerEnrollmentPage } from '../staff-picker-enrollment/staff-picker-enrollment.page';
import { StaffPolicyEnrollmentDetailModalPage } from './staff-policy-enrollment-detail-modal/staff-policy-enrollment-detail-modal.page';

@Component({
	selector: 'app-staff-policy-enrollment-detail',
	templateUrl: './staff-policy-enrollment-detail.page.html',
	styleUrls: ['./staff-policy-enrollment-detail.page.scss'],
	standalone: false,
})
export class StaffPolicyEnrollmentDetailPage extends PageBase {
	statusList = [];
	HRMEffectiveTimeTypeList = [];
	polEnrollmentType = [];
	initStaffPolicyEnrollmentDetails = [];
	initTypePolEnrollment;
	initIdPolEnrollment;
	constructor(
		public pageProvider: HRM_StaffEnrollmentProvider,
		public polBenefitProvider: HRM_PolBenefitProvider,
		public polInsuranceProvider: HRM_PolInsuranceProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
		public polPaidTimeOffProvider: HRM_PolicyPaidTimeOffProvider,
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
			PolicyId: ['', Validators.required],
			PolicyType: ['', Validators.required],
			IDRequester: [''],
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
			Status: ['Draft', Validators.required],
			EnrollmentSignDate: ['', Validators.required],
			EnrollmentEffectiveDate: ['', Validators.required],
			ApplyType: ['', Validators.required],
			ConsultedPerson: [''],
			ProbationPeriod: [''],
			StaffPolicyEnrollmentDetails: this.formBuilder.array([]),
			DeletedLines: [],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.env.getType('HRMEffectiveTimeType')]).then((values: any) => {
			this.statusList = values[0];
			this.HRMEffectiveTimeTypeList = values[1];
		});

		this.route.queryParams.subscribe(() => {
			const navigation = this.router.getCurrentNavigation();

			if (navigation?.extras?.state?.StaffList) this.initStaffPolicyEnrollmentDetails = navigation.extras.state.StaffList;
			if (navigation?.extras?.state?.PolicyId) this.initIdPolEnrollment = navigation.extras.state.PolicyId;
			if (navigation?.extras?.state?.PolicyType) this.initTypePolEnrollment = navigation.extras.state.PolicyType;
			if (!this.initTypePolEnrollment) {
				Promise.all([this.polBenefitProvider.read(), this.polInsuranceProvider.read(), this.polEmployeeProvider.read(), this.polPaidTimeOffProvider.read()]).then(
					(results: any[]) => {
						let fakeId = 1;
						const allData = [
							...results[0].data.map((item) => ({ ...item, Type: 'PolBenefit', FakeId: fakeId++ })),
							...results[1].data.map((item) => ({ ...item, Type: 'PolInsurance', FakeId: fakeId++ })),
							...results[2].data.map((item) => ({ ...item, Type: 'PolEmployee', FakeId: fakeId++ })),
							...results[3].data.map((item) => ({ ...item, Type: 'PolPaidTimeOff', FakeId: fakeId++ })),
						];
						this.polEnrollmentType = allData;
						super.preLoadData(event);
					}
				);
			} else {
				this.getPolEnrollmentProvider()
					.read()
					.then((res: any) => {
						this.polEnrollmentType = res.data.map((item) => ({ ...item, Type: this.initTypePolEnrollment }));
						super.preLoadData(event);
					});
			}
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		if (this.item.Id == 0) if (this.initStaffPolicyEnrollmentDetails) this.item.StaffPolicyEnrollmentDetails = this.initStaffPolicyEnrollmentDetails;
		super.loadedData(event, ignoredFromGroup);
		this.patchFormArray();
		if (this.item?.Id == 0) {
			this.formGroup.controls.Status.markAsDirty();
			this.formGroup.controls.IDBranch.markAsDirty();
			if (this.initIdPolEnrollment) {
				this.formGroup.controls.PolicyId.setValue(parseInt(this.initIdPolEnrollment));
				this.formGroup.controls.PolicyId.markAsDirty();
			}
			if (this.initTypePolEnrollment) {
				this.formGroup.controls.PolicyType.setValue(this.initTypePolEnrollment);
				this.formGroup.controls.PolicyType.markAsDirty();
			}
			if (this.item.StaffPolicyEnrollmentDetails) {
				let groups = this.formGroup.controls.StaffPolicyEnrollmentDetails as FormArray;
				groups.controls.forEach((control: any) => {
					Object.keys(control.controls).forEach((key) => {
						control.get(key).markAsDirty();
					});
				});
			}
		}
		if (!this.item._StaffRequester) {
			this.formGroup.controls.IDRequester.setValue(this.env.user.StaffID);
			this.requesterDataSource.selected.push({ FullName: this.env.user.FullName, Id: this.env.user.StaffID });
			this.formGroup.controls.IDRequester.markAsDirty();
		}
		if (this.id && this.item._StaffRequester) {
			if (!this.requesterDataSource.selected.some((d) => d.Id == this.item._StaffRequester.Id)) this.requesterDataSource.selected.push(this.item._StaffRequester);
		}
		this.requesterDataSource.initSearch();

		if (this.id && this.item._StaffSignedBy) {
			if (!this.signedByDataSource.selected.some((d) => d.Id == this.item._StaffSignedBy.Id)) this.signedByDataSource.selected.push(this.item._StaffSignedBy);
		}
		this.signedByDataSource.initSearch();
		if (!this.initTypePolEnrollment) this.setSelectedPolicyEnrollment();
	}

	patchFormArray() {
		let groups = this.formGroup.controls.StaffPolicyEnrollmentDetails as FormArray;
		groups.clear();
		if (this.item.StaffPolicyEnrollmentDetails?.length > 0)
			this.item.StaffPolicyEnrollmentDetails.forEach((i) => {
				this.addLine(i);
				if (i._Staff) {
					i._Staff.Avatar = i._Staff.Code ? environment.staffAvatarsServer + i._Staff.Code + '.jpg' : 'assets/avartar-empty.jpg';
					i._Staff.Email = i._Staff.Email ? i._Staff.Email.replace(environment.loginEmail, '') : '';
				}
			});
	}

	addLine(line) {
		let groups = this.formGroup.controls.StaffPolicyEnrollmentDetails as FormArray;
		let group = this.formBuilder.group({
			Id: [line.Id ?? 0],
			IDEnrollment: [this.formGroup.controls.Id.value],
			IDStaff: [line.IDStaff, Validators.required],
			Code: [line.Code ?? ''],
			Name: [line.Name ?? ''],
			Remark: [line.Remark ?? ''],
		});
		groups.push(group);
	}

	removeSelectedLine() {
		let groups = <FormArray>this.formGroup.controls.StaffPolicyEnrollmentDetails;

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
		let groups = <FormArray>this.formGroup.controls.StaffPolicyEnrollmentDetails;
		if (groups.controls[index].get('Id').value) {
			this.env
				.showPrompt('Are you sure you want to delete this staff?', null, 'Delete staff')
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

	requesterDataSource = this.buildSelectDataSource((term) => {
		const staffId = this.formGroup.get('IDRequester')?.value;
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Term: term,
			Id_ne: staffId ? staffId : null,
		});
	});

	signedByDataSource = this.buildSelectDataSource((term) => {
		const staffId = this.formGroup.get('IDSignedBy')?.value;
		return this.staffProvider.search({
			Take: 20,
			Skip: 0,
			IDDepartment: this.env.selectedBranchAndChildren,
			Term: term,
			Id_ne: staffId ? staffId : null,
		});
	});

	onPolicyIdChange(e: any) {
		if (!this.initTypePolEnrollment) {
			this.formGroup.controls.PolicyId.setValue(e.Id);
			this.formGroup.controls.PolicyId.markAsDirty();
			this.formGroup.controls.PolicyType.setValue(e.Type);
			this.formGroup.controls.PolicyType.markAsDirty();
		} else {
			this.formGroup.controls.PolicyId.setValue(e.Id);
			this.formGroup.controls.PolicyId.markAsDirty();
		}
		this.saveChange();
	}

	private setSelectedPolicyEnrollment() {
		const selected = this.polEnrollmentType.find((item) => item.Id === this.formGroup.controls.PolicyId.value && item.Type === this.formGroup.controls.PolicyType.value);
		if (selected) {
			this.formGroup.controls.PolicyId.setValue(selected.FakeId);
		}
	}

	private getPolEnrollmentProvider() {
		switch (this.initTypePolEnrollment) {
			case 'PolBenefit':
				return this.polBenefitProvider;
			case 'PolInsurance':
				return this.polInsuranceProvider;
			case 'PolEmployee':
				return this.polEmployeeProvider;
			case 'PolPaidTimeOff':
				return this.polPaidTimeOffProvider;
			default:
				return this.polPaidTimeOffProvider;
		}
	}
	requesterChange(e) {
		if (e) {
			this.formGroup.controls.IDRequester.setValue(e.Id);
			this.formGroup.controls.IDRequester.markAsDirty();
			this.saveChange();
		}
	}
	signedByChange(e) {
		if (e) {
			this.formGroup.controls.IDSignedBy.setValue(e.Id);
			this.formGroup.controls.IDSignedBy.markAsDirty();
			this.saveChange();
		}
	}

	validateEnrollmentDates(changedField) {
		const signDate = this.formGroup.controls.EnrollmentSignDate.value;
		const effectiveDate = this.formGroup.controls.EnrollmentEffectiveDate.value;
		const sign = new Date(signDate);
		const effective = new Date(effectiveDate);
		if (!signDate || !effectiveDate) return;
		if (effective < sign) {
			this.env.showMessage('The sign date must be on or before the effective date!', 'warning');
			if (changedField === 'EnrollmentSignDate') {
				this.formGroup.controls.EnrollmentSignDate.setValue(this.item.EnrollmentSignDate ?? '');
				this.formGroup.controls.EnrollmentSignDate.markAsPristine();
			} else if (changedField === 'EnrollmentEffectiveDate') {
				this.formGroup.controls.EnrollmentEffectiveDate.setValue(this.item.EnrollmentEffectiveDate ?? '');
				this.formGroup.controls.EnrollmentEffectiveDate.markAsPristine();
			}
			return;
		}
		this.saveChange();
	}

	editSelectedLine() {
		this.showModal(this.selectedItems);
	}
	editLine(i) {
		this.showModal([i]);
	}
	async showModal(i) {
		if (!i) {
			const modal1 = await this.modalController.create({
				component: StaffPickerEnrollmentPage,
				backdropDismiss: false,
				cssClass: 'modal90',
				componentProps: {
					dataSource: this.polEnrollmentType.filter((d) => d.Id == this.formGroup.controls.PolicyId.value),
				},
			});
			await modal1.present();
			const { data } = await modal1.onWillDismiss();
			// if (data) i = data.StaffList;
			if (!data || !data.StaffList || data.StaffList.length === 0) {
				return;
			}
			i = data.StaffList;
		}
		const modal = await this.modalController.create({
			component: StaffPolicyEnrollmentDetailModalPage,
			backdropDismiss: false,
			cssClass: 'modal90',
			componentProps: {
				Items: i,
				IDEnrollment: this.formGroup.controls.Id.value,
			},
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			let groups = this.formGroup.controls.StaffPolicyEnrollmentDetails as FormArray;
			data.forEach((i) => {
				let staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
				if (!staffControl) {
					this.addLine(i);
					staffControl = groups.controls.find((d) => d.get('IDStaff').value == i.IDStaff);
					staffControl.get('Id').markAsDirty();
					staffControl.get('IDStaff').markAsDirty();
					staffControl.get('IDEnrollment').markAsDirty();
					staffControl.get('Remark').markAsDirty();
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
			this.selectedItems = [];
			this.saveChange();
		}
	}

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		this.item = savedItem;
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
