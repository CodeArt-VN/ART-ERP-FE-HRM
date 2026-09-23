import {
	timesheetLogJobTitleId,
	timesheetLogRemarkColumn,
	timesheetLogRemarkGrows,
	timesheetLogStaffColumn,
	timesheetLogStaffIsPinned,
	timesheetLogStatusBadge,
	timesheetLogStatusColumn,
} from './timesheet-log.columns';

describe('timesheet log column widths', () => {
	it('pins the staff column to a fixed width', () => {
		expect(timesheetLogStaffColumn.width).toBe(320);
		expect(timesheetLogStaffIsPinned()).toBe(true);
	});

	it('lets the combined time and remark column grow into the remaining row', () => {
		expect(timesheetLogRemarkColumn.minWidth).toBe(220);
		expect(timesheetLogRemarkColumn.maxWidth).toBe('100%');
		expect(timesheetLogRemarkGrows()).toBe(true);
	});

	it('gives the status badge a fixed width', () => {
		expect(timesheetLogStatusColumn.width).toBe(150);
	});
});

describe('timesheetLogJobTitleId', () => {
	it('returns the staff job title id', () => {
		expect(timesheetLogJobTitleId({ IDJobTitle: 12 })).toBe(12);
	});

	it('returns null when the staff has no job title', () => {
		expect(timesheetLogJobTitleId(null)).toBeNull();
		expect(timesheetLogJobTitleId({})).toBeNull();
		expect(timesheetLogJobTitleId({ IDJobTitle: 0 })).toBeNull();
	});
});

describe('timesheetLogStatusBadge', () => {
	it('uses a success badge for a valid log', () => {
		expect(timesheetLogStatusBadge(true)).toEqual({ color: 'success', label: 'Valid' });
	});

	it('uses a danger badge for an invalid log', () => {
		expect(timesheetLogStatusBadge(false)).toEqual({ color: 'danger', label: 'InValid' });
	});
});
