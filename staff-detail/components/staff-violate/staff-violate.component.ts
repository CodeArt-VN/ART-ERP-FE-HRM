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
import { CRM_ContactProvider, CRM_PersonInfoProvider, HRM_StaffWorkRuleViolationProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-violate',
	templateUrl: './staff-violate.component.html',
	styleUrls: ['./staff-violate.component.scss'],
	standalone: false,
})
export class StaffViolateComponent extends PageBase {
	@Input() set sfId(value) {
		this.id = value;
		this.query.IDStaff = this.id;
	}

	constructor(
		public pageProvider: HRM_StaffWorkRuleViolationProvider,
		public env: EnvService,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.query.Take = 5;
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
	}
}
