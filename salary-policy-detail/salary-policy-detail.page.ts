import { ChangeDetectorRef, Component } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { HRM_PolSalaryProvider, HRM_UDFProvider} from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FormArray, FormBuilder, FormControl, Validators} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-salary-policy-detail',
	templateUrl: 'salary-policy-detail.page.html',
	styleUrls: ['salary-policy-detail.page.scss'],
	standalone: false,
})
export class SalaryPolicyDetailPage extends PageBase {
	branchList;
	constructor(
		public pageProvider: HRM_PolSalaryProvider,
		public udfProvider: HRM_UDFProvider,
		public modalController: ModalController,
		public formBuilder: FormBuilder,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,		
		public route: ActivatedRoute,
		public navCtrl: NavController,
		public cdr: ChangeDetectorRef,
		public location: Location
	) {
		super();
		this.pageConfig.isDetailPage = true;
		this.id = this.route.snapshot.paramMap.get('id');
		this.formGroup = formBuilder.group({
			Id: new FormControl({ value: '', disabled: true }),
			IDBranch: [this.env.selectedBranch],
			Code: [''],
			Name:[''],
			Remark: [''],
			Status: ['Draft'],
			UDFList:[''],
			Sort: [''],
			IsDeleted: [''],
			IsDisabled: [''],
			CreatedBy: [''],
			CreatedDate: [''],
			ModifiedBy: [''],
			ModifiedDate: [''],
		});
	}
	preLoadData(event?: any): void {
		this.branchList = [...this.env.branchList];
		this.query.IDBranch = [null,...this.env.selectedBranchAndChildren].join(',').toString();
		super.preLoadData(event);
	}
	loadedData(event) {
		this.udfProvider.read({}).then((res: any) => {
			if(res && res.data && res.data.length > 0){
				this.items = res.data;
				if(this.item.UDFList){
					let udfList = JSON.parse(this.item.UDFList);
					udfList.forEach(i => {
						let udf = this.items.find((x:any) => x.Id == i);
						udf.checked=true;
						super.changeSelection(udf, event);
					})
				}
			}
		});
		
		super.loadedData(event);
		if(!this.item.Id){
			this.formGroup.controls.Status.markAsDirty();
		}
		
	}
	
	changeSelection(i: any, e?: any): void {
		super.changeSelection(i, e);
		if(i.selectedItems){
			let selectedItems =  `[${i.selectedItems.map((x: any) => x.Id).join(',')}]`;
			this.formGroup.controls.UDFList.setValue(selectedItems);
			this.formGroup.controls.UDFList.markAsDirty();
			this.saveChange2();
		}
	}
	
	segmentView = 's1';
	segmentChanged(ev: any) {
		this.segmentView = ev.detail.value;
	}
}
