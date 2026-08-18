import { Lead } from "../models/lead.model";
import { Doctor } from "../models/doctor.model";
import { Hospital } from "../models/hospital.model";
import { Cab } from "../models/cab.model";
import { Loan } from "../models/loan.model";
import { Appointment } from "../models/appointment.model";
import { Employee } from "../models/employee.model";
import { UserRole } from "../constants/roles.enum";
import mongoose from "mongoose";
import { findEmployeeForUser } from "../utils/employee-lookup";

export class DashboardService {
  static async getRecentActivities(limit: number = 10, user?: any) {
    try {
      const activities: any[] = [];

      // Build lead filter query
      const leadFilter: any = {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };

      // Filter leads for non-admin users
      if (user && user.role !== UserRole.ADMIN) {
        const employee = await findEmployeeForUser(user.id);
        if (employee) {
          leadFilter.assignedTo = employee._id;
        } else {
          // No employee record - use impossible condition to match no leads
          leadFilter._id = { $in: [] };
        }
      }

      // Get recent leads (created in last 7 days)
      const recentLeads = await Lead.find(leadFilter)
        .populate("createdBy", "name")
        .populate("assignedTo", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Get recent appointments (created/updated in last 7 days)
      const recentAppointments = await Appointment.find({
        $or: [
          {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
          {
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        ],
      })
        .populate("doctor", "name")
        .populate("hospital", "name")
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(5)
        .lean();

      // Convert leads to activities
      recentLeads.forEach((lead) => {
        const timeDiff = Date.now() - new Date(lead.createdAt).getTime();
        const timeAgo = this.getTimeAgo(timeDiff);
        const createdBy = lead.createdBy as any;

        activities.push({
          id: `lead_${lead._id}`,
          type: "lead_created",
          message: `New lead created for ${lead.patientName}`,
          user: createdBy?.name || "System",
          time: timeAgo,
          status: lead.leadStatus.toLowerCase(),
          timestamp: new Date(lead.createdAt),
        });
      });

      // Convert appointments to activities
      recentAppointments.forEach((appointment) => {
        const timeDiff =
          Date.now() -
          new Date(appointment.updatedAt || appointment.createdAt).getTime();
        const timeAgo = this.getTimeAgo(timeDiff);
        const doctor = appointment.doctor as any;

        let message = "";
        let activityType = "";

        if (appointment.type === "OPD") {
          message = `OPD ${appointment.status.toLowerCase()} for patient ${appointment.patientName}`;
          activityType =
            appointment.status === "Scheduled"
              ? "opd_scheduled"
              : "opd_completed";
        } else if (appointment.type === "IPD") {
          message = `IPD ${appointment.status.toLowerCase()} for patient ${appointment.patientName}`;
          activityType =
            appointment.status === "Scheduled"
              ? "ipd_scheduled"
              : "ipd_completed";
        } else {
          message = `${appointment.type} ${appointment.status.toLowerCase()} for patient ${appointment.patientName}`;
          activityType = "appointment_updated";
        }

        activities.push({
          id: `appointment_${appointment._id}`,
          type: activityType,
          message,
          user: doctor?.name || "Doctor",
          time: timeAgo,
          status: appointment.status.toLowerCase().replace(" ", "_"),
          timestamp: new Date(appointment.updatedAt || appointment.createdAt),
        });
      });

      // Sort all activities by timestamp and limit
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return activities.slice(0, limit);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw new Error("Failed to fetch recent activities");
    }
  }

  private static getTimeAgo(timeDiff: number): string {
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  static async getStats(user?: any) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Build base filter for leads
      const baseLeadFilter: any = {};

      // Filter leads for non-admin users
      if (user && user.role !== UserRole.ADMIN) {
        const employee = await findEmployeeForUser(user.id);
        if (employee) {
          baseLeadFilter.assignedTo = employee._id;
        } else {
          // No employee record - use impossible condition to match no leads
          baseLeadFilter._id = { $in: [] };
        }
      }

      const [
        totalLeads,
        newLeads,
        todayOPD,
        todayIPD,
        totalOPD,
        totalIPD,
        totalDoctors,
        totalHospitals,
        totalCabs,
        totalLoans,
        followupsToday,
      ] = await Promise.all([
        // Total Leads
        Lead.countDocuments(baseLeadFilter),

        // New Leads
        Lead.countDocuments({ ...baseLeadFilter, leadStatus: "New" }),

        // Today's OPD (Scheduled with today's follow-up date)
        Lead.countDocuments({
          ...baseLeadFilter,
          opdStatus: "Scheduled",
          "engagement.followUpAt": { $gte: todayStart, $lte: todayEnd },
        }),

        // Today's IPD (Scheduled with today's follow-up date)
        Lead.countDocuments({
          ...baseLeadFilter,
          ipdStatus: "Scheduled",
          "engagement.followUpAt": { $gte: todayStart, $lte: todayEnd },
        }),

        // Total OPD Done
        Lead.countDocuments({ ...baseLeadFilter, opdStatus: "Done" }),

        // Total IPD Done
        Lead.countDocuments({ ...baseLeadFilter, ipdStatus: "Done" }),

        // Active Doctors
        Doctor.countDocuments({ isActive: true }),

        // Active Hospitals
        Hospital.countDocuments({ status: "Active" }),

        // Available/Booked Cabs
        Cab.countDocuments({ status: { $in: ["Available", "Booked"] } }),

        // Total Approved/Disbursed Loans Amount
        Loan.aggregate([
          { $match: { status: { $in: ["Approved", "Disbursed"] } } },
          { $group: { _id: null, total: { $sum: "$loanAmount" } } },
        ]),

        // Today's Follow-ups
        Lead.countDocuments({
          ...baseLeadFilter,
          "engagement.followUpAt": { $gte: todayStart, $lte: todayEnd },
        }),
      ]);

      const loanTotal = totalLoans[0]?.total || 0;

      return {
        totalLeads,
        newLeads,
        todayOPD,
        todayIPD,
        totalOPD,
        totalIPD,
        totalDoctors,
        totalHospitals,
        totalCabs,
        totalLoans: `₹${(loanTotal / 100000).toFixed(1)}L`,
        totalSubscriptions: 0,
        thisMonthTarget: "₹50L",
        achievements: "65%",
        followupsToday,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw new Error("Failed to fetch dashboard statistics");
    }
  }

  // New Analytics Methods
  static async getOPDIPDTrends(period: "monthly" | "yearly", user?: any) {
    try {
      const baseLeadFilter: any = {};

      // Filter for non-admin users
      if (user && user.role !== UserRole.ADMIN) {
        const employee = await findEmployeeForUser(user.id);
        if (employee) {
          baseLeadFilter.assignedTo = employee._id;
        } else {
          baseLeadFilter._id = { $in: [] };
        }
      }

      const now = new Date();
      let groupFormat: any;
      let matchDate: any;
      let labels: string[];

      if (period === "monthly") {
        // Last 12 months
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        matchDate = { createdAt: { $gte: startDate } };
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };

        labels = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(
            d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          );
        }
      } else {
        // Last 5 years
        const startDate = new Date(now.getFullYear() - 4, 0, 1);
        matchDate = { createdAt: { $gte: startDate } };
        groupFormat = { year: { $year: "$createdAt" } };

        labels = [];
        for (let i = 4; i >= 0; i--) {
          labels.push((now.getFullYear() - i).toString());
        }
      }

      const opdData = await Appointment.aggregate([
        { $match: { ...matchDate, type: "OPD", status: "Completed" } },
        { $group: { _id: groupFormat, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const ipdData = await Appointment.aggregate([
        { $match: { ...matchDate, type: "IPD", status: "Completed" } },
        { $group: { _id: groupFormat, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      const result = labels.map((label) => {
        const opdItem = opdData.find((d) => {
          if (period === "monthly") {
            const itemLabel = new Date(
              d._id.year,
              d._id.month - 1,
            ).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            return itemLabel === label;
          } else {
            return d._id.year.toString() === label;
          }
        });

        const ipdItem = ipdData.find((d) => {
          if (period === "monthly") {
            const itemLabel = new Date(
              d._id.year,
              d._id.month - 1,
            ).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            return itemLabel === label;
          } else {
            return d._id.year.toString() === label;
          }
        });

        return {
          period: label,
          opd: opdItem?.count || 0,
          ipd: ipdItem?.count || 0,
        };
      });

      return result;
    } catch (error) {
      console.error("Error fetching OPD/IPD trends:", error);
      throw new Error("Failed to fetch OPD/IPD trends");
    }
  }

  static async getDepartmentWiseDistribution(user?: any) {
    try {
      const opdData = await Appointment.aggregate([
        { $match: { type: "OPD", status: "Completed" } },
        {
          $lookup: {
            from: "hospitals",
            localField: "hospital",
            foreignField: "_id",
            as: "hospitalData",
          },
        },
        {
          $unwind: { path: "$hospitalData", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: { $ifNull: ["$hospitalData.specialty", "General"] },
            opdCount: { $sum: 1 },
          },
        },
        { $project: { department: "$_id", opdCount: 1, _id: 0 } },
      ]);

      const ipdData = await Appointment.aggregate([
        { $match: { type: "IPD", status: "Completed" } },
        {
          $lookup: {
            from: "hospitals",
            localField: "hospital",
            foreignField: "_id",
            as: "hospitalData",
          },
        },
        {
          $unwind: { path: "$hospitalData", preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: { $ifNull: ["$hospitalData.specialty", "General"] },
            ipdCount: { $sum: 1 },
          },
        },
        { $project: { department: "$_id", ipdCount: 1, _id: 0 } },
      ]);

      // Merge OPD and IPD data by department
      const departmentMap = new Map();

      opdData.forEach((item) => {
        departmentMap.set(item.department, {
          department: item.department,
          opd: item.opdCount,
          ipd: 0,
        });
      });

      ipdData.forEach((item) => {
        if (departmentMap.has(item.department)) {
          departmentMap.get(item.department).ipd = item.ipdCount;
        } else {
          departmentMap.set(item.department, {
            department: item.department,
            opd: 0,
            ipd: item.ipdCount,
          });
        }
      });

      return Array.from(departmentMap.values());
    } catch (error) {
      console.error("Error fetching department distribution:", error);
      throw new Error("Failed to fetch department-wise distribution");
    }
  }

  static async getRevenueAnalytics(
    period: "daily" | "monthly" | "yearly",
    user?: any,
  ) {
    try {
      const now = new Date();
      let matchDate: any;
      let groupFormat: any;
      let labels: string[];

      if (period === "daily") {
        // Last 30 days
        const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchDate = { createdAt: { $gte: startDate } };
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        };

        labels = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(
            d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          );
        }
      } else if (period === "monthly") {
        // Last 12 months
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        matchDate = { createdAt: { $gte: startDate } };
        groupFormat = {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        };

        labels = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          labels.push(
            d.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          );
        }
      } else {
        // Last 5 years
        const startDate = new Date(now.getFullYear() - 4, 0, 1);
        matchDate = { createdAt: { $gte: startDate } };
        groupFormat = { year: { $year: "$createdAt" } };

        labels = [];
        for (let i = 4; i >= 0; i--) {
          labels.push((now.getFullYear() - i).toString());
        }
      }

      // Aggregate revenue from loans
      const revenueData = await Loan.aggregate([
        {
          $match: { ...matchDate, status: { $in: ["Approved", "Disbursed"] } },
        },
        { $group: { _id: groupFormat, revenue: { $sum: "$loanAmount" } } },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      const result = labels.map((label) => {
        const item = revenueData.find((d) => {
          if (period === "daily") {
            const itemLabel = new Date(
              d._id.year,
              d._id.month - 1,
              d._id.day,
            ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return itemLabel === label;
          } else if (period === "monthly") {
            const itemLabel = new Date(
              d._id.year,
              d._id.month - 1,
            ).toLocaleDateString("en-US", { month: "short", year: "numeric" });
            return itemLabel === label;
          } else {
            return d._id.year.toString() === label;
          }
        });

        return {
          period: label,
          revenue: item?.revenue || 0,
        };
      });

      const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);

      return { data: result, total: totalRevenue };
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      throw new Error("Failed to fetch revenue analytics");
    }
  }

  static async getFunnelData(user?: any) {
    try {
      const baseLeadFilter: any = {};

      // Filter for non-admin users
      if (user && user.role !== UserRole.ADMIN) {
        const employee = await findEmployeeForUser(user.id);
        if (employee) {
          baseLeadFilter.assignedTo = employee._id;
        } else {
          baseLeadFilter._id = { $in: [] };
        }
      }

      const [totalLeads, totalFollowups, totalOPD, totalIPD] =
        await Promise.all([
          Lead.countDocuments(baseLeadFilter),
          Lead.countDocuments({
            ...baseLeadFilter,
            "engagement.followUpAt": { $exists: true },
          }),
          Lead.countDocuments({ ...baseLeadFilter, opdStatus: "Done" }),
          Lead.countDocuments({ ...baseLeadFilter, ipdStatus: "Done" }),
        ]);

      return [
        { stage: "Total Leads", value: totalLeads },
        { stage: "Follow-ups", value: totalFollowups },
        { stage: "OPD", value: totalOPD },
        { stage: "IPD", value: totalIPD },
      ];
    } catch (error) {
      console.error("Error fetching funnel data:", error);
      throw new Error("Failed to fetch funnel data");
    }
  }
}
