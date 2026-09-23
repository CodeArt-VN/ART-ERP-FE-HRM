import { columnMaxWidth, columnMinWidth } from 'src/app/components/data-table/column-width.util';

/** Staff column holds name, code, and job title, and stays pinned so the log column can grow. */
export const timesheetLogStaffColumn = { width: 320 };

/** Time and remark share one column that grows with the row. */
export const timesheetLogRemarkColumn = { minWidth: 220, maxWidth: '100%' };

/** Wide enough for the longer invalid badge. */
export const timesheetLogStatusColumn = { width: 150 };

export function timesheetLogJobTitleId(staff: { IDJobTitle?: number } | null | undefined): number | null {
	const id = staff?.IDJobTitle;
	return typeof id === 'number' && id > 0 ? id : null;
}

export function timesheetLogStatusBadge(isValidLog: boolean): { color: 'success' | 'danger'; label: string } {
	return isValidLog ? { color: 'success', label: 'Valid' } : { color: 'danger', label: 'InValid' };
}

export function timesheetLogStaffIsPinned(): boolean {
	const min = columnMinWidth(timesheetLogStaffColumn);
	const max = columnMaxWidth(timesheetLogStaffColumn);
	return min != null && min === max;
}

export function timesheetLogRemarkGrows(): boolean {
	return columnMaxWidth(timesheetLogRemarkColumn) === '100%' && columnMinWidth(timesheetLogRemarkColumn) != null;
}
