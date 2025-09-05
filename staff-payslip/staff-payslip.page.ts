import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffRecordPayrollProvider, HRM_UDFProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/interfaces/options-interface';

@Component({
	selector: 'app-staff-payslip',
	templateUrl: 'staff-payslip.page.html',
	styleUrls: ['staff-payslip.page.scss'],
	standalone: false,
})
export class StaffPayslipPage extends PageBase {

	constructor(
		public pageProvider: HRM_StaffRecordPayrollProvider,
		public UDFProvider: HRM_UDFProvider,
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
		this.query.IDStaff = this.env.user.StaffID;
		super.preLoadData(event);
	}
	loadedData(event) {
		super.loadedData(event);
	}

}
