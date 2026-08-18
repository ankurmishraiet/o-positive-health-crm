"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  Stethoscope,
  Car,
  IndianRupee,
  FileText,
  Calendar,
  TrendingUp,
} from "lucide-react";
import axios from "@/axios/axios";

interface DashboardStats {
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
}

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard statistics</div>;
  }

  const statsConfig = [
    {
      title: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
      change: `${stats.newLeads} new`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Doctors",
      value: stats.totalDoctors.toLocaleString(),
      change: "Active",
      icon: Stethoscope,
      color: "text-green-600",
    },
    {
      title: "Total Hospitals",
      value: stats.totalHospitals.toLocaleString(),
      change: "Active",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      title: "Total Cabs",
      value: stats.totalCabs.toLocaleString(),
      change: "Available",
      icon: Car,
      color: "text-orange-600",
    },
    {
      title: "Total OPD",
      value: stats.totalOPD.toLocaleString(),
      change: `${stats.todayOPD} today`,
      icon: Calendar,
      color: "text-indigo-600",
    },
    {
      title: "Total IPD",
      value: stats.totalIPD.toLocaleString(),
      change: `${stats.todayIPD} today`,
      icon: FileText,
      color: "text-red-600",
    },
    {
      title: "Total Loans",
      value: stats.totalLoans,
      change: "Disbursed",
      icon: IndianRupee,
      color: "text-yellow-600",
    },
    {
      title: "This Month Target",
      value: stats.thisMonthTarget,
      change: stats.achievements,
      icon: TrendingUp,
      color: "text-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-green-600 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
