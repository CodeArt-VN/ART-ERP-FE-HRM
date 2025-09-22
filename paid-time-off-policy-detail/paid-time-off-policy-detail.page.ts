import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
	BRA_BranchProvider,
	HRM_LeaveTypeProvider,
	HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
	HRM_PolicyPaidTimeOffProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-paid-time-off-policy-detail',
	templateUrl: './paid-time-off-policy-detail.page.html',
	styleUrls: ['./paid-time-off-policy-detail.page.scss'],
	standalone: false,
})
export class PaidTimeOffPolicyDetailPage extends PageBase {
	TypeList = [];
	ConfigRunMonthlyMethodList = [];
	leaveTypeList = [];

	dayList = Array.from({ length: 31 }, (_, i) => ({
		Code: i + 1,
		Name: (i + 1).toString(),
	}));

	monthList = Array.from({ length: 12 }, (_, i) => ({
		Code: i + 1,
		Name: (i + 1).toString(),
	}));

	configRunMonthlyMethodList = [
		{ Code: 'StandardLeave', Name: 'Standard Leave', Description: '📝 Ghi chú: Mỗi tháng cộng 1/12 tổng số ngày phép năm' },
		{
			Code: 'DirectAccrual',
			Name: '+1 Leave Day per Month (Direct Accrual)',
			Description: '📝 Ghi chú: Mỗi tháng cộng thêm 1 ngày phép. Số dư hiện tại sẽ cộng vào tháng được chọn.',
		},
		{
			Code: 'ProratedAccrual',
			Name: '+1 Leave Day per Month (Prorated Accrual)',
			Description: '📝 Ghi chú: Mỗi tháng cộng thêm 1 ngày phép. Số dư còn lại sẽ được chia đều theo 12 tháng làm việc.',
		},
	];

	_description = '';

	constructor(
		public pageProvider: HRM_PolicyPaidTimeOffProvider,
		public ptoGrandByLengthOfServices: HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
		public leaveTypeProvider: HRM_LeaveTypeProvider,
		public branchProvider: BRA_BranchProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			IDBranch: [env.selectedBranch],
			IDLeaveType: ['', Validators.required],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],

			Remark: [''],
			Type: ['', Validators.required],
			NumberOfDays: ['', Validators.required],
			NumberOfCarryOnDays: ['', Validators.required],

			IsGrantsByLengthOfServices: [false],
			CarryOverExpireMonths: [''],

			ConfigRunOnMonth: [''],
			ConfigRunOnDay: [''],
			ConfigRunMonthlyMethod: [''],
			ConfigRunMonthlySelectedMonth: [''],
			Lines: this.formBuilder.array([]),
		});
	}

	preLoadData(event?: any): void {
		Promise.all([this.env.getType('PaidTimeOffPolicy'), this.leaveTypeProvider.read()]).then((values: any) => {
			this.TypeList = values[0];
			console.log('typelist: ', this.TypeList);

			this.leaveTypeList = values[1]['data'];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		this.setLines();
		super.loadedData(event);

		if (this.item?.Id) {
			if (this.formGroup.controls.ConfigRunMonthlyMethod.value) {
				this._description = this.configRunMonthlyMethodList.find((d) => d.Code == this.formGroup.controls.ConfigRunMonthlyMethod.value).Description;
			}
		}
	}

	setLines() {
		this.formGroup.controls.Lines = new FormArray([]);
		if (this.item?.Lines?.length)
			this.item.Lines.forEach((i) => {
				this.addLine(i);
			});
	}

	addLine(line) {
		let groups = <FormArray>this.formGroup.controls.Lines;
		let group = this.formBuilder.group({
			IDPTO: [line.IDPTO],
			Id: [line.Id],
			MonthsOfServices: [line.MonthsOfServices, Validators.required],
			DaysGranted: [line.DaysGranted, Validators.required],
			Sort: [line.Sort],
		});

		groups.push(group);

		if (!line.Id) {
			group.controls.IDPTO.markAsDirty();
			group.controls.MonthsOfServices.markAsDirty();
			group.controls.DaysGranted.markAsDirty();
		}
	}

	removeLine(index, permanentlyRemove = true) {
		this.alertCtrl
			.create({
				header: 'Xóa chính sách thưởng phép',
				//subHeader: '---',
				message: 'Bạn có chắc muốn xóa thiết lập này?',
				buttons: [
					{
						text: 'Không',
						role: 'cancel',
					},
					{
						text: 'Đồng ý xóa',
						cssClass: 'danger-btn',
						handler: () => {
							let groups = <FormArray>this.formGroup.controls.Lines;
							let Ids = [];
							Ids.push({
								Id: groups.controls[index]['controls'].Id.value,
							});

							if (permanentlyRemove) {
								this.ptoGrandByLengthOfServices.delete(Ids).then((resp) => {
									groups.removeAt(index);
									this.env.showMessage('Deleted!', 'success');
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

	doReorder(ev, groups) {
		groups = ev.detail.complete(groups);
		for (let i = 0; i < groups.length; i++) {
			const g = groups[i];
			g.controls.Sort.setValue(i + 1);
			g.controls.Sort.markAsDirty();
		}

		this.saveChange();
	}

	monthlyMethodChange() {
		this._description = this.configRunMonthlyMethodList.find((d) => d.Code == this.formGroup.get('ConfigRunMonthlyMethod').value).Description;
		if (this.formGroup.get('ConfigRunMonthlyMethod').value == 'DirectAccrual') {
			this.formGroup.get('ConfigRunMonthlySelectedMonth').setValidators([Validators.required]);
			this.formGroup.get('ConfigRunMonthlySelectedMonth').updateValueAndValidity();
		} else {
			this.formGroup.get('ConfigRunMonthlySelectedMonth').setValidators([]);
			this.formGroup.get('ConfigRunMonthlySelectedMonth').updateValueAndValidity();
		}
		this.saveChange();
	}

	calculationLeave(type) {
		if (type == 'monthly') {
			this.env
				.showLoading(
					'Generate monthly leave ...',
					this.pageProvider.commonService.connect('POST', 'HRM/PolicyPaidTimeOff/GenerateMonthlyLeave', { Id: this.id }).toPromise()
				)
				.then((_) => {
					this.env.showMessage('Generated success','success');
				});
		} else {
			this.env
				.showLoading(
					'Generate annual leave ...',
					this.pageProvider.commonService.connect('POST', 'HRM/PolicyPaidTimeOff/GenerateAnnualLeave', { Id: this.id }).toPromise()
				)
				.then((_) => {
					this.env.showMessage('Generated success','success');
				});
		}
	}

	async saveChange() {
		super.saveChange2();
	}
}
