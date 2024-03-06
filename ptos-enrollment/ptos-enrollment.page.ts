import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_StaffPTOEnrollmentProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-ptos-enrollment',
  templateUrl: 'ptos-enrollment.page.html',
  styleUrls: ['ptos-enrollment.page.scss'],
})
export class PTOsEnrollmentPage extends PageBase {
  constructor(
    public pageProvider: HRM_StaffPTOEnrollmentProvider,
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
}
