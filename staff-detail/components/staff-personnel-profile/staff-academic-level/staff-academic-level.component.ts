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
	academicRankTypeList = [];
	academicLevelTypeList = [];
	degreeTypeList = [];
	isShowModal = false;
	@Input() IDStaff;
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

	buildFormGroup(row = null) {
		this.formGroup = this.formBuilder.group({
			Id: new FormControl({ value: row?.Id, disabled: true }),
			IDStaff: [this.IDStaff],
			Code: [row?.Code],
			Name: [row?.Name],
			Remark: [row?.Remark],
			AcademicLevel:[row?.AcademicLevel],
			AcademicRank:[row?.AcademicRank],
			Degree:[row?.Degree],
			CreatedBy: new FormControl({ value: row?.CreatedBy, disabled: true }),
			CreatedDate: new FormControl({ value: row?.CreatedDate, disabled: true }),
			ModifiedBy: new FormControl({ value: row?.ModifiedBy, disabled: true }),
			ModifiedDate: new FormControl({ value: row?.ModifiedDate, disabled: true }),
		});
		this.formGroup.get('IDStaff').markAsDirty();
	}

	preLoadData(event = null) {
		this.query.IDStaff = this.IDStaff;
		
		Promise.all([this.env.getType('AcademicRank'), this.env.getType('AcademicLevel'),this.env.getType('Degree')])
			.then((values) => {
				this.academicRankTypeList = values[0];
				this.academicLevelTypeList = values[1];
				this.degreeTypeList = values[2];
				if(this.academicRankTypeList.length == 0){
					this.academicRankTypeList = [
						{Code: 'Professor', Name: 'Professor'},
						{Code: 'Associate Professor', Name: 'Associate Professor'},
						{Code: 'Assistant Professor', Name: 'Assistant Professor'},
						{Code: 'Senior Lecturer', Name: 'Senior Lecturer'},
						{Code: 'Lecturer', Name: 'Lecturer'},
					];

				}
				if (this.academicLevelTypeList.length == 0) {
					this.academicLevelTypeList = [
					  { Code: 'Bachelor', Name: 'Bachelor’s Degree' },
					  { Code: 'Master', Name: 'Master’s Degree' },
					  { Code: 'Doctorate', Name: 'Doctoral Degree (PhD, EdD)' },
					  { Code: 'PostDoctorate', Name: 'Postdoctoral Research' },
					];
				  }
				  
				  // Thiết lập danh sách học vị/bằng cấp (Degree Type)
				  if (this.degreeTypeList.length == 0) {
					this.degreeTypeList = [
					  { Code: 'BA', Name: 'Bachelor of Arts (BA)' },
					  { Code: 'BSc', Name: 'Bachelor of Science (BSc)' },
					  { Code: 'MA', Name: 'Master of Arts (MA)' },
					  { Code: 'MSc', Name: 'Master of Science (MSc)' },
					  { Code: 'MBA', Name: 'Master of Business Administration (MBA)' },
					  { Code: 'PhD', Name: 'Doctor of Philosophy (PhD)' },
					  { Code: 'EdD', Name: 'Doctor of Education (EdD)' },
					  { Code: 'DSc', Name: 'Doctor of Science (DSc)' },
					];
				}
				super.preLoadData(event);
			})
			.catch((error) => {
				console.log(error);
				super.preLoadData();
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
				this.env.showMessage('Delete successully!','success')
			});
		});
	}
}
