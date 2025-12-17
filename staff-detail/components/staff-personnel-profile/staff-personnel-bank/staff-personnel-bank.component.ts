import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { s } from '@fullcalendar/core/internal-common';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { HRM_StaffIdentityCardAndPIT } from 'src/app/models/model-list-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffBankProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-personnel-bank',
	templateUrl: './staff-personnel-bank.component.html',
	styleUrls: ['./staff-personnel-bank.component.scss'],
	standalone: false,
})
export class StaffPersonnelBankComponent extends PageBase {
	bankBranchList = [];
	bankList = [];
	isShowModal = false;
	@Input() idStaff;

	constructor(
		public pageProvider: HRM_StaffBankProvider,
		public countryProvider: LIST_CountryProvider,
		public env: EnvService,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		// this.buildFormGroup();
	}

	buildFormGroup(row) {
		this.formGroup = this.formBuilder.group({
			Id: [row.Id],
			Code: [row.Code],
			Name: [row.Name],
			Remark: [row.Remark],
			Sort: [row.Sort],
			IDStaff: [this.idStaff],
			Bank:[row.Bank,Validators.required],
			BankBranch:[row.BankBranch,Validators.required],
			AccountNumber:[row.AccountNumber,Validators.required],
			IsPayrollAccount:[row.IsPayrollAccount],
		});
	}

	preLoadData(event = null) {
		this.pageConfig.pageName = 'staff-personnel-bank';
		this.query.IDStaff = this.idStaff;
		Promise.all([this.env.getType('BankType'), this.env.getType('BankBranchType')])
			.then((values) => {
				this.bankBranchList = values[0];
				this.bankList = values[1];
				super.preLoadData(event);
			})
			.catch((error) => {
				console.log(error);
				super.preLoadData(event);
			});
	}

	loadedData(event) {
		super.loadedData(event);
	}

	dismissModal(flag?) {
		this.isShowModal = false;
		if (flag) {
			this.saveChange2();
		}
	}


	addRow() {
		this.buildFormGroup({});
		this.formGroup.controls.IDStaff.markAsDirty();
		this.isShowModal = true;
	}

	editRow(row) {
		//Create formGroup of row
		this.buildFormGroup(row);
		this.isShowModal = true;
	}

	deleteRow(row) {
		let Ids = [];
		Ids.push({
			Id: row.Id,
		});
		this.env.showPrompt(null, 'Bạn có chắc muốn xóa không?').then((_) => {
			this.pageProvider.delete(Ids).then((resp) => {
				this.items.splice(this.items.indexOf(row), 1);
				this.env.showMessage('Deleted','success');
			});
		});
	}

}
