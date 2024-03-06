import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/share.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaffFamilyComponent } from './staff-family/staff-family.component';

@NgModule({
  imports: [IonicModule, CommonModule, ShareModule, FormsModule, ReactiveFormsModule],
  declarations: [StaffFamilyComponent],
  exports: [StaffFamilyComponent],
})
export class StaffComponentsModule {}
