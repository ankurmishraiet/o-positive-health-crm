import { Request, Response, NextFunction } from "express";
import { SalaryService } from "../services/salary.service";

export const SalaryController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const salary = await SalaryService.create(req.body, userId);
      res.status(201).json(salary);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SalaryService.list(req.query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const salary = await SalaryService.update(req.params.id, req.body, userId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json(salary);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
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

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await SalaryService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async approveSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const salary = await SalaryService.approveSalary(req.params.id, userId);
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json({
        message: "Salary approved successfully",
        data: salary
      });
    } catch (err) {
      next(err);
    }
  },

  async processSalaryPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const salary = await SalaryService.processSalaryPayment(
        req.params.id,
        req.body,
        userId
      );
      if (!salary) {
        return res.status(404).json({ message: "Salary record not found" });
      }
      res.json({
        message: "Salary payment processed successfully",
        data: salary
      });
    } catch (err) {
      next(err);
    }
  },

  async getEmployeeSalaryHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const salaries = await SalaryService.getEmployeeSalaryHistory(req.params.employeeId);
      res.json(salaries);
    } catch (err) {
      next(err);
    }
  },

  async generatePayslip(req: Request, res: Response, next: NextFunction) {
    try {
      const payslip = await SalaryService.generatePayslip(req.params.id);
      res.json(payslip);
    } catch (err) {
      next(err);
    }
  },

  async bulkCreateSalaries(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const salaries = await SalaryService.bulkCreateSalaries(req.body.salaries, userId);
      res.status(201).json({
        message: "Salaries created successfully",
        count: salaries.length,
        data: salaries
      });
    } catch (err) {
      next(err);
    }
  },

  async getSalaryComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 6;
      const comparison = await SalaryService.getSalaryComparison(
        req.params.employeeId,
        months
      );
      res.json(comparison);
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

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
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
  }
};
