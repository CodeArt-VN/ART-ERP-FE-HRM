import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffDetailPage } from './staff-detail.page';

describe('StaffDetailPage', () => {
  let component: StaffDetailPage;
  let fixture: ComponentFixture<StaffDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
