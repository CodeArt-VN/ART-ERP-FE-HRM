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
    StaffWorkScheduleComponent
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
    StaffWorkScheduleComponent
  ],
})
export class StaffComponentsModule {}
