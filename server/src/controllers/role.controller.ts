import { Request, Response, NextFunction } from "express";
import { RoleService } from "../services/role.service";

export const RoleController = {
  async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const role = await RoleService.createRole(req.body, userId);
      res.status(201).json({
        message: "Role created successfully",
        role
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const includeSystem = req.query.includeSystem === 'true';
      const roles = await RoleService.getAllRoles(includeSystem);
      res.json({
        roles,
        total: roles.length
      });
    } catch (err) {
      next(err);
    }
  },

  async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (err) {
      next(err);
    }
  },

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const role = await RoleService.updateRole(req.params.id, req.body, userId);
      if (!role) {
        return res.status(404).json({ message: "Role not found or cannot be updated" });
      }
      res.json({
        message: "Role updated successfully",
        role
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const success = await RoleService.deleteRole(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Role not found or cannot be deleted" });
      }
      res.json({ message: "Role deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async getAvailableResources(req: Request, res: Response, next: NextFunction) {
    try {
      const resources = await RoleService.getAvailableResources();
      res.json({ resources });
    } catch (err) {
      next(err);
    }
  },

  async getAvailableActions(req: Request, res: Response, next: NextFunction) {
    try {
      const actions = await RoleService.getAvailableActions();
      res.json({ actions });
    } catch (err) {
      next(err);
    }
  }
};