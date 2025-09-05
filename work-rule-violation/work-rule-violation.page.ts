import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider,HRM_StaffWorkRuleViolationProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/interfaces/options-interface';

@Component({
	selector: 'app-work-rule-violation',
	templateUrl: 'work-rule-violation.page.html',
	styleUrls: ['work-rule-violation.page.scss'],
	standalone: false,
})
export class WorkRuleViolationPage extends PageBase {
	statusList: any[] = [];
	constructor(
		public pageProvider: HRM_StaffWorkRuleViolationProvider,
		public branchProvider: BRA_BranchProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
	}

	preLoadData(event?: any): void {
		let sorted: SortConfig[] = [{ Dimension: 'Id', Order: 'DESC' }];
		this.pageConfig.sort = sorted;
		Promise.all([this.env.getStatus('StandardApprovalStatus')]).then((values) => {
			this.statusList = values[0];
		});
		super.preLoadData(event);
	}
	loadedData(event) {
		this.items.forEach((i) => {
			i.BranchName = this.env.branchList.find((branch) => branch.Id == i.IDBranch)?.Name;
			i._Status = this.statusList.find((d) => d.Code == i.Status);
		})
		super.loadedData(event);
	}

}
