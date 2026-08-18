import { Router } from "express";
import { ReimbursementController } from "../controllers/reimbursement.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

// Stats
router.get(
  "/stats",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  ReimbursementController.getStats
);

// List all
router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  ReimbursementController.list
);

// Create new reimbursement
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR, UserRole.OPS]),
  ReimbursementController.create
);

// Get by ID
router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  ReimbursementController.getById
);

// Update reimbursement
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  ReimbursementController.update
);

// Approve reimbursement
router.post(
  "/:id/approve",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  ReimbursementController.approve
);

// Reject reimbursement
router.post(
  "/:id/reject",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  ReimbursementController.reject
);

// Get by employee
router.get(
  "/employee/:employeeId",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  ReimbursementController.getByEmployee
);

export default router;
