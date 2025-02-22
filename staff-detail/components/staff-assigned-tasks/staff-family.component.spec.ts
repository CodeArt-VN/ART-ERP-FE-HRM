import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffAssignedTasksComponent } from './staff-assigned-tasks.component';

describe('StaffAssignedTasksComponent', () => {
	let component: StaffAssignedTasksComponent;
	let fixture: ComponentFixture<StaffAssignedTasksComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffAssignedTasksComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffAssignedTasksComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
