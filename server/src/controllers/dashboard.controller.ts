import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export const DashboardController = {
  async getStats(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const stats = await DashboardService.getStats(user);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch dashboard stats",
        error: error.message,
      });
    }
  },

  async getRecentActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const user = (req as any).user;
      const activities = await DashboardService.getRecentActivities(limit, user);
      res.json(activities);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch recent activities",
        error: error.message,
      });
    }
  },

  async getOPDIPDTrends(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const period = (req.query.period as 'monthly' | 'yearly') || 'monthly';
      const trends = await DashboardService.getOPDIPDTrends(period, user);
      res.json(trends);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch OPD/IPD trends",
        error: error.message,
      });
    }
  },

  async getDepartmentWiseDistribution(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const distribution = await DashboardService.getDepartmentWiseDistribution(user);
      res.json(distribution);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch department distribution",
        error: error.message,
      });
    }
  },

  async getRevenueAnalytics(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const period = (req.query.period as 'daily' | 'monthly' | 'yearly') || 'monthly';
      const analytics = await DashboardService.getRevenueAnalytics(period, user);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch revenue analytics",
        error: error.message,
      });
    }
  },

  async getFunnelData(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const funnelData = await DashboardService.getFunnelData(user);
      res.json(funnelData);
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch funnel data",
        error: error.message,
      });
    }
  },
};
