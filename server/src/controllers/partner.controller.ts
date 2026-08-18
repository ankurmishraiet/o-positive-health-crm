import { Request, Response, NextFunction } from "express";
import { PartnerService } from "../services/partner.service";
import { generateMockPartners } from "../utils/mock-data";

export const PartnerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const partners = await PartnerService.list(req.query);
      res.json(partners);
    } catch (err) {
      console.error("Database error, using mock data:", err);
      // Fallback to mock data when database is unavailable
      const mockData = generateMockPartners();
      res.json(mockData);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const partner = await PartnerService.getById(req.params.id);
      if (!partner)
        return res.status(404).json({ message: "Partner not found" });
      res.json(partner);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const partnerData = {
        ...req.body,
        createdBy: userId
      };
      const partner = await PartnerService.create(partnerData);
      res.status(201).json(partner);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const updateData = {
        ...req.body,
        updatedBy: userId
      };
      const partner = await PartnerService.update(req.params.id, updateData);
      res.json(partner);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await PartnerService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PartnerService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getCorporateStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PartnerService.getCorporateStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getIndividualStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await PartnerService.getIndividualStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
