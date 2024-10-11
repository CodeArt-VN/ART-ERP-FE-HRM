import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { StaffDetailPage } from './staff-detail.page';
import { StaffComponentsModule } from './components/staff-components.module';
import { MapCompsModule } from 'src/app/components/map-comps/map-comps.module';

const routes: Routes = [
  {
    path: '',
    component: StaffDetailPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MapCompsModule,
    ShareModule,
    StaffComponentsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [StaffDetailPage],
})
export class StaffDetailPageModule {}
