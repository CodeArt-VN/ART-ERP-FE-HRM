import { StaffTimesheetCalculationModalPage } from './staff-timesheet-calculation-modal.page';
import { StaffTimesheetCalculationModalPageModule } from './staff-timesheet-calculation-modal.module';

describe('StaffTimesheetCalculationModalPageModule', () => {
	it('declares and exports the modal so templates get the translate pipe', () => {
		const def = (StaffTimesheetCalculationModalPageModule as any).ɵmod;
		expect(def.declarations).toContain(StaffTimesheetCalculationModalPage);
		expect(def.exports).toContain(StaffTimesheetCalculationModalPage);
	});
});
