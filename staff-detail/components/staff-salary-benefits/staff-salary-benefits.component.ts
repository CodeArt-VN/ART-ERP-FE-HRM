import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';

@Component({
	selector: 'app-staff-salary-benefits',
	templateUrl: './staff-salary-benefits.component.html',
	styleUrls: ['./staff-salary-benefits.component.scss'],
	standalone: false,
})
export class StaffSalaryBenefitsComponent extends PageBase {
	@Input() set sfId(value) {
		this.id = value;
		this.query.IDStaff = this.id;
	}

	constructor(
		//public pageProvider: HRM_StaffSalaryBenefitsProvider,
		public env: EnvService,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			SalaryBenefits: this.formBuilder.array([]),
		});
		this.query.IgnoredBranch = true;
		this.query.IsPersonal = true;
		this.pageConfig.isForceCreate = true;
	}
	loadData() {
		this.loadedData();
	}
	loadedData() {
		super.loadedData();
	}
}
