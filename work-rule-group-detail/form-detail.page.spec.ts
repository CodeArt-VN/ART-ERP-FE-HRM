import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDetailPage } from './work-rule-group-detail.page';

describe('FormDetailPage', () => {
	let component: FormDetailPage;
	let fixture: ComponentFixture<FormDetailPage>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [FormDetailPage],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(FormDetailPage);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
