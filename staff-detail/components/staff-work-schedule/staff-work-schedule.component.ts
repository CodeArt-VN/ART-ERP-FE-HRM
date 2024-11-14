import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';
import {
  CRM_ContactProvider,
  CRM_PersonInfoProvider,
} from 'src/app/services/static/services.service';

@Component({
  selector: 'app-staff-work-schedule',
  templateUrl: './staff-work-schedule.component.html',
  styleUrls: ['./staff-work-schedule.component.scss'],
})
export class StaffWorkScheduleComponent extends PageBase {
  @Input() set sfId(value) {
    this.id = value;
    this.query.IDStaff = this.id;
  }

  constructor(
    //public pageProvider: HRM_StaffWorkScheduleProvider,
    public env: EnvService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
  ) {
    super();
    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      WorkSchedule: this.formBuilder.array([]),
    });
    this.query.IgnoredBranch = true;
    this.query.IsPersonal = true;
    this.pageConfig.isForceCreate = true;
  }
  loadData(){
    this.loadedData();
  }
  loadedData() {
   
    super.loadedData();
 
  }

  
}