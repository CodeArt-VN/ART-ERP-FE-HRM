import { normalizeOfficeIds, officesForAssignment, readTimesheetOption, writeTimesheetOption } from './timesheet-detail.option';

describe('normalizeOfficeIds', () => {
	it('returns null when the workplace is empty', () => {
		expect(normalizeOfficeIds(null)).toBeNull();
		expect(normalizeOfficeIds(undefined)).toBeNull();
		expect(normalizeOfficeIds('')).toBeNull();
		expect(normalizeOfficeIds([])).toBeNull();
	});

	it('keeps several offices and drops blanks or duplicates', () => {
		expect(normalizeOfficeIds([3, '5', 3, null, 0, 'x'])).toEqual([3, 5]);
	});
});

describe('readTimesheetOption', () => {
	it('reads workplaces from Option and leaves ShiftList alone', () => {
		const option = readTimesheetOption(JSON.stringify({ ShiftList: [9], IDOffice: [1, 2] }));
		expect(option.ShiftList).toEqual([9]);
		expect(option.IDOffice).toEqual([1, 2]);
	});

	it('returns a null workplace when Option has no offices', () => {
		expect(readTimesheetOption(JSON.stringify({ ShiftList: [9] })).IDOffice).toBeNull();
		expect(readTimesheetOption('').IDOffice).toBeNull();
		expect(readTimesheetOption('not-json').ShiftList).toBe('');
	});
});

describe('writeTimesheetOption', () => {
	it('stores several offices and keeps other Option keys', () => {
		const raw = writeTimesheetOption(JSON.stringify({ ShiftList: [1], Extra: 'keep' }), [2], [4, 8]);
		expect(JSON.parse(raw)).toEqual({ ShiftList: [2], Extra: 'keep', IDOffice: [4, 8] });
	});

	it('stores null when every workplace is cleared', () => {
		const raw = writeTimesheetOption(JSON.stringify({ ShiftList: [1], IDOffice: [4] }), [1], []);
		expect(JSON.parse(raw).IDOffice).toBeNull();
	});
});

describe('officesForAssignment', () => {
	const offices = [
		{ Id: 1, Name: 'A' },
		{ Id: 2, Name: 'B' },
	];

	it('offers every office when the timesheet workplace is empty', () => {
		expect(officesForAssignment(offices, null)).toEqual(offices);
	});

	it('limits the list to workplaces saved on the timesheet', () => {
		expect(officesForAssignment(offices, [2]).map((office) => office.Id)).toEqual([2]);
	});

	it('keeps the office already on the shift when it is outside the timesheet list', () => {
		expect(officesForAssignment(offices, [2], 1).map((office) => office.Id)).toEqual([1, 2]);
	});
});
