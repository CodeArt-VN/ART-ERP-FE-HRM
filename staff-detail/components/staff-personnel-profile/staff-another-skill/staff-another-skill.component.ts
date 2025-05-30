import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffAnotherSkillProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-another-skill',
	templateUrl: './staff-another-skill.component.html',
	styleUrls: ['./staff-another-skill.component.scss'],
	standalone: false,
})
export class StaffAnotherSkillComponent extends PageBase {
	isShowModal = false;
	@Input() IDStaff;
	constructor(
		public pageProvider: HRM_StaffAnotherSkillProvider,
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
			Type:[row?.Type],
			CreatedBy: new FormControl({ value: row?.CreatedBy, disabled: true }),
			CreatedDate: new FormControl({ value: row?.CreatedDate, disabled: true }),
			ModifiedBy: new FormControl({ value: row?.ModifiedBy, disabled: true }),
			ModifiedDate: new FormControl({ value: row?.ModifiedDate, disabled: true }),
		});
		this.formGroup.get('IDStaff').markAsDirty();
	}

	preLoadData(event = null) {
		this.query.IDStaff = this.IDStaff;
		super.preLoadData(event);
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
				this.env.showMessage('Delete successully!','success')
			});
		});
	}
}
