import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create", authenticate, AuthController.createUser);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/request-otp", AuthController.requestOtp);
router.post("/send-otp", AuthController.requestOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/admin/request-otp", AuthController.requestAdminOtp);
router.post("/admin/verify-otp", AuthController.verifyAdminOtp);
router.get("/me", authenticate, AuthController.me);
router.get(
  "/credentials/:id",
  authenticate,
  AuthController.getUserCredentialsById,
);
router.patch(
  "/users/:id/password",
  authenticate,
  AuthController.updateUserPasswordById,
);

export default router;
