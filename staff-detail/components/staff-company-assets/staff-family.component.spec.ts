import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffCompanyAssetsComponent } from './staff-company-assets.component';

describe('StaffCompanyAssetsComponent', () => {
	let component: StaffCompanyAssetsComponent;
	let fixture: ComponentFixture<StaffCompanyAssetsComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffCompanyAssetsComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffCompanyAssetsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
