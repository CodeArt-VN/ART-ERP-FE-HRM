/** Workplace ids stored in tbl_HRM_Timesheet.Option. Empty selection is null. */
export function normalizeOfficeIds(value: unknown): number[] | null {
	if (value == null || value === '') return null;
	const list = Array.isArray(value) ? value : [value];
	const ids: number[] = [];
	for (const raw of list) {
		const id = Number(raw);
		if (!Number.isFinite(id) || id <= 0 || ids.includes(id)) continue;
		ids.push(id);
	}
	return ids.length ? ids : null;
}

export function readTimesheetOption(raw: string | null | undefined): { ShiftList: unknown; IDOffice: number[] | null } {
	const parsed = parseOptionObject(raw);
	return {
		ShiftList: parsed.ShiftList ?? '',
		IDOffice: normalizeOfficeIds(parsed.IDOffice),
	};
}

/** Keeps existing Option keys, then writes ShiftList and IDOffice (null when none selected). */
export function writeTimesheetOption(raw: string | null | undefined, shiftList: unknown, idOffice: unknown): string {
	const next = parseOptionObject(raw);
	next.ShiftList = shiftList ?? '';
	next.IDOffice = normalizeOfficeIds(idOffice);
	return JSON.stringify(next);
}

/** Offices offered when assigning a shift. Null on the timesheet means every office. */
export function officesForAssignment<T extends { Id?: number | null }>(
	offices: T[] | null | undefined,
	allowedIds: unknown,
	selectedId?: unknown
): T[] {
	const list = Array.isArray(offices) ? offices : [];
	const allowed = normalizeOfficeIds(allowedIds);
	if (!allowed) return list;
	const filtered = list.filter((office) => allowed.includes(Number(office?.Id)));
	const selected = normalizeOfficeIds(selectedId)?.[0];
	if (selected && !filtered.some((office) => Number(office?.Id) === selected)) {
		const current = list.find((office) => Number(office?.Id) === selected);
		if (current) filtered.unshift(current);
	}
	return filtered;
}

function parseOptionObject(raw: string | null | undefined): Record<string, unknown> {
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return { ...parsed };
	} catch {
		return {};
	}
	return {};
}
