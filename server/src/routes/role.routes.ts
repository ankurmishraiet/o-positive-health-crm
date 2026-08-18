import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

// Get available resources and actions (for role creation UI)
router.get(
  "/resources",
  authorize([UserRole.ADMIN]),
  RoleController.getAvailableResources
);
router.get(
  "/actions",
  authorize([UserRole.ADMIN]),
  RoleController.getAvailableActions
);

// CRUD operations for roles
router.get(
  "/",
  authorize([UserRole.ADMIN]),
  RoleController.getAllRoles
);
router.get(
  "/:id",
  authorize([UserRole.ADMIN]),
  RoleController.getRoleById
);
router.post(
  "/",
  authorize([UserRole.ADMIN]),
  RoleController.createRole
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN]),
  RoleController.updateRole
);
router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  RoleController.deleteRole
);

export default router;