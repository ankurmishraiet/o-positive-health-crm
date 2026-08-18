import { GST } from "../models/gst.model";

export const GSTService = {
  async create(data: any, userId: string) {
    return GST.create({
      ...data,
      createdBy: userId
    });
  },

  async list(filters: any = {}) {
    const {
      gstNumber,
      status,
      paymentStatus,
      returnType,
      month,
      year,
      transactionType,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = filters;

    const query: any = {};

    if (gstNumber) query.gstNumber = gstNumber;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (returnType) query.returnType = returnType;
    if (transactionType) query.transactionType = transactionType;
    if (month) query.month = month;
    if (year) query.year = year;

    const skip = (page - 1) * limit;
    
    const [gstRecords, total] = await Promise.all([
      GST.find(query)
        .populate('createdBy', 'name email')
        .populate('verifiedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      GST.countDocuments(query)
    ]);

    return {
      gstRecords,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getById(id: string) {
    return GST.findById(id)
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email')
      .lean();
  },

  async update(id: string, data: any, userId: string) {
    return GST.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    );
  },

  async delete(id: string) {
    return GST.findByIdAndDelete(id);
  },

  async fileReturn(id: string, userId: string) {
    return GST.findByIdAndUpdate(
      id,
      {
        status: 'Filed',
        filingDate: new Date(),
        updatedBy: userId
      },
      { new: true }
    );
  },

  async verifyGST(id: string, verifiedBy: string) {
    return GST.findByIdAndUpdate(
      id,
      {
        verifiedBy,
        verifiedDate: new Date()
      },
      { new: true }
    );
  },

  async processPayment(id: string, paymentDetails: any, userId: string) {
    return GST.findByIdAndUpdate(
      id,
      {
        paymentStatus: 'Paid',
        paymentDate: new Date(),
        paymentReference: paymentDetails.paymentReference,
        challanNumber: paymentDetails.challanNumber,
        bankName: paymentDetails.bankName,
        updatedBy: userId
      },
      { new: true }
    );
  },

  async getStats(filters: any = {}) {
    const {
      month = new Date().getMonth() + 1,
      year = new Date().getFullYear()
    } = filters;

    const matchStage = { month, year };

    const stats = await GST.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTaxableAmount: { $sum: "$taxableAmount" },
          totalGSTAmount: { $sum: "$gstAmount" },
          totalAmount: { $sum: "$totalAmount" },
          totalPenalty: { $sum: "$penaltyAmount" },
          totalInterest: { $sum: "$interestAmount" },
          totalRecords: { $sum: 1 },
          filedReturns: {
            $sum: { $cond: [{ $eq: ["$status", "Filed"] }, 1, 0] }
          },
          pendingReturns: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          draftReturns: {
            $sum: { $cond: [{ $eq: ["$status", "Draft"] }, 1, 0] }
          },
          paidAmount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$gstAmount", 0] }
          },
          unpaidAmount: {
            $sum: { $cond: [{ $ne: ["$paymentStatus", "Paid"] }, "$gstAmount", 0] }
          }
        }
      }
    ]);

    // GST type breakdown
    const gstTypeStats = await GST.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$gstType",
          totalTaxableAmount: { $sum: "$taxableAmount" },
          totalGSTAmount: { $sum: "$gstAmount" },
          count: { $sum: 1 },
          avgRate: { $avg: "$gstRate" }
        }
      },
      { $sort: { totalGSTAmount: -1 } }
    ]);

    // Return type breakdown
    const returnTypeStats = await GST.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$returnType",
          totalGSTAmount: { $sum: "$gstAmount" },
          count: { $sum: 1 },
          filedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Filed"] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          }
        }
      }
    ]);

    // Overdue GST payments
    const overdueGST = await GST.find({
      paymentStatus: { $ne: 'Paid' },
      dueDate: { $lt: new Date() }
    })
      .sort('dueDate')
      .limit(10)
      .lean();

    // Monthly trend (last 12 months)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);

    const monthlyTrend = await GST.aggregate([
      {
        $match: {
          $or: [
            { year: { $gt: startDate.getFullYear() } },
            {
              year: startDate.getFullYear(),
              month: { $gte: startDate.getMonth() + 1 }
            }
          ]
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalGSTAmount: { $sum: "$gstAmount" },
          totalTaxableAmount: { $sum: "$taxableAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const result = stats[0] || {
      totalTaxableAmount: 0,
      totalGSTAmount: 0,
      totalAmount: 0,
      totalPenalty: 0,
      totalInterest: 0,
      totalRecords: 0,
      filedReturns: 0,
      pendingReturns: 0,
      draftReturns: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };

    return {
      ...result,
      gstTypeBreakdown: gstTypeStats,
      returnTypeBreakdown: returnTypeStats,
      overdueGST,
      monthlyTrend,
      complianceRate: result.totalRecords > 0 ? (result.filedReturns / result.totalRecords) * 100 : 0,
      collectionRate: result.totalGSTAmount > 0 ? (result.paidAmount / result.totalGSTAmount) * 100 : 0
    };
  },

  async getGSTSummary(gstNumber: string, month: number, year: number) {
    const matchStage = { gstNumber, month, year };

    const summary = await GST.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$transactionType",
          totalTaxableAmount: { $sum: "$taxableAmount" },
          totalGSTAmount: { $sum: "$gstAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const salesData = summary.find(item => item._id === 'Sales') || {};
    const purchaseData = summary.find(item => item._id === 'Purchase') || {};

    return {
      sales: {
        taxableAmount: salesData.totalTaxableAmount || 0,
        gstAmount: salesData.totalGSTAmount || 0,
        count: salesData.count || 0
      },
      purchases: {
        taxableAmount: purchaseData.totalTaxableAmount || 0,
        gstAmount: purchaseData.totalGSTAmount || 0,
        count: purchaseData.count || 0
      },
      netGSTPayable: (salesData.totalGSTAmount || 0) - (purchaseData.totalGSTAmount || 0)
    };
  },

  async addAmendment(gstId: string, amendment: any, userId: string) {
    return GST.findByIdAndUpdate(
      gstId,
      {
        $push: {
          amendments: {
            ...amendment,
            amendmentDate: new Date(),
            amendedBy: userId
          }
        },
        updatedBy: userId
      },
      { new: true }
    );
  },

  async getDueDateReminders() {
    const upcomingDueDate = new Date();
    upcomingDueDate.setDate(upcomingDueDate.getDate() + 7); // 7 days ahead

    return GST.find({
      paymentStatus: { $ne: 'Paid' },
      dueDate: { $lte: upcomingDueDate },
      status: { $ne: 'Cancelled' }
    })
      .sort('dueDate')
      .lean();
  }
};