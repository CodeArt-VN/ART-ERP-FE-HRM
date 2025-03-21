import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffAcademicLevelProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-academic-level',
	templateUrl: './staff-academic-level.component.html',
	styleUrls: ['./staff-academic-level.component.scss'],
	standalone: false,
})
export class StaffAcademicLevelComponent extends PageBase {
	countryList = [];
	relativeTypeList = [];
	passportTypeList = [];
	isShowModal = false;
	@Input() idStaff;

	constructor(
		public pageProvider: HRM_StaffAcademicLevelProvider,
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

	buildFormGroup() {
		this.formGroup = this.formBuilder.group({
			Id: [''],
			Code: [''],
			Name: [''],
			Remark: [''],
			Relative: [''],
			FirstName: ['', Validators.required],
			LastName: ['', Validators.required],
			MiddleName: ['', Validators.required],
			FullName: [''],
			ShortName: [''],
			Gender: ['', Validators.required],
			Age: [''],
			DOB: ['', Validators.required],
			IdentityCardNumber: ['', Validators.required],
			DateOfIssueID: ['', Validators.required],
			PlaceOfIssueID: ['', Validators.required],
			DateOfExpiryID: ['', Validators.required],
			PassportNumber: [''],
			DateOfIssuePassport: [''],
			DateOfExpiryPassport: [''],
			PlaceOfIssuePassport: [''],
			TypeOfPassport: [''],
			IDCountryOfIssuePassport: [''],
			IsDependent: [''],
			HomeAddress: [''],
		});
	}

	preLoadData(event = null) {
		this.query.IDStaff = this.idStaff;
		Promise.all([this.countryProvider.read(), this.env.getType('RelativeType'), this.env.getType('PassportType')])
			.then((values) => {
				this.countryList = values[0]['data'];
				this.relativeTypeList = values[1];
				this.passportTypeList = values[2];
				super.loadData(event);
			})
			.catch((error) => {
				console.log(error);
				super.loadData();
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

	saveChange(publishEventCode?: any): Promise<unknown> {
		return super.saveChange2();
	}

	addRow() {
		this.formGroup = this.formBuilder.group({
			Id: [0],
			Code: [''],
			Name: [''],
			Remark: [''],
			Relative: [''],
			FirstName: ['', Validators.required],
			LastName: ['', Validators.required],
			MiddleName: ['', Validators.required],
			FullName: [''], //,Validators.required
			IDStaff: [this.idStaff],
			Gender: ['', Validators.required],
			DOB: ['', Validators.required],
			IdentityCardNumber: ['', Validators.required],
			DateOfIssueID: ['', Validators.required],
			PlaceOfIssueID: ['', Validators.required],
			DateOfExpiryID: ['', Validators.required],
			PassportNumber: [''],
			DateOfIssuePassport: [''],
			DateOfExpiryPassport: [''],
			PlaceOfIssuePassport: [''],
			TypeOfPassport: [''],
			IDCountryOfIssuePassport: [''],
			IsDependent: [''],
			HomeAddress: [''],
		});
		this.formGroup.controls.IDStaff.markAsDirty();
		this.isShowModal = true;
	}

	editRow(row) {
		//Create formGroup of row
		this.formGroup = this.formBuilder.group({
			Id: [row.Id],
			Code: [row.Code],
			Name: [row.Name],
			Remark: [row.Remark],
			Relative: [row.Relative],
			FirstName: [row.FirstName, Validators.required],
			LastName: [row.LastName, Validators.required],
			MiddleName: [row.MiddleName, Validators.required],
			FullName: [row.FullName], //,Validators.required
			IDStaff: [row.IDStaff],
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
			IDCountryOfIssuePassport: [row.IDCountryOfIssuePassport],
			IsDependent: [row.IsDependent],
			HomeAddress: [row.HomeAddress],
		});
		this.isShowModal = true;
	}

	deleteRow(row) {
		let Ids = [];
		Ids.push({
			Id: row.Id,
		});
		this.env.showPrompt(null, 'Bạn có chắc muốn xóa không?').then((_) => {
			this.pageProvider.delete(Ids).then((resp) => {
				this.loadData();
			});
		});
	}
}
