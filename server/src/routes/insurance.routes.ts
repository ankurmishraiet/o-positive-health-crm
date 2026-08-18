import { Router } from "express";
import { InsuranceController } from "../controllers/insurance.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InsuranceController.create
);
router.get(
  "/:leadId",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.BD]),
  InsuranceController.getByLead
);

export default router;
