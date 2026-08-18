import { Salary } from "../models/salary.model";
import { Incentive } from "../models/incentive.model";

export const SalaryService = {
  async create(data: any, userId: string) {
    return Salary.create({
      ...data,
      createdBy: userId,
    });
  },

  async list(filters: any = {}) {
    const {
      employeeId,
      department,
      paymentStatus,
      month,
      year,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = filters;

    const query: any = {};

    if (employeeId) query.employeeId = employeeId;
    if (department) query.department = department;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (month) query.month = month;
    if (year) query.year = year;

    const skip = (page - 1) * limit;

    const [salariesData, total] = await Promise.all([
      Salary.find(query)
        .populate("employeeId", "name employeeCode department designation")
        .populate("createdBy", "name email")
        .populate("approvedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Salary.countDocuments(query),
    ]);

    // Transform data to match frontend expectations
    const salaries = await Promise.all(
      salariesData.map(async (salary: any) => {
        // Get related incentives for this employee and month/year
        const incentives = await Incentive.find({
          employeeId: salary.employeeId,
          month: salary.month,
          year: salary.year,
          paymentStatus: { $in: ["Paid", "Processing"] },
        }).lean();

        const totalIncentiveAmount = incentives.reduce(
          (sum, inc) => sum + (inc.amount || 0),
          0
        );

        return {
          id: salary.salaryId,
          employeeName: salary.employeeName || salary.employeeId?.name || "",
          employeeId:
            salary.employeeCode || salary.employeeId?.employeeCode || "",
          designation:
            salary.designation || salary.employeeId?.designation || "",
          department: salary.department || salary.employeeId?.department || "",
          baseSalary: salary.basicSalary || 0,
          incentives: salary.totalIncentives || totalIncentiveAmount || 0,
          deductions: salary.totalDeductions || 0,
          netSalary: salary.netSalary || 0,
          month: `${salary.salaryPeriod || "N/A"}`,
          status: salary.paymentStatus || "Pending",
          paymentDate: salary.paymentDate || null,
          // Include additional fields for detailed view
          grossSalary: salary.grossSalary || 0,
          allowances: salary.totalAllowances || 0,
          workingDays: salary.workingDays || 0,
          presentDays: salary.presentDays || 0,
          overtimeHours: salary.overtimeHours || 0,
          overtimeAmount: salary.overtimeAmount || 0,
          leavesTaken: salary.leavesTaken || 0,
          leaveDeduction: salary.leaveDeduction || 0,
          paymentMethod: salary.paymentMethod || "",
          attendancePercentage: salary.attendancePercentage || 0,
          relatedIncentives: incentives,
          createdAt: salary.createdAt,
          updatedAt: salary.updatedAt,
        };
      })
    );

    return {
      salaries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getById(id: string) {
    return Salary.findById(id)
      .populate("employeeId", "name employeeCode department designation")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .lean();
  },

  async update(id: string, data: any, userId: string) {
    return Salary.findByIdAndUpdate(
      id,
      { ...data, updatedBy: userId },
      { new: true, runValidators: true }
    );
  },

  async delete(id: string) {
    return Salary.findByIdAndDelete(id);
  },

  async approveSalary(id: string, approvedBy: string) {
    return Salary.findByIdAndUpdate(
      id,
      {
        paymentStatus: "Processing",
        approvedBy,
        approvedDate: new Date(),
      },
      { new: true }
    );
  },

  async processSalaryPayment(id: string, paymentDetails: any, userId: string) {
    return Salary.findByIdAndUpdate(
      id,
      {
        paymentStatus: "Paid",
        paymentDate: new Date(),
        paymentMethod: paymentDetails.paymentMethod,
        bankDetails: paymentDetails.bankDetails,
        updatedBy: userId,
      },
      { new: true }
    );
  },

  async getStats(filters: any = {}) {
    const {
      month = new Date().getMonth() + 1,
      year = new Date().getFullYear(),
    } = filters;

    const matchStage = { month, year };

    const stats = await Salary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalGrossSalary: { $sum: "$grossSalary" },
          totalNetSalary: { $sum: "$netSalary" },
          totalDeductions: { $sum: "$totalDeductions" },
          totalAllowances: { $sum: "$totalAllowances" },
          totalIncentives: { $sum: "$totalIncentives" },
          totalEmployees: { $sum: 1 },
          paidSalaries: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
          },
          pendingSalaries: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Pending"] }, 1, 0] },
          },
          processingSalaries: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Processing"] }, 1, 0] },
          },
        },
      },
    ]);

    // Department-wise breakdown
    const departmentStats = await Salary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$department",
          totalGrossSalary: { $sum: "$grossSalary" },
          totalNetSalary: { $sum: "$netSalary" },
          employeeCount: { $sum: 1 },
          avgSalary: { $avg: "$netSalary" },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalNetSalary: -1 } },
    ]);

    // Payment status breakdown
    const statusStats = await Salary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 },
          totalAmount: { $sum: "$netSalary" },
        },
      },
    ]);

    // Incentive analysis
    const incentiveStats = await Salary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalPerformanceIncentive: { $sum: "$incentives.performance" },
          totalTargetIncentive: { $sum: "$incentives.target" },
          totalBonus: { $sum: "$incentives.bonus" },
          totalCommission: { $sum: "$incentives.commission" },
          avgIncentivePerEmployee: { $avg: "$totalIncentives" },
        },
      },
    ]);

    const result = stats[0] || {
      totalGrossSalary: 0,
      totalNetSalary: 0,
      totalDeductions: 0,
      totalAllowances: 0,
      totalIncentives: 0,
      totalEmployees: 0,
      paidSalaries: 0,
      pendingSalaries: 0,
      processingSalaries: 0,
    };

    return {
      ...result,
      departmentBreakdown: departmentStats,
      statusBreakdown: statusStats,
      incentiveBreakdown: incentiveStats[0] || {},
    };
  },

  async getEmployeeSalaryHistory(employeeId: string) {
    return Salary.find({ employeeId }).sort({ year: -1, month: -1 }).lean();
  },

  async generatePayslip(salaryId: string) {
    const salary = await this.getById(salaryId);
    if (!salary) throw new Error("Salary record not found");

    // Here you would generate PDF payslip
    // For now, return the salary data
    return salary;
  },

  async bulkCreateSalaries(salariesData: any[], userId: string) {
    const salaries = salariesData.map((data) => ({
      ...data,
      createdBy: userId,
    }));

    return Salary.insertMany(salaries);
  },

  async getSalaryComparison(employeeId: string, months: number = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return Salary.find({
      employeeId,
      $or: [
        { year: { $gt: startDate.getFullYear() } },
        {
          year: startDate.getFullYear(),
          month: { $gte: startDate.getMonth() + 1 },
        },
      ],
    })
      .sort({ year: 1, month: 1 })
      .lean();
  },

  async syncEmployeeSalaries(month: number, year: number, userId: string) {
    // Import Employee model
    const { Employee } = await import("../models/employee.model");

    // Get all active employees
    const employees = await Employee.find({ status: "Active" }).lean();

    const results = {
      created: 0,
      existing: 0,
      errors: [] as any[],
    };

    for (const employee of employees) {
      try {
        // Check if salary record exists for this employee, month, and year
        const existingSalary = await Salary.findOne({
          employeeId: employee._id,
          month,
          year,
        });

        if (existingSalary) {
          results.existing++;
          continue;
        }

        // Create new salary record based on employee data
        const basicSalary: any = employee.salary || 0;
        const workingDays = new Date(year, month, 0).getDate(); // Days in month

        // Calculate allowances (using standard percentages)
        const hra = Math.round(basicSalary * 0.4); // 40% HRA
        const da = Math.round(basicSalary * 0.1); // 10% DA
        const conveyance = 1600; // Standard conveyance
        const medical = 1250; // Standard medical

        // Calculate deductions
        const pf = Math.round(basicSalary * 0.12); // 12% PF
        const esi = basicSalary <= 21000 ? Math.round(basicSalary * 0.0075) : 0; // 0.75% ESI if salary <= 21000

        // Calculate totals
        const totalAllowances = hra + da + conveyance + medical;
        const totalIncentives = 0;
        const totalDeductions = pf + esi;
        const grossSalary = basicSalary + totalAllowances + totalIncentives;
        const netSalary = grossSalary - totalDeductions;

        await Salary.create({
          employeeId: employee._id,
          employeeName: employee.name,
          employeeCode:
            employee.employeeId || `EMP-${employee._id.toString().slice(-6)}`,
          department: employee.department || "General",
          designation: employee.designation || "Staff",
          month,
          year,
          basicSalary,
          allowances: {
            hra,
            da,
            conveyance,
            medical,
            other: 0,
          },
          incentives: {
            performance: 0,
            target: 0,
            bonus: 0,
            commission: 0,
            other: 0,
          },
          deductions: {
            pf,
            esi,
            tds: 0,
            insurance: 0,
            loan: 0,
            advance: 0,
            other: 0,
          },
          totalAllowances,
          totalIncentives,
          totalDeductions,
          grossSalary,
          netSalary,
          workingDays,
          presentDays: workingDays, // Default to full attendance
          overtimeHours: 0,
          overtimeRate: 0,
          overtimeAmount: 0,
          leavesTaken: 0,
          leaveDeduction: 0,
          paymentStatus: "Pending",
          paymentMethod: "Bank Transfer",
          createdBy: userId,
        });

        results.created++;
      } catch (error) {
        console.error(
          `Error creating salary for employee ${employee._id}:`,
          error
        );
        results.errors.push({
          employeeId: employee._id,
          employeeName: employee.name,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },

  async updatePaymentStatus(
    id: string,
    status: string,
    partiallyPaidAmount?: number,
    userId?: string
  ) {
    const updateData: any = {
      paymentStatus: status,
      updatedBy: userId,
    };

    if (status === "Paid") {
      updateData.paymentDate = new Date();
    }

    if (status === "Partially Paid" && partiallyPaidAmount !== undefined) {
      updateData.partiallyPaidAmount = partiallyPaidAmount;
    }

    if (status === "Unpaid") {
      updateData.paymentDate = null;
      updateData.partiallyPaidAmount = 0;
    }

    return Salary.findByIdAndUpdate(id, updateData, { new: true });
  },
};
