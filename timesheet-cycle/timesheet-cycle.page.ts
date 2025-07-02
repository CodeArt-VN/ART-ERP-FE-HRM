import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_TimesheetCycleDetailProvider, HRM_TimesheetCycleProvider, HRM_TimesheetProvider } from 'src/app/services/static/services.service';
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
	itemsView: any = [];
	isAllRowOpened = true;
	constructor(
		public pageProvider: HRM_TimesheetCycleProvider,
		public pageDetailProvider: HRM_TimesheetCycleDetailProvider,
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
		this.query.SortBy = 'Id_desc';

		Promise.all([this.timesheetProvider.read(), this.env.getStatus('StandardApprovalStatus')]).then((resp: any) => {
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
		super.loadedData(event, ignoredFromGroup);
		// this.buildFlatTree(this.items, this.itemsState, this.isAllRowOpened).then((res) => {
		// 	this.itemsState = res;
		// 	this.itemsView = this.itemsState.filter((d) => d.show);
		// 	super.loadedData(event, ignoredFromGroup);
		// });
	}
	navTo(i) {
		let navigationExtras: NavigationExtras = {
			state: {
				item: i,
				id: i.IDTimesheet,
				segmentView: 's3',
				IDCycle: i.IDParent,
			},
		};
		this.nav('/scheduler', 'forward', navigationExtras);
	}

	async showModal(i) {
		const itemClone = {
			...i,
			Timesheets: (i.Timesheets || []).map((x) => x.IDTimesheet),
			Start: i.Start?.split('T')[0], // giữ lại phần yyyy-MM-dd
			End: i.End?.split('T')[0], // giữ lại phần yyyy-MM-dd
		};

		const modal = await this.modalController.create({
			component: TimesheetCycleModalPage,
			componentProps: {
				timesheetList: this.timesheetList,
				item: itemClone,
				id: i.Id,
			},
			cssClass: 'my-custom-class',
		});

		await modal.present();

		const { data } = await modal.onWillDismiss();

		if (data) {
			this.pageProvider
				.save(data)
				.then((resp) => {
					this.refresh();
				})
				.catch((err) => {
					this.env.showMessage(err.error?.InnerException?.ExceptionMessage ?? 'Cannot save, please try again', 'danger');
					console.error(err);
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
		let ids = this.selectedItems.filter((d) => d.IDDetail).map((i) => i.IDDetail);
		if (!this.pageConfig.canSubmit || !this.pageConfig.ShowSubmit || this.submitAttempt) return;

		this.env
			.actionConfirm('submit', ids.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/Submit', { Ids: ids }).toPromise()
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
		let ids = this.selectedItems.filter((d) => d.IDDetail).map((i) => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowApprove || this.submitAttempt) return;
		this.env
			.actionConfirm('approve', ids.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/Approve', { Ids: ids }).toPromise()
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
		let ids = this.selectedItems.filter((d) => d.IDDetail).map((i) => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowDisapprove || this.submitAttempt) return;
		this.env
			.actionConfirm('disapprove', ids.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/Disapprove', { Ids: ids }).toPromise()
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
		let ids = this.selectedItems.filter((d) => d.IDDetail).map((i) => i.IDDetail);
		if (!this.pageConfig.canApprove || !this.pageConfig.ShowDisapprove || this.submitAttempt) return;
		this.env
			.actionConfirm('disapprove', ids.length, this.item?.Name, this.pageConfig.pageTitle, () =>
				this.pageProvider.commonService.connect('POST', 'HRM/TimesheetCycle/Cancel', { Ids: ids }).toPromise()
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

	// toggleRowAll() {
	// 	this.isAllRowOpened = !this.isAllRowOpened;
	// 	this.items.forEach((i) => {
	// 		i.showdetail = !this.isAllRowOpened;
	// 		this.toggleRow(this.items, i, true);
	// 	});
	// 	this.items = this.items.filter((d) => d.show);
	// }

	// toggleRow(ls, ite, toogle = false) {
	// 	super.toggleRow(ls, ite, toogle);
	// 	this.itemsView = this.itemsState.filter((d) => d.show);
	// }

	changeSelection(e, i = null) {
		if (!i.IDParent) {
			if (i.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
			let children = this.items.filter((d) => d.IDParent == i.Id);
			children.forEach((c) => {
				const index = this.selectedItems.indexOf(c, 0);
				if (e.target.checked) {
					c.checked = true;
					if (index == -1) {
						this.selectedItems.push(c);
					}
				} else {
					if (index > -1) {
						this.selectedItems.splice(index, 1);
					}
				}
			});
		} else if (e && e.shiftKey) {
			let from = this.items.indexOf(this.lastchecked);
			let to = this.items.indexOf(i);

			let start = Math.min(from, to);
			let end = Math.max(from, to) + 1;

			let itemsToCheck = this.items.slice(start, end);
			for (let j = 0; j < itemsToCheck.length; j++) {
				const it = itemsToCheck[j];

				it.checked = this.lastchecked.checked;
				const index = this.selectedItems.indexOf(it, 0);

				if (this.lastchecked.checked && index == -1) {
					this.selectedItems.push(it);
				} else if (!this.lastchecked.checked && index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		} else if (e) {
			if (e.target.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		} else {
			if (i.checked) {
				this.selectedItems.push(i);
			} else {
				const index = this.selectedItems.indexOf(i, 0);
				if (index > -1) {
					this.selectedItems.splice(index, 1);
				}
			}
		}

		this.selectedItems = [...this.selectedItems];
		this.lastchecked = i;
		console.log('Selected items:', this.selectedItems);
		//e?.preventDefault();
		e?.stopPropagation();

		this.showCommandBySelectedRows(this.selectedItems);
	}

	delete(publishEventCode = this.pageConfig.pageName) {
		//override pagebase để ko goback và check delete detail hay delete parent
		let parents = this.selectedItems.filter((d) => !d.IDParent);
		let children = this.selectedItems.filter((d) => d.IDParent && parents.map((i) => i.Id).includes(d.IDParent));
		let notParent = [...this.selectedItems.filter((d) => d.IDParent && !children.map((d) => d.Id).includes(d.Id))];
		notParent.forEach((d=> d.Id = d.IDDetail));
		let provider = parents.length > 0 && notParent.length == 0 ? this.pageProvider : parents.length == 0 && notParent.length > 0 ? this.pageDetailProvider : null;
		let itemsDelete = [...parents, ...notParent];
		if (this.pageConfig.ShowDelete) {
			if (provider) {
				this.env
					.actionConfirm('delete', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () => provider.delete(itemsDelete))
					.then((_) => {
						this.env.showMessage('DELETE_RESULT_SUCCESS', 'success');
						this.env.publishEvent({ Code: publishEventCode });
					})
					.catch((err: any) => {
						if (err != 'User abort action') this.env.showMessage('DELETE_RESULT_FAIL', 'danger');
						console.log(err);
					});
			} else {
				this.env
					.actionConfirm('delete', this.selectedItems.length, this.item?.Name, this.pageConfig.pageTitle, () => this.pageProvider.delete(parents))
					.then((_) => {
						this.pageDetailProvider.delete(notParent).then(() => {
							this.env.showMessage('DELETE_RESULT_SUCCESS', 'success');
							this.env.publishEvent({ Code: publishEventCode });
						});
					}).catch((err: any) => {
						if (err != 'User abort action') this.env.showMessage('DELETE_RESULT_FAIL', 'danger');
						console.log(err);
					});
			}
		}
	}
}
