import { Router } from "express";
import { TargetController } from "../controllers/target.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();

router.use(authenticate);

// Set target (Admin/HR only)
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.HR]),
  TargetController.setTarget
);

// Set bulk targets (Admin/HR only)
router.post(
  "/bulk",
  authorize([UserRole.ADMIN, UserRole.HR]),
  TargetController.setBulkTargets
);

// Get targets by month (Admin/HR only)
router.get(
  "/monthly",
  authorize([UserRole.ADMIN, UserRole.HR]),
  TargetController.getTargetsByMonth
);

// Get all targets vs achievements (Admin/HR only)
router.get(
  "/vs-achievements",
  authorize([UserRole.ADMIN, UserRole.HR]),
  TargetController.getAllTargetsVsAchievements
);

// Get target by employee
router.get(
  "/employee/:employeeId",
  TargetController.getTargetByEmployee
);

// Get target vs achievement for employee
router.get(
  "/employee/:employeeId/vs-achievement",
  TargetController.getTargetVsAchievement
);

// Update target (Admin/HR only)
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  TargetController.updateTarget
);

// Delete target (Admin only)
router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  TargetController.deleteTarget
);

export default router;
