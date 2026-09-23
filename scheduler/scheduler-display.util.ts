export function buildCheckinLogEventHtml(opts: { logTimeText?: string | null; gateName?: string | null; canDelete?: boolean; color?: string | null }): string {
	const time = String(opts?.logTimeText || '').trim();
	const gate = String(opts?.gateName || '').trim();
	const timeHtml = time ? `<b>${time}</b>` : '';
	const gateHtml = gate ? ` <small>${gate}</small>` : '';
	const del = opts?.canDelete ? `<ion-icon class="del-event-btn" name="trash-outline"></ion-icon>` : '';
	const token = ionicColorToken(opts?.color || 'success');
	return `<span class="v-align-middle" style="--event-ink:var(--ion-color-${token})">${timeHtml}${gateHtml}</span>${del}`;
}

export function buildStaffResourceLabelHtml(opts: { code?: string | null; showDelete?: boolean }): string {
	const code = String(opts?.code || '');
	const del = opts?.showDelete ? `<ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>` : '';
	return `<div class="staff-resource">
							<span class="name">
								<span class="code">${code} </span>
							</span>
							${del}
						</div>`;
}

export function canShowStaffUnenrollButton(segmentView: string | null | undefined, isDeleted?: boolean, canEdit?: boolean): boolean {
	return segmentView === 's1' && !isDeleted && !!canEdit;
}

/** CSS var for event text: `--ion-color-{token}-contrast`. Hex/rgb is not a token (falls back to primary). */
/** Ionic color attribute token. Resolved CSS colors are not valid `color=""` values. */
/** Timesheet chip fill: hex `#rrggbb` + `22`, or the same alpha as rgba. */
export function tintEventColor(resolved?: string | null): string {
	const value = String(resolved || '').trim();
	if (!value) return '';
	if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return `${value}22`;
	const rgb = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
	if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, 0.133)`;
	return value;
}

export function eventInkVar(colorName?: string | null): string {
	return `var(--ion-color-${ionicColorToken(colorName)})`;
}

export function ionicColorToken(colorName?: string | null, fallback = 'medium'): string {
	const token = String(colorName || '').trim().toLowerCase();
	if (!token || /[#()\s]/.test(token) || token.startsWith('rgb') || token.startsWith('hsl') || token.startsWith('var(')) {
		return fallback;
	}
	return token;
}

/** OFF / time-off opens the same point modal as a missing punch (Q). */
export function shouldShowTimesheetPointModal(props?: { TimeOffType?: string | null } | null): boolean {
	return props != null;
}

/** Title uses the badge hue. Light theme darkens it in CSS; dark theme keeps the badge color. */
export function buildTimesheetChipHtml(color: string, icon: string, title: string, badge: string): string {
	const token = ionicColorToken(color);
	return `<ion-icon color="${token}" name="${icon}"></ion-icon> <span class="v-align-middle" style="--event-ink:var(--ion-color-${token})">${title}</span><ion-badge color="${token}" class="float-right">${badge}</ion-badge>`;
}

export function ionContrastCssVar(colorName?: string | null): string {
	const token = String(colorName || '').trim().toLowerCase();
	if (!token || /[#()]/.test(token) || token.startsWith('rgb') || token.startsWith('hsl')) {
		return '--ion-color-primary-contrast';
	}
	return `--ion-color-${token}-contrast`;
}

export function isNightShift(shiftType?: string | null, isOvernightShift?: boolean): boolean {
	if (isOvernightShift) return true;
	const t = String(shiftType || '').trim().toLowerCase();
	return t === 'nightshift' || t === 'overnightshift' || t === 'ca đêm';
}

export function buildSchedulerShiftEventHtml(opts: {
	title?: string | null;
	shiftStart?: string | null;
	shiftEnd?: string | null;
	textColor?: string | null;
	showDelete?: boolean;
	isNightShift?: boolean;
}): string {
	const del = opts?.showDelete ? `<ion-icon color="danger" class="del-event-btn" name="trash-outline"></ion-icon>` : '';
	const moon = opts?.isNightShift ? `<ion-icon color="purple" class="night-shift-icon" name="moon"></ion-icon>` : '';
	const textColor = String(opts?.textColor || '').trim();
	const style = textColor.startsWith('var(') ? ` style="--event-ink:${textColor}"` : textColor ? ` style="color:${textColor}"` : '';
	const start = String(opts?.shiftStart || '');
	const end = String(opts?.shiftEnd || '');
	return `<ion-text class="click-event-btn clickable"${style}>${moon}${del}<b>${opts?.title || ''}</b> <small>${start}-${end}</small> </ion-text>`;
}
