import { Request, Response, NextFunction } from "express";
import { HospitalService } from "../services/hospital.service";

export const HospitalController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const hospitals = await HospitalService.list(filters);
      res.json(hospitals);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.getById(req.params.id);
      if (!hospital) return res.status(404).json({ message: "Not found" });
      res.json(hospital);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.create(req.body);
      res.status(201).json(hospital);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const hospital = await HospitalService.update(req.params.id, req.body);
      res.json(hospital);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await HospitalService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getByCity(req: Request, res: Response, next: NextFunction) {
    try {
      const cityData = await HospitalService.getByCity();
      res.json(cityData);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await HospitalService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getCityDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { city } = req.params;
      const hospitals = await HospitalService.getCityDetails(city);
      res.json(hospitals);
    } catch (err) {
      next(err);
    }
  },
};
