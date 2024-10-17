import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StaffEmploymentStatusComponent } from './staff-employment-status.component';

describe('StaffEmploymentStatusComponent', () => {
  let component: StaffEmploymentStatusComponent;
  let fixture: ComponentFixture<StaffEmploymentStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StaffEmploymentStatusComponent],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffEmploymentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
