import { Request, Response, NextFunction } from "express";
import { ReimbursementService } from "../services/reimbursement.service";

export const ReimbursementController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate required fields
      const { employeeName, employeeId, category, amount, description } = req.body;
      
      if (!employeeName || !category || !amount || !description) {
        return res.status(400).json({
          message: "Missing required fields: employeeName, category, amount, and description are required"
        });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          message: "Amount must be a valid positive number"
        });
      }

      const reimbursement = await ReimbursementService.create(req.body);
      res.status(201).json({
        message: "Reimbursement request submitted successfully",
        data: reimbursement
      });
    } catch (err: any) {
      console.error("Error creating reimbursement:", err);
      res.status(500).json({
        message: err.message || "Failed to submit reimbursement request"
      });
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursements = await ReimbursementService.list(req.query);
      res.json(reimbursements);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursement = await ReimbursementService.getById(req.params.id);
      if (!reimbursement) {
        return res.status(404).json({ message: "Reimbursement not found" });
      }
      res.json(reimbursement);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursement = await ReimbursementService.update(req.params.id, req.body);
      if (!reimbursement) {
        return res.status(404).json({ message: "Reimbursement not found" });
      }
      res.json(reimbursement);
    } catch (err) {
      next(err);
    }
  },

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const reimbursement = await ReimbursementService.updateStatus(req.params.id, "approved");
      if (!reimbursement) {
        return res.status(404).json({ message: "Reimbursement not found" });
      }
      res.json({
        message: "Reimbursement approved successfully",
        data: reimbursement
      });
    } catch (err) {
      next(err);
    }
  },

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const reimbursement = await ReimbursementService.updateStatus(req.params.id, "rejected", reason);
      if (!reimbursement) {
        return res.status(404).json({ message: "Reimbursement not found" });
      }
      res.json({
        message: "Reimbursement rejected",
        data: reimbursement
      });
    } catch (err) {
      next(err);
    }
  },

  async getByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await ReimbursementService.getByEmployee(
        req.params.employeeId
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ReimbursementService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
};
