import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasualLabourRegisterPage } from './casual-labour-register.page';

describe('CasualLabourRegisterPage', () => {
  let component: CasualLabourRegisterPage;
  let fixture: ComponentFixture<CasualLabourRegisterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CasualLabourRegisterPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasualLabourRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
