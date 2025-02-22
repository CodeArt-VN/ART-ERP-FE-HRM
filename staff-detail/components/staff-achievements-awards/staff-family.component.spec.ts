import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffAchievementsAwardsComponent } from './staff-achievements-awards.component';

describe('StaffAchievementsAwardsComponent', () => {
	let component: StaffAchievementsAwardsComponent;
	let fixture: ComponentFixture<StaffAchievementsAwardsComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffAchievementsAwardsComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffAchievementsAwardsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
