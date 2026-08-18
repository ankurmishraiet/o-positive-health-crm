import { TransactionService } from "./transaction.service";
import { PaymentService } from "./payment.service";
import { SalaryService } from "./salary.service";
import { GSTService } from "./gst.service";
import { InvoiceService } from "./invoice.service";

export const FinanceService = {
  async getComprehensiveStats(filters: any = {}) {
    const {
      dateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dateTo = new Date()
    } = filters;

    // Get stats from all finance modules
    const [
      transactionStats,
      paymentStats,
      salaryStats,
      gstStats,
      invoiceStats
    ] = await Promise.all([
      TransactionService.getStats({ dateFrom, dateTo }),
      PaymentService.getStats({ dateFrom, dateTo }),
      SalaryService.getStats(),
      GSTService.getStats(),
      InvoiceService.getStats({ dateFrom, dateTo })
    ]);

    // Calculate overall financial health
    const totalRevenue = transactionStats.totalCredits + paymentStats.totalPaid + invoiceStats.incomeAmount;
    const totalExpenses = transactionStats.totalDebits + salaryStats.totalNetSalary + gstStats.totalGSTAmount + invoiceStats.expenseAmount;
    const netProfit = totalRevenue - totalExpenses;

    // Cash flow analysis
    const cashInflow = transactionStats.totalCredits + paymentStats.totalPaid;
    const cashOutflow = transactionStats.totalDebits + salaryStats.totalNetSalary;
    const netCashFlow = cashInflow - cashOutflow;

    // Pending amounts
    const totalPendingPayments = paymentStats.totalPending + invoiceStats.totalPending;
    const totalOverdue = paymentStats.overdueList.length + invoiceStats.overdueList.length;

    return {
      // Overall Summary
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        netCashFlow,
        totalPendingPayments,
        totalOverdue,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      },

      // Module-wise breakdown
      modules: {
        transactions: {
          totalCredits: transactionStats.totalCredits,
          totalDebits: transactionStats.totalDebits,
          netAmount: transactionStats.netAmount,
          transactionCount: transactionStats.totalTransactions
        },
        payments: {
          totalAmount: paymentStats.totalAmount,
          totalPaid: paymentStats.totalPaid,
          totalPending: paymentStats.totalPending,
          collectionRate: paymentStats.collectionRate,
          overdueCount: paymentStats.overduePayments
        },
        salaries: {
          totalGrossSalary: salaryStats.totalGrossSalary,
          totalNetSalary: salaryStats.totalNetSalary,
          totalDeductions: salaryStats.totalDeductions,
          employeeCount: salaryStats.totalEmployees,
          pendingPayments: salaryStats.pendingSalaries
        },
        gst: {
          totalTaxableAmount: gstStats.totalTaxableAmount,
          totalGSTAmount: gstStats.totalGSTAmount,
          totalPayable: gstStats.totalAmount,
          complianceRate: gstStats.complianceRate,
          pendingReturns: gstStats.pendingReturns
        },
        invoices: {
          totalAmount: invoiceStats.totalAmount,
          totalPaid: invoiceStats.totalPaid,
          totalPending: invoiceStats.totalPending,
          collectionRate: invoiceStats.collectionRate,
          overdueCount: invoiceStats.overdueInvoices
        }
      },

      // Detailed breakdowns
      categoryBreakdown: transactionStats.categoryBreakdown,
      serviceTypeBreakdown: paymentStats.serviceTypeBreakdown,
      departmentBreakdown: salaryStats.departmentBreakdown,
      entityTypeBreakdown: invoiceStats.entityTypeBreakdown,

      // Recent activities
      recentTransactions: transactionStats.recentTransactions,
      overduePayments: paymentStats.overdueList.slice(0, 5),
      overdueInvoices: invoiceStats.overdueList.slice(0, 5),

      // Compliance and alerts
      compliance: {
        gstCompliance: gstStats.complianceRate,
        paymentCompliance: paymentStats.collectionRate,
        invoiceCompliance: invoiceStats.collectionRate,
        salaryCompliance: salaryStats.paidSalaries / (salaryStats.totalEmployees || 1) * 100
      },

      // Key Performance Indicators
      kpis: {
        avgTransactionAmount: transactionStats.totalTransactions > 0 ? 
          (transactionStats.totalCredits + transactionStats.totalDebits) / transactionStats.totalTransactions : 0,
        avgPaymentAmount: paymentStats.totalPayments > 0 ? 
          paymentStats.totalAmount / paymentStats.totalPayments : 0,
        avgSalary: salaryStats.totalEmployees > 0 ? 
          salaryStats.totalNetSalary / salaryStats.totalEmployees : 0,
        gstEffectiveRate: gstStats.totalTaxableAmount > 0 ? 
          (gstStats.totalGSTAmount / gstStats.totalTaxableAmount) * 100 : 0
      }
    };
  },

  async getDashboardMetrics() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Current month vs last month comparison
    const [currentMonthStats, lastMonthStats] = await Promise.all([
      this.getComprehensiveStats({ dateFrom: thisMonth, dateTo: today }),
      this.getComprehensiveStats({ dateFrom: lastMonth, dateTo: lastMonthEnd })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      currentMonth: currentMonthStats,
      lastMonth: lastMonthStats,
      growth: {
        revenue: calculateGrowth(
          currentMonthStats.summary.totalRevenue,
          lastMonthStats.summary.totalRevenue
        ),
        expenses: calculateGrowth(
          currentMonthStats.summary.totalExpenses,
          lastMonthStats.summary.totalExpenses
        ),
        profit: calculateGrowth(
          currentMonthStats.summary.netProfit,
          lastMonthStats.summary.netProfit
        ),
        cashFlow: calculateGrowth(
          currentMonthStats.summary.netCashFlow,
          lastMonthStats.summary.netCashFlow
        )
      }
    };
  },

  async getFinancialTrends(months: number = 12) {
    const trends = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);

      const monthStats = await this.getComprehensiveStats({
        dateFrom: startDate,
        dateTo: endDate
      });

      trends.push({
        month: startDate.toISOString().substring(0, 7), // YYYY-MM format
        revenue: monthStats.summary.totalRevenue,
        expenses: monthStats.summary.totalExpenses,
        profit: monthStats.summary.netProfit,
        cashFlow: monthStats.summary.netCashFlow
      });
    }

    return trends;
  },

  async getTopPerformers() {
    // This would aggregate top performing entities across different categories
    const [
      topPayingPatients,
      topRevenueDoctors,
      topRevenueHospitals
    ] = await Promise.all([
      PaymentService.list({ 
        status: 'Completed', 
        limit: 5, 
        sort: '-paidAmount' 
      }),
      InvoiceService.list({ 
        entityType: 'Doctor', 
        category: 'Income',
        limit: 5, 
        sort: '-totalAmount' 
      }),
      InvoiceService.list({ 
        entityType: 'Hospital', 
        category: 'Income',
        limit: 5, 
        sort: '-totalAmount' 
      })
    ]);

    return {
      topPayingPatients: topPayingPatients.payments,
      topRevenueDoctors: topRevenueDoctors.invoices,
      topRevenueHospitals: topRevenueHospitals.invoices
    };
  },

  async getUpcomingPayments() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const [upcomingPayments, upcomingInvoices, upcomingGST] = await Promise.all([
      PaymentService.list({
        status: ['Pending', 'Partial'],
        dueDateFrom: today,
        dueDateTo: nextWeek,
        sort: 'dueDate'
      }),
      InvoiceService.list({
        paymentStatus: ['Unpaid', 'Partially Paid'],
        dueDateFrom: today,
        dueDateTo: nextWeek,
        sort: 'dueDate'
      }),
      GSTService.list({
        paymentStatus: ['Unpaid', 'Partially Paid'],
        dueDateFrom: today,
        dueDateTo: nextWeek,
        sort: 'dueDate'
      })
    ]);

    return {
      payments: upcomingPayments.payments,
      invoices: upcomingInvoices.invoices,
      gstPayments: upcomingGST.gstRecords
    };
  },

  async exportFinanceReport(filters: any = {}) {
    const stats = await this.getComprehensiveStats(filters);
    
    // This would generate a comprehensive finance report
    // For now, return the stats data
    return {
      generatedAt: new Date(),
      period: filters,
      data: stats
    };
  }
};