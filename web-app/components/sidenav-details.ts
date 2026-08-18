import {
  BarChart3,
  Users,
  UserPlus,
  Building2,
  Stethoscope,
  Car,
  IndianRupee,
  CreditCard,
  FileText,
  Shield,
  UserCog,
} from "lucide-react";

export enum UserRole {
  ADMIN = "admin",
  BD = "bd",
  HR = "hr",
  DOCTOR = "doctor",
  FINANCE = "finance",
  PARTNER = "partner",
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD],
    },
    {
      title: "Leads",
      icon: Users,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD],
      children: [
        {
          title: "All Leads",
          href: "/dashboard/leads",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD],
        },
        {
          title: "Create New Lead",
          href: "/dashboard/leads/create",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD],
        },
        {
          title: "Upload CSV",
          href: "/dashboard/leads/upload-csv",
          requiredPermissions: [UserRole.ADMIN], // BD role has upload_csv: false
        },
        {
          title: "Follow up Today",
          href: "/dashboard/leads/followup",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD],
        },
        {
          title: "OPD",
          href: "/dashboard/leads/opd",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
        {
          title: "IPD",
          href: "/dashboard/leads/ipd",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
      ],
    },
    {
      title: "Patients",
      icon: UserCog,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
      children: [
        {
          title: "Patient Directory",
          href: "/dashboard/patients",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
      ],
    },
    {
      title: "Human Resource",
      icon: UserPlus,
      requiredPermissions: [UserRole.ADMIN, UserRole.HR],
      children: [
        {
          title: "All Employees",
          href: "/dashboard/hr/employees",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        {
          title: "Add New Member",
          href: "/dashboard/hr/employees/create",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        // {
        //   title: "Bulk Upload",
        //   href: "/dashboard/bulk-upload",
        //   requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        // },
        {
          title: "Leaves",
          href: "/dashboard/hr/leaves",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        {
          title: "Salary",
          href: "/dashboard/hr/salary",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE, UserRole.HR],
        },
        {
          title: "Incentive",
          href: "/dashboard/hr/incentive",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "Reimbursement",
          href: "/dashboard/hr/reimbursement",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "Attendance",
          href: "/dashboard/hr/attendance",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        {
          title: "Targets",
          href: "/dashboard/hr/targets",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
      ],
    },
    {
      title: "Partners",
      icon: Building2,
      requiredPermissions: [UserRole.ADMIN], // BD has partners in restricted list
      children: [
        {
          title: "All Partners",
          href: "/dashboard/partners",
          requiredPermissions: [UserRole.ADMIN],
        },
        {
          title: "Corporate",
          href: "/dashboard/partners/corporate",
          requiredPermissions: [UserRole.ADMIN],
        },
        {
          title: "Individual",
          href: "/dashboard/partners/individual",
          requiredPermissions: [UserRole.ADMIN],
        },
        {
          title: "Onboard New Partner",
          href: "/dashboard/partners/create",
          requiredPermissions: [UserRole.ADMIN],
        },
      ],
    },
    {
      title: "Doctors",
      icon: Stethoscope,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
      children: [
        {
          title: "All Doctors",
          href: "/dashboard/doctors",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
        {
          title: "Doctors With Us",
          href: "/dashboard/doctors/with-us",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
        {
          title: "Doctors with Self Clinic",
          href: "/dashboard/doctors/self-clinic",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
        {
          title: "Department Wise",
          href: "/dashboard/doctors/departments",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
        {
          title: "City Wise",
          href: "/dashboard/doctors/cities",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
      ],
    },
    {
      title: "Cab Services",
      icon: Car,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
      children: [
        {
          title: "All Cabs",
          href: "/dashboard/cabs",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
        },
        {
          title: "Scheduled Cabs",
          href: "/dashboard/cabs/scheduled",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
        },
      ],
    },
    {
      title: "Hospitals",
      icon: Building2,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
      children: [
        {
          title: "All Hospitals",
          href: "/dashboard/hospitals",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
        },
        {
          title: "City wise Hospital",
          href: "/dashboard/hospitals/cities",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.PARTNER],
        },
        {
          title: "Appointment Schedule",
          href: "/dashboard/hospitals/appointments",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.DOCTOR],
        },
      ],
    },
    {
      title: "Finance",
      icon: IndianRupee,
      requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
      children: [
        {
          title: "Daily Debits & Credits",
          href: "/dashboard/finance/daily",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "Payment from Patient",
          href: "/dashboard/finance/payments",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "Doctors Invoice",
          href: "/dashboard/finance/doctors-invoice",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "Hospital Invoice",
          href: "/dashboard/finance/hospital-invoice",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        // {
        //   title: "Salary/Incentives",
        //   href: "/dashboard/finance/salary",
        //   requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE, UserRole.HR],
        // },
        // {
        //   title: "GST",
        //   href: "/dashboard/finance/gst",
        //   requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        // },
      ],
    },
    {
      title: "Loans",
      icon: CreditCard,
      requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.FINANCE],
      children: [
        {
          title: "All Loans",
          href: "/dashboard/loans",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
        {
          title: "New Loan Leads",
          href: "/dashboard/loans/new",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD, UserRole.FINANCE],
        },
        {
          title: "Create New Loan Lead",
          href: "/dashboard/loans/create",
          requiredPermissions: [UserRole.ADMIN, UserRole.BD],
        },
        {
          title: "Pending Payments",
          href: "/dashboard/loans/pending",
          requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        },
      ],
    },
    {
      title: "Documents",
      icon: FileText,
      requiredPermissions: [UserRole.ADMIN, UserRole.HR], // Finance has view only
      children: [
        {
          title: "Download",
          href: "/dashboard/documents/download",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        {
          title: "Upload",
          href: "/dashboard/documents/upload",
          requiredPermissions: [UserRole.ADMIN, UserRole.HR],
        },
        // {
        //   title: "Insurance Process",
        //   href: "/dashboard/documents/insurance",
        //   requiredPermissions: [UserRole.ADMIN, UserRole.FINANCE],
        // },
        // {
        //   title: "Salary Slips",
        //   href: "/dashboard/documents/salary-slips",
        //   requiredPermissions: [UserRole.ADMIN, UserRole.HR, UserRole.FINANCE],
        // },
      ],
    },
    {
      title: "My Targets",
      href: "/dashboard/my-targets",
      icon: BarChart3,
      requiredPermissions: [
        UserRole.ADMIN,
        UserRole.BD,
        UserRole.HR,
        UserRole.FINANCE,
        UserRole.DOCTOR,
        UserRole.PARTNER,
      ],
    },
    {
      title: "Role Management",
      icon: Shield,
      requiredPermissions: [UserRole.ADMIN],
      children: [
        {
          title: "All Roles",
          href: "/dashboard/admin/roles",
          requiredPermissions: [UserRole.ADMIN],
        },
        {
          title: "Create Role",
          href: "/dashboard/admin/roles/create",
          requiredPermissions: [UserRole.ADMIN],
        },
      ],
    },
  ],
};

export default data;
