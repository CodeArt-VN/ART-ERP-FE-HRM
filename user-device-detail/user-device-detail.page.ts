import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { HRM_StaffProvider, SYS_UserDeviceProvider } from 'src/app/services/static/services.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { concat, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { CommonService } from 'src/app/services/core/common.service';

@Component({
	selector: 'app-user-device-detail',
	templateUrl: './user-device-detail.page.html',
	styleUrls: ['./user-device-detail.page.scss'],
	standalone: false,
})
export class UserDeviceDetailPage extends PageBase {
	constructor(
		public pageProvider: SYS_UserDeviceProvider,
		public staffProvider: HRM_StaffProvider,
		public env: EnvService,
		public navCtrl: NavController,
		public route: ActivatedRoute,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public cdr: ChangeDetectorRef,
		public loadingController: LoadingController,
		public commonService: CommonService
	) {
		super();
		this.pageConfig.isDetailPage = true;

		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDStaff: ['', Validators.required],
			Code: [''],
			Name: [''],
			Model: [''],
			Platform: [''],
			OperatingSystem: [''],
			OsVersion: [''],
			Manufacturer: [''],
			Sort: [''],
			Remark: [''],
			MemUsed: [''],
			DiskFree: [''],
			DiskTotal: [''],
			RealDiskFree: [''],
			RealDiskTotal: [''],
			WebViewVersion: [''],
			BatteryLevel: [''],
			IsCharging: [''],
			IsVirtual: [''],
			IsAllowCheckIn: [''],
		});
	}

	loadedData(event?: any, ignoredFromGroup?: boolean): void {
		super.loadedData(event, ignoredFromGroup);
		if (this.item.Staff) {
			this.staffListSelected.push(this.item.Staff);
		}

		this.staffSearch();
	}

	staffList$;
	staffListLoading = false;
	staffListInput$ = new Subject<string>();
	staffListSelected = [];
	staffSelected = null;
	staffSearch() {
		this.staffListLoading = false;
		this.staffList$ = concat(
			of(this.staffListSelected),
			this.staffListInput$.pipe(
				distinctUntilChanged(),
				tap(() => (this.staffListLoading = true)),
				switchMap((term) =>
					this.staffProvider
						.search({
							Take: 20,
							Skip: 0,
							IDDepartment: this.env.selectedBranchAndChildren,
							Keyword: term,
						})
						.pipe(
							catchError(() => of([])), // empty list on error
							tap(() => (this.staffListLoading = false))
						)
				)
			)
		);
	}

	async saveChange() {
		console.log('s');

		super.saveChange2();
	}
}
