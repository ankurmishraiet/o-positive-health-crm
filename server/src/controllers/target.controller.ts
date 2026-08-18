import { Request, Response, NextFunction } from "express";
import { TargetService } from "../services/target.service";

export const TargetController = {
  async setTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        employeeId,
        month,
        year,
        revenueTarget,
        opdTarget,
        ipdTarget,
        remarks,
      } = req.body;
      const setById = (req as any).user.id;

      if (!employeeId || !month || !year || revenueTarget === undefined) {
        return res.status(400).json({
          message: "Employee ID, month, year, and lead target are required",
        });
      }

      // Validate target values are non-negative
      if (revenueTarget < 0 || (opdTarget !== undefined && opdTarget < 0) || (ipdTarget !== undefined && ipdTarget < 0)) {
        return res.status(400).json({
          message: "Target values cannot be negative",
        });
      }

      const target = await TargetService.setTarget(
        employeeId,
        month,
        year,
        revenueTarget,
        opdTarget || 0,
        ipdTarget || 0,
        setById,
        remarks
      );

      res.status(201).json(target);
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Target already exists for this employee and month",
        });
      }
      next(err);
    }
  },

  async setBulkTargets(req: Request, res: Response, next: NextFunction) {
    try {
      const { targets, month, year } = req.body;
      const setById = (req as any).user.id;

      if (!targets || !Array.isArray(targets) || !month || !year) {
        return res.status(400).json({
          message: "Invalid request. Targets array, month, and year are required",
        });
      }

      const result = await TargetService.setBulkTargets(
        targets,
        month,
        year,
        setById
      );

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getTargetByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const target = await TargetService.getTargetByEmployee(
        employeeId,
        month as string,
        parseInt(year as string)
      );

      if (!target) {
        return res.status(404).json({ message: "Target not found" });
      }

      res.json(target);
    } catch (err) {
      next(err);
    }
  },

  async getTargetsByMonth(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const targets = await TargetService.getTargetsByMonth(
        month as string,
        parseInt(year as string)
      );

      res.json(targets);
    } catch (err) {
      next(err);
    }
  },

  async getTargetVsAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const result = await TargetService.getTargetVsAchievement(
        employeeId,
        month as string,
        parseInt(year as string)
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getAllTargetsVsAchievements(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const results = await TargetService.getAllTargetsVsAchievements(
        month as string,
        parseInt(year as string)
      );

      res.json(results);
    } catch (err) {
      next(err);
    }
  },

  async updateTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const target = await TargetService.updateTarget(id, updates);

      if (!target) {
        return res.status(404).json({ message: "Target not found" });
      }

      res.json(target);
    } catch (err) {
      next(err);
    }
  },

  async deleteTarget(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const target = await TargetService.deleteTarget(id);

      if (!target) {
        return res.status(404).json({ message: "Target not found" });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
