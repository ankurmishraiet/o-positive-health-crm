import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";

export const LeaveController = {
  async list(req: Request, res: Response) {
    try {
      const filters = {
        employeeId: req.query.employeeId as string,
        status: req.query.status as string,
        leaveType: req.query.leaveType as string,
        department: req.query.department as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const leaves = await LeaveService.list(filters);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leave = await LeaveService.getById(id);
      
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
      
      res.json(leave);
    } catch (error) {
      console.error("Error fetching leave:", error);
      res.status(500).json({ error: "Failed to fetch leave" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      // Get employee info from User model or request
      const { Employee } = require("../models/employee.model");
      const { User } = require("../models/user.model");
      const { Types } = require("mongoose");
      
      let employeeInfo;
      
      // Try to find employee by userId first
      const user = await User.findById(userId);
      if (user && user.employeeId) {
        // Check if user.employeeId is a valid ObjectId or employee code string
        if (Types.ObjectId.isValid(user.employeeId)) {
          employeeInfo = await Employee.findById(user.employeeId);
        } else {
          // If not valid ObjectId, try to find by employeeId field (employee code)
          employeeInfo = await Employee.findOne({ employeeId: user.employeeId });
        }
      }
      
      // If employeeId is provided in request, try to find employee
      if (!employeeInfo && req.body.employeeId) {
        // Check if it's a valid ObjectId format
        if (Types.ObjectId.isValid(req.body.employeeId)) {
          employeeInfo = await Employee.findById(req.body.employeeId);
        } else {
          // If not valid ObjectId, try to find by employeeId field (employee code)
          employeeInfo = await Employee.findOne({ employeeId: req.body.employeeId });
        }
      }
      
      // If still no employee found, return error
      if (!employeeInfo) {
        return res.status(400).json({ 
          error: "Employee information not found. Please ensure your account is linked to an employee profile." 
        });
      }

      // Calculate total days
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Build leave data without spreading req.body to avoid conflicts
      const leaveData = {
        leaveType: req.body.leaveType,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        reason: req.body.reason,
        replacementEmployee: req.body.replacementEmployee,
        employeeId: employeeInfo._id,
        employeeName: employeeInfo.name,
        employeeCode: employeeInfo.employeeId || employeeInfo._id.toString(),
        department: employeeInfo.department || "Not Specified",
        totalDays: req.body.totalDays || totalDays,
        createdBy: userId
      };

      const leave = await LeaveService.create(leaveData);
      res.status(201).json(leave);
    } catch (error: any) {
      console.error("Error creating leave:", error);
      res.status(500).json({ 
        error: "Failed to create leave",
        message: error.message 
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: (req as any).user?.id
      };

      const leave = await LeaveService.update(id, updateData);
      
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
      
      res.json(leave);
    } catch (error) {
      console.error("Error updating leave:", error);
      res.status(500).json({ error: "Failed to update leave" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const leave = await LeaveService.remove(id);
      
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
      
      res.json({ message: "Leave deleted successfully" });
    } catch (error) {
      console.error("Error deleting leave:", error);
      res.status(500).json({ error: "Failed to delete leave" });
    }
  },

  async getStats(req: Request, res: Response) {
    try {
      const stats = await LeaveService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching leave stats:", error);
      res.status(500).json({ error: "Failed to fetch leave stats" });
    }
  },

  async approveLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comments } = req.body;
      const approvedBy = (req as any).user?.id;

      const leave = await LeaveService.approveLeave(id, approvedBy, comments);
      
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
      
      res.json({ message: "Leave approved successfully", leave });
    } catch (error) {
      console.error("Error approving leave:", error);
      res.status(500).json({ error: "Failed to approve leave" });
    }
  },

  async rejectLeave(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const approvedBy = (req as any).user?.id;

      if (!rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const leave = await LeaveService.rejectLeave(id, approvedBy, rejectionReason);
      
      if (!leave) {
        return res.status(404).json({ error: "Leave not found" });
      }
      
      res.json({ message: "Leave rejected successfully", leave });
    } catch (error) {
      console.error("Error rejecting leave:", error);
      res.status(500).json({ error: "Failed to reject leave" });
    }
  },

  async getEmployeeLeaves(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const leaves = await LeaveService.getEmployeeLeaves(employeeId, year);
      res.json(leaves);
    } catch (error) {
      console.error("Error fetching employee leaves:", error);
      res.status(500).json({ error: "Failed to fetch employee leaves" });
    }
  },

  async getLeaveBalance(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;

      const balance = await LeaveService.getLeaveBalance(employeeId, year);
      res.json(balance);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
      res.status(500).json({ error: "Failed to fetch leave balance" });
    }
  },

  async bulkAction(req: Request, res: Response) {
    try {
      const { action, leaveIds, comments, rejectionReason } = req.body;
      const approvedBy = (req as any).user?.id;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'" });
      }

      if (!Array.isArray(leaveIds) || leaveIds.length === 0) {
        return res.status(400).json({ error: "Leave IDs array is required" });
      }

      if (action === 'reject' && !rejectionReason) {
        return res.status(400).json({ error: "Rejection reason is required for reject action" });
      }

      const results = [];
      for (const leaveId of leaveIds) {
        try {
          let result;
          if (action === 'approve') {
            result = await LeaveService.approveLeave(leaveId, approvedBy, comments);
          } else {
            result = await LeaveService.rejectLeave(leaveId, approvedBy, rejectionReason);
          }
          
          if (result) {
            results.push({ leaveId, success: true, leave: result });
          } else {
            results.push({ leaveId, success: false, error: "Leave not found" });
          }
        } catch (error) {
          results.push({ leaveId, success: false, error: error.message });
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
  }
};