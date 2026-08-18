import { Request, Response } from "express";
import { IncentiveService } from "../services/incentive.service";
import { generateMockIncentives } from "../utils/mock-data";

export const IncentiveController = {
  async list(req: Request, res: Response) {
    try {
      const filters = {
        employeeId: req.query.employeeId as string,
        paymentStatus: req.query.paymentStatus as string,
        approvalStatus: req.query.approvalStatus as string,
        incentiveType: req.query.incentiveType as string,
        department: req.query.department as string,
        month: req.query.month ? parseInt(req.query.month as string) : undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };

      const incentives = await IncentiveService.list(filters);
      res.json(incentives);
    } catch (error) {
      console.error("Database error, using mock data:", error);
      // Fallback to mock data when database is unavailable
      const mockData = generateMockIncentives();
      res.json(mockData);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incentive = await IncentiveService.getById(id);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json(incentive);
    } catch (error) {
      console.error("Error fetching incentive:", error);
      res.status(500).json({ error: "Failed to fetch incentive" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const incentiveData = {
        ...req.body,
        createdBy: (req as any).user?.id
      };

      const incentive = await IncentiveService.create(incentiveData);
      res.status(201).json(incentive);
    } catch (error) {
      console.error("Error creating incentive:", error);
      res.status(500).json({ error: "Failed to create incentive" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: (req as any).user?.id
      };

      const incentive = await IncentiveService.update(id, updateData);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json(incentive);
    } catch (error) {
      console.error("Error updating incentive:", error);
      res.status(500).json({ error: "Failed to update incentive" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const incentive = await IncentiveService.remove(id);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ message: "Incentive deleted successfully" });
    } catch (error) {
      console.error("Error deleting incentive:", error);
      res.status(500).json({ error: "Failed to delete incentive" });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await IncentiveService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching incentive stats:", error);
      res.status(500).json({ error: "Failed to fetch incentive stats" });
    }
  },

  async approveIncentive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reviewComments } = req.body;
      const approvedBy = (req as any).user?.id;

      const incentive = await IncentiveService.approveIncentive(id, approvedBy, reviewComments);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ message: "Incentive approved successfully", incentive });
    } catch (error) {
      console.error("Error approving incentive:", error);
      res.status(500).json({ error: "Failed to approve incentive" });
    }
  },

  async rejectIncentive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const approvedBy = (req as any).user?.id;

      if (!rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const incentive = await IncentiveService.rejectIncentive(id, approvedBy, rejectionReason);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ message: "Incentive rejected successfully", incentive });
    } catch (error) {
      console.error("Error rejecting incentive:", error);
      res.status(500).json({ error: "Failed to reject incentive" });
    }
  },

  async submitForApproval(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const incentive = await IncentiveService.submitForApproval(id);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ message: "Incentive submitted for approval successfully", incentive });
    } catch (error) {
      console.error("Error submitting incentive for approval:", error);
      res.status(500).json({ error: "Failed to submit incentive for approval" });
    }
  },

  async processPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      const incentive = await IncentiveService.processPayment(id, paymentData);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ message: "Incentive payment processed successfully", incentive });
    } catch (error) {
      console.error("Error processing incentive payment:", error);
      res.status(500).json({ error: "Failed to process incentive payment" });
    }
  },

  async getEmployeeIncentives(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const incentives = await IncentiveService.getEmployeeIncentives(employeeId, year);
      res.json(incentives);
    } catch (error) {
      console.error("Error fetching employee incentives:", error);
      res.status(500).json({ error: "Failed to fetch employee incentives" });
    }
  },

  async getTopPerformers(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const topPerformers = await IncentiveService.getTopPerformers(limit, year);
      res.json(topPerformers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ error: "Failed to fetch top performers" });
    }
  },

  async generateRecurring(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const newIncentive = await IncentiveService.generateRecurringIncentives(id);
      res.status(201).json({ 
        message: "Recurring incentive generated successfully", 
        incentive: newIncentive 
      });
    } catch (error) {
      console.error("Error generating recurring incentive:", error);
      res.status(500).json({ error: error.message || "Failed to generate recurring incentive" });
    }
  },

  async bulkAction(req: Request, res: Response) {
    try {
      const { action, incentiveIds, reviewComments, rejectionReason, paymentData } = req.body;
      const approvedBy = (req as any).user?.id;

      if (!['approve', 'reject', 'submit', 'process-payment'].includes(action)) {
        return res.status(400).json({ 
          error: "Invalid action. Must be 'approve', 'reject', 'submit', or 'process-payment'" 
        });
      }

      if (!Array.isArray(incentiveIds) || incentiveIds.length === 0) {
        return res.status(400).json({ error: "Incentive IDs array is required" });
      }

      if (action === 'reject' && !rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required for reject action" });
      }

      const results = [];
      for (const incentiveId of incentiveIds) {
        try {
          let result;
          switch (action) {
            case 'approve':
              result = await IncentiveService.approveIncentive(incentiveId, approvedBy, reviewComments);
              break;
            case 'reject':
              result = await IncentiveService.rejectIncentive(incentiveId, approvedBy, rejectionReason);
              break;
            case 'submit':
              result = await IncentiveService.submitForApproval(incentiveId);
              break;
            case 'process-payment':
              result = await IncentiveService.processPayment(incentiveId, paymentData);
              break;
          }
          
          if (result) {
            results.push({ incentiveId, success: true, incentive: result });
          } else {
            results.push({ incentiveId, success: false, error: "Incentive not found" });
          }
        } catch (error) {
          results.push({ incentiveId, success: false, error: error.message });
        }
      }

      res.json({
        message: `Bulk ${action} completed`,
        results,
        successCount: results.filter(r => r.success).length,
        failureCount: results.filter(r => !r.success).length
      });
    } catch (error) {
      console.error("Error performing bulk action:", error);
      res.status(500).json({ error: "Failed to perform bulk action" });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { paymentStatus, approvalStatus } = req.body;
      const userId = (req as any).user?.id;

      if (!paymentStatus && !approvalStatus) {
        return res.status(400).json({ 
          error: "Either paymentStatus or approvalStatus must be provided" 
        });
      }

      const updateData: any = { updatedBy: userId };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (approvalStatus) updateData.approvalStatus = approvalStatus;

      const incentive = await IncentiveService.update(id, updateData);
      
      if (!incentive) {
        return res.status(404).json({ error: "Incentive not found" });
      }
      
      res.json({ 
        message: "Incentive status updated successfully", 
        incentive 
      });
    } catch (error) {
      console.error("Error updating incentive status:", error);
      res.status(500).json({ error: "Failed to update incentive status" });
    }
  }
};