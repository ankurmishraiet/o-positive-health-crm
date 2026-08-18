import { Incentive } from "../models/incentive.model";

export const IncentiveService = {
  async list(filters?: {
    employeeId?: string;
    paymentStatus?: string;
    approvalStatus?: string;
    incentiveType?: string;
    department?: string;
    month?: number;
    year?: number;
  }) {
    const query: any = {};
    
    if (filters?.employeeId) {
      query.employeeId = filters.employeeId;
    }
    
    if (filters?.paymentStatus) {
      query.paymentStatus = filters.paymentStatus;
    }
    
    if (filters?.approvalStatus) {
      query.approvalStatus = filters.approvalStatus;
    }
    
    if (filters?.incentiveType) {
      query.incentiveType = filters.incentiveType;
    }
    
    if (filters?.department) {
      query.department = new RegExp(filters.department, 'i');
    }
    
    if (filters?.month) {
      query.month = filters.month;
    }
    
    if (filters?.year) {
      query.year = filters.year;
    }
    
    return Incentive.find(query)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  },

  async getById(id: string) {
    return Incentive.findById(id)
      .populate('employeeId', 'name email department designation')
      .populate('approvedBy', 'name email')
      .lean();
  },

  async create(data: any) {
    return Incentive.create(data);
  },

  async update(id: string, data: any) {
    return Incentive.findByIdAndUpdate(id, data, { new: true });
  },

  async remove(id: string) {
    return Incentive.findByIdAndDelete(id);
  },

  async getStats() {
    const totalIncentives = await Incentive.countDocuments();
    const totalAmount = await Incentive.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const pendingApproval = await Incentive.countDocuments({ approvalStatus: "Submitted" });
    const approved = await Incentive.countDocuments({ approvalStatus: "Approved" });
    const pendingPayment = await Incentive.countDocuments({ 
      approvalStatus: "Approved", 
      paymentStatus: "Pending" 
    });

    // Current month/year stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentMonthIncentives = await Incentive.countDocuments({
      month: currentMonth,
      year: currentYear
    });

    const currentMonthAmount = await Incentive.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
          paymentStatus: "Paid"
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Incentive type distribution
    const incentiveTypeStats = await Incentive.aggregate([
      {
        $group: {
          _id: "$incentiveType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" }
        }
      }
    ]);

    // Department wise stats
    const departmentStats = await Incentive.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          pending: {
            $sum: { $cond: [{ $eq: ["$approvalStatus", "Submitted"] }, 1, 0] }
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$approvalStatus", "Approved"] }, 1, 0] }
          }
        }
      }
    ]);

    // Monthly trends for current year
    const monthlyTrends = await Incentive.aggregate([
      {
        $match: {
          year: currentYear,
          paymentStatus: "Paid"
        }
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      totalIncentives,
      totalAmount: totalAmount[0]?.total || 0,
      pendingApproval,
      approved,
      pendingPayment,
      currentMonthIncentives,
      currentMonthAmount: currentMonthAmount[0]?.total || 0,
      incentiveTypeStats,
      departmentStats,
      monthlyTrends
    };
  },

  async approveIncentive(id: string, approvedBy: string, reviewComments?: string) {
    return Incentive.findByIdAndUpdate(
      id,
      {
        approvalStatus: "Approved",
        approvedBy,
        approvedDate: new Date(),
        reviewComments
      },
      { new: true }
    );
  },

  async rejectIncentive(id: string, approvedBy: string, rejectionReason: string) {
    return Incentive.findByIdAndUpdate(
      id,
      {
        approvalStatus: "Rejected",
        approvedBy,
        approvedDate: new Date(),
        rejectionReason
      },
      { new: true }
    );
  },

  async submitForApproval(id: string) {
    return Incentive.findByIdAndUpdate(
      id,
      {
        approvalStatus: "Submitted",
        submittedDate: new Date()
      },
      { new: true }
    );
  },

  async processPayment(id: string, paymentData: {
    paymentDate?: Date;
    paymentMethod?: string;
    taxDeducted?: number;
  }) {
    const updateData = {
      paymentStatus: "Paid",
      paymentDate: paymentData.paymentDate || new Date(),
      ...paymentData
    };

    return Incentive.findByIdAndUpdate(id, updateData, { new: true });
  },

  async getEmployeeIncentives(employeeId: string, year?: number) {
    const query: any = { employeeId };
    
    if (year) {
      query.year = year;
    }

    return Incentive.find(query)
      .sort({ createdAt: -1 })
      .lean();
  },

  async getTopPerformers(limit: number = 10, year?: number) {
    const currentYear = year || new Date().getFullYear();

    return Incentive.aggregate([
      {
        $match: {
          year: currentYear,
          paymentStatus: "Paid"
        }
      },
      {
        $group: {
          _id: {
            employeeId: "$employeeId",
            employeeName: "$employeeName",
            department: "$department"
          },
          totalIncentives: { $sum: "$amount" },
          incentiveCount: { $sum: 1 },
          averageIncentive: { $avg: "$amount" }
        }
      },
      { $sort: { totalIncentives: -1 } },
      { $limit: limit }
    ]);
  },

  async generateRecurringIncentives(incentiveId: string) {
    const originalIncentive = await Incentive.findById(incentiveId);
    
    if (!originalIncentive || !originalIncentive.isRecurring) {
      throw new Error("Incentive not found or not set as recurring");
    }

    // Logic to generate next incentive based on frequency
    const nextMonth = originalIncentive.month === 12 ? 1 : originalIncentive.month + 1;
    const nextYear = originalIncentive.month === 12 ? originalIncentive.year + 1 : originalIncentive.year;

    const newIncentiveData = {
      ...originalIncentive.toObject(),
      _id: undefined,
      incentiveId: undefined,
      month: nextMonth,
      year: nextYear,
      approvalStatus: "Draft",
      paymentStatus: "Pending",
      submittedDate: undefined,
      approvedBy: undefined,
      approvedDate: undefined,
      paymentDate: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    return Incentive.create(newIncentiveData);
  }
};