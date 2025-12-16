import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, PopoverController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	CRM_ContactProvider,
	HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
	HRM_StaffAgreementProvider,
	HRM_StaffProvider,
	HRM_UDFProvider,
	SYS_ConfigProvider,
	WMS_ItemProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';

@Component({
	selector: 'app-staff-agreement-detail',
	templateUrl: './staff-agreement-detail.page.html',
	styleUrls: ['./staff-agreement-detail.page.scss'],
	standalone: false,
})
export class StaffAgreementDetailPage extends PageBase {
	statusList = [];
	typeList = [
		{ Code: 'Benefit', Name: 'Benefit', disable: true },
		{ Code: 'Insurance', Name: 'Insurance' },
	];
	_hrmInsuranceType = [];
	calculationMethodTypeList = [];
	changeTypeList = [
		{ Code: 'Increase', Name: 'Increase' },
		{ Code: 'Decrease', Name: 'Decrease' },
		{ Code: 'Override', Name: 'Override' },
	];
	_staffDataSource = this.buildSelectDataSource((term) => {
		return this.staffProvider.search({ Take: 20, Skip: 0, Keyword: term });
	});
	UDFList = [];

	constructor(
		public pageProvider: HRM_StaffAgreementProvider,
		public udfProvider: HRM_UDFProvider,
		public contactProvider: CRM_ContactProvider,
		public branchProvider: BRA_BranchProvider,
		public itemProvider: WMS_ItemProvider,
		public sysConfigProvider: SYS_ConfigProvider,
		public popoverCtrl: PopoverController,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService,
		public staffProvider: HRM_StaffProvider
	) {
		super();
		this.buildFormGroup();
		this.pageConfig.isDetailPage = true;
	}
	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			IDStaff: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: [''],
			Remark: [''],
			Sort: [''],
			Status: new FormControl({ value: 'Draft', disabled: true }, Validators.required),
			EffectiveFrom: ['', Validators.required],
			EffectiveTo: ['', Validators.required],
			IsDisabled: new FormControl({ value: '', disabled: true }),
			IsDeleted: new FormControl({ value: '', disabled: true }),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			Lines: this.formBuilder.array([]),
			DeletedLines: [''],
		});
	}
	preLoadData(event) {
		Promise.all([this.env.getStatus('PurchaseRequest'), this.env.getType('HRMInsuranceType'), this.env.getType('CalculationMethodType')]).then((values: any) => {
			if (values[0]) this.statusList = values[0];
			this._hrmInsuranceType = values[1];
			this.calculationMethodTypeList = values[2];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.buildFormGroup();

		super.loadedData(event);

		if (this.item._Staff) {
			this._staffDataSource.selected.push(lib.cloneObject(this.item._Staff));
		}

		if (!this.item.Id) {
			this.formGroup.get('Status').markAsDirty();
		}
		this._staffDataSource.initSearch();
		this.setLines();
		if (this.item?.Status != 'Draft') this.formGroup.disable();
	}

	removeItem(Ids) {
		let groups = <FormArray>this.formGroup.controls.Lines;
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
	}

	setLines() {
		this.formGroup.controls.Lines = new FormArray([]);
		if (this.item?.Lines?.length) {
			this.item?.Lines.forEach((i) => {
				this.addItemLine(i);
			});
		}
	}

	addItemLine(line) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			Id: [line?.Id],
			AgreementID: [line ? line.AgreementID : this.id],
			Name: [line?.Name],
			Code: [line?.Code],
			Type: [line?.Type],
			SubType: [line?.SubType],
			ChangeType: [line?.ChangeType, Validators.required],
			OldValue: [line?.OldValue ?? 0],
			NewValue: [line?.NewValue ?? 0],
			CoOldValue: [line?.CoOldValue ?? 0],
			CoNewValue: [line?.CoNewValue ?? 0],
			CalculationType: [line?.CalculationType, Validators.required],
		});
		groups.push(group);
	}

	changeDate() {
		if (this.submitAttempt) return;
		this.submitAttempt = true;

		const effectiveFrom = this.formGroup.controls.EffectiveFrom.value;
		const effectiveTo = this.formGroup.controls.EffectiveTo.value;
		const from = new Date(effectiveFrom);
		const to = new Date(effectiveTo);

		if (to < from) {
			this.env.showMessage('Please select a future date', 'warning');
			this.formGroup.controls.EffectiveFrom.setValue(this.item.EffectiveFrom);
			this.formGroup.controls.EffectiveTo.setValue(this.item.EffectiveTo);
			this.formGroup.controls.EffectiveFrom.markAsPristine();
			this.formGroup.controls.EffectiveTo.markAsPristine();
			this.submitAttempt = false;
		} else {
			this.submitAttempt = false;
			this.saveChange();
		}
	}

	async saveChange() {
		return super.saveChange2();
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

	typeChange(g: any) {
		switch (g.controls.Type.value) {
			case 'Insurance':
				g.controls.SubType.setValidators(Validators.required);
				g.controls.SubType.updateValueAndValidity();
				if (g.controls.Code.value) {
					g.controls.Code.setValue(null);
					g.controls.Code.markAsDirty();
					g.controls.Code.setValidators([]);
					g.controls.Code.updateValueAndValidity();
				}
				break;

			case 'Benefit':
				g.controls.SubType.setValidators([]);
				g.controls.SubType.updateValueAndValidity();
				g.controls.Code.setValidators(Validators.required);
				g.controls.Code.updateValueAndValidity();
				if (g.controls.SubType.value) {
					g.controls.SubType.setValue(null);
					g.controls.SubType.markAsDirty();
				}
				if (g.controls.CoNewValue.value > 0) {
					g.controls.CoNewValue.setValue(0);
					g.controls.CoNewValue.markAsDirty();
				}
				this.udfProvider.read({ Group: 'Benefits' }).then((value: any) => {
					this.UDFList = value.data;
				});
				break;
		}
	}

	submit(): void {
		let text = 'Gửi Duyệt';
		let message = 'Sau khi gửi duyệt, bạn không thể chỉnh sửa đối tượng được nữa. Bạn có chắc muốn gửi duyệt tất cả đối tượng chưa duyệt?';
		this.changeStatus(text, message, 'Submitted');
	}

	approve(): void {
		let text = 'Duyệt';
		let message = 'Bạn có chắc chắn duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Approved');
	}

	disapprove(): void {
		let text = 'Không Duyệt';
		let message = 'Bạn có chắc chắn không duyệt các đối tượng này?';
		this.changeStatus(text, message, 'Disapproved');
	}

	cancel(): void {
		let text = 'Huỷ';
		let message = 'Bạn có chắc chắn huỷ các đối tượng này?';
		this.changeStatus(text, message, 'Rejected');
	}

	changeStatus(text, message, Status) {
		this.alertCtrl
			.create({
				header: text,
				//subHeader: '---',
				message: message,
				buttons: [
					{
						text: 'Hủy',
						role: 'cancel',
						handler: () => {
							//console.log('Không xóa');
						},
					},
					{
						text: 'Xác nhận',
						cssClass: 'danger-btn',
						handler: () => {
							let publishEventCode = this.pageConfig.pageName;
							let apiPath = {
								method: 'POST',
								url: function () {
									return ApiSetting.apiDomain('HRM/StaffAgreement/ChangeStatus/');
								},
							};

							if (this.submitAttempt == false) {
								this.submitAttempt = true;
								let postDTO = {
									Ids: [this.id],
									Status: Status,
								};
								this.pageProvider.commonService
									.connect(apiPath.method, apiPath.url(), postDTO)
									.toPromise()
									.then((savedItem: any) => {
										if (publishEventCode) {
											this.env.publishEvent({
												Code: publishEventCode,
											});
										}
										this.env.showMessage('Saving completed!', 'success');
										this.submitAttempt = false;
										this.refresh(null);
									})
									.catch((err) => {
										this.submitAttempt = false;
										//console.log(err);
									});
							}
						},
					},
				],
			})
			.then((alert) => {
				alert.present();
			});
	}
}
