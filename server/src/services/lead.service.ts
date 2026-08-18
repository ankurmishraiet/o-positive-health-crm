import { Lead } from "../models/lead.model";
import { Appointment } from "../models/appointment.model";
import { Employee } from "../models/employee.model";
import {
  CreateLeadDto,
  UpdateLeadStatusDto,
  LeadStatus,
} from "../types/lead.types";
import { UserRole } from "../constants/roles.enum";
import mongoose from "mongoose";
import { findEmployeeForUser } from "../utils/employee-lookup";

export const LeadService = {
  async list(filters: any = {}, user?: any) {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...queryFilters
    } = filters;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the query
    const query: any = {};

    // Handle filters
    if (queryFilters.createdBy) {
      query.createdBy = queryFilters.createdBy;
    }
    if (queryFilters.assignedTo) {
      query.assignedTo = queryFilters.assignedTo;
    }
    if (queryFilters.leadStatus) {
      query.leadStatus = queryFilters.leadStatus;
    }
    if (queryFilters.city) {
      const escapedCity = queryFilters.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.city = new RegExp(`^${escapedCity}$`, "i");
    }
    if (queryFilters.treatment) {
      query.treatment = new RegExp(queryFilters.treatment, "i");
    }
    if (queryFilters.search) {
      query.$or = [
        { patientName: new RegExp(queryFilters.search, "i") },
        { "contact.mobile": new RegExp(queryFilters.search, "i") },
        { treatment: new RegExp(queryFilters.search, "i") },
      ];
    }
    // Filter by follow-up status
    if (queryFilters.followUpStatus) {
      const now = new Date();
      if (queryFilters.followUpStatus === "pending") {
        query["engagement.followUpAt"] = { $gte: now };
      } else if (queryFilters.followUpStatus === "overdue") {
        query["engagement.followUpAt"] = { $lt: now, $exists: true };
      } else if (queryFilters.followUpStatus === "no_followup") {
        query["engagement.followUpAt"] = null;
      }
    }
    // Filter by assignment state (only when no specific assignedTo is given)
    if (!queryFilters.assignedTo) {
      if (queryFilters.unassigned === "true") {
        query.assignedTo = { $in: [null, undefined] };
      } else if (queryFilters.assigned === "true") {
        query.assignedTo = { $exists: true, $ne: null };
      }
    }

    // Filter leads for non-admin users
    // Only show leads assigned to the logged-in user's associated employee
    if (user && user.role !== UserRole.ADMIN) {
      // Find the employee associated with this user
      console.log('[Lead Service] Filtering for non-admin user:', {
        userId: user.id,
        role: user.role
      });
      const employee = await findEmployeeForUser(user.id);
      console.log('[Lead Service] Employee lookup result:', employee ? {
        employeeId: employee._id.toString(),
        name: employee.name,
        employeeCode: employee.employeeId
      } : 'NOT FOUND');
      
      if (employee) {
        // Only show leads assigned to this employee
        query.assignedTo = employee._id;
        console.log('[Lead Service] Filtering leads by assignedTo:', employee._id.toString());
      } else {
        // If no employee is found, return empty results
        console.log('[Lead Service] No employee found for user, returning empty results');
        return {
          leads: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
            hasMore: false,
          },
        };
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    console.log('[Lead Service] Final query:', JSON.stringify(query));
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name")
        .populate("createdBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(query),
    ]);

    console.log('[Lead Service] Query results:', { leadsFound: leads.length, total });
    return {
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  },

  async getById(id: string, user?: any) {
    const lead = await Lead.findById(id)
      .populate("assignedTo", "name")
      .populate("createdBy", "name")
      .lean();

    // Filter for non-admin users - only allow access to their assigned leads
    if (lead && user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      // Handle both populated and unpopulated assignedTo
      const assignedToId = (lead.assignedTo as any)?._id?.toString() || lead.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        // Return null if the lead is not assigned to this employee
        return null;
      }
    }

    return lead;
  },

  async create(data: CreateLeadDto, userId: string) {
    // Check for duplicate phone number if mobile is provided
    if (data.contact?.mobile && data.contact.mobile.trim() !== "") {
      const existingLead = await Lead.findOne({
        "contact.mobile": data.contact.mobile,
      });
      if (existingLead) {
        throw new Error(
          `A lead with phone number ${data.contact.mobile} already exists (Lead ID: ${existingLead._id})`
        );
      }
    }

    // Validate assignedTo is a valid ObjectId if provided
    let validAssignedTo = undefined;
    if (data.assignedTo && data.assignedTo.trim() !== "") {
      if (mongoose.Types.ObjectId.isValid(data.assignedTo)) {
        validAssignedTo = data.assignedTo;
      } else {
        // Invalid ObjectId - set to undefined to avoid BSON error
        validAssignedTo = undefined;
      }
    }

    // Ensure engagement object exists with default values
    const leadData = {
      ...data,
      assignedTo: validAssignedTo,
      createdBy: userId,
      engagement: {
        firstEngagement: new Date(),
        lastEngagement: new Date(),
        followUpAt: data.contact?.mobile
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : undefined, // Default to tomorrow if mobile provided
        ...((data as any).engagement || {}),
      },
    };

    return Lead.create(leadData);
  },

  async update(id: string, data: any) {
    // Validate assignedTo if it's being updated
    if (data.assignedTo !== undefined) {
      if (data.assignedTo && data.assignedTo.trim() !== "") {
        if (!mongoose.Types.ObjectId.isValid(data.assignedTo)) {
          // Invalid ObjectId - set to undefined to avoid BSON error
          data.assignedTo = undefined;
        }
      } else {
        // Empty or null value - set to undefined
        data.assignedTo = undefined;
      }
    }

    return Lead.findByIdAndUpdate(id, data, { new: true });
  },

  async updateStatus(id: string, leadStatus: LeadStatus) {
    return Lead.findByIdAndUpdate(id, { leadStatus }, { new: true });
  },

  async assignLead(id: string, employeeId: string, assignedByUserId: string) {
    // Validate employeeId is a valid ObjectId
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error("Invalid employee ID provided");
    }

    return Lead.findByIdAndUpdate(
      id,
      {
        assignedTo: employeeId,
        assignedBy: assignedByUserId,
      },
      { new: true }
    )
      .populate("assignedTo", "name")
      .populate("assignedBy", "name");
  },

  async remove(id: string) {
    return Lead.findByIdAndDelete(id);
  },

  async getFollowUpToday(page: number = 1, limit: number = 20, user?: any) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const skip = (page - 1) * limit;

    const query: any = {
      "engagement.followUpAt": {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    // Filter leads for non-admin users
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        query.assignedTo = employee._id;
      } else {
        // No employee record found for this user, return empty results
        return {
          leads: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasMore: false,
          },
        };
      }
    }

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name")
        .select(
          "patientName contact treatment leadStatus engagement assignedTo"
        )
        .sort({ "engagement.followUpAt": 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    };
  },

  async getOPD(filter: string = "today", user?: any) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let appointmentDateFilter: any = {};
    let leadDateFilter: any = {};

    if (filter === "today") {
      appointmentDateFilter = {
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
      leadDateFilter = {
        $or: [
          { "engagement.followUpAt": { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };
    } else if (filter === "past") {
      appointmentDateFilter = {
        appointmentDate: { $lt: startOfDay },
      };
      leadDateFilter = {
        $or: [
          { "engagement.followUpAt": { $lt: startOfDay } },
          {
            updatedAt: { $lt: startOfDay },
            "engagement.followUpAt": { $exists: false },
          },
        ],
      };
    } else if (filter === "future") {
      appointmentDateFilter = {
        appointmentDate: { $gt: endOfDay },
      };
      leadDateFilter = {
        "engagement.followUpAt": { $gt: endOfDay },
      };
    }
    // 'all' filter has no date restrictions

    // Find appointments with type OPD
    const appointments = await Appointment.find({
      type: "OPD",
      ...appointmentDateFilter,
      status: { $in: ["Scheduled", "Confirmed", "In Progress"] },
    })
      .populate("doctor", "name")
      .populate("hospital", "name address")
      .select(
        "appointmentId patientName patientPhone treatment doctorName hospitalName appointmentDate appointmentTime status"
      )
      .lean();

    // Include leads with OPD status or leadStatus "OPD Schedule"
    const leadQuery: any = {
      $or: [
        {
          opdStatus: {
            $in: ["Scheduled", "In Progress", "Online OPD", "Offline OPD"],
          },
        },
        { leadStatus: "OPD Schedule" },
      ],
    };

    if (filter !== "all") {
      leadQuery.$and = [leadDateFilter];
    }

    // Filter leads for non-admin users
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        leadQuery.assignedTo = employee._id;
      } else {
        // No employee record found for this user, return empty leads
        return { appointments, leads: [] };
      }
    }

    const leads = await Lead.find(leadQuery)
      .populate("assignedTo", "name")
      .select(
        "patientName contact treatment opdStatus leadStatus engagement assignedTo city"
      )
      .lean();

    return { appointments, leads };
  },

  async getTodayOPD(user?: any) {
    return this.getOPD("today", user);
  },

  async getIPD(filter: string = "today", user?: any) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let appointmentDateFilter: any = {};
    let leadDateFilter: any = {};

    if (filter === "today") {
      appointmentDateFilter = {
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      };
      leadDateFilter = {
        $or: [
          { "engagement.followUpAt": { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };
    } else if (filter === "past") {
      appointmentDateFilter = {
        appointmentDate: { $lt: startOfDay },
      };
      leadDateFilter = {
        $or: [
          { "engagement.followUpAt": { $lt: startOfDay } },
          {
            updatedAt: { $lt: startOfDay },
            "engagement.followUpAt": { $exists: false },
          },
        ],
      };
    } else if (filter === "future") {
      appointmentDateFilter = {
        appointmentDate: { $gt: endOfDay },
      };
      leadDateFilter = {
        "engagement.followUpAt": { $gt: endOfDay },
      };
    }
    // 'all' filter has no date restrictions

    // Find appointments with type IPD
    const appointments = await Appointment.find({
      type: "IPD",
      ...appointmentDateFilter,
      status: { $in: ["Scheduled", "Confirmed", "In Progress", "Admitted"] },
    })
      .populate("doctor", "name")
      .populate("hospital", "name address")
      .select(
        "appointmentId patientName patientPhone treatment doctorName hospitalName appointmentDate appointmentTime status duration"
      )
      .lean();

    // Include leads with IPD status or leadStatus "IPD Schedule"
    const leadQuery: any = {
      $or: [
        { ipdStatus: { $in: ["Scheduled", "Admitted"] } },
        { leadStatus: "IPD Schedule" },
      ],
    };

    if (filter !== "all") {
      leadQuery.$and = [leadDateFilter];
    }

    // Filter leads for non-admin users
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        leadQuery.assignedTo = employee._id;
      } else {
        // No employee record found for this user, return empty leads
        return { appointments, leads: [] };
      }
    }

    const leads = await Lead.find(leadQuery)
      .populate("assignedTo", "name")
      .select(
        "patientName contact treatment ipdStatus leadStatus engagement assignedTo city"
      )
      .lean();

    return { appointments, leads };
  },

  async getTodayIPD(user?: any) {
    return this.getIPD("today", user);
  },

  async getCities(user?: any) {
    const match: any = {};

    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        match.assignedTo = employee._id;
      } else {
        return [];
      }
    }

    // Aggregate to deduplicate case-insensitively (e.g. "new delhi" === "New Delhi")
    const result = await Lead.aggregate([
      {
        $match: {
          ...match,
          city: { $exists: true, $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$city" } } },
          displayName: { $first: "$city" },
        },
      },
      { $match: { _id: { $ne: "" } } },
      { $sort: { _id: 1 } },
    ]);

    return result
      .map((r) =>
        // Title-case the normalized (lowercased) key so output is always
        // consistent — "new delhi", "NEW DELHI", and "New Delhi" all → "New Delhi"
        (r._id as string).replace(/\b\w/g, (c: string) => c.toUpperCase()),
      )
      .filter(Boolean);
  },

  async getLeadsByEmployee(employeeId: string, filters: any = {}) {
    // Similar to list but filtered by assignedTo
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...queryFilters
    } = filters;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the query with assignedTo filter
    const query: any = { assignedTo: employeeId };

    // Handle additional filters
    if (queryFilters.leadStatus) {
      query.leadStatus = queryFilters.leadStatus;
    }
    if (queryFilters.city) {
      const escapedCity = queryFilters.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.city = new RegExp(`^${escapedCity}$`, "i");
    }
    if (queryFilters.treatment) {
      query.treatment = new RegExp(queryFilters.treatment, "i");
    }
    if (queryFilters.search) {
      query.$or = [
        { patientName: new RegExp(queryFilters.search, "i") },
        { "contact.mobile": new RegExp(queryFilters.search, "i") },
        { treatment: new RegExp(queryFilters.search, "i") },
      ];
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name")
        .populate("assignedBy", "name")
        .populate("createdBy", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  },
};
