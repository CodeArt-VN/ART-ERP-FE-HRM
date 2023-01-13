import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_ShiftProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-shift',
    templateUrl: 'shift.page.html',
    styleUrls: ['shift.page.scss']
})
export class ShiftPage extends PageBase {
    constructor(
        public pageProvider: HRM_ShiftProvider,
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
    typeList = [];
    preLoadData(event?: any): void {
        this.env.getType('ShiftType').then(data=>{
            this.typeList = data;
            super.preLoadData(event);
        })
    }

    loadedData(event?: any, ignoredFromGroup?: boolean): void {
        this.items.forEach(i => {
            let t = this.typeList.find(d=>d.Code == i.Type);
            if(t){
                i.Color = t.Color;
            }
        });
        super.loadedData(event, ignoredFromGroup);
    }
}
