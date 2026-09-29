import { Injectable } from '@angular/core';
import { HRM_TimesheetCycleProvider } from 'src/app/services/static/services.service';

/** Custom TimesheetCycle APIs — do not put these on GenCode `services.service.ts`. */
@Injectable({ providedIn: 'root' })
export class HRM_TimesheetCycleService extends HRM_TimesheetCycleProvider {
	getConfig(idTimesheetCycleDetail: number) {
		return this.commonService
			.connect('GET', 'HRM/TimesheetCycle/Config', { IDTimesheetCycleDetail: idTimesheetCycleDetail })
			.toPromise();
	}

	saveConfig(idTimesheetCycleDetail: number, body: any) {
		return this.commonService.connect('POST', 'HRM/TimesheetCycle/Config/' + idTimesheetCycleDetail, body).toPromise();
	}

	resetConfig(idTimesheetCycleDetail: number, idTimesheetTemplate?: number) {
		const body: any = {};
		if (idTimesheetTemplate) body.IDTimesheetTemplate = idTimesheetTemplate;
		return this.commonService.connect('POST', 'HRM/TimesheetCycle/ResetConfig/' + idTimesheetCycleDetail, body).toPromise();
	}

	reopen(ids: number[]) {
		return this.commonService.connect('POST', 'HRM/TimesheetCycle/Reopen', { Ids: ids }).toPromise();
	}
}
