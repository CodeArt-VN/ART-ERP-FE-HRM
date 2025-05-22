import { Component, ChangeDetectorRef, Input } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_StaffUDFProvider, HRM_UDFProvider, WMS_ZoneProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-staff-personnel-udf',
	templateUrl: './staff-personnel-udf.page.html',
	styleUrls: ['./staff-personnel-udf.page.scss'],
	standalone: false,
})
export class StaffPersonnelUDFComponent extends PageBase {
	@Input() IDStaff;
	subGroupList: any = [];
	subGroup: any = [];
	constructor(
		public pageProvider: HRM_UDFProvider,
		public staffUDFProvider: HRM_StaffUDFProvider,
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
		this.formGroup = this.formBuilder.group({});
	}

	preLoadData(event?: any): void {
		this.query.Group = 'EmployeeInformation';
		this.query.IsDisabled = false;
		Promise.all([this.env.getType('EmployeeInformation', true)]).then((values: any) => {
			console.log(values);
			if (values && values[0]) {
				this.subGroupList = values[0];
			}
			super.preLoadData(event);
		});
	}
	
	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.staffUDFProvider
			.getAnItem(this.IDStaff)
			.then((res: any) => {
				if (res) {
					this.item = res;
				}
				this.subGroup = this.items.reduce(
					(acc, row) => {
						const key = row.SubGroup || 'Others';

						// Find existing group
						let group = acc.find((g: any) => g.Code === key);

						if (!group) {
							const name = this.subGroupList.find((x: any) => x.Code === key);
							group = {
								Code: key,
								Name: name ? name.Name : key,
								items: [],
							};
							acc.push(group);
						}
						row._formGroup = this.formBuilder.group({
							Id: [this.IDStaff],
							Name: [row.Name],
							Code: [row.Code],
						  });
						  row._formGroup.addControl(row.Code, new FormControl(res?res['UDF'+row.UDF]:''));
						  row._formGroup.get('Name').markAsDirty();
						  row._formGroup.get('Code').markAsDirty();
						  console.log( row._formGroup);
						  
						group.items.push(row);
						return acc;
					},
					[] as { Code: string; Name: string; items: any[] }[]
				);
				console.log(this.subGroup);
				this.openedFields = this.subGroup.map((x: any) => x.Code);
			})
			.finally(() => {
				super.loadedData(event);
			});
	}
	openedFields
	accordionGroupChange(e) {
		this.openedFields = e.detail.value;
	}
	isAccordionExpanded(id: string): boolean {
		return this.openedFields.includes(id?.toString());
	}

	async saveChange(fg) {
		super.saveChange2(fg,null,this.staffUDFProvider);
	}

}
