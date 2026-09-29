export interface StaffTimesheetTemplateLine {
	Code?: string;
	Name?: string;
	DataType?: string;
	UDFValue?: any;
	IsHidden?: boolean;
	IsSummary?: boolean;
	Sort?: number | null;
	SummarySort?: number | null;
	SummaryMethod?: string | null;
}

export function resolveTimesheetCycleConfigTarget(selectedTimesheet: {
	IDDetail?: number;
	Name?: string;
	Status?: string;
} | null | undefined): { idTimesheetCycleDetail: number; timesheetName: string; status: string } | null {
	const idDetail = selectedTimesheet?.IDDetail;
	if (!idDetail) return null;
	return {
		idTimesheetCycleDetail: idDetail,
		timesheetName: selectedTimesheet?.Name || '',
		status: selectedTimesheet?.Status || 'Draft',
	};
}

/** Columns API must send cycle id so BE uses cycle config instead of the live template. */
export function buildTimesheetRecordColumnsQuery(input: {
	IDTimesheet?: number | null;
	IDTimesheetCycle?: number | null;
} | null | undefined): { IDTimesheet: number; IDTimesheetCycle: number } | null {
	const idTimesheet = Number(input?.IDTimesheet);
	const idTimesheetCycle = Number(input?.IDTimesheetCycle);
	if (!Number.isFinite(idTimesheet) || idTimesheet <= 0) return null;
	if (!Number.isFinite(idTimesheetCycle) || idTimesheetCycle <= 0) return null;
	return { IDTimesheet: idTimesheet, IDTimesheetCycle: idTimesheetCycle };
}

/** Summary export: one IDTimesheetCycle key only (BE QueryStrings is case-insensitive). */
export function buildTimesheetRecordSummaryExportQuery(input: {
	IDTimesheet?: number | null;
	IDTimesheetCycle?: number | null;
	Lang?: string | null;
} | null | undefined): { IDTimesheet: number; IDTimesheetCycle: number; Lang?: string } | null {
	const base = buildTimesheetRecordColumnsQuery(input);
	if (!base) return null;
	const lang = (input?.Lang || '').trim();
	return lang ? { ...base, Lang: lang } : { ...base };
}

/** Detail export: cycle + working-date range; do not emit IDTimeSheetCycle duplicate. */
export function buildTimesheetRecordDetailExportQuery(input: {
	IDTimesheet?: number | null;
	IDTimesheetCycle?: number | null;
	WorkingDateFrom?: string | Date | null;
	WorkingDateTo?: string | Date | null;
	Lang?: string | null;
} | null | undefined): {
	IDTimesheet: number;
	IDTimesheetCycle: number;
	WorkingDateFrom?: string | Date;
	WorkingDateTo?: string | Date;
	Lang?: string;
} | null {
	const base = buildTimesheetRecordColumnsQuery(input);
	if (!base) return null;
	const q: {
		IDTimesheet: number;
		IDTimesheetCycle: number;
		WorkingDateFrom?: string | Date;
		WorkingDateTo?: string | Date;
		Lang?: string;
	} = { ...base };
	if (input?.WorkingDateFrom != null && input.WorkingDateFrom !== '') q.WorkingDateFrom = input.WorkingDateFrom;
	if (input?.WorkingDateTo != null && input.WorkingDateTo !== '') q.WorkingDateTo = input.WorkingDateTo;
	const lang = (input?.Lang || '').trim();
	if (lang) q.Lang = lang;
	return q;
}

/** Name, code, and job title. Pinned so the data columns can scroll. */
export const staffTimesheetStaffColumn = { width: 320 };

export function staffTimesheetJobTitleId(staff: { IDJobTitle?: number } | null | undefined): number | null {
	const id = staff?.IDJobTitle;
	return typeof id === 'number' && id > 0 ? id : null;
}

export interface StaffTimesheetColumn {
	Code: string;
	Name: string;
	DataType?: string;
	UDFValue?: any;
	SummaryMethod?: string | null;
	numeric?: boolean;
	dateTime?: boolean;
	date?: boolean;
}

const NUMERIC_TYPES = new Set(['int', 'number', 'decimal', 'float', 'double', 'money', 'numeric']);
const NUMERIC_METHODS = new Set(['COUNT', 'COUNT_DISTINCT', 'SUM', 'AVG']);
const TEXT_TYPES = new Set(['text', 'varchar', 'nvarchar', 'nchar', 'char', 'string']);
const DATETIME_TYPES = new Set(['datetime', 'datetime2', 'date-time', 'datetimeoffset']);
const DATE_TYPES = new Set(['date']);

function sortByNumber(a: number | null | undefined, b: number | null | undefined): number {
	const av = a == null ? Number.MAX_SAFE_INTEGER : Number(a);
	const bv = b == null ? Number.MAX_SAFE_INTEGER : Number(b);
	return av - bv;
}

export function isFiniteTimesheetNumber(value: any): boolean {
	if (value === null || value === undefined || value === '' || typeof value === 'boolean') return false;
	const n = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(n);
}

/** Max 2 fraction digits; integers stay without a decimal part. Locale comes from the caller. */
export function formatTimesheetNumber(value: any, locale?: string): string {
	if (!isFiniteTimesheetNumber(value)) return value == null || value === '' ? '' : String(value);
	const n = typeof value === 'number' ? value : Number(value);
	return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

export function staffTimesheetColumnIsNumeric(column: StaffTimesheetColumn, samples: any[] = []): boolean {
	const type = String(column?.DataType || '').toLowerCase();
	if (TEXT_TYPES.has(type) || DATETIME_TYPES.has(type) || DATE_TYPES.has(type)) return false;
	if (NUMERIC_TYPES.has(type)) return true;
	if (type) return false;
	const method = String(column?.SummaryMethod || '').toUpperCase();
	if (NUMERIC_METHODS.has(method)) return true;
	return samples.some((v) => isFiniteTimesheetNumber(v));
}

const DATE_TIME_VALUE = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;

export function staffTimesheetColumnIsDateTime(column: StaffTimesheetColumn, samples: any[] = []): boolean {
	const type = String(column?.DataType || '').toLowerCase();
	if (TEXT_TYPES.has(type) || NUMERIC_TYPES.has(type) || DATE_TYPES.has(type)) return false;
	if (DATETIME_TYPES.has(type)) return true;
	if (type) return false;
	return samples.some((v) => typeof v === 'string' && DATE_TIME_VALUE.test(v.trim()));
}

const DATE_VALUE = /^\d{4}-\d{2}-\d{2}$/;

export function staffTimesheetColumnIsDate(column: StaffTimesheetColumn, samples: any[] = []): boolean {
	const type = String(column?.DataType || '').toLowerCase();
	if (TEXT_TYPES.has(type) || NUMERIC_TYPES.has(type) || DATETIME_TYPES.has(type)) return false;
	if (DATE_TYPES.has(type)) return true;
	if (type) return false;
	return samples.some((v) => typeof v === 'string' && DATE_VALUE.test(v.trim()));
}

/** Calendar date only, yyyy-MM-dd. Uses the date prefix so the day does not shift by timezone. */
export function formatTimesheetDate(value: any): string {
	if (value == null || value === '') return '';
	const text = String(value).trim();
	const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
	if (match) return match[1];
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return text;
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local wall time, yyyy-MM-dd HH:mm. */
export function formatTimesheetDateTime(value: any): string {
	if (value == null || value === '') return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return String(value);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toColumn(line: StaffTimesheetTemplateLine, summaryMethod?: string | null): StaffTimesheetColumn {
	const column: StaffTimesheetColumn = {
		Code: line.Code!,
		Name: line.Name || line.Code!,
		DataType: line.DataType,
		UDFValue: line.UDFValue,
		SummaryMethod: summaryMethod,
	};
	column.numeric = staffTimesheetColumnIsNumeric(column);
	return column;
}

/** Detail grid: visible template lines ordered by Sort. */
export function buildDetailColumns(lines: StaffTimesheetTemplateLine[] | null | undefined): StaffTimesheetColumn[] {
	return (lines || [])
		.filter((l) => !!l?.Code && !l.IsHidden)
		.slice()
		.sort((a, b) => sortByNumber(a.Sort, b.Sort))
		.map((l) => toColumn(l));
}

/** Summary grid: IsSummary lines ordered by SummarySort. */
export function buildSummaryColumns(lines: StaffTimesheetTemplateLine[] | null | undefined): StaffTimesheetColumn[] {
	return (lines || [])
		.filter((l) => !!l?.Code && !!l.IsSummary && !l.IsHidden)
		.slice()
		.sort((a, b) => {
			const bySummary = sortByNumber(a.SummarySort, b.SummarySort);
			if (bySummary !== 0) return bySummary;
			return sortByNumber(a.Sort, b.Sort);
		})
		.map((l) => toColumn(l, l.SummaryMethod));
}

export function buildSummaryColumnsFromHeaders(
	headers: { ColCode?: string; ColLabel?: string; SummaryMethod?: string; DataType?: string }[] | null | undefined
): StaffTimesheetColumn[] {
	return (headers || [])
		.filter((h) => !!h?.ColCode)
		.map((h) =>
			toColumn({ Code: h.ColCode, Name: h.ColLabel || h.ColCode, DataType: h.DataType }, h.SummaryMethod)
		);
}

export function markNumericColumns(columns: StaffTimesheetColumn[], rows: any[]): StaffTimesheetColumn[] {
	return columns.map((column) => ({
		...column,
		numeric: staffTimesheetColumnIsNumeric(
			column,
			rows.map((row) => row?._ListUDFValue?.[column.Code])
		),
		dateTime: staffTimesheetColumnIsDateTime(
			column,
			rows.map((row) => row?._ListUDFValue?.[column.Code])
		),
		date: staffTimesheetColumnIsDate(
			column,
			rows.map((row) => row?._ListUDFValue?.[column.Code])
		),
	}));
}
