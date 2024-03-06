import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
  HRM_StaffProvider,
  HRM_Staff_ConcurrentPositionProvider,
  BRA_BranchProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CompareValidator } from 'src/app/services/core/validators';
import { ACCOUNT_ApplicationUserProvider } from 'src/app/services/custom.service';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-casual-labour-register',
  templateUrl: './casual-labour-register.page.html',
  styleUrls: ['./casual-labour-register.page.scss'],
})
export class CasualLabourRegisterPage extends PageBase {
  avatarURL = 'assets/imgs/avartar-empty.jpg';
  @ViewChild('importfile') importfile: any;

  hasBaseDropZoneOver = false;

  activePage = 'page-1';
  baseServiceURL = ApiSetting.mainService.base;
  showLogout = false;

  passwordViewType = 'password';
  showRolesEdit = false;
  userAccount: any = {};

  roles = [];
  staffInRoles = [];
  staffInRole: any = {};

  minDOB = '';
  maxDOB = '';

  constructor(
    public pageProvider: HRM_StaffProvider,
    public staffConcurrentPositionProvider: HRM_Staff_ConcurrentPositionProvider,
    public branchProvider: BRA_BranchProvider,
    public urserProvider: ACCOUNT_ApplicationUserProvider,
    public env: EnvService,
    public navCtrl: NavController,
    public route: ActivatedRoute,

    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
    public commonService: CommonService,
  ) {
    super();
    console.log(this);
    this.pageConfig.isDetailPage = true;
    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      IDBranch: new FormControl(),
      Code: [{ value: '' }],
      Name: new FormControl('', Validators.maxLength(128)),
      Remark: new FormControl(),
      // IDDepartment: new FormControl('', Validators.required),
      // IDJobTitle: new FormControl('', Validators.required),
      IsDisabled: [
        new FormControl({
          value: false,
          disabled: !this.pageConfig.canArchive,
        }),
      ],

      LastName: new FormControl(),
      Title: new FormControl(),
      FirstName: new FormControl(),
      FullName: new FormControl('', Validators.required),
      IDInterviewer: new FormControl('', Validators.required),
      ShortName: new FormControl(),
      Gender: new FormControl(),
      DOB: new FormControl(),
      PhoneNumber: new FormControl('', Validators.required),

      Address: new FormControl(),
      ImageURL: new FormControl(),

      IdentityCardNumber: new FormControl(),
      Domicile: new FormControl(),
      DateOfIssueID: new FormControl(),
      IssuedBy: new FormControl(),

      BackgroundColor: new FormControl(),

      Email: ['', Validators.required],
      oldPassword: new FormControl(),
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, CompareValidator.confirmPassword])],
    });

    let cYear = new Date().getFullYear();
    this.minDOB = cYear - 70 + '-01-01';
    this.maxDOB = cYear - 16 + '-12-31';
  }

  branchList = [];
  departmentList = [];

  preLoadData() {
    this.id = 0;
    this.pageConfig.canEdit = true;
    this.item = { Id: 0 };

    super.preLoadData(null);
  }

  async loadedData(event) {
    if (this.id && this.item) {
      this.avatarURL = environment.staffAvatarsServer + this.item.Code + '.jpg?t=' + new Date().getTime();
      this.item.DateOfIssueID = lib.dateFormat(this.item.DateOfIssueID, 'yyyy-mm-dd');
    }

    //this.showRolesEdit = GlobalData.Profile.Roles.SYSRoles.indexOf('HOST') > -1;

    super.loadedData(event);

    this.formGroup?.reset();
    this.formGroup?.patchValue(this.item);
    this.staffSearch();
  }

  async saveChange() {}

  async submit() {
    this.bindName();
    super.saveChange();
  }

  bindName() {
    if (this.formGroup && this.formGroup.controls.FullName.value) {
      let names = this.formGroup.controls.FullName.value.split(' ');
      if (names.length > 1) {
        this.formGroup.controls.FirstName.setValue(names[names.length - 1]);
        this.formGroup.controls.LastName.setValue(names[0]);
        this.formGroup.controls.Name.setValue(names[names.length - 1] + ' ' + names[0]);
      }
    }
  }

  changeDepartment() {
    let selectedDepartment = this.formGroup.controls.IDDepartment.value;
    this.branchList.forEach((b) => {
      b.Flag = false;
    });
    this.markNestedNode(this.branchList, selectedDepartment);
  }
  markNestedNode(ls, Id) {
    ls.filter((d) => d.IDParent == Id).forEach((i) => {
      i.Flag = true;
      this.markNestedNode(ls, i.Id);
    });
  }

  segmentView = 's1';
  segmentChanged(ev: any) {
    this.segmentView = ev.detail.value;
  }

  changeLock() {
    this.userAccount.LockoutEnabled = !this.userAccount.LockoutEnabled;
    if (this.userAccount.LockoutEnabled) {
      this.env.showTranslateMessage('Account has been locked, cannot log in', 'warning');
    } else {
      this.env.showTranslateMessage('Account functions normally', 'warning');
    }
    this.urserProvider.save(this.userAccount).then(() => {
      this.env.publishEvent({ Code: 'changeAccount' });
    });
  }

  changeRole(role) {}

  checkRole(role) {
    return false;
  }

  //https://www.google.com/maps/dir/?api=1&origin=10.764310,106.764643&destination=10.764310,106.764643&waypoints=10.7830526,106.94224159999999|10.791549,107.07479179999996|10.7915375,107.0749568|10.7922551,107.0781187|10.725809,107.05181330000005|10.7897802,107.10178040000005
  //https://www.google.com/maps/dir/10.7830526,106.94224159999999/10.791549,107.07479179999996/10.7915375,107.0749568/10.7922551,107.0781187/10.725809,107.05181330000005/10.7897802,107.10178040000005

  onFileSelected() {}

  selectFile() {}

  fileOverBase(e) {}

  staffList$;
  staffListLoading = false;
  staffListInput$ = new Subject<string>();
  staffListSelected = [];
  staffSelected = null;
  staffSearch() {
    this.staffListLoading = false;
    this.staffList$ = concat(
      of(this.staffListSelected),
      this.staffListInput$.pipe(
        distinctUntilChanged(),
        tap(() => (this.staffListLoading = true)),
        switchMap((term) =>
          this.pageProvider.search({ Take: 20, Skip: 0, Term: term }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.staffListLoading = false)),
          ),
        ),
      ),
    );
  }
}
