import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffFamilyProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-personnel-family',
	templateUrl: './staff-personnel-family.component.html',
	styleUrls: ['./staff-personnel-family.component.scss'],
	standalone: false,
})
export class StaffPersonnelFamilyComponent extends PageBase {
	countryList = [];
	relativeTypeList = [];
	passportTypeList = [];
	isShowModal = false;
	@Input() idStaff;

	constructor(
		public pageProvider: HRM_StaffFamilyProvider,
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
			Relative: [row.Relative],
			FirstName: [row.FirstName, Validators.required],
			LastName: [row.LastName, Validators.required],
			MiddleName: [row.MiddleName, Validators.required],
			FullName: [row.FullName, Validators.required],
			ShortName: [row.ShortName, Validators.required],
			IDStaff: [this.idStaff],
			Gender: [row.Gender, Validators.required],
			DOB: [row.DOB, Validators.required],
			IdentityCardNumber: [row.IdentityCardNumber, Validators.required],
			DateOfIssueID: [row.DateOfIssueID, Validators.required],
			PlaceOfIssueID: [row.PlaceOfIssueID, Validators.required],
			DateOfExpiryID: [row.DateOfExpiryID, Validators.required],
			PassportNumber: [row.PassportNumber],
			DateOfIssuePassport: [row.DateOfIssuePassport],
			DateOfExpiryPassport: [row.DateOfExpiryPassport],
			PlaceOfIssuePassport: [row.PlaceOfIssuePassport],
			TypeOfPassport: [row.TypeOfPassport],
			CountryOfIssuePassport: [row.CountryOfIssuePassport],
			IsDependants: [row.IsDependants],
			HomeAddress: [row.HomeAddress],
			IsEmergencyContact: [row.IsEmergencyContact],
			TaxIdentificationNumber: [row.TaxIdentificationNumber],
			Job : [row.Job]
		});
	}

	preLoadData(event = null) {
		this.pageConfig.pageName = 'staff-personnel-family';
		this.query.IDStaff = this.idStaff;
		Promise.all([this.countryProvider.read(), this.env.getType('RelativeType'), this.env.getType('PassportType')])
			.then((values) => {
				this.countryList = values[0]['data'];
				this.relativeTypeList = values[1];
				this.passportTypeList = values[2];
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

	bindName() {
		if (this.formGroup && this.formGroup.controls.FullName.value) {
			let names = this.formGroup.controls.FullName.value.split(' ');
			if (names.length > 1) {
				this.formGroup.controls.FirstName.setValue(names[names.length - 1]);
				this.formGroup.controls.LastName.setValue(names[0]);
				this.formGroup.controls.ShortName.setValue(names[names.length - 1] + ' ' + names[0]);
				this.formGroup.get('FirstName').markAsDirty();
				this.formGroup.get('LastName').markAsDirty();
				this.formGroup.get('ShortName').markAsDirty();
				if (names.length > 2) {
					this.formGroup.controls.MiddleName.setValue('');
					for (var i = 1; i <= names.length - 2; i++) {
						this.formGroup.controls.MiddleName.setValue(this.formGroup.controls.MiddleName.value + names[i] + ' ');
					}
					this.formGroup.controls.MiddleName.setValue(this.formGroup.controls.MiddleName.value.trim());
					this.formGroup.controls.MiddleName.markAsDirty();
				}
			}
		}
	}
}
