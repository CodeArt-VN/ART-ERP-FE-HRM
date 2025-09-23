import { Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/app.guard';

export const HRMRoutes: Routes = [

    { path: 'casual-labour-register', loadChildren: () => import('./casual-labour-register/casual-labour-register.module').then(m => m.CasualLabourRegisterPageModule) },
 
    { path: 'staff', loadChildren: () => import('./staff/staff.module').then(m => m.StaffPageModule), canActivate: [AuthGuard] },
    { path: 'staff/:id', loadChildren: () => import('./staff-detail/staff-detail.module').then(m => m.StaffDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'scheduler', loadChildren: () => import('./scheduler/scheduler.module').then(m => m.SchedulerPageModule), canActivate: [AuthGuard] },
    { path: 'scheduler/:id', loadChildren: () => import('./scheduler/scheduler.module').then(m => m.SchedulerPageModule), canActivate: [AuthGuard] },
 
    { path: 'checkin-gate', loadChildren: () => import('./checkin-gate/checkin-gate.module').then(m => m.CheckinGateDetailPageModule), canActivate: [AuthGuard] },
    { path: 'checkin-gate/:id', loadChildren: () => import('./checkin-gate/checkin-gate.module').then(m => m.CheckinGateDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'checkin-log', loadChildren: () => import('./checkin-log/checkin-log.module').then(m => m.CheckinLogPageModule), canActivate: [AuthGuard] },
    { path: 'checkin-log/:id', loadChildren: () => import('./checkin-log/checkin-log.module').then(m => m.CheckinLogPageModule), canActivate: [AuthGuard] },
 
    { path: 'timesheet-cycle', loadChildren: () => import('./timesheet-cycle/timesheet-cycle.module').then(m => m.TimesheetCyclePageModule), canActivate: [AuthGuard] },
    { path: 'timesheet-cycle/:id', loadChildren: () => import('./timesheet-cycle-detail/timesheet-cycle-detail.module').then(m => m.TimesheetCycleDetailPageModule), canActivate: [AuthGuard] },
    { path: 'timesheet-cycle/:id/:idtimesheet', loadChildren: () => import('./timesheet-cycle-detail/timesheet-cycle-detail.module').then(m => m.TimesheetCycleDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'holiday-policy', loadChildren: () => import('./holiday-policy/holiday-policy.module').then(m => m.HolidayPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'holiday-policy/:id', loadChildren: () => import('./holiday-policy-detail/holiday-policy-detail.module').then(m => m.HolidayPolicyDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'paid-time-off-policy', loadChildren: () => import('./paid-time-off-policy/paid-time-off-policy.module').then(m => m.PaidTimeOffPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'paid-time-off-policy/:id', loadChildren: () => import('./paid-time-off-policy-detail/paid-time-off-policy-detail.module').then(m => m.PaidTimeOffPolicyDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'overtime-policy', loadChildren: () => import('./overtime-policy/overtime-policy.module').then(m => m.OvertimePolicyPageModule), canActivate: [AuthGuard] },
    { path: 'overtime-policy/:id', loadChildren: () => import('./overtime-policy-detail/overtime-policy-detail.module').then(m => m.OvertimePolicyDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'ptos-enrollment', loadChildren: () => import('./ptos-enrollment/ptos-enrollment.module').then(m => m.PTOsEnrollmentPageModule), canActivate: [AuthGuard] },
    { path: 'ptos-enrollment/:id', loadChildren: () => import('./ptos-enrollment-detail/ptos-enrollment-detail.module').then(m => m.PTOsEnrollmentDetailPageModule), canActivate: [AuthGuard] },
 
    { path: 'checkin', loadChildren: () => import('./checkin/checkin.module').then(m => m.CheckinPageModule), canActivate: [AuthGuard] },
 
    { path: 'personal-scheduler', loadChildren: () => import('./personal-scheduler/personal-scheduler.module').then(m => m.PersonalSchedulerPageModule), canActivate: [AuthGuard] },
    { path: 'personal-scheduler/:id', loadChildren: () => import('./personal-scheduler/personal-scheduler.module').then(m => m.PersonalSchedulerPageModule), canActivate: [AuthGuard] },

    { path: 'user-device', loadChildren: () => import('./user-device/user-device.module').then(m => m.UserDevicePageModule), canActivate: [AuthGuard] },
    { path: 'user-device/:id', loadChildren: () => import('./user-device-detail/user-device-detail.module').then(m => m.UserDeviceDetailPageModule), canActivate: [AuthGuard] },

    { path: 'timesheet', loadChildren: () => import('./timesheet/timesheet.module').then(m => m.TimesheetPageModule), canActivate: [AuthGuard] },
    { path: 'timesheet/:id', loadChildren: () => import('./timesheet-detail/timesheet-detail.module').then(m => m.TimesheetDetailPageModule), canActivate: [AuthGuard] },

    { path: 'shift', loadChildren: () => import('./shift/shift.module').then(m => m.ShiftPageModule), canActivate: [AuthGuard] },
    { path: 'shift/:id', loadChildren: () => import('./shift-detail/shift-detail.module').then(m => m.ShiftDetailPageModule), canActivate: [AuthGuard] },


    { path: 'insurance-policy', loadChildren: () => import('./insurance-policy/insurance-policy.module').then(m => m.InsurancePolicyPageModule), canActivate: [AuthGuard] },
    { path: 'insurance-policy/:id', loadChildren: () => import('./insurance-policy-detail/insurance-policy-detail.module').then(m => m.InsurancePolicyDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'hrm-benefit-policy', loadChildren: () => import('./benefit-policy/benefit-policy.module').then(m => m.BenefitPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'hrm-benefit-policy/:id', loadChildren: () => import('./benefit-policy-detail/benefit-policy-detail.module').then(m => m.BenefitPolicyDetailPageModule), canActivate: [AuthGuard] },


    { path: 'tax-policy', loadChildren: () => import('./tax-policy/tax-policy.module').then(m => m.TaxPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'tax-policy/:id', loadChildren: () => import('./tax-policy-detail/tax-policy-detail.module').then(m => m.TaxPolicyDetailPageModule), canActivate: [AuthGuard] },

    { path: 'salary-policy', loadChildren: () => import('./salary-policy/salary-policy.module').then(m => m.SalaryPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'salary-policy/:id', loadChildren: () => import('./salary-policy-detail/salary-policy-detail.module').then(m => m.SalaryPolicyDetailPageModule), canActivate: [AuthGuard] },

    { path: 'employee-policy', loadChildren: () => import('./employee-policy/employee-policy.module').then(m => m.EmployeePolicyPageModule), canActivate: [AuthGuard] },
    { path: 'employee-policy/:id', loadChildren: () => import('./employee-policy-detail/employee-policy-detail.module').then(m => m.EmployeePolicyDetailPageModule), canActivate: [AuthGuard] },

    { path: 'staff-decision', loadChildren: () => import('./staff-decision/staff-decision.module').then(m => m.StaffDecisionPageModule), canActivate: [AuthGuard] },
    { path: 'staff-decision/:id', loadChildren: () => import('./staff-decision-detail/staff-decision-detail.module').then(m => m.StaffDecisionDetailPageModule), canActivate: [AuthGuard] },


    { path: 'udf', loadChildren: () => import('./udf/udf.module').then(m => m.UDFPageModule), canActivate: [AuthGuard] },
    { path: 'udf/:id', loadChildren: () => import('./udf-detail/udf-detail.module').then(m => m.UDFDetailPageModule), canActivate: [AuthGuard] },

    { path: 'payroll-template', loadChildren: () => import('./payroll-template/payroll-template.module').then(m => m.PayrollTemplatePageModule), canActivate: [AuthGuard] },
    { path: 'payroll-template/:id', loadChildren: () => import('./payroll-template-detail/payroll-template-detail.module').then(m => m.PayrollTemplateDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'contract-template', loadChildren: () => import('./contract-template/contract-template.module').then(m => m.ContractTemplatePageModule), canActivate: [AuthGuard] },
    { path: 'contract-template/:id', loadChildren: () => import('./contract-template-detail/contract-template-detail.module').then(m => m.ContractTemplateDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'staff-contract', loadChildren: () => import('./staff-contract/staff-contract.module').then(m => m.StaffContractPageModule), canActivate: [AuthGuard] },
    { path: 'staff-contract/:id', loadChildren: () => import('./staff-contract-detail/staff-contract-detail.module').then(m => m.StaffContractDetailPageModule), canActivate: [AuthGuard] },

    { path: 'insurance-enrollment', loadChildren: () => import('./insurance-enrollment/insurance-enrollment.module').then(m => m.InsuranceEnrollmentPageModule), canActivate: [AuthGuard] },
    { path: 'insurance-enrollment/:id', loadChildren: () => import('./insurance-enrollment-detail/insurance-enrollment-detail.module').then(m => m.InsuranceEnrollmentDetailPageModule), canActivate: [AuthGuard] },
   

    { path: 'staff-benefit-enrollment', loadChildren: () => import('./staff-benefit-enrollment/staff-benefit-enrollment.module').then(m => m.StaffBenefitEnrollmentPageModule), canActivate: [AuthGuard] },
    { path: 'staff-benefit-enrollment/:id', loadChildren: () => import('./staff-benefit-enrollment-detail/staff-benefit-enrollment-detail.module').then(m => m.StaffBenefitEnrollmentDetailPageModule), canActivate: [AuthGuard] },

    { path: 'staff-payroll', loadChildren: () => import('./staff-payroll/staff-payroll.module').then(m => m.StaffPayrollPageModule), canActivate: [AuthGuard] },
    { path: 'staff-payroll/config/:id', loadChildren: () => import('./staff-payroll-config/staff-payroll-config.module').then(m => m.StaffPayrollConfigPageModule), canActivate: [AuthGuard] },
    { path: 'staff-payroll/:id', loadChildren: () => import('./staff-payroll-detail/staff-payroll-detail.module').then(m => m.StaffPayrollDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'overtime-request', loadChildren: () => import('./overtime-request/overtime-request.module').then(m => m.OvertimeRequestPageModule), canActivate: [AuthGuard] },
    { path: 'overtime-request/:id', loadChildren: () => import('./overtime-request-detail/overtime-request-detail.module').then(m => m.OvertimeRequestDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'work-rule-group', loadChildren: () => import('./work-rule-group/work-rule-group.module').then(m => m.WorkRuleGroupPageModule), canActivate: [AuthGuard] },
    { path: 'work-rule-group/:id', loadChildren: () => import('./work-rule-group-detail/work-rule-group-detail.module').then(m => m.WorkRuleGroupDetailPageModule), canActivate: [AuthGuard] },


    { path: 'work-rule', loadChildren: () => import('./work-rule/work-rule.module').then(m => m.WorkRulePageModule), canActivate: [AuthGuard] },
    { path: 'work-rule/:id', loadChildren: () => import('./work-rule-detail/work-rule-detail.module').then(m => m.WorkRuleDetailPageModule), canActivate: [AuthGuard] },

    { path: 'work-rule-violation', loadChildren: () => import('./work-rule-violation/work-rule-violation.module').then(m => m.WorkRuleViolationPageModule), canActivate: [AuthGuard] },
    { path: 'work-rule-violation/:id', loadChildren: () => import('./work-rule-violation-detail/work-rule-violation-detail.module').then(m => m.WorkRuleViolationDetailPageModule), canActivate: [AuthGuard] },

    { path: 'staff-payslip', loadChildren: () => import('./staff-payslip/staff-payslip.module').then(m => m.StaffPayslipPageModule), canActivate: [AuthGuard] },
    { path: 'staff-payslip/:id', loadChildren: () => import('./staff-payslip-detail/staff-payslip-detail.module').then(m => m.StaffPayslipDetailPageModule), canActivate: [AuthGuard] },


    { path: 'timesheet-template', loadChildren: () => import('./timesheet-template/timesheet-template.module').then(m => m.TimesheetTemplatePageModule), canActivate: [AuthGuard] },
    { path: 'timesheet-template/:id', loadChildren: () => import('./timesheet-template-detail/timesheet-template-detail.module').then(m => m.TimesheetTemplateDetailPageModule), canActivate: [AuthGuard] },

    { path: 'timesheet-log', loadChildren: () => import('./scheduler/timesheet-log/timesheet-log.module').then(m => m.TimesheetLogPageModule), canActivate: [AuthGuard] },


    { path: 'timesheet-record', loadChildren: () => import('./timesheet-record/timesheet-record.module').then(m => m.TimesheetRecordPageModule), canActivate: [AuthGuard] },
    { path: 'timesheet-record/:id/:idtimesheet', loadChildren: () => import('./timesheet-record-detail/timesheet-record-detail.module').then(m => m.TimesheetRecordDetailPageModule), canActivate: [AuthGuard] },

    { path: 'leave-type', loadChildren: () => import('./leave-type/leave-type.module').then(m => m.LeaveTypePageModule), canActivate: [AuthGuard] },
    { path: 'leave-type/:id', loadChildren: () => import('./leave-type-detail/leave-type-detail.module').then(m => m.LeaveTypeDetailPageModule), canActivate: [AuthGuard] },

    { path: 'staff-time-off-request', loadChildren: () => import('./staff-time-off-request/staff-time-off-request.module').then(m => m.StaffTimeOffRequestPageModule), canActivate: [AuthGuard] },
    { path: 'staff-time-off-request/:id', loadChildren: () => import('./staff-time-off-request-detail/staff-time-off-request-detail.module').then(m => m.StaffTimeOffRequestDetailPageModule), canActivate: [AuthGuard] },
    { path: 'staff-policy-enrollment', loadChildren: () => import('./staff-policy-enrollment/staff-policy-enrollment.module').then(m => m.StaffPolicyEnrollmentPageModule), canActivate: [AuthGuard] },
    { path: 'staff-policy-enrollment/:id', loadChildren: () => import('./staff-policy-enrollment-detail/staff-policy-enrollment-detail.module').then(m => m.StaffPolicyEnrollmentDetailPageModule), canActivate: [AuthGuard] },
];

