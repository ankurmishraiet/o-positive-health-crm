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
      totalLoans: statsData.totalLoans || "₹0.0L",
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
  const [currentTime, setCurrentTime] = useState(new Date());

  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!session) {
      router.push("/login");
      return;
    }

    fetchDashboardStats().then(setStats);
  }, [session, isLoading, router]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Admin User";
  const userRole = session?.user?.role || "admin";
  const employeeId = session?.user?.employeeId || "EMP001";

  return (
    <div className="min-h-screen space-y-6 bg-slate-50/50 p-2 md:p-4">

      {/* ================= HEADER / WELCOME ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 via-purple-600 to-blue-600 p-6 text-white shadow-xl md:p-8">

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

          {/* Welcome */}
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
              ✨ O Positive Healthcare CRM
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Welcome back, {userName} 👋
            </h1>

            <p className="mt-2 max-w-xl text-sm text-purple-100 md:text-base">
              Here's what's happening with your healthcare system today.
            </p>

            {/* Date + Time */}
            <div className="mt-5 flex flex-wrap gap-3">

              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-md">
                <span className="text-lg">📅</span>
                <div>
                  <p className="text-xs text-purple-100">Today</p>
                  <p className="text-sm font-semibold">
                    {currentTime.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-md">
                <span className="text-lg">🕐</span>
                <div>
                  <p className="text-xs text-purple-100">Current Time</p>
                  <p className="text-sm font-semibold">
                    {currentTime.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">

            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-lg">
              👨‍💼
            </div>

            <div>
              <p className="text-xs text-purple-100">Logged in as</p>

              <p className="text-lg font-bold">
                {userName}
              </p>

              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium capitalize">
                  {userRole}
                </span>

                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium">
                  ID: {employeeId}
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= QUICK OVERVIEW ================= */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Overview
            </h2>
            <p className="text-sm text-slate-500">
              Quick summary of your healthcare CRM
            </p>
          </div>

          <div className="hidden rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-600 sm:block">
            ● System Active
          </div>
        </div>

        <EnhancedDashboardStats stats={stats} />
      </section>

      {/* ================= ANALYTICS ================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Analytics
          </h2>
          <p className="text-sm text-slate-500">
            Monitor OPD, IPD and department performance
          </p>
        </div>

        <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
          <DashboardAnalytics />
        </div>
      </section>

      {/* ================= ACTIVITIES + QUICK ACTIONS ================= */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Recent Activity
          </h2>
          <p className="text-sm text-slate-500">
            Latest updates and frequently used actions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Recent Activities */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 lg:col-span-2">
            <RecentActivities />
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <QuickActions userRole={userRole} />
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
        <p>
          © {new Date().getFullYear()} O Positive Healthcare
        </p>

        <p>
          Healthcare Management System
        </p>
      </div>

    </div>
  );
}
