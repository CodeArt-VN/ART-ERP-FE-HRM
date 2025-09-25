import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormBuilder} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { EnvService } from 'src/app/services/core/env.service';
import { lib } from 'src/app/services/static/global-functions';
import { HRM_StaffLeaveBalanceHistoryProvider } from 'src/app/services/static/services.service';
@Component({
	selector: 'app-staff-work-schedule',
	templateUrl: './staff-work-schedule.component.html',
	styleUrls: ['./staff-work-schedule.component.scss'],
	standalone: false
})
export class StaffWorkScheduleComponent extends PageBase {
	@Input() set sfId(value) {
		this.id = value;
		this.query.IDStaff = this.id;
	}

	constructor(
		public pageProvider: HRM_StaffLeaveBalanceHistoryProvider,
		public env: EnvService,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public navCtrl: NavController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController
	) {
		super();
		this.pageConfig.dividers = [
			{
				field: 'CreatedDate',
				dividerFn: (record, recordIndex, records) => {
					let a: any = recordIndex == 0 ? new Date('2000-01-01') : new Date(records[recordIndex - 1].CreatedDate);
					let b: any = new Date(record.CreatedDate);
					let mins = Math.floor((b - a) / 1000 / 60);

					if (Math.abs(mins) < 600) {
						return null;
					}
					return  lib.dateFormat(record.CreatedDate, 'dd/mm/yyyy') ;
				},
			},
		];
	}

	preLoadData(event?: any): void {
		this.pageConfig.sort = [{ Dimension: 'CreatedDate', Order: 'DESC' }];
		super.preLoadData(event);
	}
}
