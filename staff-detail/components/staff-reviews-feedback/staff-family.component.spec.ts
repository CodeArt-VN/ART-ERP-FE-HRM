import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffReviewsFeedbackComponent } from './staff-reviews-feedback.component';

describe('StaffReviewsFeedbackComponent', () => {
	let component: StaffReviewsFeedbackComponent;
	let fixture: ComponentFixture<StaffReviewsFeedbackComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffReviewsFeedbackComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffReviewsFeedbackComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
