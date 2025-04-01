import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffSpecializedFieldProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-specialized-field',
	templateUrl: './staff-specialized-field.component.html',
	styleUrls: ['./staff-specialized-field.component.scss'],
	standalone: false,
})
export class StaffSpecializedFieldComponent extends PageBase {
	specializedFieldList = [];
	isShowModal = false;
	@Input() IDStaff;
	constructor(
		public pageProvider: HRM_StaffSpecializedFieldProvider,
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

	buildFormGroup(row = null) {
		this.formGroup = this.formBuilder.group({
			Id: new FormControl({ value: row?.Id, disabled: true }),
			IDStaff: [this.IDStaff],
			Code: [row?.Code],
			Name: [row?.Name],
			Remark: [row?.Remark],
			Type: [row?.Type],
			CreatedBy: new FormControl({ value: row?.CreatedBy, disabled: true }),
			CreatedDate: new FormControl({ value: row?.CreatedDate, disabled: true }),
			ModifiedBy: new FormControl({ value: row?.ModifiedBy, disabled: true }),
			ModifiedDate: new FormControl({ value: row?.ModifiedDate, disabled: true }),
		});
		this.formGroup.get('IDStaff').markAsDirty();
	}

	preLoadData(event = null) {
		this.query.IDStaff = this.IDStaff;
		Promise.all([this.env.getType('SpecializedField')]).then((values) => {
			this.specializedFieldList = values[0];
			if (this.specializedFieldList.length == 0) {
				this.specializedFieldList = [
					{ Code: 'IT', Name: 'Information Technology' },
					{ Code: 'CS', Name: 'Computer Science' },
					{ Code: 'SE', Name: 'Software Engineering' },
					{ Code: 'AI', Name: 'Artificial Intelligence' },
					{ Code: 'DS', Name: 'Data Science' },
					{ Code: 'EE', Name: 'Electrical Engineering' },
					{ Code: 'ME', Name: 'Mechanical Engineering' },
					{ Code: 'CE', Name: 'Civil Engineering' },
					{ Code: 'BIO', Name: 'Biotechnology' },
					{ Code: 'MED', Name: 'Medicine' },
					{ Code: 'PHAR', Name: 'Pharmacy' },
					{ Code: 'LAW', Name: 'Law' },
					{ Code: 'MKT', Name: 'Marketing' },
					{ Code: 'FIN', Name: 'Finance' },
					{ Code: 'ACC', Name: 'Accounting' },
					{ Code: 'ECO', Name: 'Economics' },
					{ Code: 'HRM', Name: 'Human Resource Management' },
					{ Code: 'EDU', Name: 'Education' },
					{ Code: 'ART', Name: 'Arts & Design' },
					{ Code: 'ARCH', Name: 'Architecture' },
				];
			}
			super.preLoadData(event);
		});
	}

	dismissModal(flag?) {
		this.isShowModal = false;
		if (flag) {
			this.saveChange2();
		}
	}

	addRow() {
		this.buildFormGroup();
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
				this.env.showMessage('Delete successully!', 'success');
			});
		});
	}
}
