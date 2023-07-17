import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ShareModule } from 'src/app/share.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { StaffFamilyComponent } from './staff-family/staff-family.component';



@NgModule({
  imports: [
    IonicModule,
		CommonModule,
		ShareModule,
		NgSelectModule,
		NgOptionHighlightModule,
		FormsModule,
		ReactiveFormsModule,
		NgxMaskModule.forRoot(),
  ],
  declarations: [StaffFamilyComponent],
  exports: [StaffFamilyComponent]
})
export class StaffComponentsModule { }
