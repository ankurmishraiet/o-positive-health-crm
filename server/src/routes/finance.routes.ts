import { Router } from "express";
import { FinanceController } from "../controllers/finance.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

// Finance Dashboard & Stats
router.get(
  "/stats", 
  authorize([UserRole.ADMIN, UserRole.FINANCE]), 
  FinanceController.getStats
);
router.get(
  "/dashboard", 
  authorize([UserRole.ADMIN, UserRole.FINANCE]), 
  FinanceController.getDashboard
);
router.get(
  "/trends", 
  authorize([UserRole.ADMIN, UserRole.FINANCE]), 
  FinanceController.getTrends
);
router.get(
  "/top-performers", 
  authorize([UserRole.ADMIN, UserRole.FINANCE]), 
  FinanceController.getTopPerformers
);
router.get(
  "/upcoming-payments", 
  authorize([UserRole.ADMIN, UserRole.FINANCE]), 
  FinanceController.getUpcomingPayments
);

// Transactions Management
router.post(
  "/transactions",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE, 
    UserRole.BD, 
    UserRole.HR,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  FinanceController.createTransaction
);
router.get(
  "/transactions",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE, 
    UserRole.BD, 
    UserRole.HR,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  FinanceController.listTransactions
);
router.get(
  "/transactions/stats",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE, 
    UserRole.BD, 
    UserRole.HR,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  FinanceController.getTransactionStats
);
router.get(
  "/transactions/:id",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE, 
    UserRole.BD, 
    UserRole.HR,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  FinanceController.getTransaction
);
router.put(
  "/transactions/:id",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  FinanceController.updateTransaction
);
router.delete(
  "/transactions/:id",
  authorize([
    UserRole.ADMIN
  ]),
  FinanceController.deleteTransaction
);

// Payments Management
router.post(
  "/payments",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.createPayment
);
router.get(
  "/payments",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.listPayments
);
router.get(
  "/payments/stats",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.getPaymentStats
);
router.get(
  "/payments/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.getPayment
);
router.put(
  "/payments/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.updatePayment
);
router.post(
  "/payments/:id/process",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.processPayment
);

// Salary Management
router.post(
  "/salaries",
  authorize([UserRole.ADMIN, UserRole.HR]),
  FinanceController.createSalary
);
router.get(
  "/salaries",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  FinanceController.listSalaries
);
router.get(
  "/salaries/stats",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  FinanceController.getSalaryStats
);
router.get(
  "/salaries/:id",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  FinanceController.getSalary
);
router.put(
  "/salaries/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  FinanceController.updateSalary
);
router.post(
  "/salaries/:id/approve",
  authorize([UserRole.ADMIN, UserRole.HR]),
  FinanceController.approveSalary
);
router.post(
  "/salaries/:id/process-payment",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.processSalaryPayment
);
router.delete(
  "/salaries/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  FinanceController.deleteSalary
);
router.post(
  "/salaries/sync-employees",
  authorize([UserRole.ADMIN, UserRole.HR]),
  FinanceController.syncEmployeeSalaries
);
router.patch(
  "/salaries/:id/payment-status",
  authorize([UserRole.ADMIN, UserRole.FINANCE, UserRole.HR]),
  FinanceController.updateSalaryPaymentStatus
);

// GST Management
router.post(
  "/gst",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.createGST
);
router.get(
  "/gst",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.listGST
);
router.get(
  "/gst/stats",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.getGSTStats
);
router.get(
  "/gst/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.getGST
);
router.put(
  "/gst/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.updateGST
);
router.post(
  "/gst/:id/file",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.fileGSTReturn
);
router.post(
  "/gst/:id/process-payment",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  FinanceController.processGSTPayment
);

export default router;