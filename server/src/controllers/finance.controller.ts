import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { PaymentService } from "../services/payment.service";
import { SalaryService } from "../services/salary.service";
import { GSTService } from "../services/gst.service";
import { FinanceService } from "../services/finance.service";
import { generateMockSalaries } from "../utils/mock-data";

export const FinanceController = {
  // Comprehensive Finance Stats
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await FinanceService.getComprehensiveStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await FinanceService.getDashboardMetrics();
      res.json(dashboard);
    } catch (err) {
      next(err);
    }
  },

  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const trends = await FinanceService.getFinancialTrends(months);
      res.json(trends);
    } catch (err) {
      next(err);
    }
  },

  async getTopPerformers(req: Request, res: Response, next: NextFunction) {
    try {
      const performers = await FinanceService.getTopPerformers();
      res.json(performers);
    } catch (err) {
      next(err);
    }
  },

  async getUpcomingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const upcoming = await FinanceService.getUpcomingPayments();
      res.json(upcoming);
    } catch (err) {
      next(err);
    }
  },

  // Transactions
  async createTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const transaction = await TransactionService.create(req.body, userId);
      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  },

  async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await TransactionService.list(req.query);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  },

  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.getById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  },

  async updateTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const transaction = await TransactionService.update(req.params.id, req.body, userId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  },

  async deleteTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await TransactionService.delete(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ message: "Transaction deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async getTransactionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await TransactionService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  // Payments
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payment = await PaymentService.create(req.body, userId);
      res.status(201).json(payment);
    } catch (err) {
      next(err);
    }
  },

  async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await PaymentService.list(req.query);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  },

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentService.getById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (err) {
      next(err);
    }
  },

  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const payment = await PaymentService.update(req.params.id, req.body, userId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (err) {
      next(err);
    }
  },

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { paidAmount, paymentMethod } = req.body;
      const payment = await PaymentService.updatePayment(req.params.id, paidAmount, paymentMethod, userId);
      res.json(payment);
    } catch (err) {
      next(err);
    }
  },

  async getPaymentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PaymentService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  // Salaries
  async createSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const salary = await SalaryService.create(req.body, userId);
      res.status(201).json(salary);
    } catch (err) {
      next(err);
    }
  },

  async listSalaries(req: Request, res: Response, next: NextFunction) {
    try {
      const salaries = await SalaryService.list(req.query);
      res.json(salaries);
    } catch (err) {
      console.error("Database error, using mock data:", err);
      // Fallback to mock data when database is unavailable
      const mockData = generateMockSalaries();
      res.json(mockData);
    }
  },

  async getSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const salary = await SalaryService.getById(req.params.id);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json(salary);
    } catch (err) {
      next(err);
    }
  },

  async updateSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const salary = await SalaryService.update(req.params.id, req.body, userId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json(salary);
    } catch (err) {
      next(err);
    }
  },

  async approveSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const salary = await SalaryService.approveSalary(req.params.id, userId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json(salary);
    } catch (err) {
      next(err);
    }
  },

  async processSalaryPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const salary = await SalaryService.processSalaryPayment(req.params.id, req.body, userId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json(salary);
    } catch (err) {
      next(err);
    }
  },

  async deleteSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const salary = await SalaryService.delete(req.params.id);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json({ message: "Salary record deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async getSalaryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SalaryService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async syncEmployeeSalaries(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { month, year } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ 
          message: "Month and year are required" 
        });
      }

      const results = await SalaryService.syncEmployeeSalaries(month, year, userId);
      res.json({
        message: "Employee salaries synced successfully",
        ...results
      });
    } catch (err) {
      next(err);
    }
  },

  async updateSalaryPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { status, partiallyPaidAmount } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Payment status is required" });
      }

      const salary = await SalaryService.updatePaymentStatus(
        req.params.id,
        status,
        partiallyPaidAmount,
        userId
      );

      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }

      res.json({
        message: "Payment status updated successfully",
        data: salary
      });
    } catch (err) {
      next(err);
    }
  },

  // GST
  async createGST(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const gst = await GSTService.create(req.body, userId);
      res.status(201).json(gst);
    } catch (err) {
      next(err);
    }
  },

  async listGST(req: Request, res: Response, next: NextFunction) {
    try {
      const gstRecords = await GSTService.list(req.query);
      res.json(gstRecords);
    } catch (err) {
      next(err);
    }
  },

  async getGST(req: Request, res: Response, next: NextFunction) {
    try {
      const gst = await GSTService.getById(req.params.id);
      if (!gst) {
        return res.status(404).json({ message: "GST record not found" });
      }
      res.json(gst);
    } catch (err) {
      next(err);
    }
  },

  async updateGST(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const gst = await GSTService.update(req.params.id, req.body, userId);
      if (!gst) {
        return res.status(404).json({ message: "GST record not found" });
      }
      res.json(gst);
    } catch (err) {
      next(err);
    }
  },

  async fileGSTReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const gst = await GSTService.fileReturn(req.params.id, userId);
      if (!gst) {
        return res.status(404).json({ message: "GST record not found" });
      }
      res.json(gst);
    } catch (err) {
      next(err);
    }
  },

  async processGSTPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const gst = await GSTService.processPayment(req.params.id, req.body, userId);
      if (!gst) {
        return res.status(404).json({ message: "GST record not found" });
      }
      res.json(gst);
    } catch (err) {
      next(err);
    }
  },

  async getGSTStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await GSTService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
};