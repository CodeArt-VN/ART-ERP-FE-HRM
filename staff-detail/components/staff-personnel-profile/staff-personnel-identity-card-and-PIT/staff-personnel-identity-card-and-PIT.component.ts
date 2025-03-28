import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { er } from '@fullcalendar/core/internal-common';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { HRM_StaffIdentityCardAndPIT } from 'src/app/models/model-list-interface';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffFamilyProvider, HRM_StaffIdentityCardAndPITProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-personnel-identity-card-and-PIT',
	templateUrl: './staff-personnel-identity-card-and-PIT.component.html',
	styleUrls: ['./staff-personnel-identity-card-and-PIT.component.scss'],
	standalone: false,
})
export class StaffPersonnelIdentityCardAndPITComponent extends PageBase {
	countryList = [];
	typeList = [];
	isShowModal = false;
	@Input() idStaff;

	constructor(
		public pageProvider: HRM_StaffIdentityCardAndPITProvider,
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
			IsDeleted: [row.IsDeleted],
			IsDisabled: [row.IsDisabled],
			CreatedBy: [row.CreatedBy],
			ModifiedBy: [row.ModifiedBy],
			CreatedDate: [row.CreatedDate],
			ModifiedDate: [row.ModifiedDate],
			CardNumber: [row.CardNumber, Validators.required],
			DateOfIssue: [row.DateOfIssue, Validators.required],
			PlaceOfIssue: [row.PlaceOfIssue, Validators.required],
			DateOfExpiry: [row.DateOfExpiry, Validators.required],
			CountryOfIssue: [row.CountryOfIssue, Validators.required],
			Type: ['IdentityCard', Validators.required],
			IDStaff: [this.idStaff],
		});
	}

	preLoadData(event = null) {
		super.preLoadData;
		this.query.IDStaff = this.idStaff;
		this.query.IsDisabled = 'skipped';
		Promise.all([this.countryProvider.read(), this.env.getType('CardAndPITType')])
			.then((values) => {
				this.countryList = values[0]['data'];
				this.typeList = values[1];
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

	savedChange(savedItem?: any, form?: FormGroup<any>): void {
		super.savedChange(savedItem, form);
		this.env.showPrompt(null, 'Do you want to use this identifier?').then((_) => {
			this.active(savedItem.Id);
		});
	}

	addRow() {
		this.buildFormGroup({});
		this.formGroup.controls.IDStaff.markAsDirty();
		this.formGroup.controls.Type.markAsDirty();
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
				this.env.showMessage('Deleted', 'success');
			});
		});
	}

	active(id) {
		let postDTO = { Id: id };
		this.pageProvider.commonService
			.connect('POST', 'HRM/StaffIdentityCardAndPIT/Activate', postDTO)
			.toPromise()
			.then((resp) => {
				this.refresh();
			});
	}
}
