import { Router } from "express";
import { LeadController } from "../controllers/lead.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";
import { csvUpload } from "../middlewares/multer.middleware";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.list
);
router.get(
  "/employee/:employeeId/leads",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR, UserRole.BD_MANAGER, UserRole.SALES_MANAGER, UserRole.BD_ASSOCIATE]),
  LeadController.getLeadsByEmployee
);

// Config endpoints (must be before /:id to avoid param conflicts)
router.get(
  "/config/cities",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getCities
);
router.get(
  "/config/form",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getFormConfig
);

// Follow-up / OPD / IPD endpoints (must be before /:id)
router.get(
  "/followup/today",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getFollowUpToday
);
router.get(
  "/opd/today",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getTodayOPD
);
router.get(
  "/opd/:filter",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getOPD
);
router.get(
  "/ipd/today",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getTodayIPD
);
router.get(
  "/ipd/:filter",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getIPD
);

router.get(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.BD, UserRole.HR]),
  LeadController.getById
);
router.post(
  "/",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LeadController.create
);
router.put(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LeadController.update
);
router.patch(
  "/:id",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LeadController.update
);
router.patch(
  "/:id/status",
  authorize([UserRole.ADMIN, UserRole.BD]),
  LeadController.updateStatus
);
router.post("/:id/assign", authorize([UserRole.ADMIN]), LeadController.assign);
router.delete("/:id", authorize([UserRole.ADMIN]), LeadController.remove);

// CSV Upload route
router.post(
  "/upload-csv",
  authorize([UserRole.ADMIN, UserRole.BD]),
  csvUpload.single('csvFile'),
  LeadController.uploadCsv
);

export default router;
