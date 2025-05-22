import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffForeignLanguageProvider, LIST_CountryProvider } from 'src/app/services/static/services.service';

@Component({
	selector: 'app-staff-foreign-language',
	templateUrl: './staff-foreign-language.component.html',
	styleUrls: ['./staff-foreign-language.component.scss'],
	standalone: false,
})
export class StaffForeignLanguageComponent extends PageBase {
	foreignLanguageList = [];
	certificateTypeList = [];
	degreeTypeList = [];
	isShowModal = false;
	@Input() IDStaff;
	constructor(
		public pageProvider: HRM_StaffForeignLanguageProvider,
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
			ListeningSkill:[row?.ListeningSkill],
			SpeakingSkill:[row?.SpeakingSkill],
			ReadingSkill:[row?.ReadingSkill],
			WritingSkill:[row?.WritingSkill],
			DateOfIssue:[row?.DateOfIssue],
			PlaceOfIssue:[row?.PlaceOfIssue],
			DateOfExpiry:[row?.DateOfExpiry],
			CertificateType:[row?.CertificateType],
			CertificateNumber:[row?.CertificateNumber],
			ForeignLanguage:[row?.ForeignLanguage],
			CreatedBy: new FormControl({ value: row?.CreatedBy, disabled: true }),
			CreatedDate: new FormControl({ value: row?.CreatedDate, disabled: true }),
			ModifiedBy: new FormControl({ value: row?.ModifiedBy, disabled: true }),
			ModifiedDate: new FormControl({ value: row?.ModifiedDate, disabled: true }),
		});
		this.formGroup.get('IDStaff').markAsDirty();
	}

	preLoadData(event = null) {
		this.query.IDStaff = this.IDStaff;
		
		Promise.all([this.env.getType('ForeignLanguage'), this.env.getType('CertificateType')])
			.then((values) => {
				this.foreignLanguageList = values[0];
				this.certificateTypeList = values[1];
				if(this.foreignLanguageList.length == 0){
					this.foreignLanguageList = [
						{Code: 'English', Name: 'English'},
						{Code: 'Vietnamese', Name: 'Vietnamese'},
						{Code: 'Chinese', Name: 'Chinese'},
						{Code: 'Japanese', Name: 'Japanese'},
					];

				}
				if (this.certificateTypeList.length == 0) {
					this.certificateTypeList = [
					  { Code: 'TOEFL', Name: 'TOEFL Certificate' },
					  { Code: 'IELTS', Name: 'IELTS Certificate' },
					  { Code: 'HSK', Name: 'HSK Certificate (Chinese Proficiency)' },
					  { Code: 'JLPT', Name: 'JLPT Certificate (Japanese Proficiency)' },
					  { Code: 'MOS', Name: 'Microsoft Office Specialist (MOS)' },
					  { Code: 'PMP', Name: 'Project Management Professional (PMP)' },
					  { Code: 'AWS', Name: 'AWS Certified Solutions Architect' },
					  { Code: 'CCNA', Name: 'Cisco Certified Network Associate (CCNA)' },
					  { Code: 'CPA', Name: 'Certified Public Accountant (CPA)' },
					  { Code: 'CFA', Name: 'Chartered Financial Analyst (CFA)' },
					];
				  }
				  // Thiết lập danh sách học vị/bằng cấp (Degree Type)
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
