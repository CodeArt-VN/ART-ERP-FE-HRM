import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { StaffDetailPage } from '../staff-detail/staff-detail.page';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { ApiSetting } from 'src/app/services/static/api-setting';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-staff',
	templateUrl: 'staff.page.html',
	styleUrls: ['staff.page.scss'],
	standalone: false,
})
export class StaffPage extends PageBase {
	branchList = [];

	constructor(
		public pageProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
	}

	departmentList = [];
	preLoadData() {
		this.branchList = this.env.branchList;

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
				this.departmentList = [];

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
		this.items.forEach((i) => {
			i.Avatar = i.Code? (environment.staffAvatarsServer + i.Code + '.jpg') : 'assets/avartar-empty.jpg';
			i.Department = this.branchList.find((d) => d.Id == i.IDDepartment); // lib.getAttrib(i.IDDepartment, this.branchList);
			i.JobTitle = lib.getAttrib(i.IDJobTitle, this.branchList);
			i.Email = i.Email ? i.Email.replace(environment.loginEmail, '') : '';
		});

		super.loadedData(event);
	}

	showDetail(i) {
		this.navCtrl.navigateForward('/staff/' + i.Id);
	}

	async showDetail_(i) {
		const modal = await this.modalController.create({
			component: StaffDetailPage,
			componentProps: {
				branchList: this.branchList,
				item: i,
				id: i.Id,
			},
			cssClass: 'my-custom-class',
		});
		return await modal.present();
	}

	add() {
		let newStaff = {
			Id: 0,
		};
		this.showDetail(newStaff);
	}
}
