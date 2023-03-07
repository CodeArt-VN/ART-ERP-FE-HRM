import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffProvider, HRM_Staff_ConcurrentPositionProvider, BRA_BranchProvider } from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { FileUploader } from 'ng2-file-upload';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CompareValidator } from 'src/app/services/core/validators';
import { ACCOUNT_ApplicationUserProvider } from 'src/app/services/custom.service';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-staff-detail',
    templateUrl: './staff-detail.page.html',
    styleUrls: ['./staff-detail.page.scss'],
})
export class StaffDetailPage extends PageBase {

    avatarURL = 'assets/imgs/avartar-empty.jpg';
    @ViewChild('importfile') importfile: any;

    uploader: FileUploader = new FileUploader({
        url: '',
        authTokenHeader: "Authorization",
        authToken: this.commonService.getToken(),
        queueLimit: 1,
        allowedFileType: ['image']
    });
    hasBaseDropZoneOver = false;

    activePage = 'page-1';
    baseServiceURL = ApiSetting.mainService.base;
    showLogout = false;


    passwordViewType = 'password';
    showRolesEdit = false;
    userAccount: any = {};
    changePasswordForm: FormGroup;

    roles = [];
    staffInRoles = [];
    staffInRole: any = {};

    minDOB = ''
    maxDOB = ''

    jobTitleList = [];
    workAreaList = [];

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
        public commonService: CommonService
    ) {
        super();

        this.pageConfig.isDetailPage = true;
        this.id = this.route.snapshot.paramMap.get('id');

        this.formGroup = formBuilder.group({
            Id: new FormControl({ value: '', disabled: true }),
            IDBranch: new FormControl(),
            Code: [{ value: '' }],
            Name: new FormControl('', Validators.maxLength(128)),
            Remark: new FormControl(),
            IDDepartment: new FormControl('', Validators.required),
            IDJobTitle: new FormControl('', Validators.required),
            Area: new FormControl(),
            IsDisabled: new FormControl({ value: false, disabled: true }),
            LastName: new FormControl(),
            Title: new FormControl(),
            FirstName: new FormControl(),
            FullName: new FormControl('', Validators.required),
            ShortName: new FormControl(),
            Gender: new FormControl(),
            DOB: new FormControl(),
            PhoneNumber: new FormControl(),
            Email: new FormControl(),
            Address: new FormControl(),
            ImageURL: new FormControl(),
            IdentityCardNumber: new FormControl(),
            Domicile: new FormControl(),
            DateOfIssueID: new FormControl(),
            IssuedBy: new FormControl(),
            BackgroundColor: new FormControl(),
        });

        this.changePasswordForm = formBuilder.group({
            Email: ['', Validators.required],
            oldPassword: new FormControl(),
            newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
            confirmPassword: ['', Validators.compose([Validators.required, CompareValidator.confirmPassword])]
        });
        this.changePasswordForm.controls['confirmPassword'].setParent(this.changePasswordForm);

        this.uploader.onBeforeUploadItem = (item) => {
            let UploadAPI = ApiSetting.apiDomain('CUS/FILE/UploadAvatar/' + this.item.Code);
            item.url = UploadAPI;
        }

        this.uploader.onSuccessItem = (item, response, status: number, headers) => {

            this.uploader.clearQueue();
            //console.log(response);
            this.avatarURL = environment.staffAvatarsServer + this.item.Code + '.jpg?t=' + new Date().getTime();

            if (this.env.user.Email == this.item.Email) {
                //reload avatar in user cp
                this.env.user.Avatar = this.avatarURL;

                //this.accountService.setProfile(GlobalData.Profile);
                //this.events.publish('app:UpdateAvatar', this.avatarURL);
                //console.log('app:UpdateAvatar');
            }
        }

        let cYear = (new Date()).getFullYear();
        this.minDOB = (cYear - 70) + '-01-01';
        this.maxDOB = (cYear - 16) + '-12-31';

    }



    async loadedData(event) {
        if (this.id && this.item) {
            this.avatarURL = environment.staffAvatarsServer + this.item.Code + '.jpg?t=' + new Date().getTime();
            this.item.DateOfIssueID = lib.dateFormat(this.item.DateOfIssueID, 'yyyy-mm-dd');
            if (this.item.Email) {
                this.urserProvider.getAnItem(this.item.Id, '').then((ite) => {
                    if (ite) {
                        this.userAccount = ite
                        this.changePasswordForm.patchValue(this.userAccount);
                        this.changePasswordForm.markAsPristine();
                        this.cdr.detectChanges();
                    }
                    else {
                        this.userAccount = {};
                        this.userAccount.Id = '';
                        this.changePasswordForm.reset();
                    }
                }).catch((data) => {
                    this.userAccount.Id = 0;
                    this.changePasswordForm.reset();
                });
            }
            setTimeout(() => {
                this.changeDepartment();
            }, 100);

        }


        //this.showRolesEdit = GlobalData.Profile.Roles.SYSRoles.indexOf('HOST') > -1;

        super.loadedData(event)

        this.formGroup?.reset();
        this.formGroup?.patchValue(this.item);
    }

    async saveChange() {
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
        this.env.getJobTitle(selectedDepartment, true).then(result => {
            this.jobTitleList = [...result];
        });

        this.env.getType('WorkAreaType').then(result => {
            this.workAreaList = [...result];
        })
    }

    markNestedNode(ls, Id) {
        ls.filter(d => d.IDParent == Id).forEach(i => {
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
            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.account-locked', 'warning');
        }
        else {
            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.account-normal', 'warning');
        }
        this.urserProvider.save(this.userAccount).then(() => {
            this.env.publishEvent({ Code: 'changeAccount' });
        })
    }

    changeRole(role) {

    }

    checkRole(role) {
        return false;
    }

    //https://www.google.com/maps/dir/?api=1&origin=10.764310,106.764643&destination=10.764310,106.764643&waypoints=10.7830526,106.94224159999999|10.791549,107.07479179999996|10.7915375,107.0749568|10.7922551,107.0781187|10.725809,107.05181330000005|10.7897802,107.10178040000005
    //https://www.google.com/maps/dir/10.7830526,106.94224159999999/10.791549,107.07479179999996/10.7915375,107.0749568/10.7922551,107.0781187/10.725809,107.05181330000005/10.7897802,107.10178040000005


    onFileSelected() {

    }

    selectFile() {

    }

    fileOverBase(e) {

    }

    async createAccount() {
        if (!this.changePasswordForm.valid) {
            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.check-red-above', 'warning');
        }
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                message: 'Đang dữ liệu...'
            });
            await loading.present().then(() => {
                this.userAccount.Id = '';
                //this.userAccount.Email = this.item.Email;
                this.userAccount.FullName = this.item.FullName;
                this.userAccount.Avatar = 'Uploads/HRM/Staffs/Avatars/' + this.item.Id + '.jpg';
                this.userAccount.PhoneNumber = this.item.PhoneNumber;
                this.userAccount.Address = this.item.Address;
                this.userAccount.StaffID = this.item.Id;
                this.userAccount.PartnerID = this.item.IDPartner;
                this.userAccount.UserName = this.changePasswordForm.controls.newPassword.value; //UserName => Password on server

                this.urserProvider.save(this.userAccount)
                    .then((newId: any) => {
                        this.userAccount.Id = newId;
                        if (this.userAccount.Email != this.item.Email) {
                            this.item.Email = this.userAccount.Email;

                        }

                        this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.create-account-with-value', 'success', this.userAccount.Email);
                        if (loading) loading.dismiss();
                        this.changePasswordForm.markAsPristine();
                        this.cdr.detectChanges();

                    })
                    .catch(err => {
                        if (loading) loading.dismiss();
                        if (err.error && err.error.Message && err.error.Message.indexOf('Account with email is exits') > -1) {
                            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.email-registerd', 'danger');
                        }
                        else {
                            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.can-not-save', 'danger');
                        }

                        this.cdr.detectChanges();
                    });
            });

        }
    }

    async resetPassword() {
        if (!this.changePasswordForm.valid) {
            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.check-red-above', 'danger');
        }
        else {
            const loading = await this.loadingController.create({
                cssClass: 'my-custom-class',
                message: 'Đang dữ liệu...'
            });

            await loading.present().then(() => {

                this.urserProvider.resetPassword(this.userAccount.Id, this.changePasswordForm.controls.newPassword.value, this.changePasswordForm.controls.confirmPassword.value)
                    .then((savedItem: any) => {
                        this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.update-password-complete', 'success');

                        this.cdr.detectChanges();
                        this.changePasswordForm.markAsPristine();
                        if (loading) loading.dismiss();

                    })
                    .catch(err => {
                        if (err._body.indexOf('confirmation password do not match') > -1) {
                            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.confirmation-password-not-match', 'danger');
                        }
                        else if (err._body.indexOf('least 6 characters') > -1) {
                            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.least-6-char', 'danger');
                        }
                        else {
                            this.env.showTranslateMessage('erp.app.pages.hrm.staff.message.can-not-save', 'danger');
                        }
                        if (loading) loading.dismiss();
                        this.cdr.detectChanges();
                    });
            });

        }
    }

}
