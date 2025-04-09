import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShareModule } from 'src/app/share.module';
import { UDFDetailPage } from './udf-detail.page';

const routes: Routes = [
    {
        path: '',
        component: UDFDetailPage,
    },
];

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule, RouterModule.forChild(routes)],
    declarations: [UDFDetailPage],
})
export class UDFDetailPageModule {}
