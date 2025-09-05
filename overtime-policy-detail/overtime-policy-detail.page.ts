import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { PageBase } from 'src/app/page-base';
import { ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/core/env.service';
import { FormBuilder, Validators, FormControl,FormArray } from '@angular/forms';
import { CommonService } from 'src/app/services/core/common.service';
import { HRM_PolOvertimeProvider } from 'src/app/services/static/services.service';
@Component({
	selector: 'app-overtime-policy-detail',
	templateUrl: './overtime-policy-detail.page.html',
	styleUrls: ['./overtime-policy-detail.page.scss'],
	standalone: false,
})
export class OvertimePolicyDetailPage extends PageBase {
	typeList = [];
	branchList;
	constructor(
		public pageProvider: HRM_PolOvertimeProvider,
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
			IDBranch: [this.env.selectedBranch],
			Id: new FormControl({ value: '', disabled: true }),
			Code: [''],
			Name: ['', Validators.required],
			Remark: [''],
			Type: ['', Validators.required],
			Start: ['', Validators.required],
			End: ['', Validators.required],
			IsOvernightShift: [false],
			MaxMinuteOfOTInCycle: [''],
			EffectiveDate:[''],
			ConvertToPTO:[''],
			PolRateOvertimes: this.formBuilder.array([])

		});
	}

	preLoadData(event?: any): void {
		this.branchList = [...this.env.user.BranchList];
		this.branchList.filter(d=> d.disabled).forEach(b=>{
			b.disabled = false;
		})
		this.env.getType('OvertimeType').then((data) => {
			this.typeList = data;
			super.preLoadData(event);
		});
	}
	loadedData(){
		this.patchPolRateOvertime();
		super.loadedData();
	}
	patchPolRateOvertime(){
		let groups = this.formGroup.get('PolRateOvertimes') as FormArray;
		groups.clear();
		if(this.item.PolRateOvertimes){
			this.item.PolRateOvertimes.forEach(i=>{
				this.addPolRateOverTime(i);
			})
		}
		if(!this.pageConfig.canEdit) groups.disable();
	}
	addPolRateOverTime(line){
		let groups = this.formGroup.get('PolRateOvertimes') as FormArray;
		let group = this.formBuilder.group({
			Id : [line?.Id],
			Rate:[line?.Rate,Validators.required],
			IsAddBonusBenefit:[line?.IsAddBonusBenefit],
			BonusPercentage:[line?.BonusPercentage,Validators.required],
			ApplyBranches : [line?.ApplyBranches]
		});
		groups.push(group);
	}
	
	async saveChange() {
		super.saveChange2();
	}
}
