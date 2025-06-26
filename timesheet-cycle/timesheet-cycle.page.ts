import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetCycleProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { TimesheetCycleModalPage } from '../timesheet-cycle-modal/timesheet-cycle-modal.page';
import { lib } from 'src/app/services/static/global-functions';
import { NavigationExtras } from '@angular/router';

@Component({
	selector: 'app-timesheet-cycle',
	templateUrl: 'timesheet-cycle.page.html',
	styleUrls: ['timesheet-cycle.page.scss'],
	standalone: false,
})
export class TimesheetCyclePage extends PageBase {
	statusList = [];
	timesheetList = [];
	itemsState: any = [];
	isAllRowOpened = false;
	constructor(
		public pageProvider: HRM_TimesheetCycleProvider,
		public timesheetProvider: HRM_TimesheetProvider,

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

	preLoadData(event?: any): void {
		Promise.all([	this.timesheetProvider.read(),this.env.getStatus('StandardApprovalStatus')]).then((resp:any) => {

			this.timesheetList = resp[0]['data'];
			this.statusList = resp[1];
			super.preLoadData(event);
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		let additionItems = [];
		this.items.forEach((i) => {
			if (i.Timesheets?.length > 0) {
				i.Timesheets.forEach((t) => {
					t.Id = lib.generateUID();
					t.IDParent = i.Id;
					t.StatusText = lib.getAttrib(t.Status, this.statusList, 'Name', '--', 'Code');
					t.StatusColor = lib.getAttrib(t.Status, this.statusList, 'Color', 'dark', 'Code');
					additionItems.push(t);
				});
			}
		});
		this.items = [...this.items, ...additionItems];
		this.buildFlatTree(this.items, this.itemsState, this.isAllRowOpened).then((res) => {
			this.itemsState = res;
			super.loadedData(event, ignoredFromGroup);
		});

		// this.items.forEach((i) => {
		// 	i.Start = lib.dateFormat(i.Start);
		// 	i.End = lib.dateFormat(i.End);

		// 	i.TimesheetList = i.Timesheets;
		// 	// for (let j = 0; j < i.Timesheets.length; j++) {
		// 	// 	const t = this.timesheetList.find((d) => d.Id == i.Timesheets[j]);
		// 	// 	if (t) {
		// 	// 		i.TimesheetList.push(t);
		// 	// 	}
		// 	// }
		// });
	}
	navTo(i) {
		let navigationExtras: NavigationExtras = {
			state: {
				item: i,
				id: i.IDTimesheet,
				segmentView: 's3',
				IDCycle : i.IDParent
			},
		};
		this.nav('/scheduler', 'forward', navigationExtras);
	}

	async showModal(i) {
		const modal = await this.modalController.create({
			component: TimesheetCycleModalPage,
			componentProps: {
				timesheetList: this.timesheetList,
				item: i,
				id: i.Id,
			},
			cssClass: 'my-custom-class',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();

		if (data) {
			this.pageProvider.save(data).then((resp) => {
				this.refresh();
			});
		}
	}

	add() {
		let newItem = {
			Id: 0,
		};
		this.showModal(newItem);
	}

	
	submitForApproval() {
		let ids = this.selectedItems.map(i => i.IDDetail);
		if (!this.pageConfig.canSubmit || !this.pageConfig.ShowSubmit || this.submitAttempt) return;

		this.env
			.actionConfirm('submit', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST','HRM/TimesheetCycle/Submit',{Ids:ids}).toPromise()
			)
			.then((_) => {
				this.env.publishEvent({
					Code: this.pageConfig.pageName,
				});
				this.env.showMessage('Submit successfully!', 'success');
				this.submitAttempt = false;
				this.refresh();
			})
			.catch((err: any) => {
				if (err != 'User abort action') this.env.showMessage('Cannot submit, please try again', 'danger');
				console.log(err);
			});
	}

	approve() {
		let ids = this.selectedItems.map(i => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowApprove || this.submitAttempt) return;
		this.env
			.actionConfirm('approve', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST','HRM/TimesheetCycle/Approve',{Ids:ids}).toPromise()

			)
			.then((_) => {
				this.env.publishEvent({
					Code: this.pageConfig.pageName,
				});
				this.env.showMessage('Approved successfully!', 'success');
				this.submitAttempt = false;
				this.refresh();
			})
			.catch((err: any) => {
				if (err != 'User abort action') this.env.showMessage('Cannot approve, please try again', 'danger');
				console.log(err);
			});
	}

	disapprove() {
		let ids = this.selectedItems.map(i => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowDisapprove || this.submitAttempt) return;
		this.env
			.actionConfirm('disapprove', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST','HRM/TimesheetCycle/Disapprove',{Ids:ids}).toPromise()

			)
			.then((_) => {
				this.env.publishEvent({
					Code: this.pageConfig.pageName,
				});
				this.env.showMessage('Disapprove successfully!', 'success');
				this.submitAttempt = false;
				this.refresh();
			})
			.catch((err: any) => {
				if (err != 'User abort action') this.env.showMessage('Cannot disapprove, please try again', 'danger');
				console.log(err);
			});
	}
	cancel() {
		let ids = this.selectedItems.map(i => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowDisapprove || this.submitAttempt) return;
		this.env
			.actionConfirm('disapprove', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST','HRM/TimesheetCycle/Cancel',{Ids:ids}).toPromise()

			)
			.then((_) => {
				this.env.publishEvent({
					Code: this.pageConfig.pageName,
				});
				this.env.showMessage('Disapprove successfully!', 'success');
				this.submitAttempt = false;
				this.refresh();
			})
			.catch((err: any) => {
				if (err != 'User abort action') this.env.showMessage('Cannot disapprove, please try again', 'danger');
				console.log(err);
			});
	}
}
