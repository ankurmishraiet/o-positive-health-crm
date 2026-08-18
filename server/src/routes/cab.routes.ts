import { Router } from "express";
import { CabController } from "../controllers/cab.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
    UserRole.DRIVER, 
    UserRole.BD, 
    UserRole.HR, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  CabController.list
);
router.get(
  "/stats",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
    UserRole.DRIVER, 
    UserRole.BD, 
    UserRole.HR, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  CabController.getStats
);
router.get(
  "/:id",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
    UserRole.DRIVER, 
    UserRole.BD, 
    UserRole.HR, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]), 
  CabController.getById
);
router.post(
  "/",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
    UserRole.BD, 
    UserRole.HR, 
    UserRole.FINANCE,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.BD_ASSOCIATE,
    UserRole.DIRECTOR
  ]),
  CabController.create
);
router.put(
  "/:id", 
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  CabController.update
);
router.put(
  "/:id/assign",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS,
    UserRole.BD_MANAGER,
    UserRole.SALES_MANAGER,
    UserRole.ASSISTANT_MANAGER,
    UserRole.OPERATION_MANAGER,
    UserRole.DIRECTOR
  ]),
  CabController.assignDriver
);
router.put(
  "/:id/status",
  authorize([UserRole.DRIVER]),
  CabController.updateStatus
);
router.delete("/:id", authorize([UserRole.ADMIN]), CabController.remove);

export default router;
