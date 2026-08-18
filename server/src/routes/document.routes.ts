import { Router } from "express";
import { DocumentController } from "../controllers/document.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";
import upload from "../middlewares/multer.middleware";

const router = Router();
router.use(authenticate);

// Basic CRUD operations
router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR, UserRole.FINANCE]),
  DocumentController.list
);
router.get(
  "/statistics",
  authorize([UserRole.ADMIN, UserRole.HR]),
  DocumentController.getStatistics
);
router.get(
  "/category/:category",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR, UserRole.FINANCE]),
  DocumentController.getByCategory
);
router.get(
  "/entity/:entityType/:entityId",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR, UserRole.FINANCE]),
  DocumentController.getByEntity
);
router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR, UserRole.FINANCE]),
  DocumentController.getById
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.HR]),
  DocumentController.update
);
router.delete(
  "/:id",
  authorize([UserRole.ADMIN]),
  DocumentController.delete
);

// File operations
router.post(
  "/upload",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR]),
  upload.single("file") as any,
  DocumentController.upload
);

// Get presigned URL for direct S3 upload
router.post(
  "/presigned-url",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR]),
  DocumentController.getPresignedUploadUrl
);

router.get(
  "/:id/download",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.DOCTOR, UserRole.FINANCE]),
  DocumentController.download
);

// Salary Slip specific routes
router.get(
  "/salary-slips/list",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  DocumentController.getSalarySlips
);
router.post(
  "/salary-slips/generate/:employeeId/:month/:year",
  authorize([UserRole.ADMIN, UserRole.HR]),
  DocumentController.generateSalarySlip
);
router.post(
  "/salary-slips/generate-bulk",
  authorize([UserRole.ADMIN, UserRole.HR]),
  DocumentController.generateBulkSalarySlips
);
router.put(
  "/salary-slips/:id/mark-email-sent",
  authorize([UserRole.ADMIN, UserRole.HR]),
  DocumentController.markSalarySlipEmailSent
);

// Comment operations
router.post(
  "/:id/comments",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  DocumentController.addComment
);
router.get(
  "/:id/comments",
  authorize([UserRole.ADMIN, UserRole.HR, UserRole.FINANCE]),
  DocumentController.getComments
);

export default router;