import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Patient directory routes
router.get("/search", PatientController.search);
router.get("/", PatientController.list);
router.get("/:id/history", PatientController.getPatientHistory);
router.get("/:id/status", PatientController.getPatientStatus);
router.get("/:id/appointments", PatientController.getPatientAppointments);
router.get("/:id/cabs", PatientController.getPatientCabBookings);
router.get("/:id/hospitals", PatientController.getPatientHospitals);

export default router;
