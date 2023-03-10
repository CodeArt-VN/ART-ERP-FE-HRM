import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetLogProvider, OST_OfficeGateProvider, SYS_UserDeviceProvider } from 'src/app/services/static/services.service';
import { lib } from 'src/app/services/static/global-functions';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CateringVoucherModalPage } from '../catering-voucher-modal/catering-voucher-modal.page';

@Component({
    selector: 'app-checkin',
    templateUrl: 'checkin.page.html',
    styleUrls: ['checkin.page.scss']
})
export class CheckinPage extends PageBase {
    constructor(
        public pageProvider: HRM_TimesheetLogProvider,
        public gateProvider: OST_OfficeGateProvider,
        public userDeviceProvider: SYS_UserDeviceProvider,
        public modalController: ModalController,
		public popoverCtrl: PopoverController,
        public alertCtrl: AlertController,
        public loadingController: LoadingController,
        public env: EnvService,
        public navCtrl: NavController,
    ) {
        super();
    }
    gateList = [];
    myIP = '';
    preLoadData(event?: any): void {
        this.sort.LogTime = 'LogTime';
        this.sortToggle('LogTime', true);
        this.query.IDStaff = this.env.user.StaffID;

        this.gateProvider.read().then(resp => {
            this.gateList = resp['data'];
            super.preLoadData(event);
        });

        this.pageProvider.commonService.connect('GET', ApiSetting.apiDomain("Account/MyIP"), null).toPromise().then((resp:any)=>{
            this.myIP = resp;
            console.log(this.myIP);
            
        })
    }

    loadedData(event?: any, ignoredFromGroup?: boolean): void {
        this.items.forEach(i => {
            i.Time = lib.dateFormat(i.LogTime, 'hh:MM');
            i.Date = lib.dateFormat(i.LogTime, 'dd/mm/yyyy');
            i.Gate = this.gateList.find(d => d.Id == i.IDGate);
        });
        super.loadedData(event, ignoredFromGroup);
    }

    myHeaderFn(record, recordIndex, records) {



        let a: any = recordIndex == 0 ? new Date('2000-01-01') : new Date(records[recordIndex - 1].LogTime);
        let b: any = new Date(record.LogTime);
        let mins = Math.floor((b - a) / 1000 / 60);

        if (Math.abs(mins) < 600) {
            return null;
        }
        return record.Date;
        // return {
        //   CreatedTimeText: record.CreatedDate ? lib.dateFormat(record.CreatedDate, 'hh:MM') : '',
        //   CreatedDateText: record.CreatedDate ? lib.dateFormat(record.CreatedDate, 'dd/mm/yy') : ''
        // }

    }

    scanning = false;
    scanQRCode() {
        if (!Capacitor.isPluginAvailable('BarcodeScanner') || Capacitor.platform == 'web') {
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.mobile-only','warning');
            return;
        }
        BarcodeScanner.prepare().then(() => {
            BarcodeScanner.checkPermission({ force: true }).then(status => {
                if (status.granted) {
                    this.scanning = true;
                    document.querySelector('ion-app').style.backgroundColor = "transparent";
                    BarcodeScanner.startScan().then(async (result) => {
                        console.log(result);
                        let close: any = document.querySelector('#closeCamera');

                        if (!result.hasContent) {
                            close.click();
                        }

                        let gateCode = '';
                        if (result.content.indexOf('G:') == 0) {
                            gateCode = result.content.replace('G:', '');
                        }
                        else {
                            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.checkin-gate-with-value', '', result.content);
                            setTimeout(() => this.scanQRCode(), 0);
                        }

                        
                        const loading = await this.loadingController.create({
                            cssClass: 'my-custom-class',
                            message: 'Vui l??ng ch??? ki???m tra checkin'
                        });
                        await loading.present().then(async () => {

                            let logItem = {
                                IDStaff: this.env.user.StaffID,
                                GateCode: gateCode,
                                Lat: null,
                                Long: null,
                                UUID: '',
                                IPAddress: this.myIP,
                                IsMockLocation: false
                            };

                            if (Capacitor.isPluginAvailable('Device')){
                                let UID = await Device.getId();
                                logItem.UUID = UID.uuid;
                            }
                            Geolocation.getCurrentPosition({timeout: 5000, enableHighAccuracy: true}).then((resp) => {
                                logItem.Lat = resp.coords.latitude;
                                logItem.Long = resp.coords.longitude;
                                console.log(resp);
                                
                            })
                            .catch(err=>{
                                console.log(err);
                                
                            })
                            .finally(()=>{
                                this.pageProvider.save(logItem).then((resp:any) => {
                                    console.log(resp);
                                    if (loading) loading.dismiss();
                                    
                                    this.refresh();
                                    if(resp.Id){
                                        let i = resp;
                                        i.Time = lib.dateFormat(i.LogTime, 'hh:MM');
                                        i.Date = lib.dateFormat(i.LogTime, 'dd/mm/yyyy');
                                        i.Gate = this.gateList.find(d => d.Id == i.IDGate);
                                        this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.checkin-complete','success');
                                        this.showLog(i);
                                    }
                                    else if(resp != "OK"){
                                        this.showLogMessage(resp);
                                    }
                                    else{
                                        this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.checkin-complete','success');
                                    }
                                }).catch(err => {
                                    if (loading) loading.dismiss();
                                    this.env.showMessage(err, 'danger');
                                });
                            });

                            
                            this.closeCamera();
                        });
                    })
                }
                else {
                    this.alertCtrl.create({
                        header: 'Qu??t QR code',
                        //subHeader: '---',
                        message: 'B???n ch??a cho ph??p s??? d???ng camera, Xin vui l??ng c???p quy???n cho ???ng d???ng.',
                        buttons: [
                            {
                                text: 'Kh??ng',
                                role: 'cancel',
                                handler: () => { }
                            },
                            {
                                text: '?????ng ??',
                                cssClass: 'danger-btn',
                                handler: () => {
                                    BarcodeScanner.openAppSettings();
                                }
                            }
                        ]
                    }).then(alert => {
                        alert.present();
                    })
                }
            })
                .catch((e: any) => console.log('Error is', e));
        })



    }

    closeCamera() {
        if (!Capacitor.isPluginAvailable('BarcodeScanner') || Capacitor.platform == 'web') {
            return;
        }
        this.scanning = false;
        this.lighting = false;
        this.useFrontCamera = false;
        document.querySelector('ion-app').style.backgroundColor = "";
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
    }

    lighting = false;
    lightCamera() {
        // if (this.lighting) {
        //     this.qrScanner.disableLight().then(() => {
        //         this.lighting = false;
        //     });
        // }
        // else {
        //     this.qrScanner.enableLight().then(() => {
        //         this.lighting = true;
        //     });
        // }
    }

    useFrontCamera = false;
    reversalCamera() {
        // if (this.useFrontCamera) {
        //     this.qrScanner.useBackCamera().then(() => {
        //         this.useFrontCamera = false;
        //     });
        // }
        // else {
        //     this.qrScanner.useFrontCamera().then(() => {
        //         this.useFrontCamera = true;
        //     });
        // }
    }

    ionViewWillLeave() {
        this.closeCamera();
    }

   

    async showLog(cData) {
        const modal = await this.modalController.create({
            component: CateringVoucherModalPage,
            componentProps: cData,
            cssClass: 'modal-catering-voucher'
        });
        await modal.present();
    }

    showRemark(i){
        if(!i.IsValidLog && i.Remark){
            this.showLogMessage(i.Remark);
            
        }
    }

    showLogMessage(message){
        
        if( message.indexOf('Invalid IP') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.invalid-ip','warning', null, 0, true);
        }
        else if( message.indexOf('Invalid gate coordinate') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.invalid-gate-coordinate','warning', null, 0, true);
        }
        else if( message.indexOf('Invalid coordinate') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.invalid-coordinate','warning', null, 0, true);
        }
        else if( message.indexOf('Invalid distance') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.invalid-distance','warning', null, 0, true);
        }
        else if( message.indexOf('Invalid LogTime') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.invalid-logtime','warning', null, 0, true);
        }
        else if( message.indexOf('No pre-ordered') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.no-pre-ordered','warning', null, 0, true);
        }
        else if( message.indexOf('Schedule not found') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.schedule-not-found','warning', null, 0, true);
        }
        else if( message.indexOf('Catering voucher has been used') > -1){
            this.env.showTranslateMessage('erp.app.pages.hrm.checkin-gate.message.catering-voucher-has-been-used','warning', null, 0, true);
        }
    }
}