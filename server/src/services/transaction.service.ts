import { Transaction } from "../models/transaction.model";

export const TransactionService = {
  async create(data: any, userId: string) {
    return Transaction.create({
      ...data,
      createdBy: userId,
      netAmount: data.amount // Set netAmount same as amount initially
    });
  },

  async list(filters: any = {}) {
    const {
      type,
      category,
      status,
      dateFrom,
      dateTo,
      entityType,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = filters;

    const query: any = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (entityType) query.entityType = entityType;
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { paymentMethod: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('entityId')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query)
    ]);

    return {
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getById(id: string) {
    return Transaction.findById(id)
      .populate('entityId')
      .populate('createdBy', 'name email')
      .lean();
  },

  async update(id: string, data: any, userId: string) {
    return Transaction.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    );
  },

  async delete(id: string) {
    return Transaction.findByIdAndDelete(id);
  },

  async getStats(filters: any = {}) {
    const {
      dateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dateTo = new Date()
    } = filters;

    const matchStage = {
      date: { $gte: dateFrom, $lte: dateTo }
    };

    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCredits: {
            $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] }
          },
          totalDebits: {
            $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] }
          },
          totalTransactions: { $sum: 1 },
          creditCount: {
            $sum: { $cond: [{ $eq: ["$type", "Credit"] }, 1, 0] }
          },
          debitCount: {
            $sum: { $cond: [{ $eq: ["$type", "Debit"] }, 1, 0] }
          }
        }
      }
    ]);

    // Category-wise breakdown
    const categoryStats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          credits: {
            $sum: { $cond: [{ $eq: ["$_id.type", "Credit"] }, "$amount", 0] }
          },
          debits: {
            $sum: { $cond: [{ $eq: ["$_id.type", "Debit"] }, "$amount", 0] }
          },
          total: { $sum: "$amount" },
          count: { $sum: "$count" }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find(matchStage)
      .populate('createdBy', 'name')
      .sort('-createdAt')
      .limit(5)
      .lean();

    const result = stats[0] || {
      totalCredits: 0,
      totalDebits: 0,
      totalTransactions: 0,
      creditCount: 0,
      debitCount: 0
    };

    return {
      ...result,
      netAmount: result.totalCredits - result.totalDebits,
      categoryBreakdown: categoryStats,
      recentTransactions
    };
  },

  async getDailyStats(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return Transaction.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          credits: {
            $sum: { $cond: [{ $eq: ["$type", "Credit"] }, "$amount", 0] }
          },
          debits: {
            $sum: { $cond: [{ $eq: ["$type", "Debit"] }, "$amount", 0] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);
  }
};