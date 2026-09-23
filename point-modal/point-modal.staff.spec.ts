import { formatWorkdayPoint, pointModalAccent, pointModalCalcFields, resolvePointModalStaff, resolveTimesheetPointCard } from './point-modal.staff';

describe('resolvePointModalStaff', () => {
	it('uses the calendar resource when the event has no staff name', () => {
		const event = {
			getResources: () => [
				{
					title: 'Fallback',
					extendedProps: { FullName: 'Huỳnh Lê Hoàng', JobTitle: 'Bếp trưởng', Code: 'MFB-02894' },
				},
			],
		};

		expect(resolvePointModalStaff({ WorkingDate: '17/08/2026' }, event)).toEqual({
			name: 'Huỳnh Lê Hoàng',
			job: 'Bếp trưởng',
			code: 'MFB-02894',
		});
	});

	it('keeps FullName already stored on the event', () => {
		const event = {
			getResources: () => [{ extendedProps: { FullName: 'Resource name', Code: 'R-1' } }],
		};

		expect(resolvePointModalStaff({ FullName: 'Event name', Code: 'E-1' }, event)).toEqual({
			name: 'Event name',
			job: '',
			code: 'R-1',
		});
	});

	it('returns blanks when the event has no resource', () => {
		expect(resolvePointModalStaff({}, { getResources: () => [] })).toEqual({
			name: '',
			job: '',
			code: '',
		});
	});
});

describe('formatWorkdayPoint', () => {
	it('rounds decimals to two places and leaves whole numbers as integers', () => {
		expect(formatWorkdayPoint(1)).toBe('1');
		expect(formatWorkdayPoint(1.001)).toBe('1');
		expect(formatWorkdayPoint(1.1)).toBe('1.1');
		expect(formatWorkdayPoint(0.98)).toBe('0.98');
		expect(formatWorkdayPoint(0.52)).toBe('0.52');
		expect(formatWorkdayPoint(0.979)).toBe('0.98');
		expect(formatWorkdayPoint(0)).toBe('0');
		expect(formatWorkdayPoint(null)).toBe('');
	});
});

describe('resolveTimesheetPointCard', () => {
	it('shows the timesheet name and the OFF allocation when there is no work shift', () => {
		const card = resolveTimesheetPointCard(
			{ IDTimesheet: 135, TimeOffType: 'OFF', IDShift: null },
			[{ Id: 135, Name: 'Sushi Tei Cao Thắng' }],
			[{ Code: 'OFF', Name: 'Nghỉ tuần, nghỉ do không có tiệc', Color: null }]
		);
		expect(card.timesheet).toEqual({ Name: 'Sushi Tei Cao Thắng' });
		expect(card.shift?.Name).toBe('OFF');
		expect(card.shift?.Detail).toBe('Nghỉ tuần, nghỉ do không có tiệc');
		expect(card.shift?.Start).toBeUndefined();
	});
});

describe('pointModalCalcFields', () => {
	it('hides the work window and shows zero when there is no check-in log', () => {
		expect(pointModalCalcFields(false, { Breaks: null, MinutesOfWorked: null })).toEqual({
			showWindow: false,
			breaks: 0,
			minutes: 0,
		});
	});

	it('keeps start and end visible when logs exist', () => {
		expect(pointModalCalcFields(true, { Breaks: 60, MinutesOfWorked: 480 })).toEqual({
			showWindow: true,
			breaks: 60,
			minutes: 480,
		});
	});
});

describe('pointModalAccent', () => {
	it('maps a named status color to an Ionic variable', () => {
		expect(pointModalAccent('success')).toBe('var(--ion-color-success)');
	});

	it('keeps a resolved color value', () => {
		expect(pointModalAccent('#67cb49')).toBe('#67cb49');
	});
});