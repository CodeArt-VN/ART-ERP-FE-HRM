import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
	selector: 'app-timesheet-cycle-select-modal',
	templateUrl: './timesheet-cycle-select-modal.page.html',
	styleUrls: ['./timesheet-cycle-select-modal.page.scss'],
	standalone: false,
})
export class TimesheetCycleSelectModalComponent implements OnInit {
	_timesheetCycleList: any[] = [];
	timesheetCycleList: any[] = [];
	idCycle: any;

	constructor(public popoverCtrl: PopoverController) {}
	ngOnInit(): void {
		this.timesheetCycleList = this._timesheetCycleList;
	}

	command() {
		this.popoverCtrl.dismiss({ IDCycle: this.idCycle });
	}
}
