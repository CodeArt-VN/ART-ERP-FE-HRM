import { Component } from '@angular/core';
import { AlertController, LoadingController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-timesheet',
	templateUrl: './timesheet.page.html',
	styleUrls: ['./timesheet.page.scss'],
})
export class TimesheetPage extends PageBase {

	constructor(
		public pageProvider: HRM_TimesheetProvider,
		public branchProvicer: BRA_BranchProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
	) {
		super();
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		this.items.forEach(i => {
			i._Branch = this.env.branchList.find(d => d.Id == i.IDBranch);
		});
		super.loadedData(event, ignoredFromGroup);
	}




	

	

}
