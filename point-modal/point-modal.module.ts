import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ShareModule } from 'src/app/share.module';
import { PointModalPage } from './point-modal.page';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, TranslateModule, ShareModule],
	declarations: [PointModalPage],
	exports: [PointModalPage],
})
export class PointModalPageModule {}
