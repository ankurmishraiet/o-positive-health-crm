"use client";

import EnhancedDashboardStats from "@/components/dashboard/enhanced-dashboard-stats";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import DashboardAnalytics from "@/components/dashboard/dashboard-analytics";
import { useAuth } from "@/hooks/use-auth";
import axios from "@/axios/axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function fetchDashboardStats() {
  try {
    const res = await axios.get(`/dashboard/stats`);
    const statsData = res.data;

    const loanTotal = statsData.totalLoans || 0;

    return {
      totalLeads: statsData.totalLeads || 0,
      newLeads: statsData.newLeads || 0,
      todayOPD: statsData.todayOPD || 0,
      todayIPD: statsData.todayIPD || 0,
      totalOPD: statsData.totalOPD || 0,
      totalIPD: statsData.totalIPD || 0,
      totalDoctors: statsData.totalDoctors || 0,
      totalHospitals: statsData.totalHospitals || 0,
      totalCabs: statsData.totalCabs || 0,
      totalLoans: statsData.totalLoans,
      totalSubscriptions: 0,
      followupsToday: statsData.followupsToday || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalLeads: 0,
      newLeads: 0,
      todayOPD: 0,
      todayIPD: 0,
      totalOPD: 0,
      totalIPD: 0,
      totalDoctors: 0,
      totalHospitals: 0,
      totalCabs: 0,
      totalLoans: "₹0.0L",
      totalSubscriptions: 0,
      followupsToday: 0,
    };
  }
}

export default function DashboardPage() {
  const { session, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.push("/login");
      return;
    }
    fetchDashboardStats().then(setStats);
  }, [session, isLoading, router]);

  if (!stats) {
    return <p className="text-gray-500">Loading dashboard...</p>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Role: {session?.user?.role}</p>
          <p className="text-sm text-gray-500">
            ID: {session?.user?.employeeId}
          </p>
        </div>
      </div>

      <EnhancedDashboardStats stats={stats} />

      {/* Analytics Charts */}
      <DashboardAnalytics />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>
        <div>
          <QuickActions userRole={session?.user?.role} />
        </div>
      </div>
    </div>
  );
}
