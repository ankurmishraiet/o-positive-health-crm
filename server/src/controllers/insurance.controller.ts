import { Request, Response, NextFunction } from "express";
import { InsuranceService } from "../services/insurance.service";

export const InsuranceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const insurance = await InsuranceService.create(req.body);
      res.status(201).json(insurance);
    } catch (err) {
      next(err);
    }
  },

  async getByLead(req: Request, res: Response, next: NextFunction) {
    try {
      const insurance = await InsuranceService.getByLead(req.params.leadId);
      res.json(insurance);
    } catch (err) {
      next(err);
    }
  },
};
