import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, PopoverController, IonAccordionGroup } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffProvider, HRM_Staff_ConcurrentPositionProvider, BRA_BranchProvider, LIST_AddressSubdivisionProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CompareValidator } from 'src/app/services/util/validators';
import { ACCOUNT_ApplicationUserProvider } from 'src/app/services/custom/custom.service';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-staff-detail',
	templateUrl: './staff-detail.page.html',
	styleUrls: ['./staff-detail.page.scss'],
	standalone: false,
})
export class StaffDetailPage extends PageBase {
	@ViewChild('accordionGroup', { static: true }) accordionGroup: IonAccordionGroup;

	avatarURL = 'assets/imgs/avartar-empty.jpg';
	@ViewChild('importfile') importfile: any;

	hasBaseDropZoneOver = false;

	activePage = 'page-1';
	showLogout = false;

	passwordViewType = 'password';
	showRolesEdit = false;
	userAccount: any = {};
	changePasswordForm: FormGroup;

	roles = [];
	staffInRoles = [];
	staffInRole: any = {};

	optionGroup = [
		{
			Code: 'personnel-profile',
			Name: 'Personnel profile',
			Remark: 'Personal, legal and background information',
			Icon: 'person-outline',
		},
		{
			Code: 'job-information',
			Name: 'Job information',
			Remark: 'Jobs, career, recruitment...',
			Icon: 'flag-outline',
		},
		{
			Code: 'salary-benefits',
			Name: 'Salary & benefits',
			Remark: 'Payroll & benefits',
			Icon: 'wallet-outline',
		},
		{
			Code: 'assigned-tasks',
			Name: 'Assigned tasks',
			Remark: 'Job functions and feedbacks',
			Icon: 'book-outline',
		},
		{
			Code: 'achievements-awards',
			Name: 'Achievements & awards',
			Remark: 'Certificates, Awards, Appreciation...',
			Icon: 'ribbon-outline',
		},
		{
			Code: 'violate',
			Name: 'Violate',
			Remark: 'Violations of working regulations',
			Icon: 'warning-outline',
		},
		{
			Code: 'reviews-feedback',
			Name: 'Reviews & feedback',
			Remark: 'Performance management and features',
			Icon: 'reader-outline',
		},
		{
			Code: 'contracts-documents',
			Name: 'Contracts & documents',
			Remark: 'Contracts & HR Documents',
			Icon: 'documents-outline',
		},
		{
			Code: 'work-schedule',
			Name: 'Work schedule & leave',
			Remark: 'Timesheets, Checkins & Timeoffs',
			Icon: 'calendar-clear-outline',
		},
		{
			Code: 'company-assets',
			Name: 'Company assets',
			Remark: 'Intellectual properties and Physic...',
			Icon: 'desktop-outline',
		},
		{
			Code: 'employment-status',
			Name: 'Employment status',
			Remark: 'Status, on-leave, terminations',
			Icon: 'push-outline',
		},
		{
			Code: 'active-data',
			Name: 'Active data',
			Remark: 'Personal, legal and background information',
			Icon: 'create-outline',
		},
	];
	constructor(
		public pageProvider: HRM_StaffProvider,
		public staffConcurrentPositionProvider: HRM_Staff_ConcurrentPositionProvider,
		public branchProvider: BRA_BranchProvider,
		public addressSubdivisionProvider: LIST_AddressSubdivisionProvider,
		public urserProvider: ACCOUNT_ApplicationUserProvider,
		public popoverCtrl: PopoverController,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public httpClient: HttpClient,

		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();

		this.pageConfig.isDetailPage = true;
		this.pageConfig.isShowFeature = true;
		this.pageConfig.isFeatureAsMain = true;
		this.id = this.route.snapshot.paramMap.get('id');

		this.formGroup = formBuilder.group({
			IDBranch: new FormControl({ value: null, disabled: false }),
			Id: new FormControl({ value: '', disabled: true }),
			IDDepartment: new FormControl({ value: '', disabled: true }),
			IDJobTitle: new FormControl({ value: '', disabled: true }),
			Code: new FormControl(),
			Name: new FormControl('', Validators.maxLength(512)),
			Remark: new FormControl(),
			CreatedBy: new FormControl({ value: '', disabled: true }),
			CreatedDate: new FormControl({ value: '', disabled: true }),
			ModifiedBy: new FormControl({ value: '', disabled: true }),
			ModifiedDate: new FormControl({ value: '', disabled: true }),
			IsDisabled: new FormControl({ value: false, disabled: true }),
			Email: new FormControl(''),
			PhoneNumber: new FormControl(''),
			Company: new FormControl(''),
			FullName: new FormControl('', Validators.required),
			ShortName: new FormControl(),
			Gender: new FormControl(),
			ImageURL: new FormControl(),
			BackgroundColor: new FormControl(),
		});
	}

	loadedData(event) {
		this.avatarURL = environment.staffAvatarsServer + this.item.Code + '.jpg?t=' + new Date().getTime();
		super.loadedData();
		this.getCompany(this.formGroup.controls.IDDepartment.value);
	}

	getCompany(id) {
		let currentBranch = this.env.branchList.find((d) => d.Id == id);
		if (currentBranch) {
			if (currentBranch.Type == 'Company') {
				this.formGroup.get('Company').setValue(currentBranch);
				return;
			}
			this.getCompany(currentBranch.IDParent);
		}
	}

	segmentView: any = {
		Page: 'personnel-profile',
	};
	segmentChanged(ev: any) {
		this.pageConfig.isSubActive = true;
		this.segmentView.Page = ev;
	}

	selectedOption = null;

	loadNode(option = null) {
		this.pageConfig.isSubActive = true;
		if (!option && this.segmentView) {
			option = this.optionGroup.find((d) => d.Code == this.segmentView.Page);
		}

		if (!option) {
			option = this.optionGroup[0];
		}

		if (!option) {
			return;
		}

		this.selectedOption = option;

		this.segmentView.Page = option.Code;
	}
}
