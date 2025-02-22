import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffSalaryBenefitsComponent } from './staff-salary-benefits.component';

describe('StaffSalaryBenefitsComponent', () => {
	let component: StaffSalaryBenefitsComponent;
	let fixture: ComponentFixture<StaffSalaryBenefitsComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffSalaryBenefitsComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffSalaryBenefitsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
