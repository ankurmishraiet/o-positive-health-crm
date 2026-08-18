import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();

router.get("/stats", DashboardController.getStats);
router.get("/recent-activities", DashboardController.getRecentActivities);
router.get("/analytics/opd-ipd-trends", DashboardController.getOPDIPDTrends);
router.get("/analytics/department-distribution", DashboardController.getDepartmentWiseDistribution);
router.get("/analytics/revenue", DashboardController.getRevenueAnalytics);
router.get("/analytics/funnel", DashboardController.getFunnelData);

export default router;
