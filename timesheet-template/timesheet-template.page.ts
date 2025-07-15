import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { Location } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HRM_TimesheetTemplateProvider } from 'src/app/services/static/services.service';
import { s } from '@fullcalendar/core/internal-common';

@Component({
	selector: 'app-timesheet-template',
	templateUrl: 'timesheet-template.page.html',
	styleUrls: ['timesheet-template.page.scss'],
	standalone: false,
})
export class TimesheetTemplatePage extends PageBase {
	constructor(
		public pageProvider: HRM_TimesheetTemplateProvider,
		public modalController: ModalController,
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
	}

	async copy() {
		let ids = this.selectedItems.map((i) => i.Id);
		this.pageProvider.commonService
			.connect('POST', 'HRM/TimesheetTemplate/CopyTimesheetTemplate', ids)
			.toPromise()
			.then((res) => {
				this.env.showMessage('Copy succesfully', 'success');
				super.refresh();
			});
	}
}
