import { Router } from "express";
import { BulkUploadController } from "../controllers/bulk-upload.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";
import { csvUpload } from "../middlewares/multer.middleware";

const router = Router();
router.use(authenticate);

// Bulk upload routes for different entities
router.post(
  "/employees",
  authorize([UserRole.ADMIN, UserRole.HR]),
  csvUpload.single('csvFile'),
  BulkUploadController.uploadEmployees
);

router.post(
  "/hospitals",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  csvUpload.single('csvFile'),
  BulkUploadController.uploadHospitals
);

router.post(
  "/doctors",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  csvUpload.single('csvFile'),
  BulkUploadController.uploadDoctors
);

router.post(
  "/partners",
  authorize([UserRole.ADMIN, UserRole.OPS]),
  csvUpload.single('csvFile'),
  BulkUploadController.uploadPartners
);

export default router;
