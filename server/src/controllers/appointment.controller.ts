import { Request, Response, NextFunction } from "express";
import { AppointmentService } from "../services/appointment.service";

export const AppointmentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const appointments = await AppointmentService.list(filters);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.getById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.create(req.body);
      res.status(201).json(appointment);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.update(req.params.id, req.body);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const appointment = await AppointmentService.updateStatus(req.params.id, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const appointment = await AppointmentService.remove(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const stats = await AppointmentService.getStats(filters);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getByCity(req: Request, res: Response, next: NextFunction) {
    try {
      const { city } = req.params;
      const appointments = await AppointmentService.getByCity(city);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  },
};