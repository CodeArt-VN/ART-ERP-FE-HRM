import { Injectable } from '@angular/core';
import { HRM_StaffRecordPayrollProvider } from 'src/app/services/static/services.service';

@Injectable({ providedIn: 'root' })
export class HRM_StaffRecordPayrollService extends HRM_StaffRecordPayrollProvider {

	importStaffRecordPayroll(fileToUpload: File,id) {
		let apiPath = {
			postImport: {
				method: 'UPLOAD',
				url: function () {
					return 'HRM/StaffRecordPayroll/ImportRecord/'+id;
				},
			},
		};
		return this.commonService.import(apiPath, fileToUpload);
	}

	importStaffRecordInput(fileToUpload: File,id) {
		let apiPath = {
			postImport: {
				method: 'UPLOAD',
				url: function () {
					return 'HRM/StaffRecordPayroll/ImportRecordInput/'+id;
				},
			},
		};
		return this.commonService.import(apiPath, fileToUpload);
	}

	exportStaffRecordPayroll(query) {
		let apiPath = {
			getExport: {
				method: 'DOWNLOAD',
				url: function () {
					return 'HRM/StaffRecordPayroll/ExportRecord';
				},
			},
		};
		return this.commonService.export(apiPath, query);
	}

}
