import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_PolEmployeeProvider,
	HRM_PolSalaryProvider,
	HRM_StaffPolEmployeeDecisionProvider,
	HRM_StaffProvider,
	HRM_UDFProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';
import { StaffDecisionDetailModal } from './staff-decision-detail-modal/staff-decision-detail-modal';

@Component({
	selector: 'app-staff-decision-detail',
	templateUrl: './staff-decision-detail.page.html',
	styleUrls: ['./staff-decision-detail.page.scss'],
	standalone: false,
})
export class StaffDecisionDetailPage extends PageBase {
	statusList = [];
	polSalaryList = [];
	polEmployeeList = [];
	UDFGroups = [];
	UDFList: any = []; // UDFList =[{Id :1, Code:'TenConMeo',Name:'Ten con mèo',ControlType:'text', ...},...]
	UDFListPolEmployee: any = []; // UDFList =[{IDUDF :1, IsRequired:true} ...]
	loadingUDFList = false;
	trackingPolEmplyee;
	HRMEffectiveTimeTypeList = [];
	constructor(
		public pageProvider: HRM_StaffPolEmployeeDecisionProvider,
		public polEmployeeProvider: HRM_PolEmployeeProvider,
		public UDFProvider: HRM_UDFProvider,
		public staffProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public polSalaryProvider: HRM_PolSalaryProvider,
		public modalController: ModalController,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public router: Router
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [this.env.selectedBranch],
			IDSignedBy: [''],
			IDPolEmployee: ['', Validators.required],
			IDRequester: [this.env.user.StaffID, Validators.required],
			IDPolSalary: ['', Validators.required],
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
			Status: new FormControl({ value: 'Draft', disabled: true }),
			ConsultedPerson: [''],
			IsConcurrentPosition: [false],
			DecisionSignDate: [''],
			DecisionEffectiveDate: [''],
			ProbationPeriod: [''],
			ApplyType: ['', Validators.required],
			StaffPolEmployeeDecisionDetails: this.formBuilder.array([]),
			DeletedPolEmployeeDecisionDetails: [[]],
		});
	}

	preLoadData(event?: any): void {
		Promise.all([
			this.env.getStatus('StandardApprovalStatus'),
			this.polSalaryProvider.read(),
			this.polEmployeeProvider.read(),
			this.env.getType('UDFGroupsType', true),
			this.env.getType('HRMEffectiveTimeType'),
		]).then((res: any) => {
			this.statusList = res[0];
			this.polSalaryList = res[1].data;
			this.polEmployeeList = res[2].data;
			this.UDFGroups = res[3];
			this.HRMEffectiveTimeTypeList = res[4];
			super.preLoadData(event);
		});
		this.route.queryParams.subscribe(() => {
			const navigation = this.router.getCurrentNavigation();
			if (navigation?.extras?.state?.StaffList) {
				// this.initStaffPolBenefitEnrollmentDetails = navigation.extras.state.StaffList;
				// this.initPolBenefit = navigation.extras.state.IDPol;
			}
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.selectedItems = [];
		this.patchStaffPolEmployeeDecisionDetails();

		if (this.item.IDPolEmployee) {
			this.loadingUDFList = true;
			this.trackingPolEmplyee = this.item.IDPolEmployee;
			this.getPolEmployeeUDFList(this.item.IDPolEmployee).finally(() => {
				this.patchEmployeePolicyConfig();
				super.loadedData(event, ignoredFromGroup);
			});
			this.polEmployeeProvider
				.getAnItem(this.item.IDPolEmployee)
				.then((rs: any) => {
					if (rs && rs.UDFList) {
						let jsParse = JSON.parse(rs.UDFList);
						if (jsParse && jsParse.length > 0) {
							this.UDFListPolEmployee = jsParse;
							let ids = jsParse.map((i) => i.IDUDF);
							if (ids.length > 0) {
								this.UDFProvider.read({ Id: ids }).then((u: any) => {
									this.UDFList = u.data;
									this.patchEmployeePolicyConfig();
									super.loadedData(event, ignoredFromGroup);
								});
							} else {
								this.patchEmployeePolicyConfig();
								super.loadedData(event, ignoredFromGroup);
							}
						}
					}
				})
				.catch((err) => {
					this.patchEmployeePolicyConfig();
					super.loadedData(event, ignoredFromGroup);
				});
		} else super.loadedData(event, ignoredFromGroup);
		if (!this.item.Id) {
			this.formGroup.controls.IDRequester.setValue(this.env.user.StaffID);
			this.formGroup.controls.IDRequester.markAsDirty();
			this.formGroup.controls.Status.markAsDirty();
		}
		if (['Approved', 'Submitted'].includes(this.item.Status)) {
			this.pageConfig.canEdit = false;
		}
	}

	patchStaffPolEmployeeDecisionDetails() {
		let groups = this.formGroup.controls.StaffPolEmployeeDecisionDetails as FormArray;
		groups.clear();
		if (this.item?.StaffPolEmployeeDecisionDetails?.length > 0) {
			this.item.StaffPolEmployeeDecisionDetails.forEach((i) => {
				this.addStaffPolEmployeeDecisionDetail(i);
			});
		}
	}

	addStaffPolEmployeeDecisionDetail(field, openModal = false) {
		let groups = this.formGroup.controls.StaffPolEmployeeDecisionDetails as FormArray;
		let group = this.formBuilder.group({
			Id: [field?.Id],
			IDStaff: [field?.IDStaff],
			StaffName: [field?._Staff?.Name],
			StaffCode: [field?._Staff?.Code],
			IDStaffPolEmployeeDecision: [field?.IDStaffPolEmployeeDecision],
			IDDepartment: [field?.IDDepartment],
			DepartmentName: [field?.Department?.Name],
			IDJobTitle: [field?.IDJobTitle],
			JobTitleName: [field?.JobTitle?.Name],
			IsConcurrentPosition: new FormControl({ value: field?.IsConcurrentPosition, disabled: true }),
			DecisionValue: [field?.DecisionValue],
			//EmployeePolicyConfig: this.formBuilder.group({}),
		});
		groups.push(group);
		field.EmployeePolicyConfig = {};
		this.addEmployeePolicyConfig(field);
		if (openModal) this.showModal(group);
	}

	patchEmployeePolicyConfig() {
		this.item.StaffPolEmployeeDecisionDetails.forEach((i) => {
			this.addEmployeePolicyConfig(i);
		});
	}

	addEmployeePolicyConfig(field) {
		field.EmployeePolicyConfig = {};
		let values = field.DecisionValue ? JSON.parse(field.DecisionValue) : [];
		this.UDFList.forEach((d) => {
			let value = values?.find((j) => j.IDUDF == d.Id);
			field.EmployeePolicyConfig[d.Code] = value?.Value;
		});
	}

	changePolEmployee() {
		if (this.item.StaffPolEmployeeDecisionDetails.some((d) => d.DecisionValue)) {
			this.env
				.showPrompt('Change employee policy can lost data, do you sure to change?', null, 'Warning!')
				.then(() => {
					let groups = this.formGroup.controls.StaffPolEmployeeDecisionDetails as FormArray;
					groups.controls
						.filter((d) => d.value.DecisionValue)
						.forEach((g) => {
							g.get('DecisionValue').setValue(null);
							g.get('DecisionValue').markAsDirty();
						});
					this.saveChange2()
						.then((savedItem) => {
							this.item = savedItem;
							this.loadedData();
						})
						.catch((err) => this.refresh());
				})
				.catch(() => {
					this.formGroup.get('IDPolEmployee').setValue(this.trackingPolEmplyee);
					this.formGroup.get('IDPolEmployee').markAsPristine();
				});
		} else {
			this.saveChange2()
				.then((savedItem) => {
					this.item = savedItem;
					this.loadedData();
				})
				.catch((err) => this.refresh());
		}
	}
	getPolEmployeeUDFList(IDPolEmployee) {
		return new Promise(async (resolve, reject) => {
			if (IDPolEmployee) {
				this.loadingUDFList = true;
				await this.polEmployeeProvider
					.getAnItem(IDPolEmployee)
					.then((rs: any) => {
						if (rs.UDFList) {
							let jsParse = JSON.parse(rs.UDFList);
							if (jsParse && jsParse.length > 0) {
								this.UDFListPolEmployee = jsParse;
								let ids = jsParse.map((i) => i.IDUDF);
								this.UDFProvider.read({ Id: ids })
									.then((u: any) => {
										this.UDFList = u.data;
									})
									.finally(() => (this.loadingUDFList = false));
							}
						} else {
							this.UDFListPolEmployee = [];
							this.UDFList = [];
							this.loadingUDFList = false;
						}
					})
					.catch((err) => (this.loadingUDFList = false));
			}
			resolve(true);
		});
	}

	async showModal(i = null) {
		const modal = await this.modalController.create({
			component: StaffDecisionDetailModal,
			componentProps: {
				UDFList: this.UDFList,
				UDFListPolEmployee: this.UDFListPolEmployee,
				staffList: this.selectedItems.length > 0 ? this.selectedItems.map((s) => s._Staff) : i?._Staff ? [i._Staff] : [],
				UDFGroups: this.UDFGroups,
				id: i?.Id,
				item: i ? i : this.selectedItems.length > 0 ? this.selectedItems[0] : null,
			},
			cssClass: 'modal90',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) {
			console.log(data);
			if (data.StaffList) {
				let groups = this.formGroup.controls.StaffPolEmployeeDecisionDetails as FormArray;
				data.StaffList.forEach((i) => {
					let staffControl = groups.controls.find((d) => d.get('IDStaff').value == i);
					if (!staffControl) {
						data.IDStaff = i;
						this.addStaffPolEmployeeDecisionDetail({ ...data, Id: 0 });
						staffControl = groups.controls.find((d) => d.get('IDStaff').value == i);
						staffControl.get('IDStaff').markAsDirty();
						if (data.IDDepartment) staffControl.get('IDDepartment').markAsDirty();
						if (data.IDJobTitle) staffControl.get('IDJobTitle').markAsDirty();
						if (data.DecisionValue) staffControl.get('DecisionValue').markAsDirty();
					} else {
						Object.keys(data)
							.filter((d) => d != 'StaffList' && d != 'Id')
							.forEach((key) => {
								if (staffControl.get(key) && data[key] != staffControl.get(key)?.value) {
									staffControl.get(key).setValue(data[key]);
									staffControl.get(key).markAsDirty();
								}
							});
					}
				});
			}
			this.saveChange2().then((savedItem) => {
				this.item = savedItem;
				this.loadedData();
			});
		}
	}

	checkAllSelectedItems(event) {
		const isChecked = event.target.checked;
		this.selectedItems = [];
		if (isChecked) {
			this.selectedItems = [];
			this.item.StaffPolEmployeeDecisionDetails.forEach((i) => {
				this.selectedItems.push(i);
			});
		}
	}
	removeStaffPolEmployeeDecisionDetail(i) {
		this.env.showPrompt('Are you sure you want to delete selected employee decisions?', null, 'Delete').then((_) => {
			this.formGroup.get('DeletedPolEmployeeDecisionDetails').setValue([i.Id]);
			this.formGroup.get('DeletedPolEmployeeDecisionDetails').markAsDirty();
			this.saveChange2().then((savedItem) => {
				this.item = savedItem;
				this.loadedData();
			});
		});
	}

	removeAllStaffPolEmployeeDecisionDetail() {
		this.env.showPrompt('Are you sure you want to delete all selected employee decisions?', null, 'Delete').then((_) => {
			this.formGroup.get('DeletedPolEmployeeDecisionDetails').setValue(this.selectedItems.map((s) => s.Id));
			this.formGroup.get('DeletedPolEmployeeDecisionDetails').markAsDirty();
			this.saveChange2().then((savedItem) => {
				this.item = savedItem;
				this.loadedData();
			});
		});
	}

	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}

	async saveChange() {
		super.saveChange2();
	}
	// approve(){
	// 	this.env.showPrompt('Do you want to apply this decision?').then(()=>{
	// 		this.pageProvider.commonService.connect('POST', 'HRM/StaffPolEmployeeDecision/ApplyDecision/',{Ids:[this.item.Id]} )
	// 		.toPromise()
	// 		.then(() => {
	// 			this.refresh();
	// 			this.env.showMessage('Apply decision successfully!','success');
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);
	// 		});
	// 	})

	// }
}
