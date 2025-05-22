import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_WorkRuleProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/models/options-interface';
import { HRM_WorkRule } from 'src/app/models/model-list-interface';

@Component({
	selector: 'app-work-rule',
	templateUrl: 'work-rule.page.html',
	styleUrls: ['work-rule.page.scss'],
	standalone: false,
})
export class WorkRulePage extends PageBase {
	constructor(
		public pageProvider: HRM_WorkRuleProvider,
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
		this.items.forEach((item) => {
			item.BranchName = this.env.branchList.find((branch) => branch.Id == item.IDBranch)?.Name;
		})
		super.loadedData(event);
		
	}

}
