import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();

router.use(authenticate);

// Mark attendance (Admin/HR only)
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.HR]),
  AttendanceController.markAttendance
);

// Mark bulk attendance (Admin/HR only)
router.post(
  "/bulk",
  authorize([UserRole.ADMIN, UserRole.HR]),
  AttendanceController.markBulkAttendance
);

// Get attendance by date (Admin/HR only)
router.get(
  "/date",
  authorize([UserRole.ADMIN, UserRole.HR]),
  AttendanceController.getAttendanceByDate
);

// Get monthly attendance (Admin/HR only)
router.get(
  "/monthly",
  authorize([UserRole.ADMIN, UserRole.HR]),
  AttendanceController.getMonthlyAttendance
);

// Get attendance by employee
router.get(
  "/employee/:employeeId",
  AttendanceController.getAttendanceByEmployee
);

// Get attendance stats for employee
router.get(
  "/employee/:employeeId/stats",
  AttendanceController.getAttendanceStats
);

// Update attendance (Admin/HR only)
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  AttendanceController.updateAttendance
);

// Delete attendance (Admin only)
router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  AttendanceController.deleteAttendance
);

export default router;
