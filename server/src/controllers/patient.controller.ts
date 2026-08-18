import { Request, Response, NextFunction } from "express";
import { PatientService } from "../services/patient.service";

export const PatientController = {
  /**
   * Search patients
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;
      const searchTerm = q as string;
      const searchLimit = limit ? parseInt(limit as string, 10) : 20;
      const user = (req as any).user;
      
      const patients = await PatientService.search(searchTerm, searchLimit, user);
      res.json(patients);
    } catch (err) {
      next(err);
    }
  },

  /**
   * List all patients
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await PatientService.list(req.query, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get patient full history
   */
  async getPatientHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const history = await PatientService.getPatientHistory(req.params.id, user);
      res.json(history);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get patient appointments
   */
  async getPatientAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await PatientService.getPatientAppointments(req.params.id, req.query, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get patient cab bookings
   */
  async getPatientCabBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await PatientService.getPatientCabBookings(req.params.id, req.query, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get hospitals visited by patient
   */
  async getPatientHospitals(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await PatientService.getPatientHospitals(req.params.id, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current patient status
   */
  async getPatientStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const status = await PatientService.getPatientStatus(req.params.id, user);
      res.json(status);
    } catch (err) {
      next(err);
    }
  }
};
