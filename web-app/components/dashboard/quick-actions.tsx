import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar,
  Users,
  Phone,
  Car,
  Building2,
  IndianRupee,
  Upload,
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  userRole?: string;
}

export default function QuickActions({
  userRole = "Employee",
}: QuickActionsProps) {
  const allActions = [
    {
      title: "Create New Lead",
      description: "Add a new patient lead",
      href: "/dashboard/leads/create",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Schedule Appointment",
      description: "Book OPD/IPD appointment",
      href: "/dashboard/doctors",
      icon: Calendar,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Add Employee",
      description: "Onboard new team member",
      href: "/dashboard/hr/employees/create",
      icon: Users,
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Book Cab",
      description: "Schedule patient transport",
      href: "/dashboard/cabs/create",
      icon: Car,
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Follow Up Calls",
      description: "View pending follow-ups",
      href: "/dashboard/leads/followup",
      icon: Phone,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Add Doctor",
      description: "Register new doctor",
      href: "/dashboard/doctors/create",
      icon: Users,
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      title: "Add Hospital",
      description: "Register new hospital",
      href: "/dashboard/hospitals/create",
      icon: Building2,
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      title: "Create Loan Lead",
      description: "New loan application",
      href: "/dashboard/loans/create",
      icon: IndianRupee,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "Upload Documents",
      description: "Upload patient documents",
      href: "/dashboard/documents/upload",
      icon: Upload,
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  const availableActions = allActions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {availableActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:shadow-md transition-all bg-transparent mb-2"
              >
                <div
                  className={`p-2 rounded-md mr-3 text-white ${action.color}`}
                >
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">
                    {action.description}
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
