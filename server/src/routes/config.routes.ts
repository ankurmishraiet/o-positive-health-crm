import { Router } from "express";
import { ConfigController } from "../controllers/config.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Public or authenticated config endpoints
router.get("/", authenticate, ConfigController.getDocumentConfig);

export default router;
