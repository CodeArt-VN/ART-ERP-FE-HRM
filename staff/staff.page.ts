import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, HRM_StaffProvider } from 'src/app/services/static/services.service';
import { StaffDetailPage } from '../staff-detail/staff-detail.page';
import { Location } from '@angular/common';
import { lib } from 'src/app/services/static/global-functions';
import { environment } from 'src/environments/environment';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
	selector: 'app-staff',
	templateUrl: 'staff.page.html',
	styleUrls: ['staff.page.scss'],
	standalone: false,
})
export class StaffPage extends PageBase {
	isAddViewMode: boolean = false;
	viewData: any = { Views: [] }; // view data
	branchList = [];
	segmentView = { activeView: { Name: '', Type: '', From: '', Sort: 0 }, viewList: [] }; // segment view config
	fieldsOriginal: any = []; // original fields  (shown/hidden)
	editView; //form customize view
	groupView: any = [
		// group view Shown/Hidden
		{
			Name: 'Shown',
			Fields: [],
		},
		{
			Name: 'Hidden',
			Fields: [],
		},
	];
	viewConfigDefault: any = {
		// default view config
		Layout: {
			View: {
				Name: 'Defaut view',
				Type: '',
				Icon: '',
				Color: '',
				IsPinned: false,
				IsDefault: true,
				IsActive: false,
			},
			Card: {
			},
		},
		Fields: [
			{ Code: 'Id', Name: 'Id', Icon: '', Color: '', Sort: 1 },
			{ Code: 'FullName', Name: 'FullName', Icon: '', Color: '', Sort: 2 },
			{ Code: 'IDJobTitle', Name: 'IDJobTitle', Icon: '', Color: '', Sort: 3 },
		],
		GroupBy: {
			Group1: { Code: '', Sort: '' },
			Group2: null,
		},
		Filter: [],
		Sort: [],
	};

	viewStaffConfig: any = {}; // view active config
	activeViewIndex: number = 0;

	constructor(
		public pageProvider: HRM_StaffProvider,
		public branchProvider: BRA_BranchProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location,
		public formBuilder: FormBuilder
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
			this.pageProvider.commonService.connect('GET', 'BI/Schema/GetSchemaByCode', { Code: 'HRM_Staff', Type: 'DBTable' }).toPromise(),
			this.env.getStorage('ViewStaff'),
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
			});
			this.fieldsOriginal = [
				{ Name: 'Shown', Fields: [] },
				{ Name: 'Hidden', Fields: [...values[1]['Fields']] },
			];
			// set viewData from local storage
			this.viewData = values[2] || { Views: [] };
			let views = this.viewData.Views && Array.isArray(this.viewData.Views) ? this.viewData.Views : [];
			if (!views.length) {
				// if no views, set default view
				views = [
					{
						...this.viewConfigDefault,
						Layout: { ...this.viewConfigDefault.Layout, View: { ...this.viewConfigDefault.Layout.View, Name: 'Defautt view', IsActive: true } },
					},
				];
				this.viewData.Views = views;
			}
			// load segmentView form views (only Name, Type, From, Sort)
			this.segmentView.viewList = views.map((v, idx) => ({
				Name: v.Layout.View.Name,
				Type: v.Layout.View.Type,
				From: 'Staff', // source of view
				Sort: v.Sort || idx,
			}));
			// activeView is first view in list and 'IsActive' = True
			let activeIdx = views.findIndex((v) => v.Layout.View.IsActive);
			if (activeIdx === -1) activeIdx = 0;
			this.segmentView.activeView = this.segmentView.viewList[activeIdx];
			this.activeViewIndex = activeIdx;
			// viewStaffConfig of view active
			this.viewStaffConfig = views[activeIdx];
			// groupView list Shown/Hidden view active
			const shownFields = this.viewStaffConfig.Fields ? this.viewStaffConfig.Fields.map((f) => ({ ...f })) : [];
			const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;
			const shownNames = shownFields.map((f) => f.Name);
			const hiddenFields = hiddenSchema.filter((f) => !shownNames.includes(f.Name));
			this.groupView = [
				{ Name: 'Shown', Fields: shownFields },
				{ Name: 'Hidden', Fields: hiddenFields },
			];
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

	customizeView(type) {
		this.pageConfig.isShowFeature = !this.pageConfig.isShowFeature;
		if (!this.pageConfig.isShowFeature) return;
		let views = this.viewData.Views || [];
		if (type === 'add') {
			this.isAddViewMode = true;
			// Add: template default
			this.groupView = [
				{ Name: 'Shown', Fields: [] },
				{ Name: 'Hidden', Fields: JSON.parse(JSON.stringify(this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields)) },
			];
			this.editView = {
				_formGroup: this.formBuilder.group({
					ViewName: ['', Validators.required],
					// ViewType: ['', Validators.required],
				}),
			};
		} else {
			this.isAddViewMode = false;
			// Edit: get view active (activeViewIndex)
			let editingView = views[this.activeViewIndex];
			// Edit if editingView is not defined or it 'Default view'
			if (!editingView || editingView.Layout?.View?.IsDefault) {
				editingView = JSON.parse(JSON.stringify(this.viewConfigDefault));
				editingView.Layout.View.Name = 'Defaut view';
				editingView.Layout.View.IsDefault = false;
				editingView.Layout.View.IsActive = false;
			} else {
				editingView = JSON.parse(JSON.stringify(editingView));
			}
			const shownFields = editingView.Fields ? editingView.Fields.map((f) => ({ ...f })) : [];
			const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;
			const shownNames = shownFields.map((f) => f.Name);
			const hiddenFields = hiddenSchema.filter((f) => !shownNames.includes(f.Name));
			this.groupView = [
				{ Name: 'Shown', Fields: shownFields },
				{ Name: 'Hidden', Fields: hiddenFields },
			];
			// Set editView form_group
			this.editView = {
				_formGroup: this.formBuilder.group({
					ViewName: [editingView.Layout.View.Name || '', Validators.required],
					// ViewType: [editingView.Layout.View.Type || '', Validators.required],
				}),
			};
		}
	}

	saveView() {
		if (!this.editView._formGroup.valid) {
			// let invalidControls = this.findInvalidControlsRecursive(this.editView._formGroup);
			// const translationPromises = invalidControls.map((control) => this.env.translateResource(control));
			// Promise.all(translationPromises).then((values) => {
			// 	let invalidControls = values;
			// 	this.env.showMessage('Please recheck control(s): {{value}}', 'warning', invalidControls.join(' | '));
			// });
			// return;
			this.env.showMessage('Please recheck information highlighted in red above', 'warning');
			return;
		}
		if (this.submitAttempt == false) {
			this.submitAttempt = true;
			// config view data
			let config: any = {
				Layout: {
					View: {
						Name: this.editView._formGroup.value.ViewName,
						Type: this.editView._formGroup.value.ViewType || '',
						Icon: '',
						Color: '',
						IsPinned: false,
						IsDefault: false,
						IsActive: true,
					},
					Card: {
						IsStackFields: false,
						IsEmptyFields: false,
						IsCollapseEmptyColumns: false,
						IsColorColumns: false,
						Size: 'Medium',
					},
				},
				Fields: this.groupView
					.find((g) => g.Name === 'Shown')
					.Fields.map((f: any, idx) => ({
						Code: f.Code || f.Name,
						Name: f.Name,
						Icon: f.Icon || '',
						Color: f.Color || '',
						Sort: f.Sort || idx + 1,
					})),
				GroupBy: {
					Group1: { Code: '', Sort: '' },
					Group2: null,
				},
				Filter: [],
				Sort: [],
			};
			let views = this.viewData.Views || [];
			let setActiveIndex = -1;
			if (this.isAddViewMode) {
				// add new
				views.push(config);
				setActiveIndex = views.length - 1;
				this.isAddViewMode = false;
			} else {
				// edit
				views[this.activeViewIndex] = config;
				setActiveIndex = this.activeViewIndex;
			}
			//only this view IsActive = true
			views.forEach((v, idx) => (v.Layout.View.IsActive = idx === setActiveIndex));
			this.env.setStorage('ViewStaff', this.viewData);
			// Update segmentView.viewList, activeView, viewStaffConfig, groupView
			this.segmentView.viewList = views.map((v, idx) => ({
				Name: v.Layout.View.Name,
				Type: v.Layout.View.Type,
				From: 'Staff',
				Sort: v.Sort || idx,
			}));
			// find index of view active
			let activeIdx = views.findIndex((v) => v.Layout.View.IsActive);
			if (activeIdx === -1) activeIdx = 0;
			// set activeView
			this.segmentView.activeView = this.segmentView.viewList[activeIdx];
			this.activeViewIndex = activeIdx;
			// viewStaffConfig of view active
			this.viewStaffConfig = views[activeIdx];
			// groupView list Shown/Hidden view active
			const shownFields = this.viewStaffConfig.Fields ? this.viewStaffConfig.Fields.map((f) => ({ ...f })) : [];
			const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;
			const shownNames = shownFields.map((f) => f.Name);
			const hiddenFields = hiddenSchema.filter((f) => !shownNames.includes(f.Name));
			this.groupView = [
				{ Name: 'Shown', Fields: shownFields },
				{ Name: 'Hidden', Fields: hiddenFields },
			];
			this.submitAttempt = false;
		}
	}

	addFieldToShown(field) {
		// Delete Hidden
		this.groupView[1].Fields = this.groupView[1].Fields.filter((f) => f.Name !== field.Name);
		// Add vào Shown
		this.groupView[0].Fields.push(field);
		this.saveView();
	}

	removeAllFieldsFromShown() {
		const fieldsToRemove = [...this.groupView[0].Fields];
		const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;
		// Remove all from Shown
		this.groupView[0].Fields = [];
		// for each field to remove
		fieldsToRemove.forEach((field) => {
			// logic
			// find index in original Hidden
			const targetIndex = hiddenSchema.findIndex((f) => f.Name === field.Name);
			// not found in Hidden
			if (targetIndex === -1) {
				this.groupView[1].Fields.push(field);
				return;
			}
			// Find where to insert in current Hidden
			let insertAt = this.groupView[1].Fields.length;
			for (let i = 0; i < this.groupView[1].Fields.length; i++) {
				// find index in current Hidden
				// example: gốc là A B C D, hiện tại là A D
				// bỏ C lại đúng vị trí giữa A D
				// C index = 2 = targetIndex
				// D index = 3 = idx (for theo groupViewHidden A và D)
				// if lần đầu idx A = 0 ko thỏa lần tiếp idx D = 3 thỏa thì chèn 2 trước 3 là C trước D (A C D)
				const idx = hiddenSchema.findIndex((f) => f.Name === this.groupView[1].Fields[i].Name);
				if (idx > targetIndex) {
					insertAt = i;
					break;
				}
			}
			this.groupView[1].Fields.splice(insertAt, 0, field);
		});
		this.saveView();
	}
	removeFieldFromShown(field) {
		// Remove field in groupView (Shown)
		this.groupView[0].Fields = this.groupView[0].Fields.filter((f) => f.Name !== field.Name);
		const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;

		const targetIndex = hiddenSchema.findIndex((f) => f.Name === field.Name);
		if (targetIndex === -1) {
			this.groupView[1].Fields.push(field);
			return;
		}
		// Find where to insert in current Hidden (keep schema order)
		let insertAt = this.groupView[1].Fields.length;
		for (let i = 0; i < this.groupView[1].Fields.length; i++) {
			const idx = hiddenSchema.findIndex((f) => f.Name === this.groupView[1].Fields[i].Name);
			if (idx > targetIndex) {
				insertAt = i;
				break;
			}
		}
		this.groupView[1].Fields.splice(insertAt, 0, field);
		this.saveView();
	}

	doReorder(ev: any, fields: any[], nameGroup: string) {
		if (nameGroup !== 'Shown') return;
		const reorderedFields = ev.detail.complete(fields);
		// Update Sort property for each field
		reorderedFields.forEach((item, index) => {
			item.Sort = index + 1;
		});
		// Update groupView
		const groupUpdate = this.groupView.find((g) => g.Name === 'Shown');
		if (groupUpdate) {
			groupUpdate.Fields = reorderedFields;
		}
		// Save
		this.saveView();
	}

	segmentChanged(ev: any) {
		if (this.submitAttempt == false) {
			this.submitAttempt = true;
			// Change tab segment, update viewStaffConfig, groupView, activeView, activeViewIndex
			const idx = ev && ev.detail && typeof ev.detail.value === 'number' ? ev.detail.value : ev;
			let views = this.viewData.Views || [];
			if (typeof idx === 'number' && this.segmentView.viewList[idx]) {
				this.activeViewIndex = idx;
				// Set IsActive view focus
				views.forEach((v, i) => (v.Layout.View.IsActive = i === idx));
				this.env.setStorage('ViewStaff', this.viewData);
				this.viewStaffConfig = views[idx];
				this.segmentView.activeView = this.segmentView.viewList[idx];
				// groupView
				const shownFields = this.viewStaffConfig.Fields ? this.viewStaffConfig.Fields.map((f) => ({ ...f })) : [];
				const hiddenSchema = this.fieldsOriginal.find((g) => g.Name === 'Hidden').Fields;
				const shownNames = shownFields.map((f) => f.Name);
				const hiddenFields = hiddenSchema.filter((f) => !shownNames.includes(f.Name));
				this.groupView = [
					{ Name: 'Shown', Fields: shownFields },
					{ Name: 'Hidden', Fields: hiddenFields },
				];
			}
			if (this.pageConfig.isShowFeature) {
				this.toggleFeature();
			}
			this.submitAttempt = false;
		}
	}
}
