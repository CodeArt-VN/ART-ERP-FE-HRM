import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HRM_StaffPayrollProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { SYS_ConfigService } from 'src/app/services/custom/system-config.service';
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
		public sysConfigService: SYS_ConfigService,
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
		this.query.SortBy = 'Id_desc';

		Promise.all([this.env.getStatus('StandardApprovalStatus'), this.sysConfigService.getConfig(this.env.selectedBranch, ['StaffPayrollUsedApprovalModule'])]).then((res:any) => {
			this.statusList = res[0];
			if(res[1]){
				this.pageConfig = {
					...this.pageConfig,
					...res[1]
				};
			}
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
	isAllRowOpened = true;
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

	changeSelection(e, i = null) {
		if (!i.IDParent) {
			if (i.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
			let children = this.itemsState.filter((d) => d.IDParent == i.Id);
			children.forEach((c) => {
				const index = this.selectedItems.indexOf(c, 0);
				if (e.target.checked) {
					c.checked = true;
					if (index == -1) {
						this.selectedItems.push(c);
					}
				} else {
					if (index > -1) {
						this.selectedItems.splice(index, 1);
					}
				}
			});
		} else if (e && e.shiftKey) {
			let from = this.itemsState.indexOf(this.lastchecked);
			let to = this.itemsState.indexOf(i);

			let start = Math.min(from, to);
			let end = Math.max(from, to) + 1;

			let itemsToCheck = this.itemsState.slice(start, end);
			for (let j = 0; j < itemsToCheck.length; j++) {
				const it = itemsToCheck[j];

				it.checked = this.lastchecked.checked;
				const index = this.selectedItems.indexOf(it, 0);

				if (this.lastchecked.checked && index == -1) {
					this.selectedItems.push(it);
				} else if (!this.lastchecked.checked && index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		} else if (e) {
			if (e.target.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		} else {
			if (i.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		}

		this.selectedItems = [...this.selectedItems];
		this.lastchecked = i;
		console.log('Selected items:', this.selectedItems);
		//e?.preventDefault();
		e?.stopPropagation();

		this.showCommandBySelectedRows(this.selectedItems);
	}
}
