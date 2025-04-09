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


    { path: 'compulsory-insurance-policy', loadChildren: () => import('./compulsory-insurance-policy/compulsory-insurance-policy.module').then(m => m.CompulsoryInsurancePolicyPageModule), canActivate: [AuthGuard] },
    { path: 'compulsory-insurance-policy/:id', loadChildren: () => import('./compulsory-insurance-policy-detail/compulsory-insurance-policy-detail.module').then(m => m.CompulsoryInsurancePolicyDetailPageModule), canActivate: [AuthGuard] },
   
    { path: 'welfare-policy', loadChildren: () => import('./welfare-policy/welfare-policy.module').then(m => m.WelfarePolicyPageModule), canActivate: [AuthGuard] },
    { path: 'welfare-policy/:id', loadChildren: () => import('./welfare-policy-detail/welfare-policy-detail.module').then(m => m.WelfarePolicyDetailPageModule), canActivate: [AuthGuard] },


    { path: 'tax-policy', loadChildren: () => import('./tax-policy/tax-policy.module').then(m => m.TaxPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'tax-policy/:id', loadChildren: () => import('./tax-policy-detail/tax-policy-detail.module').then(m => m.TaxPolicyDetailPageModule), canActivate: [AuthGuard] },

    { path: 'salary-policy', loadChildren: () => import('./salary-policy/salary-policy.module').then(m => m.SalaryPolicyPageModule), canActivate: [AuthGuard] },
    { path: 'salary-policy/:id', loadChildren: () => import('./salary-policy-detail/salary-policy-detail.module').then(m => m.SalaryPolicyDetailPageModule), canActivate: [AuthGuard] },

   
    { path: 'udf', loadChildren: () => import('./udf/udf.module').then(m => m.UDFPageModule), canActivate: [AuthGuard] },
    { path: 'udf/:id', loadChildren: () => import('./udf-detail/udf-detail.module').then(m => m.UDFDetailPageModule), canActivate: [AuthGuard] },

    // { path: 'payroll-template', loadChildren: () => import('./salary-policy/salary-policy.module').then(m => m.PayrollTemplatePageModule), canActivate: [AuthGuard] },
    // { path: 'payroll-template/:id', loadChildren: () => import('./salary-policy-detail/salary-policy-detail.module').then(m => m.PayrollTemplateDetailPageModule), canActivate: [AuthGuard] },
   
];

