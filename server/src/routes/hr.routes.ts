import { Router } from "express";
import { LeaveController } from "../controllers/leave.controller";
import { IncentiveController } from "../controllers/incentive.controller";
import { PayrollController } from "../controllers/payroll.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

// Payroll Management Routes
router.post(
  "/payroll/process",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  PayrollController.processPayroll
);

router.get(
  "/payroll/stats",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  PayrollController.getPayrollStats
);

router.get(
  "/payroll",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  PayrollController.list
);

// Leave Management Routes
router.get(
  "/leaves/stats",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.getStats
);

router.get(
  "/leaves",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.list
);

router.get(
  "/leaves/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.getById
);

router.post(
  "/leaves",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.create
);

router.put(
  "/leaves/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.update
);

router.delete(
  "/leaves/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.remove
);

router.post(
  "/leaves/:id/approve",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.approveLeave
);

router.post(
  "/leaves/:id/reject",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.rejectLeave
);

router.get(
  "/leaves/employee/:employeeId",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.getEmployeeLeaves
);

router.get(
  "/leaves/employee/:employeeId/balance",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.getLeaveBalance
);

router.post(
  "/leaves/bulk-action",
  authorize([UserRole.ADMIN, UserRole.HR]),
  LeaveController.bulkAction
);

// Incentive Management Routes
router.get(
  "/incentives/stats",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  IncentiveController.getStats
);

router.get(
  "/incentives/top-performers",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.getTopPerformers
);

router.get(
  "/incentives",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  IncentiveController.list
);

router.get(
  "/incentives/:id",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  IncentiveController.getById
);

router.post(
  "/incentives",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.create
);

router.put(
  "/incentives/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.update
);

router.delete(
  "/incentives/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.remove
);

router.post(
  "/incentives/:id/submit",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.submitForApproval
);

router.post(
  "/incentives/:id/approve",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.approveIncentive
);

router.post(
  "/incentives/:id/reject",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.rejectIncentive
);

router.post(
  "/incentives/:id/process-payment",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  IncentiveController.processPayment
);

router.get(
  "/incentives/employee/:employeeId",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.getEmployeeIncentives
);

router.post(
  "/incentives/:id/generate-recurring",
  authorize([UserRole.ADMIN, UserRole.HR]),
  IncentiveController.generateRecurring
);

router.post(
  "/incentives/bulk-action",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  IncentiveController.bulkAction
);

router.patch(
  "/incentives/:id/status",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  IncentiveController.updateStatus
);

export default router;