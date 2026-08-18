import { Router } from "express";
import { PartnerController } from "../controllers/partner.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/rbac.middleware";
import { UserRole } from "../constants/roles.enum";

const router = Router();
router.use(authenticate);

router.get(
  "/stats",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
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
  PartnerController.getStats
);

router.get(
  "/stats/corporate",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
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
  PartnerController.getCorporateStats
);

router.get(
  "/stats/individual",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
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
  PartnerController.getIndividualStats
);

router.get(
  "/",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
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
  PartnerController.list
);
router.get(
  "/:id",
  authorize([
    UserRole.ADMIN, 
    UserRole.OPS, 
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
  PartnerController.getById
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
  PartnerController.create
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
  PartnerController.update
);
router.delete("/:id", authorize([UserRole.ADMIN]), PartnerController.remove);

export default router;
