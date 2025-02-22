import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffContractsDocumentsComponent } from './staff-contracts-documents.component';

describe('StaffContractsDocumentsComponent', () => {
	let component: StaffContractsDocumentsComponent;
	let fixture: ComponentFixture<StaffContractsDocumentsComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [StaffContractsDocumentsComponent],
			imports: [IonicModule.forRoot()],
		}).compileComponents();

		fixture = TestBed.createComponent(StaffContractsDocumentsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
