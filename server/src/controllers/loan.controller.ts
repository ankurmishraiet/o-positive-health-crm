import { Request, Response, NextFunction } from "express";
import { LoanService } from "../services/loan.service";

export const LoanController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const loan = await LoanService.create(req.body);
      res.status(201).json(loan);
    } catch (err: any) {
      // Handle mongoose validation errors
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({ 
          message: errors.join(', '),
          errors: err.errors
        });
      }
      
      // Handle permission errors
      if (err.message && err.message.includes('permission')) {
        return res.status(403).json({
          message: "You don't have permission to perform this action. Please contact Admin.",
          error: "PERMISSION_DENIED"
        });
      }
      
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const loans = await LoanService.list(filters);
      res.json(loans);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const loan = await LoanService.getById(req.params.id);
      if (!loan) return res.status(404).json({ message: "Loan not found" });
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const loan = await LoanService.updateLoan(req.params.id, req.body);
      if (!loan) return res.status(404).json({ message: "Loan not found" });
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const loan = await LoanService.deleteLoan(req.params.id);
      if (!loan) return res.status(404).json({ message: "Loan not found" });
      res.json({ message: "Loan deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await LoanService.updateStatus(
        req.params.id,
        req.body.status
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async uploadDisbursal(req: Request, res: Response, next: NextFunction) {
    try {
      const fileUrl = (req as any).file?.path;
      const updated = await LoanService.uploadDisbursalLetter(
        req.params.id,
        fileUrl
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async getPendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const pendingPayments = await LoanService.getPendingPayments();
      res.json(pendingPayments);
    } catch (err) {
      next(err);
    }
  },

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId, emiNumber } = req.params;
      const loan = await LoanService.processPayment(loanId, emiNumber, req.body);
      res.json(loan);
    } catch (err) {
      next(err);
    }
  },

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await LoanService.getLoanStatistics();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
