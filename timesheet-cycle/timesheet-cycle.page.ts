import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetCycleProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { TimesheetCycleModalPage } from '../timesheet-cycle-modal/timesheet-cycle-modal.page';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-timesheet-cycle',
    templateUrl: 'timesheet-cycle.page.html',
    styleUrls: ['timesheet-cycle.page.scss']
})
export class TimesheetCyclePage extends PageBase {
    timesheetList = [];
    constructor(
        public pageProvider: HRM_TimesheetCycleProvider,
        public timesheetProvider: HRM_TimesheetProvider,

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

    preLoadData(event?: any): void {
        this.timesheetProvider.read().then(resp => {
            this.timesheetList = resp['data'];
            super.preLoadData(event);
        });
    }

    loadedData(event?: any, ignoredFromGroup?: boolean): void {
        this.items.forEach(i => {
            i.Start = lib.dateFormat(i.Start);
            i.End = lib.dateFormat(i.End);

            i.TimesheetList = [];
            for (let j = 0; j < i.Timesheets.length; j++) {
                const t = this.timesheetList.find(d => d.Id == i.Timesheets[j]);
                if(t){
                    i.TimesheetList.push(t);
                }
                
            }

        });
        super.loadedData(event, ignoredFromGroup);
    }


    async showModal(i) {
        const modal = await this.modalController.create({
            component: TimesheetCycleModalPage,
            componentProps: {
                timesheetList: this.timesheetList,
                item: i,
                id: i.Id
            },
            cssClass: 'my-custom-class'
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();

        if (data) {
            this.pageProvider.save(data).then(resp => {
                this.refresh();
            });
        }
    }

    add() {
        let newItem = {
            Id: 0
        };
        this.showModal(newItem);
    }
}
