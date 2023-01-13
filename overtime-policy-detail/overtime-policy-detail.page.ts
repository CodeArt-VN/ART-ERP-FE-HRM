import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { BRA_BranchProvider, HRM_OvertimePolicyProvider, } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
    selector: 'app-overtime-policy-detail',
    templateUrl: './overtime-policy-detail.page.html',
    styleUrls: ['./overtime-policy-detail.page.scss'],
})
export class OvertimePolicyDetailPage extends PageBase {
    TypeList = []
    constructor(
        public pageProvider: HRM_OvertimePolicyProvider,
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

        this.formGroup = formBuilder.group({
            IDBranch: [this.env.selectedBranch],
            Id: new FormControl({ value: '', disabled: true }),
            Code: [''],
            Name: ['', Validators.required],
            Remark: [''],
            Type: ['', Validators.required],
            Start: ['', Validators.required],
            End: ['', Validators.required],
            IsOvernightShift: [false],
            MaxMinuteOfOTInCycle: [''],
        });
    }

    preLoadData(event?: any): void {
        this.env.getType('OvertimeType').then(data=>{
            this.TypeList = data;
            super.preLoadData(event);
        })
    }

    async saveChange() {
        super.saveChange2();
    }
}
