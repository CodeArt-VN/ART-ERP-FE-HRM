import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HRM_PayrollTemplateProvider, HRM_StaffPayrollProvider, SYS_ConfigProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
@Component({
	selector: 'app-staff-payroll',
	templateUrl: 'staff-payroll.page.html',
	styleUrls: ['staff-payroll.page.scss'],
	standalone: false,
})
export class StaffPayrollPage extends PageBase {
	statusList = [];
	constructor(
		public pageProvider: HRM_StaffPayrollProvider,
		public modalController: ModalController,
		public sysConfigProvider: SYS_ConfigProvider,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
		this.pageConfig.ShowAdd = false; 
	}

	preLoadData(event?: any): void {
		let sysConfigQuery = ['StaffPayrollUsedApprovalModule'];
		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.sysConfigProvider.read({ Code_in: sysConfigQuery, IDBranch: this.env.selectedBranch })]).then((res:any) => {
			this.statusList = res[0];
			res[1]['data'].forEach((e) => {
				if ((e.Value == null || e.Value == 'null') && e._InheritedConfig) {
					e.Value = e._InheritedConfig.Value;
				}
				this.pageConfig[e.Code] = JSON.parse(e.Value);
			});
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		const uniqueById = Array.from(new Map(this.items.map((i) => i._TimesheetCycle).map((item) => [item.TimesheetCycleId, item])).values());
		uniqueById.forEach((cycle: any) => {
			cycle.Id = lib.generateUID();
		});

		this.items.forEach((i) => {
			let cycle: any = uniqueById.find((c: any) => c.TimesheetCycleId === i._TimesheetCycle.TimesheetCycleId);
			i.IDParent = cycle.Id;
			i.StatusText = lib.getAttrib(i.Status, this.statusList, 'Name', '--', 'Code');
			i.StatusColor = lib.getAttrib(i.Status, this.statusList, 'Color', 'dark', 'Code');
		});
		this.items = [...this.items, ...uniqueById];
		this.buildFlatTree(this.items, this.itemsState, this.isAllRowOpened).then((res) => {
			this.itemsState = res;
			this.itemsView = this.itemsState.filter((d) => d.show);
		});

		super.loadedData(event, ignoredFromGroup);
		console.table(this.items);
		if (this.pageConfig['StaffPayrollUsedApprovalModule']) {
			this.pageConfig['canApprove'] = false;
		}
	}
	itemsState: any = [];
	itemsView = [];
	isAllRowOpened = false;
	toggleRowAll() {
		this.isAllRowOpened = !this.isAllRowOpened;
		this.itemsState.forEach((i) => {
			i.showdetail = !this.isAllRowOpened;
			this.toggleRow(this.itemsState, i, true);
		});
		this.itemsView = this.itemsState.filter((d) => d.show);
	}

	toggleRow(ls, ite, toogle = false) {
		super.toggleRow(ls, ite, toogle);
		this.itemsView = this.itemsState.filter((d) => d.show);
	}
}
