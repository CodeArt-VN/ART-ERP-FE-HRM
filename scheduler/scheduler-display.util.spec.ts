import { buildCheckinLogEventHtml, buildStaffResourceLabelHtml, buildTimesheetChipHtml, canShowStaffUnenrollButton, eventInkVar, ionContrastCssVar, ionicColorToken, isNightShift, buildSchedulerShiftEventHtml, shouldShowTimesheetPointModal, tintEventColor } from './scheduler-display.util';

describe('ionicColorToken', () => {
	it('keeps an Ionic color name and rejects a resolved CSS color', () => {
		expect(ionicColorToken('Primary')).toBe('primary');
		expect(ionicColorToken('#b9e702')).toBe('medium');
		expect(ionicColorToken('rgb(185, 231, 2)')).toBe('medium');
		expect(ionicColorToken('')).toBe('medium');
	});
});

describe('shouldShowTimesheetPointModal', () => {
	it('opens the point modal for OFF the same way as a missing punch', () => {
		expect(shouldShowTimesheetPointModal({ TimeOffType: 'OFF' })).toBe(true);
		expect(shouldShowTimesheetPointModal({ TimeOffType: null })).toBe(true);
		expect(shouldShowTimesheetPointModal(null)).toBe(false);
	});
});

describe('buildTimesheetChipHtml', () => {
	it('paints the title with the badge hue so theme CSS can darken light mode', () => {
		const html = buildTimesheetChipHtml('success', 'checkmark-circle-outline', '09:46→18:00', '1');
		expect(html).toContain('style="--event-ink:var(--ion-color-success)"');
		expect(html).toContain('ion-badge color="success"');
		expect(html).not.toContain('style="color:');
	});
});

describe('tintEventColor / eventInkVar', () => {
	it('uses the same translucent fill and ink variable as the timesheet chips', () => {
		expect(tintEventColor('#67cb49')).toBe('#67cb4922');
		expect(tintEventColor('rgb(103, 203, 73)')).toBe('rgba(103, 203, 73, 0.133)');
		expect(eventInkVar('Success')).toBe('var(--ion-color-success)');
	});
});

describe('buildCheckinLogEventHtml', () => {
	it('renders log time and gate instead of shift fields', () => {
		expect(buildCheckinLogEventHtml({ logTimeText: '08:30', gateName: 'Cổng A' })).toBe(
			'<span class="v-align-middle" style="--event-ink:var(--ion-color-success)"><b>08:30</b> <small>Cổng A</small></span>'
		);
	});

	it('does not render undefined when shift fields are missing', () => {
		const html = buildCheckinLogEventHtml({ logTimeText: '09:15' });
		expect(html).toBe('<span class="v-align-middle" style="--event-ink:var(--ion-color-success)"><b>09:15</b></span>');
		expect(html).not.toContain('undefined');
	});

	it('paints an invalid log with the danger ink', () => {
		expect(buildCheckinLogEventHtml({ logTimeText: '08:30', color: 'danger' })).toContain('--event-ink:var(--ion-color-danger)');
	});

	it('adds delete icon only when allowed', () => {
		expect(buildCheckinLogEventHtml({ logTimeText: '08:30', canDelete: true })).toContain('del-event-btn');
		expect(buildCheckinLogEventHtml({ logTimeText: '08:30', canDelete: false })).not.toContain('del-event-btn');
	});
});

describe('buildStaffResourceLabelHtml / canShowStaffUnenrollButton', () => {
	it('shows unenroll delete only on scheduler tab for active staff with edit permission', () => {
		expect(canShowStaffUnenrollButton('s1', false, true)).toBeTrue();
		expect(canShowStaffUnenrollButton('s1', false, false)).toBeFalse();
		expect(canShowStaffUnenrollButton('s1', false)).toBeFalse();
		expect(canShowStaffUnenrollButton('s2', false, true)).toBeFalse();
		expect(canShowStaffUnenrollButton('s3', false, true)).toBeFalse();
		expect(canShowStaffUnenrollButton('s1', true, true)).toBeFalse();
	});

	it('omits trash icon when showDelete is false', () => {
		const html = buildStaffResourceLabelHtml({ code: 'IN-4881', showDelete: false });
		expect(html).toContain('IN-4881');
		expect(html).not.toContain('del-event-btn');
	});

	it('includes trash icon when showDelete is true', () => {
		expect(buildStaffResourceLabelHtml({ code: 'MFB-02894', showDelete: true })).toContain('del-event-btn');
	});
});

describe('ionContrastCssVar', () => {
	it('maps a color token to the Ionic contrast CSS variable', () => {
		expect(ionContrastCssVar('success')).toBe('--ion-color-success-contrast');
		expect(ionContrastCssVar('Primary')).toBe('--ion-color-primary-contrast');
		expect(ionContrastCssVar('warning')).toBe('--ion-color-warning-contrast');
	});

	it('does not build a variable from a hex/rgb background value', () => {
		expect(ionContrastCssVar('#b9e702')).toBe('--ion-color-primary-contrast');
		expect(ionContrastCssVar('rgb(185, 231, 2)')).toBe('--ion-color-primary-contrast');
		expect(ionContrastCssVar('')).toBe('--ion-color-primary-contrast');
	});
});

describe('night shift moon icon', () => {
	it('detects NightShift by code, Vietnamese name, overnight type, or IsOvernightShift', () => {
		expect(isNightShift('NightShift')).toBeTrue();
		expect(isNightShift('ca đêm')).toBeTrue();
		expect(isNightShift('OvernightShift')).toBeTrue();
		expect(isNightShift('Shift12Hours', true)).toBeTrue();
		expect(isNightShift('DayShift')).toBeFalse();
		expect(isNightShift('Shift12Hours', false)).toBeFalse();
		expect(isNightShift('')).toBeFalse();
	});

	it('puts a purple moon icon on the right only for night shifts', () => {
		const night = buildSchedulerShiftEventHtml({
			title: 'BV3',
			shiftStart: '22:00',
			shiftEnd: '06:00',
			isNightShift: true,
		});
		expect(night).toContain('night-shift-icon');
		expect(night).toContain('name="moon"');
		expect(night).toContain('color="purple"');
		expect(night.indexOf('night-shift-icon')).toBeLessThan(night.indexOf('<b>BV3</b>'));

		const overnight12h = buildSchedulerShiftEventHtml({
			title: 'BV3+',
			shiftStart: '19:00',
			shiftEnd: '07:00',
			isNightShift: true,
		});
		expect(overnight12h).toContain('night-shift-icon');
		expect(overnight12h).toContain('color="purple"');

		const day = buildSchedulerShiftEventHtml({ title: 'IND6', shiftStart: '10:00', shiftEnd: '18:00', isNightShift: false });
		expect(day).not.toContain('night-shift-icon');
		expect(day).not.toContain('name="moon"');
	});
});
