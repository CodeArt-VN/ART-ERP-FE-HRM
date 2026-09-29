export interface TimesheetTemplateOption {
	Id: number;
	Name?: string;
	Code?: string;
}

export interface ResetTemplateRadioInput {
	type: 'radio';
	label: string;
	value: string;
	checked: boolean;
}

function toPositiveId(value: any): number | null {
	if (value == null || value === '') return null;
	const id = typeof value === 'number' ? value : parseInt(String(value), 10);
	return Number.isFinite(id) && id > 0 ? id : null;
}

/** Radio inputs for ion-alert when resetting cycle columns from a chosen template. */
export function buildResetTemplatePromptInputs(
	templates: TimesheetTemplateOption[] | null | undefined,
	defaultTemplateId?: number | null,
	currentSuffix = ' (current)'
): ResetTemplateRadioInput[] {
	const list: TimesheetTemplateOption[] = [];
	for (const t of templates || []) {
		const id = toPositiveId(t?.Id);
		if (!id) continue;
		list.push({ Id: id, Name: t?.Name, Code: t?.Code });
	}

	const preferredId = toPositiveId(defaultTemplateId);
	const preferred = preferredId && list.some((t) => t.Id === preferredId) ? preferredId : list[0]?.Id;

	return list.map((t) => ({
		type: 'radio' as const,
		label: (t.Name || t.Code || String(t.Id)) + (preferredId != null && t.Id === preferredId ? currentSuffix : ''),
		value: String(t.Id),
		checked: t.Id === preferred,
	}));
}

export function parseSelectedTemplateId(selected: any): number | null {
	if (selected == null || selected === '') return null;
	// Ionic radio may return the raw value, or rarely a map/object.
	if (typeof selected === 'object' && !Array.isArray(selected)) {
		const values = Object.values(selected);
		if (values.length === 1) return toPositiveId(values[0]);
		if ('value' in selected) return toPositiveId((selected as any).value);
	}
	return toPositiveId(selected);
}

/** Prefer alert selection; fall back to the radio marked checked. */
export function resolveResetTemplateId(selected: any, inputs: ResetTemplateRadioInput[] | null | undefined): number | null {
	const fromSelected = parseSelectedTemplateId(selected);
	if (fromSelected) return fromSelected;
	const checked = (inputs || []).find((i) => i.checked);
	return checked ? toPositiveId(checked.value) : null;
}
