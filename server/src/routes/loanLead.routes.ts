import { Router } from "express";
import { LoanLeadController } from "../controllers/loanLead.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

// Basic CRUD operations
router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.BD]),
  LoanLeadController.list
);

router.get(
  "/statistics",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  LoanLeadController.getStatistics
);

router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.BD]),
  LoanLeadController.getById
);

router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LoanLeadController.create
);

router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LoanLeadController.update
);

router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  LoanLeadController.delete
);

// Status management
router.patch(
  "/:id/status",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LoanLeadController.updateStatus
);

// Convert to loan
router.post(
  "/:id/convert",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  LoanLeadController.convertToLoan
);

// Save or update draft
router.post(
  "/draft",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.FINANCE]),
  LoanLeadController.saveDraft
);

router.patch(
  "/:id/draft",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.FINANCE]),
  LoanLeadController.saveDraft
);

export default router;
