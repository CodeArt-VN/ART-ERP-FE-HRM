import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { StaffDetailPage } from './staff-detail.page';
import {FileUploadModule} from 'ng2-file-upload';
import { StaffComponentsModule } from './components/staff-components.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

const routes: Routes = [
  {
    path: '',
    component: StaffDetailPage
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgOptionHighlightModule,
    ShareModule,
    FileUploadModule,
    StaffComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StaffDetailPage]
})
export class StaffDetailPageModule {}
