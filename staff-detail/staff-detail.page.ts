import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, PopoverController, IonAccordionGroup } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
  HRM_StaffProvider,
  HRM_Staff_ConcurrentPositionProvider,
  BRA_BranchProvider,
  LIST_AddressSubdivisionProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { CompareValidator } from 'src/app/services/core/validators';
import { ACCOUNT_ApplicationUserProvider } from 'src/app/services/custom.service';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';
import { catchError, map, Observable, of } from 'rxjs';
import {HttpClientModule, HttpClientJsonpModule, HttpClient } from '@angular/common/http';
import { LIST_AddressSubdivision } from 'src/app/models/model-list-interface';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.page.html',
  styleUrls: ['./staff-detail.page.scss'],
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
  openedFields = [];
  provinceDataSource :any ;
  districtDataSource :any;

  minDOB = '';
  maxDOB = '';
   mapLoaded: Observable<boolean>;
  center: google.maps.LatLngLiteral = {
    lat: 11.0517262,
    lng: 106.8842023,
  };
  options = {
    scrollwheel: false,
    disableDoubleClickZoom: true,
    streetViewControl: false,
    mapTypeControl: false,
    controlSize: 30,
    zoom: 16,
    styles: [
      {
        featureType: 'poi',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
      {
        featureType: 'transit',
        stylers: [
          {
            visibility: 'off',
          },
        ],
      },
    ],
  };
  markerOptions: google.maps.MarkerOptions = {
    draggable: true,
  };


  jobTitleList = [];
  workAreaList = [];
  hrAddressTypeList = [];
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
    public commonService: CommonService,
  ) {
    super();

    this.pageConfig.isDetailPage = true;
    this.pageConfig.isShowFeature = true;
    this.pageConfig.isFeatureAsMain = true;
    this.id = this.route.snapshot.paramMap.get('id');

    this.formGroup = formBuilder.group({
      IDBranch: new FormControl({ value: null, disabled: false }),
      Id: new FormControl({ value: '', disabled: true }),
      Code: new FormControl(),
      Name: new FormControl('', Validators.maxLength(512)),
      Remark: new FormControl(),
      CreatedBy: new FormControl({ value: '', disabled: true }),
      CreatedDate: new FormControl({ value: '', disabled: true }),
      ModifiedBy: new FormControl({ value: '', disabled: true }),
      ModifiedDate: new FormControl({ value: '', disabled: true }),
      
      IDDepartment: new FormControl('', Validators.required),
      IDJobTitle: new FormControl('', Validators.required),
      Company: [],
      Area: new FormControl(),

      Addresses: new FormArray([]),
      DeletedAddressFields: [[]],

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
      confirmPassword: ['', Validators.compose([Validators.required, CompareValidator.confirmPassword])],
    });
    this.changePasswordForm.controls['confirmPassword'].setParent(this.changePasswordForm);

    let cYear = new Date().getFullYear();
    this.minDOB = cYear - 70 + '-01-01';
    this.maxDOB = cYear - 16 + '-12-31';
  
  }
  initMap() {
    console.log('aaa');
    
  }
  preLoadData(event = null){
    Promise.all([ 
      this.env.getType('HRAddressType'),
      this.addressSubdivisionProvider.read(),
    ])
   .then(values=>{
      this.hrAddressTypeList = values[0];
      if(values[1] && values[1]['data']?.length>0){
        this.provinceDataSource = [...values[1]['data']].filter(d=> d.Type == 'ProvincialLevel');
        this.districtDataSource = [...values[1]['data']].filter(d=> d.Type == 'MunicipalLevel');
      }
      super.preLoadData(event);
    }).catch(err=>{
      super.preLoadData(event);
    })
  }
  async loadedData(event) {
      
    if (!this.env.isMapLoaded) {
    this.mapLoaded =  this.httpClient
        .jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyAtyM-Th784YwQUTquYa0WlFIj8C6RB2uM', 'callback')
        .pipe(
          map(() => { 
            console.log('Google Maps loaded successfully');
            this.env.isMapLoaded = true;
            this.initMap();
            return true;
          }),
          catchError((err) => {
            console.log(err);
            return of(false);
          }),
        );
    } else {
      this.initMap();
    }
    if (this.id && this.item) {
      this.avatarURL = environment.staffAvatarsServer + this.item.Code + '.jpg?t=' + new Date().getTime();
      this.item.DateOfIssueID = lib.dateFormat(this.item.DateOfIssueID, 'yyyy-mm-dd');
      if (this.item.Email) {
        this.urserProvider
          .getAnItem(this.item.Id, '')
          .then((ite) => {
            if (ite) {
              this.userAccount = ite;
              this.changePasswordForm.patchValue(this.userAccount);
              this.changePasswordForm.markAsPristine();
              this.cdr.detectChanges();
            } else {
              this.userAccount = {};
              this.userAccount.Id = '';
              this.changePasswordForm.reset();
            }
          })
          .catch((data) => {
            this.userAccount.Id = 0;
            this.changePasswordForm.reset();
          });
      }
      setTimeout(() => {
        this.changeDepartment();
      }, 100);
      this.env.getBranch(this.item?.IDBranch).then(rs=>{
        console.log(rs);
      })

      if (this.item.Addresses?.length > 0) {
        this.item.Addresses = this.item.Addresses?.sort((a, b) => a.Sort - b.Sort);
        let groups = this.formGroup.get('Addresses') as FormArray;
        groups.clear();
        this.patchAddressesValue();
      }
    }

    //this.showRolesEdit = GlobalData.Profile.Roles.SYSRoles.indexOf('HOST') > -1;

    super.loadedData(event);

    // this.formGroup?.reset();
    // this.formGroup?.patchValue(this.item);
  }

  async saveChange() {
    this.bindName();
    this.saveChange2();
  }

  patchAddressesValue(){
  if (this.item.Addresses) {
    if (this.item.Addresses?.length) {
      for (let i of this.item.Addresses) {
        this.addAddress(i);
      }
    }

    if (!this.pageConfig.canEdit ) {
      this.formGroup.controls.Addresses.disable();
    }
    }
  }

  getCompany(id) {
    let currentBranch = this.env.branchList.find((d) => d.Id == id);
    if (currentBranch) {
      if(currentBranch.Type =='Company'){
         this.formGroup.get('Company').setValue(currentBranch);
         return;
      } 
      this.getCompany(currentBranch.IDParent);
    }
  }
  addAddress(address, markAsDirty = false){ // todo
    let groups = <FormArray>this.formGroup.controls.Addresses;
    let group = this.formBuilder.group({

      IDStaff: [this.formGroup.get('Id').value],
      Id: new FormControl({ value: address?.Id, disabled: true }),
      Type: [address?.Type,Validators.required],
      AddressLine1: [address?.AddressLine1,Validators.required],
      AddressLine2: [address?.AddressLine2],
      Country: [address?.Country],
      Province: [address?.Province],
      District: [address?.District],
      Ward: [address?.Ward],        
      ZipCode: [address?.ZipCode],
      Lat: [address?.Lat],
      Long: [address?.Long],
      Contact: [address?.Contact],
      Phone1: [address?.Phone1],
      Phone2: [address?.Phone2],
      Remark: [address?.Remark],
      Sort: [address?.Sort],

      ProvinceDataSource : [[...this.provinceDataSource]],
      DistrictDataSource : [],
    });
    groups.push(group);
    group.get('IDStaff').markAsDirty();
    group.get('Id').markAsDirty();
    this.changeProvince(group,markAsDirty);
  }

  removeAddress(g, index) {
    let groups = <FormArray>this.formGroup.controls.Addresses;
    if(g.get('Id').value){
      this.env
      .showPrompt('Bạn có chắc muốn xóa không?', null, 'Xóa địa chỉ')
      .then((_) => {
        this.formGroup.get('DeletedAddressFields').setValue([g.controls.Id.value]);
        this.formGroup.get('DeletedAddressFields').markAsDirty();
        this.saveChange();
        groups.removeAt(index);
      })
      .catch((_) => {});
    }
    else groups.removeAt(index);
  }

  changeProvince(g,markAsDirty = true){
    let province = [...this.provinceDataSource].find(d=> d.Name == g.get('Province').value);
    let listDistrict = [...this.districtDataSource];
    if(province){
      listDistrict = listDistrict.filter(d=> d.IDParent == province.Id );
    }
    g.get('DistrictDataSource').setValue(listDistrict);
    if(markAsDirty) this.saveChange();
  }
  changeCoordinate(coordinate, form: FormGroup) {
    console.log(coordinate);

    form.controls.Lat.setValue(coordinate.Lat);
    form.controls.Long.setValue(coordinate.Long);
    form.controls.Lat.markAsDirty();
    form.controls.Long.markAsDirty();
    this.saveChange();
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

  accordionGroupChange(e) {
    this.openedFields = e.detail.value;
    console.log(this.openedFields);
  }

  isAccordionExpanded(id: string): boolean {
    return this.openedFields.includes(id?.toString());
  }
  doReorder(ev, groups) {
    let obj = [];
    groups = ev.detail.complete(groups);
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      g.controls.Sort.setValue(i + 1);
      g.controls.Sort.markAsDirty();
    }
    this.saveChange();
  }

  changeDepartment(markAsDirty = false) {
    let selectedDepartment = this.formGroup.controls.IDDepartment.value;
    this.env.getJobTitle(selectedDepartment, true).then((result) => {
      this.jobTitleList = [...result];
      this.getCompany(selectedDepartment);
    });

    this.env.getType('WorkAreaType').then((result) => {
      this.workAreaList = [...result];
    });
    if(markAsDirty) this.saveChange();
  }

  markNestedNode(ls, Id) {
    ls.filter((d) => d.IDParent == Id).forEach((i) => {
      i.Flag = true;
      this.markNestedNode(ls, i.Id);
    });
  }

  segmentView = 's1';
  segmentChanged(ev: any) {
    this.pageConfig.isSubActive = true;
    this.segmentView = ev;
  }

  changeLock() {
    this.userAccount.LockoutEnabled = !this.userAccount.LockoutEnabled;
    if (this.userAccount.LockoutEnabled) {
      this.env.showMessage('Account has been locked, cannot log in', 'warning');
    } else {
      this.env.showMessage('Account functions normally', 'warning');
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

  async createAccount() {
    if (!this.changePasswordForm.valid) {
      this.env.showMessage('Please recheck information highlighted in red above', 'warning');
    } else {
      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Đang dữ liệu...',
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

        this.urserProvider
          .save(this.userAccount)
          .then((newId: any) => {
            this.userAccount.Id = newId;
            if (this.userAccount.Email != this.item.Email) {
              this.item.Email = this.userAccount.Email;
            }

            this.env.showMessage('Account created {{value}}', 'success', this.userAccount.Email);
            if (loading) loading.dismiss();
            this.changePasswordForm.markAsPristine();
            this.cdr.detectChanges();
          })
          .catch((err) => {
            if (loading) loading.dismiss();
            if (err.error && err.error.Message && err.error.Message.indexOf('Account with email is exits') > -1) {
              this.env.showMessage(
                'Email has already been used for account registration, please check again',
                'danger',
              );
            } else {
              this.env.showMessage('Cannot save, please try again', 'danger');
            }

            this.cdr.detectChanges();
          });
      });
    }
  }

  async resetPassword() {
    if (!this.changePasswordForm.valid) {
      this.env.showMessage('Please recheck information highlighted in red above', 'danger');
    } else {
      const loading = await this.loadingController.create({
        cssClass: 'my-custom-class',
        message: 'Đang dữ liệu...',
      });

      await loading.present().then(() => {
        this.urserProvider
          .resetPassword(
            this.userAccount.Id,
            this.changePasswordForm.controls.newPassword.value,
            this.changePasswordForm.controls.confirmPassword.value,
          )
          .then((savedItem: any) => {
            this.env.showMessage('Password changed', 'success');

            this.cdr.detectChanges();
            this.changePasswordForm.markAsPristine();
            if (loading) loading.dismiss();
          })
          .catch((err) => {
            if (err._body.indexOf('confirmation password do not match') > -1) {
              this.env.showMessage('log-in password does not match', 'danger');
            } else if (err._body.indexOf('least 6 characters') > -1) {
              this.env.showMessage('Password must contain more than 6 characters', 'danger');
            } else {
              this.env.showMessage('Cannot save, please try again', 'danger');
            }
            if (loading) loading.dismiss();
            this.cdr.detectChanges();
          });
      });
    }
  }

  savedChange(savedItem = null, form = this.formGroup) {
    super.savedChange(savedItem);
    let addresses = this.formGroup.get('Addresses') as FormArray;
    let idsBeforeSaving = new Set(addresses.controls.map((g) => g.get('Id').value));
    this.item = savedItem;

    if (this.item.Addresses?.length > 0) {
      let newIds = new Set(this.item.Addresses.map((i) => i.Id));
      const diff = [...newIds].filter((item) => !idsBeforeSaving.has(item));
      if (diff?.length > 0) {
        addresses.controls.find((d) => !d.get('Id').value ) ?.get('Id') .setValue(diff[0]);
        this.openedFields = [...this.openedFields, diff[0].toString()];


      }
    }
  }
}
