import { Request, Response, NextFunction } from "express";
import { DoctorService } from "../services/doctor.service";
import { generateMockDoctors } from "../utils/mock-data";

export const DoctorController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        type: req.query.type as string,
        city: req.query.city as string,
        department: req.query.department as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => 
        filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
      );
      
      const doctors = await DoctorService.list(Object.keys(filters).length ? filters : undefined);
      res.json(doctors);
    } catch (err) {
      console.error("Database error, using mock data:", err);
      // Fallback to mock data when database is unavailable
      const mockData = generateMockDoctors();
      res.json(mockData);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.getById(req.params.id);
      if (!doctor) return res.status(404).json({ message: "Not found" });
      res.json(doctor);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate required fields
      const { name, phone } = req.body;
      
      if (!name || name.trim() === "") {
        return res.status(400).json({ 
          message: "Name is required",
          field: "name"
        });
      }
      
      if (!phone || phone.trim() === "") {
        return res.status(400).json({ 
          message: "Phone number is required",
          field: "phone"
        });
      }
      
      const doctor = await DoctorService.create(req.body);
      res.status(201).json(doctor);
    } catch (err: any) {
      // Handle mongoose validation errors
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e: any) => e.message);
        return res.status(400).json({ 
          message: errors.join(', '),
          errors: err.errors
        });
      }
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({ 
          message: `${field} already exists. Please use a different ${field}.`,
          field
        });
      }
      
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const doctor = await DoctorService.update(req.params.id, req.body);
      res.json(doctor);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await DoctorService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DoctorService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getWithUsStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DoctorService.getWithUsStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const doctors = await DoctorService.getDoctorsByType(type);
      res.json(doctors);
    } catch (err) {
      next(err);
    }
  },

  async getByCity(req: Request, res: Response, next: NextFunction) {
    try {
      const { city } = req.params;
      const doctors = await DoctorService.getDoctorsByCity(city);
      res.json(doctors);
    } catch (err) {
      next(err);
    }
  },

  async getByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { department } = req.params;
      const doctors = await DoctorService.getDoctorsByDepartment(department);
      res.json(doctors);
    } catch (err) {
      next(err);
    }
  },

  async getDoctorAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const appointments = await DoctorService.getDoctorAppointments(id);
      res.json(appointments);
    } catch (err) {
      next(err);
    }
  },
};
