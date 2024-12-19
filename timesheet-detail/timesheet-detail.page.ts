import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { lib } from 'src/app/services/static/global-functions';
import { BRA_BranchProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';

@Component({
    selector: 'app-timesheet-detail',
    templateUrl: './timesheet-detail.page.html',
    styleUrls: ['./timesheet-detail.page.scss'],
    standalone: false
})
export class TimesheetDetailPage extends PageBase {
  dataIDBranchList = [];
  constructor(
    public pageProvider: HRM_TimesheetProvider,
    public branchProvicer: BRA_BranchProvider,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public env: EnvService,
    public route: ActivatedRoute,
    public navCtrl: NavController,
  ) {
    super();
    this.pageConfig.isDetailPage = true;
    this.id = this.route.snapshot?.paramMap?.get('id');

    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      IDBranch: [this.env.selectedBranch],
      Name: ['', Validators.required],
      Code: [''],
      Type: ['', Validators.required],
      Sort: [''],
      Remark: [''],

      CheckInPolicy: ['', Validators.required],
      NumberOfShiftPerDay: ['', Validators.required],
      WorkingHoursPerDay: ['', Validators.required],
      Manager: [''],

      IsCheckOutRequired: [''],
      IsRequiredApproveToEnroll: [''],
      IsRequiredApproveToTransfer: [''],
      IsRequiredApproveToSwitch: [''],
    });
  }

  segmentView = 's1';
  segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
  }

  timesheetTypeList;
  CheckInOutPolicyList;

  loadedData(event) {
    // this.dataIDBranchList = this.env.branchList;
    this.env.getType('TimesheetType').then((data) => {
      this.timesheetTypeList = data;

      this.env.getType('CheckInOutPolicy').then((data) => {
        this.CheckInOutPolicyList = data;

        super.loadedData();
      });
    });
  }
}
