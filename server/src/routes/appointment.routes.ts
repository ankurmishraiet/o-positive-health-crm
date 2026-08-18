import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  AppointmentController.list
);

router.get(
  "/stats",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  AppointmentController.getStats
);

router.get(
  "/city/:city",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  AppointmentController.getByCity
);

router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  AppointmentController.getById
);

router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  AppointmentController.create
);

router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  AppointmentController.update
);

router.put(
  "/:id/status",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  AppointmentController.updateStatus
);

router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  AppointmentController.remove
);

export default router;