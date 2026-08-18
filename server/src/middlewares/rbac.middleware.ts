import { Request, Response, NextFunction } from "express";
import { RoleService } from "../services/role.service";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Check if user has one of the required roles (legacy support)
    if (roles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({ message: "Forbidden" });
  };
};

// New permission-based authorization
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const hasPermission = await RoleService.checkPermission(
        user.role,
        user.customRole,
        resource,
        action
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          message: `Insufficient permissions. Required: ${action} on ${resource}` 
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
