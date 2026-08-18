import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Building2,
  Stethoscope,
  Car,
  IndianRupee,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalLeads: number;
    newLeads: number;
    todayOPD: number;
    todayIPD: number;
    totalOPD: number;
    totalIPD: number;
    totalDoctors: number;
    totalHospitals: number;
    totalCabs: number;
    totalLoans: string;
    totalSubscriptions: number;
    thisMonthTarget: string;
    achievements: string;
    followupsToday: number;
  };
}

export default function EnhancedDashboardStats({ stats }: DashboardStatsProps) {
  const mainStats = [
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/dashboard/leads",
    },
    {
      title: "New Leads",
      value: stats.newLeads.toLocaleString(),
      change: "+8%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      link: "/dashboard/leads",
    },
    {
      title: "Today's OPD",
      value: stats.todayOPD.toLocaleString(),
      change: "+15%",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/dashboard/leads/opd",
    },
    {
      title: "Today's IPD",
      value: stats.todayIPD.toLocaleString(),
      change: "+5%",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      link: "/dashboard/leads/ipd",
    },
  ];

  const secondaryStats = [
    {
      title: "Total OPD",
      value: stats.totalOPD.toLocaleString(),
      icon: CheckCircle,
      color: "text-indigo-600",
      link: "/dashboard/leads",
    },
    {
      title: "Total IPD",
      value: stats.totalIPD.toLocaleString(),
      icon: FileText,
      color: "text-red-600",
      link: "/dashboard/leads",
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors.toLocaleString(),
      icon: Stethoscope,
      color: "text-green-600",
      link: "/dashboard/doctors",
    },
    {
      title: "Total Hospitals",
      value: stats.totalHospitals.toLocaleString(),
      icon: Building2,
      color: "text-blue-600",
      link: "/dashboard/hospitals",
    },
    {
      title: "Total Cabs",
      value: stats.totalCabs.toLocaleString(),
      icon: Car,
      color: "text-yellow-600",
      link: "/dashboard/cabs",
    },
    {
      title: "Total Loans",
      value: stats.totalLoans,
      icon: IndianRupee,
      color: "text-green-600",
      link: "/dashboard/loans",
    },
    {
      title: "Total Subscriptions",
      value: stats.totalSubscriptions.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      link: "/dashboard/partners",
    },
    {
      title: "Follow-ups Today",
      value: stats.followupsToday.toLocaleString(),
      icon: Clock,
      color: "text-orange-600",
      link: "/dashboard/leads/followup",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {secondaryStats.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-xs text-gray-600">{stat.title}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
