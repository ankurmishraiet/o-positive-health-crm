import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();

router.use(authenticate);

router.get(
  "/stats",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.getStats
);

router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.list
);
router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.getById
);
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.create
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.update
);
router.delete(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.delete
);
router.patch(
  "/:id/hierarchy",
  authorize([UserRole.ADMIN]),
  EmployeeController.updateHierarchy
);
router.post(
  "/:id/create-account",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.createAccount
);
router.delete(
  "/:id/remove-account",
  authorize([UserRole.ADMIN, UserRole.HR]),
  EmployeeController.removeAccount
);

export default router;
