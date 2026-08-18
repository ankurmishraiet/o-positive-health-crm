"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  UserPlus,
  Building2,
  Stethoscope,
  Car,
  IndianRupee,
  FileText,
  CreditCard,
  BarChart3,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Leads",
    icon: Users,
    children: [
      { title: "All Leads", href: "/dashboard/leads" },
      { title: "Create New Lead", href: "/dashboard/leads/create" },
      { title: "Follow up Today", href: "/dashboard/leads/followup" },
      { title: "OPD", href: "/dashboard/leads/opd" },
      { title: "IPD", href: "/dashboard/leads/ipd" },
    ],
  },
  {
    title: "Human Resource",
    icon: UserPlus,
    children: [
      { title: "All Employees", href: "/dashboard/hr/employees" },
      { title: "Add New Member", href: "/dashboard/hr/employees/create" },
      { title: "Leaves", href: "/dashboard/hr/leaves" },
      { title: "Salary", href: "/dashboard/hr/salary" },
      { title: "Incentive", href: "/dashboard/hr/incentive" },
      { title: "Reimbursement", href: "/dashboard/hr/reimbursement" },
    ],
  },
  {
    title: "Partners",
    icon: Building2,
    children: [
      { title: "All Partners", href: "/dashboard/partners" },
      { title: "Corporate", href: "/dashboard/partners/corporate" },
      { title: "Individual", href: "/dashboard/partners/individual" },
      { title: "Onboard New Partner", href: "/dashboard/partners/create" },
    ],
  },
  {
    title: "Doctors",
    icon: Stethoscope,
    children: [
      { title: "All Doctors", href: "/dashboard/doctors" },
      { title: "Doctors With Us", href: "/dashboard/doctors/with-us" },
      {
        title: "Doctors with Self Clinic",
        href: "/dashboard/doctors/self-clinic",
      },
      { title: "Department Wise", href: "/dashboard/doctors/departments" },
      { title: "City Wise", href: "/dashboard/doctors/cities" },
    ],
  },
  {
    title: "Cab Services",
    icon: Car,
    children: [
      { title: "All Cabs", href: "/dashboard/cabs" },
      { title: "Today Cabs", href: "/dashboard/cabs/today" },
      { title: "Scheduled Cabs", href: "/dashboard/cabs/scheduled" },
      { title: "Cab for OPD", href: "/dashboard/cabs/opd" },
      { title: "Cab for IPD", href: "/dashboard/cabs/ipd" },
    ],
  },
  {
    title: "Hospitals",
    icon: Building2,
    children: [
      { title: "All Hospitals", href: "/dashboard/hospitals" },
      { title: "City wise Hospital", href: "/dashboard/hospitals/cities" },
      {
        title: "Appointment Schedule",
        href: "/dashboard/hospitals/appointments",
      },
    ],
  },
  {
    title: "Finance",
    icon: IndianRupee,
    children: [
      { title: "Daily Debits & Credits", href: "/dashboard/finance/daily" },
      { title: "Payment from Patient", href: "/dashboard/finance/payments" },
      { title: "Doctors Invoice", href: "/dashboard/finance/doctors-invoice" },
      {
        title: "Hospital Invoice",
        href: "/dashboard/finance/hospital-invoice",
      },
      { title: "Salary/Incentives", href: "/dashboard/finance/salary" },
      { title: "GST", href: "/dashboard/finance/gst" },
    ],
  },
  {
    title: "Loans",
    icon: CreditCard,
    children: [
      { title: "All Loans", href: "/dashboard/loans" },
      { title: "New Loan Leads", href: "/dashboard/loans/new" },
      { title: "Create New Loan Lead", href: "/dashboard/loans/create" },
      { title: "Pending Payments", href: "/dashboard/loans/pending" },
    ],
  },
  {
    title: "Documents",
    icon: FileText,
    children: [
      { title: "Download", href: "/dashboard/documents/download" },
      { title: "Upload", href: "/dashboard/documents/upload" },
      { title: "Insurance Process", href: "/dashboard/documents/insurance" },
      { title: "Salary Slips", href: "/dashboard/documents/salary-slips" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 bg-white border-r border-gray-200 flex flex-col fixed lg:sticky top-0 left-0 h-screen z-40 transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600">O Positive Health</h2>
          <p className="text-sm text-gray-500">CRM Platform</p>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                      {expandedItems.includes(item.title) ? (
                        <ChevronDown className="ml-auto h-4 w-4" />
                      ) : (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </Button>
                    {expandedItems.includes(item.title) && (
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start text-sm",
                                pathname === child.href &&
                                  "bg-blue-50 text-blue-600"
                              )}
                            >
                              <span className="truncate">{child.title}</span>
                            </Button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href!}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-blue-50 text-blue-600"
                      )}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
