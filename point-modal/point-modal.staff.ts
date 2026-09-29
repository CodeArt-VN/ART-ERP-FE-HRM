export function formatWorkdayPoint(value: unknown): string {
	if (value === null || value === undefined || value === '') return '';
	const point = Number(value);
	if (!Number.isFinite(point)) return '';
	return String(Math.round(point * 100) / 100);
}

export function pointModalAccent(color: string | null | undefined): string {
	const value = String(color || 'medium').trim();
	if (!value) return 'var(--ion-color-medium)';
	if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl') || value.startsWith('var(')) return value;
	return `var(--ion-color-${value})`;
}

export function resolveTimesheetPointCard(
	record: any,
	timesheets?: Array<{ Id?: unknown; Name?: string | null }> | null,
	timeoffTypes?: Array<{ Code?: string | null; Name?: string | null; Color?: string | null }> | null
): { timesheet: { Name: string } | null; shift: { Name: string; Detail?: string; Color?: string; Start?: string; End?: string } | null } {
	const timesheet = (timesheets || []).find((d) => d && d.Id == record?.IDTimesheet);
	const timesheetCard = timesheet?.Name ? { Name: String(timesheet.Name) } : record?.Timesheet?.Name ? { Name: String(record.Timesheet.Name) } : null;
	if (record?.TimeOffType) {
		const code = String(record.TimeOffType);
		const toType = (timeoffTypes || []).find((d) => d && d.Code == record.TimeOffType);
		const detail = toType?.Name && String(toType.Name) !== code ? String(toType.Name) : '';
		const color = String(toType?.Color || record?.Color || 'medium').trim().toLowerCase();
		return {
			timesheet: timesheetCard,
			shift: {
				Name: code,
				Detail: detail,
				Color: color && !/[#()\s]/.test(color) ? color : 'medium',
			},
		};
	}
	return {
		timesheet: timesheetCard,
		shift: record?.Shift || null,
	};
}

export function pointModalCalcFields(hasLogs: boolean, item?: { Breaks?: unknown; MinutesOfWorked?: unknown } | null): { showWindow: boolean; breaks: unknown; minutes: unknown } {
	if (!hasLogs) return { showWindow: false, breaks: 0, minutes: 0 };
	return {
		showWindow: true,
		breaks: item?.Breaks ?? '',
		minutes: item?.MinutesOfWorked ?? '',
	};
}

export function pointModalIncludesNextDayLogs(item?: {
	Type?: string | null;
	ShiftType?: string | null;
	IsOvernightShift?: boolean;
	ShiftStart?: string | null;
	ShiftEnd?: string | null;
	Shift?: { Type?: string | null; IsOvernightShift?: boolean; Start?: string | null; End?: string | null } | null;
} | null): boolean {
	const overnight = !!(item?.IsOvernightShift || item?.Shift?.IsOvernightShift);
	const type = String(item?.Type || item?.ShiftType || item?.Shift?.Type || '').trim().toLowerCase();
	if (overnight || type === 'nightshift' || type === 'overnightshift' || type === 'ca đêm') return true;
	const start = clockToMinutes(item?.ShiftStart || item?.Shift?.Start);
	const end = clockToMinutes(item?.ShiftEnd || item?.Shift?.End);
	return start != null && end != null && start > end;
}

export function pointModalLogRange(
	workingDate: string | null | undefined,
	item?: Parameters<typeof pointModalIncludesNextDayLogs>[0]
): { from: string; to: string } {
	const start = parseWorkingDate(workingDate);
	if (!start) return { from: '', to: '' };
	const end = new Date(start.getTime());
	if (pointModalIncludesNextDayLogs(item)) end.setDate(end.getDate() + 1);
	return { from: `${formatDay(start)}T00:00:00`, to: `${formatDay(end)}T23:59:59` };
}

function parseWorkingDate(workingDate: string | null | undefined): Date | null {
	const parts = String(workingDate || '').split('/');
	if (parts.length !== 3) return null;
	const day = Number(parts[0]);
	const month = Number(parts[1]);
	const year = Number(parts[2]);
	if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
	return date;
}

function formatDay(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

function clockToMinutes(value: string | null | undefined): number | null {
	const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
	if (!match) return null;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour > 23 || minute > 59) return null;
	return hour * 60 + minute;
}

export function resolvePointModalStaff(item: any, event: any): { name: string; job: string; code: string } {
	let resource: any;
	try {
		resource = event?.getResources?.()?.[0];
	} catch {
		resource = undefined;
	}
	const props = resource?.extendedProps || {};
	return {
		name: String(item?.FullName || props.FullName || resource?.title || '').trim(),
		job: String(props.JobTitle || '').trim(),
		code: String(props.Code || item?.Code || '').trim(),
	};
}
