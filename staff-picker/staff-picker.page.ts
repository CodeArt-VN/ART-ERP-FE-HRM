import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';

@Component({
  selector: 'app-staff-picker',
  templateUrl: 'staff-picker.page.html',
  styleUrls: ['staff-picker.page.scss'],
})
export class StaffPickerPage extends PageBase {
  branchList = [];
  departmentList = [];
  quickSelect = {
    IDDepartment: -1,
    IDJobTitle: -1,
  };

  constructor(
    public pageProvider: HRM_StaffProvider,
    public branchProvider: BRA_BranchProvider,
    public modalController: ModalController,
    public alertCtrl: AlertController,
    public loadingController: LoadingController,
    public env: EnvService,
    public navCtrl: NavController,
    public location: Location,
  ) {
    super();
  }

  preLoadData() {
    this.query.Take = 2000;
    Promise.all([
      this.branchProvider.read({
        Take: 5000,
        AllChildren: true,
        AllParent: true,
      }),
    ]).then((values) => {
      this.branchList = values[0]['data'];
      this.buildFlatTree(this.branchList, this.branchList, true).then((resp: any) => {
        this.branchList = resp;

        this.branchList.forEach((i) => {
          let prefix = '';
          for (let j = 1; j < i.level; j++) {
            prefix += '- ';
          }
          i.NamePadding = prefix + i.Name;
          if (i.Type == 'TitlePosition') {
            i.Flag = true;
          } else {
            this.departmentList.push(i);
          }
        });

        this.departmentList.forEach((i) => {
          i.IDs = [];
          this.getChildrenDepartmentID(i.IDs, i.Id);
        });

        this.departmentList.forEach((i) => {
          i.Query = JSON.stringify(i.IDs);
        });

        //console.log(this.departmentList)
      });
      super.preLoadData(null);
    });
  }

  getChildrenDepartmentID(ids, id) {
    ids.push(id);
    let children = this.departmentList.filter((i) => i.IDParent == id);
    children.forEach((i) => {
      this.getChildrenDepartmentID(ids, i.Id);
    });
  }

  loadedData(event) {
    this.departmentList.forEach((d) => {
      d.Count = 0;
    });
    this.branchList.forEach((d) => {
      d.Count = 0;
    });

    this.items.forEach((i) => {
      i.Department = lib.getAttrib(i.IDDepartment, this.branchList);
      i.JobTitle = lib.getAttrib(i.IDJobTitle, this.branchList);

      let dm = this.departmentList.find((d) => d.Id == i.IDDepartment);
      if (dm) dm.Count++;

      let jt = this.branchList.find((d) => d.Id == i.IDJobTitle);
      if (jt) jt.Count++;
    });

    super.loadedData(event);
  }

  quickSelectChange(type) {
    if (type == 'IDJobTitle') {
      this.quickSelect.IDDepartment = -1;
      for (let x = 0; x < this.items.length; x++) {
        const i = this.items[x];
        if (this.quickSelect.IDJobTitle == i.IDJobTitle) {
          i.checked = true;
        }
      }
    } else {
      this.quickSelect.IDJobTitle = -1;
      for (let x = 0; x < this.items.length; x++) {
        const i = this.items[x];
        if (this.quickSelect.IDDepartment == i.IDDepartment) {
          i.checked = true;
        }
      }
    }

    this.selectedItems = this.items.filter((d) => d.checked);
    this.changeSelection({});

    setTimeout(() => {
      this.quickSelect.IDDepartment = -1;
      this.quickSelect.IDJobTitle = -1;
    }, 100);
  }

  SaveSelectedStaff() {
    this.modalController.dismiss(this.selectedItems);
  }

  isAllChecked = false;
  toggleSelectAll() {
    this.items.forEach((i) => (i.checked = this.isAllChecked));
    this.selectedItems = this.isAllChecked ? [...this.items] : [];
    this.changeSelection({});
  }
}
