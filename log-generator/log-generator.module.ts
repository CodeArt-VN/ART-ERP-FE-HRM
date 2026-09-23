import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ShareModule } from 'src/app/share.module';
import { LogGeneratorPage } from './log-generator.page';

@NgModule({
	imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule, ShareModule],
	declarations: [LogGeneratorPage],
	exports: [LogGeneratorPage],
})
export class LogGeneratorPageModule {}
