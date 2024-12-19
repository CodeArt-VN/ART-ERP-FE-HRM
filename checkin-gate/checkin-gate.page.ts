import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
  BRA_BranchProvider,
  OST_OfficeGateProvider,
  OST_OfficeProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import QRCode from 'qrcode';
import { lib } from 'src/app/services/static/global-functions';

@Component({
    selector: 'app-checkin-gate',
    templateUrl: './checkin-gate.page.html',
    styleUrls: ['./checkin-gate.page.scss'],
    standalone: false
})
export class CheckinGateDetailPage extends PageBase {
  officeList = [];
  gateList = [];
  selectedOffice = null;
  QRC = null;

  constructor(
    public pageProvider: OST_OfficeGateProvider,
    public officeProvider: OST_OfficeProvider,

    public env: EnvService,
    public navCtrl: NavController,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
    public commonService: CommonService,
  ) {
    super();
    this.pageConfig.isDetailPage = true;
    this.pageConfig.isShowFeature = true;
    this.item = null;
    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      IDOffice: ['', Validators.required],
      Name: ['', Validators.required],
      Code: ['', Validators.required],
      Type: ['', Validators.required],
      IPAddress: [''],
      Lat: [''],
      Long: [''],
      MaxDistance: [''],
      IsVerifyLocation: [true],

      Sort: [''],
      Remark: [''],

      IsCateringService: [false],

      CanCheckinBreakfast: [false],
      CanCheckinLunch: [false],
      CanCheckinDinner: [false],
      BreakfastStart: [''],
      BreakfastEnd: [''],
      LunchStart: [''],
      LunchEnd: [''],
      DinnerStart: [''],
      DinnerEnd: [''],
    });
  }

  typeList = [];

  events(e) {
    console.log(e);

    if (e.Code == 'checkin-gate') {
      this.changeOffice();
    }
  }

  preLoadData(event?: any): void {
    this.env.getType('CheckinType').then((resp) => {
      this.typeList = resp;
    });

    this.officeProvider.read().then((resp) => {
      this.officeList = resp['data'];
      if (this.officeList.length) {
        this.selectedOffice = this.officeList[0];
        this.changeOffice();
      }
    });
    if (this.id) {
      super.preLoadData(event);
    } else {
      this.loadedData();
    }
  }

  loadedData(event?: any, ignoredFromGroup?: boolean): void {
    super.loadedData();

    if (this.item && this.item.IDOffice) {
      this.selectedOffice = this.officeList.find((d) => d.Id == this.item.IDOffice);
      if (this.item.Type == 'QRCodeCheckin') {
        this.loadQR();
      }
    }

    if (!this.item.IDOffice && this.selectedOffice) {
      this.formGroup.controls.IDOffice.setValue(this.selectedOffice.Id);
      this.formGroup.controls.IDOffice.markAsDirty();

      this.formGroup.controls.Code.setValue(lib.generateUID());
      this.formGroup.controls.Code.markAsDirty();
    }
  }

  loadQR() {
    let that = this;
    QRCode.toDataURL(
      'G:' + this.formGroup.controls.Code.value,
      {
        errorCorrectionLevel: 'M',
        version: 2,
        width: 500,
        scale: 20,
        type: 'image/webp',
      },
      function (err, url) {
        that.QRC = url;
      },
    );
  }

  changeOffice() {
    if (this.selectedOffice) {
      this.query.IDOffice = this.selectedOffice.Id;
      this.pageProvider.read(this.query).then((resp) => {
        this.gateList = resp['data'];
      });
    }
  }

  changeGate(gate) {
    let newURL = '#/checkin-gate/';
    if (gate) {
      newURL += gate.Id;
      this.id = gate.Id;

      if (gate.Id == 0) {
        this.item = null;
        this.formGroup.reset();
      }

      this.loadData(null);
    } else {
      this.id = 0;
    }
    history.pushState({}, null, newURL);
  }

  changeCode() {
    this.formGroup.controls.Code.setValue(lib.generateUID());
    this.formGroup.controls.Code.markAsDirty();

    this.saveChange().then((resp) => {
      this.loadQR();
    });
  }

  async saveChange() {
    let lastId = this.id;
    super.saveChange2();
  }
}
