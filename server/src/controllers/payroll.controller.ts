import { Request, Response, NextFunction } from "express";
import { PayrollService } from "../services/payroll.service";

export const PayrollController = {
  async processPayroll(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, department } = req.body;
      
      if (!month || !year) {
        return res.status(400).json({ 
          message: "Month and year are required" 
        });
      }

      const result = await PayrollService.processPayroll({
        month,
        year,
        department
      });

      res.json({
        message: "Payroll processed successfully",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  async getPayrollStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PayrollService.getPayrollStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const payrolls = await PayrollService.list(req.query);
      res.json(payrolls);
    } catch (err) {
      next(err);
    }
  }
};