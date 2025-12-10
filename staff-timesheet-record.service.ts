import { Injectable } from '@angular/core';
import { HRM_TimesheetRecordProvider } from 'src/app/services/static/services.service';

@Injectable({ providedIn: 'root' })
export class HRM_TimesheetRecordService extends HRM_TimesheetRecordProvider {

	importStaffTimesheetRecord(fileToUpload: File,id) {
		let apiPath = {
			postImport: {
				method: 'UPLOAD',
				url: function () {
					return 'HRM/TimesheetRecord/ImportRecord/'+id;
				},
			},
		};
		return this.commonService.import(apiPath, fileToUpload);
	}

	importStaffimesheetRecordInput(fileToUpload: File,id) {
		let apiPath = {
			postImport: {
				method: 'UPLOAD',
				url: function () {
					return 'HRM/TimesheetRecord/ImportRecordInput/'+id;
				},
			},
		};
		return this.commonService.import(apiPath, fileToUpload);
	}

	exportStaffimesheetRecord(query) {
		let apiPath = {
			getExport: {
				method: 'DOWNLOAD',
				url: function () {
					return 'HRM/TimesheetRecord/ExportRecord';
				},
			},
		};
		return this.commonService.export(apiPath, query);
	}

	exportTimesheetRecordSummary(query) {
		let apiPath = {
			getExport: {
				method: 'DOWNLOAD',
				url: function () {
					return 'HRM/TimesheetRecord/ExportTimesheetRecordSummary';
				},
			},
		};
		return this.commonService.export(apiPath, query);
	}


	exportStaffInsurance(query) {
		let apiPath = {
			getExport: {
				method: 'DOWNLOAD',
				url: function () {
					return 'HRM/TimesheetRecord/ExportInsurance';
				},
			},
		};
		return this.commonService.export(apiPath, query);
	}
}
