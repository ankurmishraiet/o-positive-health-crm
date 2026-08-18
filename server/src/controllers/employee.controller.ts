import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/employee.service";
import { generateMockEmployees } from "../utils/mock-data";

export const EmployeeController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await EmployeeService.list(req.query);
      res.json(employees);
    } catch (err) {
      console.error("Database error, using mock data:", err);
      // Fallback to mock data when database is unavailable
      const mockData = generateMockEmployees();
      res.json(mockData);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.getById(req.params.id);
      if (!employee) return res.status(404).json({ message: "Not found" });
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.create(req.body);
      res.status(201).json(employee);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.update(req.params.id, req.body);
      if (!employee) return res.status(404).json({ message: "Not found" });
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await EmployeeService.delete(req.params.id);
      if (!employee) return res.status(404).json({ message: "Not found" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async updateHierarchy(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportsTo } = req.body;
      const updated = await EmployeeService.updateHierarchy(
        req.params.id,
        reportsTo
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await EmployeeService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.createUserAccount(req.params.id, req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async removeAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EmployeeService.removeUserAccount(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
};
