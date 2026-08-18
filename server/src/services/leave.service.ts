import { Leave } from "../models/leave.model";

export const LeaveService = {
  async list(filters?: {
    employeeId?: string;
    status?: string;
    leaveType?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const query: any = {};
    
    if (filters?.employeeId) {
      query.employeeId = filters.employeeId;
    }
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.leaveType) {
      query.leaveType = filters.leaveType;
    }
    
    if (filters?.department) {
      query.department = new RegExp(filters.department, 'i');
    }
    
    // Date range filtering
    if (filters?.startDate || filters?.endDate) {
      query.startDate = {};
      if (filters.startDate) {
        query.startDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.startDate.$lte = new Date(filters.endDate);
      }
    }
    
    return Leave.find(query)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .populate('replacementEmployee', 'name designation')
      .sort({ appliedDate: -1 })
      .lean();
  },

  async getById(id: string) {
    return Leave.findById(id)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .populate('replacementEmployee', 'name designation')
      .lean();
  },

  async create(data: any) {
    return Leave.create(data);
  },

  async update(id: string, data: any) {
    return Leave.findByIdAndUpdate(id, data, { new: true });
  },

  async remove(id: string) {
    return Leave.findByIdAndDelete(id);
  },

  async getStats() {
    const totalLeaves = await Leave.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: "Pending" });
    const approvedLeaves = await Leave.countDocuments({ status: "Approved" });
    const rejectedLeaves = await Leave.countDocuments({ status: "Rejected" });

    // Current month stats
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const currentMonthLeaves = await Leave.countDocuments({
      appliedDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Leave type distribution
    const leaveTypeStats = await Leave.aggregate([
      {
        $group: {
          _id: "$leaveType",
          count: { $sum: 1 },
          totalDays: { $sum: "$totalDays" }
        }
      }
    ]);

    // Department wise stats
    const departmentStats = await Leave.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] }
          }
        }
      }
    ]);

    return {
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      currentMonthLeaves,
      leaveTypeStats,
      departmentStats
    };
  },

  async approveLeave(id: string, approvedBy: string, comments?: string) {
    return Leave.findByIdAndUpdate(
      id,
      {
        status: "Approved",
        approvedBy,
        approvedDate: new Date(),
        comments
      },
      { new: true }
    );
  },

  async rejectLeave(id: string, approvedBy: string, rejectionReason: string) {
    return Leave.findByIdAndUpdate(
      id,
      {
        status: "Rejected",
        approvedBy,
        approvedDate: new Date(),
        rejectionReason
      },
      { new: true }
    );
  },

  async getEmployeeLeaves(employeeId: string, year?: number) {
    const query: any = { employeeId };
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    return Leave.find(query)
      .sort({ appliedDate: -1 })
      .lean();
  },

  async getLeaveBalance(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const approvedLeaves = await Leave.aggregate([
      {
        $match: {
          employeeId: employeeId,
          status: "Approved",
          startDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: "$leaveType",
          totalDays: { $sum: "$totalDays" }
        }
      }
    ]);

    // Default leave entitlements (should come from employee policy)
    const defaultEntitlements = {
      "Annual Leave": 21,
      "Sick Leave": 12,
      "Casual Leave": 12,
      "Maternity Leave": 180,
      "Paternity Leave": 15
    };

    const leaveBalance = {};
    for (const [leaveType, entitlement] of Object.entries(defaultEntitlements)) {
      const used = approvedLeaves.find(l => l._id === leaveType)?.totalDays || 0;
      leaveBalance[leaveType] = {
        entitled: entitlement,
        used,
        remaining: entitlement - used
      };
    }

    return leaveBalance;
  }
};