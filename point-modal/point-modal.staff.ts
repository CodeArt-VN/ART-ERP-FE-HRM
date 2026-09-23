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
