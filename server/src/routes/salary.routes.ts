import { Router } from "express";
import { SalaryController } from "../controllers/salary.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Salary CRUD operations
router.post("/", SalaryController.create);
router.get("/", SalaryController.list);
router.get("/stats", SalaryController.getStats);
router.get("/:id", SalaryController.getById);
router.put("/:id", SalaryController.update);
router.delete("/:id", SalaryController.delete);

// Salary approval and payment processing
router.post("/:id/approve", SalaryController.approveSalary);
router.post("/:id/process-payment", SalaryController.processSalaryPayment);

// Employee salary history and comparison
router.get("/employee/:employeeId/history", SalaryController.getEmployeeSalaryHistory);
router.get("/employee/:employeeId/comparison", SalaryController.getSalaryComparison);

// Payslip generation
router.get("/:id/payslip", SalaryController.generatePayslip);

// Bulk operations
router.post("/bulk", SalaryController.bulkCreateSalaries);

// Sync employees to salary table
router.post("/sync-employees", SalaryController.syncEmployeeSalaries);

// Update payment status
router.patch("/:id/payment-status", SalaryController.updatePaymentStatus);

export default router;
