import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController, ModalController, NavParams } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_ShiftProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators } from '@angular/forms';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-catering-voucher-modal',
    templateUrl: './catering-voucher-modal.page.html',
    styleUrls: ['./catering-voucher-modal.page.scss'],
    standalone: false
})
export class CateringVoucherModalPage extends PageBase {
  avatarURL = '';

  constructor(
    public pageProvider: HRM_ShiftProvider,
    public modalController: ModalController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
  ) {
    super();
    this.item = {};
  }

  preLoadData(event?: any): void {
    this.item = this.navParams.data;
    console.log(this.item);

    this.avatarURL = environment.staffAvatarsServer + this.item.Staff.Code + '.jpg';

    super.loadedData(event);
  }
}
