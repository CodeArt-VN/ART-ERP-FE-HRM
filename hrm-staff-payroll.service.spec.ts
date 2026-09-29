import { of } from 'rxjs';
import { HRM_StaffPayrollService } from './hrm-staff-payroll.service';

describe('HRM_StaffPayrollService', () => {
	let commonService: { connect: jasmine.Spy };
	let service: HRM_StaffPayrollService;

	beforeEach(() => {
		commonService = {
			connect: jasmine.createSpy('connect').and.returnValue(of({})),
		};
		service = new HRM_StaffPayrollService(commonService as any);
	});

	it('resetConfig POSTs ResetConfig/{id}', async () => {
		await service.resetConfig(15);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/StaffPayroll/ResetConfig/15', {});
	});

	it('reopen POSTs Reopen with Ids', async () => {
		await service.reopen([8, 9]);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/StaffPayroll/Reopen', { Ids: [8, 9] });
	});
});
