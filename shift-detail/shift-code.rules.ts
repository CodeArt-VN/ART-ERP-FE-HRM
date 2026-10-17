/** Exact match against descendant codes of SYS type TimeOffType (AL, CL, …). */
export function normalizeShiftCode(value: unknown): string {
	return String(value ?? '')
		.trim()
		.toUpperCase();
}

export function isReservedShiftCode(value: unknown, reservedCodes: readonly string[] | null | undefined): boolean {
	const normalized = normalizeShiftCode(value);
	if (!normalized || !reservedCodes?.length) return false;
	return reservedCodes.some((code) => normalizeShiftCode(code) === normalized);
}

/** First of code, then name, that reuses a time-off type code. */
export function conflictingShiftLabel(code: unknown, name: unknown, reservedCodes: readonly string[] | null | undefined): string | null {
	if (isReservedShiftCode(code, reservedCodes)) return String(code).trim();
	if (isReservedShiftCode(name, reservedCodes)) return String(name).trim();
	return null;
}
