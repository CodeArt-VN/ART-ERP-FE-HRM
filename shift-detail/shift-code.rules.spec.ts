import { conflictingShiftLabel, isReservedShiftCode } from './shift-code.rules';

const reserved = ['AL', 'CL', 'OFF'];

describe('shift code vs TimeOffType', () => {
	it('blocks codes and names that match a time-off type, ignoring case and spaces', () => {
		expect(isReservedShiftCode(' al ', reserved)).toBe(true);
		expect(isReservedShiftCode('CL', reserved)).toBe(true);
		expect(conflictingShiftLabel('S1', 'off', reserved)).toBe('off');
	});

	it('allows a normal shift code and an empty code', () => {
		expect(isReservedShiftCode('', reserved)).toBe(false);
		expect(isReservedShiftCode('   ', reserved)).toBe(false);
		expect(conflictingShiftLabel('S1', 'Ca sáng', reserved)).toBeNull();
		expect(conflictingShiftLabel('DayShift', 'Ca sáng', reserved)).toBeNull();
	});
});
