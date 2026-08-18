import { Router } from "express";
import { LoanController } from "../controllers/loan.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";
import upload from "../middlewares/multer.middleware";

const router = Router();
router.use(authenticate);

// Basic CRUD operations
router.get(
  "/",
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
  LoanController.list
);
router.get(
  "/statistics",
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
  LoanController.getStatistics
);
router.get(
  "/pending-payments",
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
  LoanController.getPendingPayments
);
router.get(
  "/:id",
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
  LoanController.getById
);
router.post(
  "/",
  authorize([
    UserRole.ADMIN, 
    UserRole.HR, 
    UserRole.BD, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  LoanController.create
);
router.put(
  "/:id",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  LoanController.update
);
router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  LoanController.delete
);

// Status management
router.put(
  "/:id/status",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  LoanController.updateStatus
);

// Payment processing
router.post(
  "/:loanId/payments/:emiNumber",
  authorize([
    UserRole.ADMIN, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  LoanController.processPayment
);

// File uploads
router.post(
  "/:id/upload-disbursal",
  authorize([UserRole.ADMIN]),
  upload.single("file") as any,
  LoanController.uploadDisbursal
);

export default router;
