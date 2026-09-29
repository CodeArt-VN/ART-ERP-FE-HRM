import { Injectable } from '@angular/core';
import { HRM_StaffPayrollProvider } from 'src/app/services/static/services.service';

/** Custom StaffPayroll APIs — do not put these on GenCode `services.service.ts`. */
@Injectable({ providedIn: 'root' })
export class HRM_StaffPayrollService extends HRM_StaffPayrollProvider {
	resetConfig(id: number) {
		return this.commonService.connect('POST', 'HRM/StaffPayroll/ResetConfig/' + id, {}).toPromise();
	}

	reopen(ids: number[]) {
		return this.commonService.connect('POST', 'HRM/StaffPayroll/Reopen', { Ids: ids }).toPromise();
	}
}
