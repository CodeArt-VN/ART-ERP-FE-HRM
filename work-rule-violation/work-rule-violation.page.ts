import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider,HRM_StaffWorkRuleViolationProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/models/options-interface';

@Component({
	selector: 'app-work-rule-violation',
	templateUrl: 'work-rule-violation.page.html',
	styleUrls: ['work-rule-violation.page.scss'],
	standalone: false,
})
export class WorkRuleViolationPage extends PageBase {
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
		super.preLoadData(event);
	}
	loadedData(event) {
		super.loadedData(event);
	}

}
