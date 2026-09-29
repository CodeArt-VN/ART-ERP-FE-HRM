import {
	buildDetailColumns,
	buildSummaryColumns,
	buildSummaryColumnsFromHeaders,
	buildTimesheetRecordColumnsQuery,
	buildTimesheetRecordDetailExportQuery,
	buildTimesheetRecordSummaryExportQuery,
	formatTimesheetNumber,
	formatTimesheetDateTime,
	formatTimesheetDate,
	resolveTimesheetCycleConfigTarget,
	staffTimesheetColumnIsDate,
	staffTimesheetColumnIsDateTime,
	staffTimesheetColumnIsNumeric,
	staffTimesheetJobTitleId,
	staffTimesheetStaffColumn,
} from './staff-timesheet.columns';

describe('resolveTimesheetCycleConfigTarget', () => {
	it('maps IDDetail from the selected timesheet option', () => {
		expect(
			resolveTimesheetCycleConfigTarget({
				IDDetail: 777,
				Name: 'Bảo vệ Nội bộ',
				Status: 'Draft',
			})
		).toEqual({
			idTimesheetCycleDetail: 777,
			timesheetName: 'Bảo vệ Nội bộ',
			status: 'Draft',
		});
	});

	it('returns null when cycle detail id is missing', () => {
		expect(resolveTimesheetCycleConfigTarget(null)).toBeNull();
		expect(resolveTimesheetCycleConfigTarget({ Name: 'X' })).toBeNull();
	});

	it('defaults status to Draft for cycle template modal props', () => {
		expect(resolveTimesheetCycleConfigTarget({ IDDetail: 1, Name: 'A' })?.status).toBe('Draft');
	});
});

describe('buildTimesheetRecordColumnsQuery', () => {
	it('requires both timesheet and cycle ids for cycle-config columns', () => {
		expect(buildTimesheetRecordColumnsQuery({ IDTimesheet: 12, IDTimesheetCycle: 99 })).toEqual({
			IDTimesheet: 12,
			IDTimesheetCycle: 99,
		});
		expect(buildTimesheetRecordColumnsQuery({ IDTimesheet: 12 })).toBeNull();
		expect(buildTimesheetRecordColumnsQuery({ IDTimesheetCycle: 99 })).toBeNull();
		expect(buildTimesheetRecordColumnsQuery(null)).toBeNull();
	});

	it('must not emit both IDTimesheetCycle and IDTimeSheetCycle (BE QueryStrings is case-insensitive)', () => {
		const q = buildTimesheetRecordColumnsQuery({ IDTimesheet: 12, IDTimesheetCycle: 99 }) as Record<string, number>;
		const keys = Object.keys(q).map((k) => k.toLowerCase());
		expect(keys.filter((k) => k === 'idtimesheetcycle').length).toBe(1);
	});
});

describe('buildTimesheetRecordSummaryExportQuery', () => {
	it('requires timesheet + cycle and may include Lang', () => {
		expect(buildTimesheetRecordSummaryExportQuery({ IDTimesheet: 12, IDTimesheetCycle: 99 })).toEqual({
			IDTimesheet: 12,
			IDTimesheetCycle: 99,
		});
		expect(
			buildTimesheetRecordSummaryExportQuery({ IDTimesheet: 12, IDTimesheetCycle: 99, Lang: 'vi-VN' })
		).toEqual({
			IDTimesheet: 12,
			IDTimesheetCycle: 99,
			Lang: 'vi-VN',
		});
		expect(buildTimesheetRecordSummaryExportQuery({ IDTimesheet: 12 })).toBeNull();
	});

	it('emits a single cycle key casing', () => {
		const q = buildTimesheetRecordSummaryExportQuery({ IDTimesheet: 1, IDTimesheetCycle: 2 }) as Record<
			string,
			unknown
		>;
		expect(Object.keys(q).filter((k) => k.toLowerCase() === 'idtimesheetcycle')).toEqual(['IDTimesheetCycle']);
	});
});

describe('buildTimesheetRecordDetailExportQuery', () => {
	it('includes working date range without duplicate cycle keys', () => {
		const q = buildTimesheetRecordDetailExportQuery({
			IDTimesheet: 12,
			IDTimesheetCycle: 99,
			WorkingDateFrom: '2026-09-01',
			WorkingDateTo: '2026-09-30',
			Lang: 'en-US',
		}) as Record<string, unknown>;
		expect(q).toEqual({
			IDTimesheet: 12,
			IDTimesheetCycle: 99,
			WorkingDateFrom: '2026-09-01',
			WorkingDateTo: '2026-09-30',
			Lang: 'en-US',
		});
		expect(Object.keys(q).filter((k) => k.toLowerCase() === 'idtimesheetcycle')).toEqual(['IDTimesheetCycle']);
	});

	it('returns null when timesheet or cycle missing', () => {
		expect(buildTimesheetRecordDetailExportQuery({ IDTimesheet: 12 })).toBeNull();
	});
});

describe('staffTimesheetStaffColumn', () => {
	it('pins a wide name column', () => {
		expect(staffTimesheetStaffColumn.width).toBe(320);
	});
});

describe('staffTimesheetJobTitleId', () => {
	it('returns a positive job title id', () => {
		expect(staffTimesheetJobTitleId({ IDJobTitle: 12 })).toBe(12);
		expect(staffTimesheetJobTitleId(null)).toBeNull();
		expect(staffTimesheetJobTitleId({})).toBeNull();
		expect(staffTimesheetJobTitleId({ IDJobTitle: 0 })).toBeNull();
	});
});

describe('buildDetailColumns', () => {
	it('keeps visible lines ordered by Sort', () => {
		const cols = buildDetailColumns([
			{ Code: 'B', Name: 'Late', Sort: 2, IsHidden: false },
			{ Code: 'A', Name: 'Point', Sort: 1, IsHidden: false },
			{ Code: 'H', Name: 'Hidden', Sort: 0, IsHidden: true },
			{ Code: '', Name: 'Empty', Sort: 3 },
		]);

		expect(cols.map((c) => c.Code)).toEqual(['A', 'B']);
		expect(cols[0].Name).toBe('Point');
	});

	it('puts null Sort last', () => {
		const cols = buildDetailColumns([
			{ Code: 'Z', Name: 'Z', Sort: null },
			{ Code: 'A', Name: 'A', Sort: 1 },
		]);
		expect(cols.map((c) => c.Code)).toEqual(['A', 'Z']);
	});
});

describe('buildSummaryColumns', () => {
	it('keeps IsSummary lines ordered by SummarySort', () => {
		const cols = buildSummaryColumns([
			{ Code: 'Work', Name: 'Work days', IsSummary: true, SummarySort: 2, Sort: 1 },
			{ Code: 'Point', Name: 'Point', IsSummary: true, SummarySort: 1, Sort: 5 },
			{ Code: 'Skip', Name: 'Not summary', IsSummary: false, SummarySort: 1 },
			{ Code: 'Hide', Name: 'Hidden summary', IsSummary: true, IsHidden: true, SummarySort: 0 },
		]);

		expect(cols.map((c) => c.Code)).toEqual(['Point', 'Work']);
		expect(cols[0].Name).toBe('Point');
	});

	it('falls back to Sort when SummarySort ties', () => {
		const cols = buildSummaryColumns([
			{ Code: 'B', Name: 'B', IsSummary: true, SummarySort: 1, Sort: 2 },
			{ Code: 'A', Name: 'A', IsSummary: true, SummarySort: 1, Sort: 1 },
		]);
		expect(cols.map((c) => c.Code)).toEqual(['A', 'B']);
	});

	it('drops a line when IsSummary is turned off in cycle config', () => {
		const before = buildSummaryColumns([
			{ Code: 'Off', Name: 'Off', IsSummary: true, SummarySort: 1 },
			{ Code: 'Point', Name: 'Point', IsSummary: true, SummarySort: 2 },
		]);
		const after = buildSummaryColumns([
			{ Code: 'Off', Name: 'Off', IsSummary: false, SummarySort: 1 },
			{ Code: 'Point', Name: 'Point', IsSummary: true, SummarySort: 2 },
		]);
		expect(before.map((c) => c.Code)).toEqual(['Off', 'Point']);
		expect(after.map((c) => c.Code)).toEqual(['Point']);
	});
});

describe('buildSummaryColumnsFromHeaders', () => {
	it('maps SP header rows to columns', () => {
		const cols = buildSummaryColumnsFromHeaders([
			{ ColCode: 'Point', ColLabel: 'Công', SummaryMethod: 'SUM' },
			{ ColCode: '', ColLabel: 'Skip' },
		]);
		expect(cols).toEqual([{ Code: 'Point', Name: 'Công', SummaryMethod: 'SUM', numeric: true, DataType: undefined, UDFValue: undefined }]);
	});
});

describe('formatTimesheetNumber', () => {
	it('keeps at most 2 fraction digits in the given locale', () => {
		expect(formatTimesheetNumber(1.239, 'vi-VN')).toBe('1,24');
		expect(formatTimesheetNumber(1.239, 'en-US')).toBe('1.24');
		expect(formatTimesheetNumber(8, 'en-US')).toBe('8');
		expect(formatTimesheetNumber(null)).toBe('');
	});
});

describe('formatTimesheetDateTime', () => {
	it('formats a datetime as yyyy-MM-dd HH:mm', () => {
		expect(formatTimesheetDateTime('2026-09-24T10:35:59')).toBe('2026-09-24 10:35');
		expect(formatTimesheetDateTime(null)).toBe('');
	});
});

describe('formatTimesheetDate', () => {
	it('formats a date as yyyy-MM-dd', () => {
		expect(formatTimesheetDate('2026-09-24T00:00:00')).toBe('2026-09-24');
		expect(formatTimesheetDate('2026-09-24')).toBe('2026-09-24');
		expect(formatTimesheetDate(null)).toBe('');
	});
});

describe('staffTimesheetColumnIsDate', () => {
	it('uses the date datatype and leaves text and datetime alone', () => {
		expect(staffTimesheetColumnIsDate({ Code: 'Day', DataType: 'date' })).toBe(true);
		expect(staffTimesheetColumnIsDate({ Code: 'Id', DataType: 'text' }, ['2026-09-24'])).toBe(false);
		expect(staffTimesheetColumnIsDate({ Code: 'In', DataType: 'datetime' })).toBe(false);
	});
});
describe('staffTimesheetColumnIsDateTime', () => {
	it('uses datatype or a datetime sample', () => {
		expect(staffTimesheetColumnIsDateTime({ Code: 'In', DataType: 'datetime' })).toBe(true);
		expect(staffTimesheetColumnIsDateTime({ Code: 'In' }, ['2026-09-24T10:35:00'])).toBe(true);
		expect(staffTimesheetColumnIsDateTime({ Code: 'Point', DataType: 'decimal' }, [1.5])).toBe(false);
	});
});
describe('staffTimesheetColumnIsNumeric', () => {
	it('uses datatype, summary method, or sampled values', () => {
		expect(staffTimesheetColumnIsNumeric({ Code: 'A', DataType: 'decimal' })).toBe(true);
		expect(staffTimesheetColumnIsNumeric({ Code: 'A', SummaryMethod: 'SUM' })).toBe(true);
		expect(staffTimesheetColumnIsNumeric({ Code: 'A' }, ['x', 1.5])).toBe(true);
		expect(staffTimesheetColumnIsNumeric({ Code: 'StaffId', DataType: 'text' }, [15943])).toBe(false);
	});
});
