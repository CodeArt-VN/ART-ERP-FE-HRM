import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import {
  BRA_BranchProvider,
  HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
  HRM_PolicyPaidTimeOffProvider,
} from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
  selector: 'app-paid-time-off-policy-detail',
  templateUrl: './paid-time-off-policy-detail.page.html',
  styleUrls: ['./paid-time-off-policy-detail.page.scss'],
})
export class PaidTimeOffPolicyDetailPage extends PageBase {
  TypeList = [];
  constructor(
    public pageProvider: HRM_PolicyPaidTimeOffProvider,
    public ptoGrandByLengthOfServices: HRM_PolicyPaidTimeOffGrantsByLengthOfServicesProvider,
    public branchProvider: BRA_BranchProvider,
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
    this.pageConfig.isDetailPage = true;

    this.formGroup = formBuilder.group({
      IDBranch: [env.selectedBranch],
      Id: new FormControl({ value: '', disabled: true }),
      Code: [''],
      Name: ['', Validators.required],

      Remark: [''],
      Type: ['', Validators.required],
      NumberOfDays: ['', Validators.required],
      NumberOfCarryOnDays: ['', Validators.required],

      IsGrantsByLengthOfServices: [false],

      Lines: this.formBuilder.array([]),
    });
  }

  preLoadData(event?: any): void {
    this.env.getType('PaidTimeOffPolicy').then((resp) => {
      this.TypeList = resp;
      super.preLoadData(event);
    });
  }
  loadedData(event) {
    this.setLines();
    super.loadedData(event);
  }

  setLines() {
    this.formGroup.controls.Lines = new FormArray([]);
    if (this.item?.Lines?.length)
      this.item.Lines.forEach((i) => {
        this.addLine(i);
      });
  }

  addLine(line) {
    let groups = <FormArray>this.formGroup.controls.Lines;
    let group = this.formBuilder.group({
      IDPTO: [line.IDPTO],
      Id: [line.Id],
      MonthsOfServices: [line.MonthsOfServices, Validators.required],
      DaysGranted: [line.DaysGranted, Validators.required],
      Sort: [line.Sort],
    });

    groups.push(group);

    if (!line.Id) {
      group.controls.IDPTO.markAsDirty();
      group.controls.MonthsOfServices.markAsDirty();
      group.controls.DaysGranted.markAsDirty();
    }
  }

  removeLine(index, permanentlyRemove = true) {
    this.alertCtrl
      .create({
        header: 'Xóa chính sách thưởng phép',
        //subHeader: '---',
        message: 'Bạn chắc muốn xóa thiết lập này?',
        buttons: [
          {
            text: 'Không',
            role: 'cancel',
          },
          {
            text: 'Đồng ý xóa',
            cssClass: 'danger-btn',
            handler: () => {
              let groups = <FormArray>this.formGroup.controls.Lines;
              let Ids = [];
              Ids.push({
                Id: groups.controls[index]['controls'].Id.value,
              });

              if (permanentlyRemove) {
                this.ptoGrandByLengthOfServices.delete(Ids).then((resp) => {
                  groups.removeAt(index);
                  this.env.showTranslateMessage('Deleted!', 'success');
                });
              }
            },
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }

  doReorder(ev, groups) {
    groups = ev.detail.complete(groups);
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      g.controls.Sort.setValue(i + 1);
      g.controls.Sort.markAsDirty();
    }

    this.saveChange();
  }

  async saveChange() {
    super.saveChange2();
  }
}
