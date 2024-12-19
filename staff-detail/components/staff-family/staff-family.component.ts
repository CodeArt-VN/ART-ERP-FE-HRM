import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { lib } from 'src/app/services/static/global-functions';
import {
  CRM_ContactProvider,
  CRM_PersonInfoProvider,
  HRM_StaffFamilyProvider,
  HRM_StaffStaffAndFamilyJobProvider,
} from 'src/app/services/static/services.service';

@Component({
    selector: 'app-staff-family',
    templateUrl: './staff-family.component.html',
    styleUrls: ['./staff-family.component.scss'],
    standalone: false
})
export class StaffFamilyComponent extends PageBase {
  @Input() set sfId(value) {
    this.id = value;
    this.query.IDStaff = this.id;
  }

  constructor(
    public pageProvider: HRM_StaffFamilyProvider,
    public env: EnvService,
    public route: ActivatedRoute,
    public alertCtrl: AlertController,
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loadingController: LoadingController,
  ) {
    super();
    this.formGroup = formBuilder.group({
      Id: new FormControl({ value: '', disabled: true }),
      FamilyMembers: this.formBuilder.array([]),
    });
    this.query.IgnoredBranch = true;
    this.query.IsPersonal = true;
    this.pageConfig.isForceCreate = true;
  }

  loadedData() {
    this.items.forEach((i) => {
      i.DOB = lib.dateFormat(i.DOB);
      i.DateOfIssueID = lib.dateFormat(i.DateOfIssueID);
      i.DateOfExpiryID = lib.dateFormat(i.DOB);
      i.DateOfIssuePassport = lib.dateFormat(i.DateOfIssuePassport);
      i.DateOfExpiryPassport = lib.dateFormat(i.DateOfExpiryPassport);
      i.disabled = true;
    });

    this.item = { Id: this.id };
    super.loadedData();
    this.setFamilyMembers();

    this.contactList$ = concat(of(this.items), of([]));
    this.contactSearch();
  }

  setFamilyMembers() {
    this.items.forEach((c) => {
      this.addFamilyMember(c);
    });
  }

  addFamilyMember(contact, doSave = false) {
    let groups = <FormArray>this.formGroup.controls.FamilyMembers;
    let group = this.formBuilder.group({
      IDStaff: this.id,
      Id: contact.Id,
      Name: [contact.Name, Validators.required],
      FullName: [contact.FullName],
      FirstName: [contact.FirstName],
      LastName: [contact.LastName],
      DOB: [contact.DOB],
      Gender: [contact.Gender],
      HomeAddress: [contact.HomeAddress],
      IsPersonal: [contact.IsPersonal],
      WorkPhone: [contact.WorkPhone],
      IdentityCardNumber: [contact.IdentityCardNumber],
      DateOfIssueID: [contact.DateOfIssueID],
      PlaceOfIssueID: [contact.PlaceOfIssueID],
      DateOfExpiryID: [contact.DateOfExpiryID],

      PassportNumber: [contact.PassportNumber],
      DateOfIssuePassport: [contact.DateOfIssuePassport],
      PlaceOfIssuePassport: [contact.PlaceOfIssuePassport],
      DateOfExpiryPassport: [contact.DateOfExpiryPassport],

      IDTypeOfPassport: [contact.IDTypeOfPassport],
      IDCountryOfIssuePassport: [contact.IDCountryOfIssuePassport],

      Remark: [contact.Remark],

      IsDependants: [contact.IsDependants],
    });

    groups.push(group);
    if (doSave) {
      group.controls.IDStaff.markAsDirty();
      group.controls.Name.markAsDirty();
      group.controls.IsPersonal.markAsDirty();
      group.controls.WorkPhone.markAsDirty();
      group.controls.Gender.markAsDirty();
      this.saveContact(group);
    }
  }

  removeFamilyMember(index) {
    let groups = <FormArray>this.formGroup.controls.FamilyMembers;
    let submitItem = {
      IDStaff: null,
      Id: groups.controls[index]['controls'].Id.value,
    };
    if (submitItem.Id)
      this.pageProvider.save(submitItem).then((resp) => {
        this.items = this.items.filter((d) => d.Id != submitItem.Id);
        groups.removeAt(index);
        this.env.showMessage('Contacts deleted', 'success');
      });
  }

  async saveContact(form: FormGroup) {
    if (form.controls.Name.dirty) {
      this.calcName(form);
    }
    this.saveChange2(form, null, this.pageProvider);
  }

  calcName(form: FormGroup) {
    let fullName = lib.personNameFormat(form.controls.Name.value);
    form.controls.Name.setValue(fullName);
    form.controls.FullName.setValue(fullName);
    form.controls.FullName.markAsDirty();
    let names = fullName.split(' ');
    if (names.length > 1) {
      form.controls.FirstName.setValue(names[names.length - 1]);
      form.controls.LastName.setValue(names[0]);

      form.controls.FirstName.markAsDirty();
      form.controls.LastName.markAsDirty();
    }
  }

  contactList$;
  contactListLoading = false;
  contactListInput$ = new Subject<string>();
  contactSearch() {
    this.contactListLoading = false;
    this.contactList$ = concat(
      of(this.items),
      this.contactListInput$.pipe(
        distinctUntilChanged(),
        tap(() => (this.contactListLoading = true)),
        switchMap((term) =>
          this.searchConnect({
            Take: 20,
            Skip: 0,
            IsPersonal: true,
            Keyword: term,
          }).pipe(
            catchError(() => of([])), // empty list on error
            tap(() => (this.contactListLoading = false)),
          ),
        ),
      ),
    );
  }

  searchConnect(query) {
    return this.pageProvider.commonService.connect('GET', ApiSetting.apiDomain('HRM/StaffFamily'), query);
  }

  addContactLine(name) {
    return { IDStaff: this.id, IsPersonal: true, Name: name, Gender: true };
  }

  selectContact(i) {
    if (i) {
      if (this.items.findIndex((d) => d.Id == i.Id) == -1) {
        this.items.push(i);
        i.IDStaff = this.id;
        this.addFamilyMember(i, true);
      }
      i.disabled = true;
    }
  }
}
