import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import upload from "../middlewares/multer.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.list
);
router.get(
  "/stats",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.getStats
);
router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.getById
);
router.get(
  "/:id/download",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.download
);
router.get(
  "/:id/pdf",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.generatePDF
);
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  upload.single("file") as any,
  InvoiceController.create
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.update
);
router.delete(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.delete
);
router.post(
  "/:id/payment",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.updatePayment
);
router.post(
  "/:id/send",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.markAsSent
);
router.post(
  "/:id/viewed",
  InvoiceController.markAsViewed
);
router.post(
  "/:id/reminder",
  authorize([UserRole.ADMIN, UserRole.FINANCE]),
  InvoiceController.sendReminder
);

export default router;
