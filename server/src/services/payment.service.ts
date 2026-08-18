import { Payment } from "../models/payment.model";

export const PaymentService = {
  async create(data: any, userId: string) {
    return Payment.create({
      ...data,
      createdBy: userId
    });
  },

  async list(filters: any = {}) {
    const {
      status,
      paymentMethod,
      serviceType,
      patientId,
      hospitalId,
      doctorId,
      dateFrom,
      dateTo,
      dueDateFrom,
      dueDateTo,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = filters;

    const query: any = {};

    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (serviceType) query.serviceType = serviceType;
    if (patientId) query.patientId = patientId;
    if (hospitalId) query.hospitalId = hospitalId;
    if (doctorId) query.doctorId = doctorId;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;
    
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('patientId', 'name phone')
        .populate('hospitalId', 'name')
        .populate('doctorId', 'name')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query)
    ]);

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getById(id: string) {
    return Payment.findById(id)
      .populate('patientId', 'name phone email')
      .populate('hospitalId', 'name address')
      .populate('doctorId', 'name specialization')
      .populate('createdBy', 'name email')
      .lean();
  },

  async update(id: string, data: any, userId: string) {
    return Payment.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    );
  },

  async delete(id: string) {
    return Payment.findByIdAndDelete(id);
  },

  async updatePayment(id: string, paidAmount: number, paymentMethod: string, userId: string) {
    const payment = await Payment.findById(id);
    if (!payment) throw new Error('Payment not found');

    payment.paidAmount = (payment.paidAmount || 0) + paidAmount;
    payment.paymentMethod = paymentMethod as any;
    payment.updatedBy = userId as any;

    return payment.save();
  },

  async getStats(filters: any = {}) {
    const {
      dateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dateTo = new Date()
    } = filters;

    const matchStage = {
      createdAt: { $gte: dateFrom, $lte: dateTo }
    };

    const stats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          totalPending: { $sum: "$pendingAmount" },
          totalPayments: { $sum: 1 },
          completedPayments: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
          },
          overduePayments: {
            $sum: { $cond: [{ $eq: ["$status", "Overdue"] }, 1, 0] }
          },
          partialPayments: {
            $sum: { $cond: [{ $eq: ["$status", "Partial"] }, 1, 0] }
          }
        }
      }
    ]);

    // Service type breakdown
    const serviceTypeStats = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$serviceType",
          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Payment method breakdown
    const paymentMethodStats = await Payment.aggregate([
      { $match: { ...matchStage, status: "Completed" } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$paidAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Overdue payments
    const overduePayments = await Payment.find({
      status: { $in: ["Pending", "Partial", "Overdue"] },
      dueDate: { $lt: new Date() }
    })
      .populate('patientId', 'name phone')
      .sort('dueDate')
      .limit(10)
      .lean();

    const result = stats[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalPayments: 0,
      completedPayments: 0,
      pendingPayments: 0,
      overduePayments: 0,
      partialPayments: 0
    };

    return {
      ...result,
      collectionRate: result.totalAmount > 0 ? (result.totalPaid / result.totalAmount) * 100 : 0,
      serviceTypeBreakdown: serviceTypeStats,
      paymentMethodBreakdown: paymentMethodStats,
      overdueList: overduePayments
    };
  },

  async getPatientPayments(patientId: string) {
    return Payment.find({ patientId })
      .populate('hospitalId', 'name')
      .populate('doctorId', 'name')
      .sort('-createdAt')
      .lean();
  },

  async getOverduePayments() {
    return Payment.find({
      status: { $in: ["Pending", "Partial", "Overdue"] },
      dueDate: { $lt: new Date() }
    })
      .populate('patientId', 'name phone')
      .populate('hospitalId', 'name')
      .sort('dueDate')
      .lean();
  }
};