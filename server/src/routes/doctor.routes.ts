import { Router } from "express";
import { DoctorController } from "../controllers/doctor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.get(
  "/stats",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getStats
);

router.get(
  "/stats/with-us",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getWithUsStats
);

router.get(
  "/type/:type",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getByType
);

router.get(
  "/city/:city",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getByCity
);

router.get(
  "/department/:department",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getByDepartment
);

router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.list
);
router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]),
  DoctorController.getById
);
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  DoctorController.create
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  DoctorController.update
);
router.delete("/:id", authorize([UserRole.ADMIN]), DoctorController.remove);

// Doctor appointments
router.get("/:id/appointments", 
  authorize([UserRole.ADMIN, UserRole.OPS, UserRole.HR]), 
  DoctorController.getDoctorAppointments
);

export default router;
