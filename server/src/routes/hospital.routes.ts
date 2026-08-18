import { Router } from "express";
import { HospitalController } from "../controllers/hospital.controller";
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
  HospitalController.list
);

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
  HospitalController.getStats
);

router.get(
  "/cities",
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
  HospitalController.getByCity
);

router.get(
  "/city/:city",
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
  HospitalController.getCityDetails
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
  HospitalController.getById
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
  HospitalController.create
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
  HospitalController.update
);
router.delete("/:id", authorize([UserRole.ADMIN]), HospitalController.remove);

export default router;
