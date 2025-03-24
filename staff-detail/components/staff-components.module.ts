import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/share.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffFamilyComponent } from './staff-family/staff-family.component';
import { StaffJobInformationComponent } from './staff-job-information/staff-job-information.component';
import { StaffPersonnelProfileComponent } from './staff-personnel-profile/staff-personnel-profile.component';
import { RouterModule } from '@angular/router';
import { MapCompsModule } from 'src/app/components/map-comps/map-comps.module';
import { StaffSalaryBenefitsComponent } from './staff-salary-benefits/staff-salary-benefits.component';
import { StaffAssignedTasksComponent } from './staff-assigned-tasks/staff-assigned-tasks.component';
import { StaffAchievementsAwardsComponent } from './staff-achievements-awards/staff-achievements-awards.component';
import { StaffReviewsFeedbackComponent } from './staff-reviews-feedback/staff-reviews-feedback.component';
import { StaffContractsDocumentsComponent } from './staff-contracts-documents/staff-contracts-documents.component';
import { StaffViolateComponent } from './staff-violate/staff-violate.component';
import { StaffCompanyAssetsComponent } from './staff-company-assets/staff-company-assets.component';
import { StaffEmploymentStatusComponent } from './staff-employment-status/staff-employment-status.component';
import { StaffActiveDataComponent } from './staff-active-data/staff-active-data.component';
import { StaffWorkScheduleComponent } from './staff-work-schedule/staff-work-schedule.component';
import { StaffPersonnelFamilyComponent } from './staff-personnel-profile/staff-personnel-family/staff-personnel-family.component';
import { StaffPersonnelIdentityCardAndPITComponent } from './staff-personnel-profile/staff-personnel-identity-card-and-PIT/staff-personnel-identity-card-and-PIT.component';
import { StaffPersonnelBankComponent } from './staff-personnel-profile/staff-personnel-bank/staff-personnel-bank.component';
import { StaffAcademicLevelComponent } from './staff-personnel-profile/staff-academic-level/staff-academic-level.component';
import { StaffAnotherSkillComponent } from './staff-personnel-profile/staff-another-skill/staff-another-skill.component';
import { StaffForeignLanguageComponent } from './staff-personnel-profile/staff-foreign-language/staff-foreign-language.component';
import { StaffSpecializedFieldComponent } from './staff-personnel-profile/staff-specialized-field/staff-specialized-field.component';
import { StaffSpecializedSkillComponent } from './staff-personnel-profile/staff-specialized-skill/staff-specialized-skill.component';
import { StaffWorkExperienceComponent } from './staff-personnel-profile/staff-work-experience/staff-work-experience.component';

@NgModule({
	imports: [
		IonicModule,
		CommonModule,
		ShareModule,
		RouterModule,
		FormsModule,
		MapCompsModule,
		ReactiveFormsModule,
		//  GoogleMapsModule,
	],
	declarations: [
		StaffPersonnelProfileComponent,
		StaffJobInformationComponent,
		StaffSalaryBenefitsComponent,
		StaffFamilyComponent,
		StaffAssignedTasksComponent,
		StaffAchievementsAwardsComponent,
		StaffViolateComponent,
		StaffReviewsFeedbackComponent,
		StaffContractsDocumentsComponent,
		StaffCompanyAssetsComponent,
		StaffEmploymentStatusComponent,
		StaffActiveDataComponent,
		StaffWorkScheduleComponent,
		StaffPersonnelFamilyComponent,
		StaffPersonnelIdentityCardAndPITComponent,
		StaffPersonnelBankComponent,
		StaffAcademicLevelComponent,
		StaffAnotherSkillComponent,
		StaffForeignLanguageComponent,
		StaffSpecializedFieldComponent,
		StaffSpecializedSkillComponent,
		StaffWorkExperienceComponent
	],
	exports: [
		StaffPersonnelProfileComponent,
		StaffJobInformationComponent,
		StaffSalaryBenefitsComponent,
		StaffFamilyComponent,
		StaffAssignedTasksComponent,
		StaffAchievementsAwardsComponent,
		StaffViolateComponent,
		StaffReviewsFeedbackComponent,
		StaffContractsDocumentsComponent,
		StaffCompanyAssetsComponent,
		StaffEmploymentStatusComponent,
		StaffActiveDataComponent,
		StaffWorkScheduleComponent,
		StaffPersonnelFamilyComponent,
		StaffPersonnelIdentityCardAndPITComponent,
		StaffPersonnelBankComponent,
		StaffAcademicLevelComponent,
		StaffAnotherSkillComponent,
		StaffForeignLanguageComponent,
		StaffSpecializedFieldComponent,
		StaffSpecializedSkillComponent,
		StaffWorkExperienceComponent
	],
})
export class StaffComponentsModule {}
