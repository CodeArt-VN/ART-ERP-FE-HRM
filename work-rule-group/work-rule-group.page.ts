import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider,HRM_WorkRuleGroupProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/models/options-interface';
import { WorkRuleGroupDetailPage } from '../work-rule-group-detail/work-rule-group-detail.page';

@Component({
	selector: 'app-work-rule-group',
	templateUrl: 'work-rule-group.page.html',
	styleUrls: ['work-rule-group.page.scss'],
	standalone: false,
})
export class WorkRuleGroupPage extends PageBase {
	constructor(
		public pageProvider: HRM_WorkRuleGroupProvider,
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
		this.pageConfig.pageIcon = 'flash-outline';
		super.preLoadData(event);
	}
	loadedData(event) {
		super.loadedData(event);
	}

	async showModal(i) {
		const modal = await this.modalController.create({
			component: WorkRuleGroupDetailPage,
			componentProps: {
				item: i,
				id: i.Id,
			},
			cssClass: 'my-custom-class',
		});
		return await modal.present();
	}

	add() {
		let newItem = {
			Id: 0,
			IsDisabled: false,
		};
		this.showModal(newItem);
	}

}
