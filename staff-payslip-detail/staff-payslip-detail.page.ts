import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_StaffRecordPayrollProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-staff-payslip-detail',
	templateUrl: './staff-payslip-detail.page.html',
	styleUrls: ['./staff-payslip-detail.page.scss'],
	standalone: false,
})
export class StaffPayslipDetailPage extends PageBase {
	UDFList: any = [];

	constructor(
		public pageProvider: HRM_StaffRecordPayrollProvider,
		public UDFProvider: HRM_UDFProvider,
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

		// this.formGroup = formBuilder.group({
		// 	IDBranch: [this.env.selectedBranch],
		// 	IDTimesheetCycle: ['', Validators.required],
		// 	IDTimesheetCycle: ['', Validators.required],
		// 	IDTimesheetCycle: ['', Validators.required],
		// 	Id: new FormControl({ value: '', disabled: true }),
		// 	Code: [''],
		// 	Name: ['', Validators.required],
		// 	Remark: [''],
		// 	Sort: [''],

		// 	IsDisabled: new FormControl({ value: '', disabled: true }),
		// 	IsDeleted: new FormControl({ value: '', disabled: true }),
		// 	CreatedBy: new FormControl({ value: '', disabled: true }),
		// 	CreatedDate: new FormControl({ value: '', disabled: true }),
		// 	ModifiedBy: new FormControl({ value: '', disabled: true }),
		// 	ModifiedDate: new FormControl({ value: '', disabled: true }),
		// });
	}

	//
	preLoadData(event?: any): void {
		Promise.all([this.UDFProvider.read()]).then((values: any) => {
			this.UDFList = values && values[0] && values[0].data ? values[0].data : [];
			super.preLoadData(event);
		});
	}
	loadedData(event) {
		this.items = [];
		super.loadedData(event);
		if (this.item && this.item._PayrollConfig) {
			this.items = this.item._PayrollConfig
				.filter((d) => !d.IsHidden)
				.map((i) => {
					const udf = this.UDFList.find((u) => u.Id === i.IDUDF);
					if (!udf) return null;

					const udfNum = parseInt(udf.UDF, 10);

					return {
						Name: udf.Name,
						Code: udf.Code,
						Value: !isNaN(udfNum) ? this.item['UDF' + udfNum] || i.UDFValue || udf.DefaultValue : i.UDFValue || udfNum,
					};
				})
				.filter((x) => x !== null);
		}
	}
	async saveChange() {
		super.saveChange2();
	}
}
