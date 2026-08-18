import { Request, Response, NextFunction } from "express";
import { CabService } from "../services/cab.service";

export const CabController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const cabs = await CabService.list(filters);
      res.json(cabs);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate required fields
      const { patientName, phone, serviceType, requestedByModel } = req.body;
      
      if (!patientName || patientName.trim() === "") {
        return res.status(400).json({ 
          message: "Patient/Person name is required",
          field: "patientName"
        });
      }
      
      if (!phone || phone.trim() === "") {
        return res.status(400).json({ 
          message: "Phone number is required",
          field: "phone"
        });
      }
      
      if (!serviceType) {
        return res.status(400).json({ 
          message: "Service type is required",
          field: "serviceType"
        });
      }
      
      if (!requestedByModel) {
        return res.status(400).json({ 
          message: "Requester type is required",
          field: "requestedByModel"
        });
      }
      
      const cab = await CabService.create(req.body);
      res.status(201).json(cab);
    } catch (err: any) {
      // Handle mongoose validation errors
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({ 
          message: errors.join(', '),
          errors: err.errors
        });
      }
      
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cab = await CabService.getById(req.params.id);
      if (!cab) {
        return res.status(404).json({ message: "Cab booking not found" });
      }
      res.json(cab);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const cab = await CabService.update(req.params.id, req.body);
      if (!cab) {
        return res.status(404).json({ message: "Cab booking not found" });
      }
      res.json(cab);
    } catch (err) {
      next(err);
    }
  },

  async assignDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { driverId, vehicleNumber, driverName } = req.body;
      const cab = await CabService.assignDriver(
        req.params.id,
        driverId,
        vehicleNumber,
        driverName
      );
      res.json(cab);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const cab = await CabService.updateStatus(req.params.id, status);
      res.json(cab);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await CabService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceType } = req.query;
      const stats = await CabService.getStats(serviceType as string);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
