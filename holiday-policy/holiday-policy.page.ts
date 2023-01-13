import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PolicyHolidayProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-holiday-policy',
    templateUrl: 'holiday-policy.page.html',
    styleUrls: ['holiday-policy.page.scss']
})
export class HolidayPolicyPage extends PageBase {
    constructor(
        public pageProvider: HRM_PolicyHolidayProvider,
        public modalController: ModalController,
		public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
        public location: Location,
    ) {
        super();
    }

    loadedData(event?: any, ignoredFromGroup?: boolean): void {
        this.items.forEach(i => {
            i.FromDate = lib.dateFormat(i.FromDate);
            i.ToDate = lib.dateFormat(i.ToDate);
        });
        super.loadedData(event, ignoredFromGroup);
    }
}
