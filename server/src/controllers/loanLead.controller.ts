import { Request, Response, NextFunction } from "express";
import { LoanLeadService } from "../services/loanLead.service";

export const LoanLeadController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const loanLeadData = {
        ...req.body,
        createdBy: (req as any).user.id,
      };
      const loanLead = await LoanLeadService.create(loanLeadData);
      res.status(201).json(loanLead);
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
      const filters = {
        status: req.query.status,
        assignedTo: req.query.assignedTo,
        priority: req.query.priority,
        search: req.query.search,
      };
      const loanLeads = await LoanLeadService.list(filters);
      res.json({ loanLeads, total: loanLeads.length });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const loanLead = await LoanLeadService.getById(req.params.id);
      if (!loanLead) return res.status(404).json({ message: "Loan lead not found" });
      res.json(loanLead);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const loanLead = await LoanLeadService.update(req.params.id, req.body);
      if (!loanLead) return res.status(404).json({ message: "Loan lead not found" });
      res.json(loanLead);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const loanLead = await LoanLeadService.delete(req.params.id);
      if (!loanLead) return res.status(404).json({ message: "Loan lead not found" });
      res.json({ message: "Loan lead deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const loanLead = await LoanLeadService.updateStatus(req.params.id, status);
      res.json(loanLead);
    } catch (err) {
      next(err);
    }
  },

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await LoanLeadService.getStatistics();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async convertToLoan(req: Request, res: Response, next: NextFunction) {
    try {
      const { loanId } = req.body;
      const loanLead = await LoanLeadService.convertToLoan(req.params.id, loanId);
      res.json(loanLead);
    } catch (err) {
      next(err);
    }
  },

  async saveDraft(req: Request, res: Response, next: NextFunction) {
    try {
      const loanLeadData = {
        ...req.body,
        status: 'Draft',
        createdBy: (req as any).user.id,
      };
      
      let loanLead;
      let message;
      
      // If ID is provided in params (PATCH route), update existing draft
      if (req.params.id) {
        loanLead = await LoanLeadService.update(req.params.id, loanLeadData);
        message = "Draft updated successfully";
      } else {
        // Otherwise create new draft (POST route)
        loanLead = await LoanLeadService.create(loanLeadData);
        message = "Draft created successfully";
      }
      
      res.status(req.params.id ? 200 : 201).json({
        message,
        loanLead
      });
    } catch (err) {
      next(err);
    }
  },
};
