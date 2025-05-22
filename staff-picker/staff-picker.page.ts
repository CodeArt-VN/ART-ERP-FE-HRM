import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { FormBuilder } from '@angular/forms';


@Component({
	selector: 'app-staff-picker',
	templateUrl: 'staff-picker.page.html',
	styleUrls: ['staff-picker.page.scss'],
	standalone: false,
})
export class StaffPickerPage extends PageBase {
	branchList = [];
	departmentList = [];
	quickSelect = {
		IDDepartment: -1,
		IDJobTitle: -1,
	};
	ids=[];
	constructor(
		public pageProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public modalController: ModalController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public formBuilder: FormBuilder,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
		this.formGroup = this.formBuilder.group({
			IDDepartment: [-1],
			IDJobTitle: [-1],
			IDQuickSelectBranch: [''],
			_selectedBranchList:[[]],
			_departmentList: [[]],
			_jobTitleList: [[]],
		});
	}

	preLoadData(event) {
		this.query.Take = 5000;
		this.branchList = [...this.env.rawBranchList];
		this.branchList.filter(d=> d.disabled).forEach(i => i.disabled = false);
		this.formGroup.get('_selectedBranchList').setValue(JSON.parse(JSON.stringify(this.branchList)));
		this.formGroup.get('_departmentList').setValue(JSON.parse(JSON.stringify(this.branchList)));
		this.formGroup.get('_jobTitleList').setValue(JSON.parse(JSON.stringify(this.branchList)));
		// this.branchList.filter(d=> d.disabled).forEach(i => i.disabled = false);
		// Promise.all([
		// 	this.branchProvider.read({
		// 		Take: 5000,
		// 		AllChildren: true,
		// 		AllParent: true,
		// 	}),
		// ]).then((values) => {
		// 	this.branchList = values[0]['data'];
		// 	this.buildFlatTree(this.branchList, this.branchList, true).then((resp: any) => {
		// 		this.branchList = resp;

		// 		this.branchList.forEach((i) => {
		// 			let prefix = '';
		// 			for (let j = 1; j < i.level; j++) {
		// 				prefix += '- ';
		// 			}
		// 			i.NamePadding = prefix + i.Name;
		// 			if (i.Type == 'TitlePosition') {
		// 				i.Flag = true;
		// 			} else {
		// 				this.departmentList.push(i);
		// 			}
		// 		});

		// 		this.departmentList.forEach((i) => {
		// 			i.IDs = [];
		// 			this.getChildrenDepartmentID(i.IDs, i.Id);
		// 		});

		// 		this.departmentList.forEach((i) => {
		// 			i.Query = JSON.stringify(i.IDs);
		// 		});

		// 		//console.log(this.departmentList)
		// 	});
		// 	super.preLoadData(null);
		// });
		super.preLoadData(event);
	}


	loadedData(event) {

		this.items.forEach((i) => {
			i.Department = lib.getAttrib(i.IDDepartment, this.branchList);
			i.JobTitle = lib.getAttrib(i.IDJobTitle, this.branchList);
			if(this.ids && this.ids.length > 0 && this.ids.includes(i.Id)){
				i.checked = true;
			}
		});
		this.items.sort((a, b) => {
			return (b.checked === true ? 1 : 0) - (a.checked === true ? 1 : 0);
		  });
		this.selectedItems = this.items.filter((d) => d.checked);

		super.loadedData(event);
	}

	changeDepartmentQuery(){
		this.formGroup.get('IDQuickSelectBranch').setValue(null);
		this.formGroup.get('IDJobTitle').setValue(null);
	   this.query.IDDepartment = this.formGroup.get('IDDepartment').value || undefined;
	   this.query.IDJobTitle = undefined;
	   this.refresh();
   }
   changeJobTitleQuery(){
	   this.formGroup.get('IDQuickSelectBranch').setValue(null);
	   this.query.IDJobTitle = this.formGroup.get('IDJobTitle').value || undefined;
	   this.refresh();

   }

	quickSelectChange(branch) {
		if(branch){
			for (let x = 0; x < this.items.length; x++) {
				const i = this.items[x];
				if (branch.Id == i.IDJobTitle || branch.Id == i.IDDepartment) {
					i.checked = true;
				}
			}
			
			this.selectedItems = this.items.filter((d) => d.checked);
			this.changeSelection({});
	
		}
		else {
			this.items?.forEach((i) => (i.checked = false));
			this.selectedItems = [];
			this.changeSelection({});
		}
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
