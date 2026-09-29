import { of } from 'rxjs';
import { HRM_TimesheetCycleService } from './hrm-timesheet-cycle.service';

describe('HRM_TimesheetCycleService', () => {
	let commonService: { connect: jasmine.Spy };
	let service: HRM_TimesheetCycleService;

	beforeEach(() => {
		commonService = {
			connect: jasmine.createSpy('connect').and.returnValue(of({})),
		};
		service = new HRM_TimesheetCycleService(commonService as any);
	});

	it('getConfig GETs Config with IDTimesheetCycleDetail', async () => {
		await service.getConfig(42);
		expect(commonService.connect).toHaveBeenCalledWith('GET', 'HRM/TimesheetCycle/Config', { IDTimesheetCycleDetail: 42 });
	});

	it('saveConfig POSTs Config/{id}', async () => {
		const body = { Columns: [] };
		await service.saveConfig(7, body);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/TimesheetCycle/Config/7', body);
	});

	it('resetConfig POSTs ResetConfig/{id} with optional template', async () => {
		await service.resetConfig(3);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/TimesheetCycle/ResetConfig/3', {});

		await service.resetConfig(3, 99);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/TimesheetCycle/ResetConfig/3', { IDTimesheetTemplate: 99 });
	});

	it('reopen POSTs Reopen with Ids', async () => {
		await service.reopen([1, 2]);
		expect(commonService.connect).toHaveBeenCalledWith('POST', 'HRM/TimesheetCycle/Reopen', { Ids: [1, 2] });
	});
});
