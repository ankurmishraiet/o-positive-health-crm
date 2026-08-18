import { Reimbursement } from "../models/reimbursement.model";

export const ReimbursementService = {
  async create(data: any) {
    try {
      // Set default values
      const reimbursementData = {
        ...data,
        submissionDate: data.submissionDate || new Date(),
        status: data.status || "pending",
        requestId: `REQ${Date.now()}`, // Generate unique request ID
      };

      const reimbursement = await Reimbursement.create(reimbursementData);
      return reimbursement;
    } catch (error) {
      console.error("Error creating reimbursement:", error);
      throw new Error("Failed to create reimbursement request");
    }
  },

  async list(filters: any = {}) {
    try {
      const query: any = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.employeeId) {
        query.employeeId = filters.employeeId;
      }

      const reimbursements = await Reimbursement.find(query)
        .sort({ submissionDate: -1 })
        .lean();

      return {
        reimbursements,
        total: reimbursements.length
      };
    } catch (error) {
      console.error("Error listing reimbursements:", error);
      throw new Error("Failed to fetch reimbursements");
    }
  },

  async getById(id: string) {
    try {
      return await Reimbursement.findById(id).lean();
    } catch (error) {
      console.error("Error fetching reimbursement by ID:", error);
      throw new Error("Failed to fetch reimbursement");
    }
  },

  async update(id: string, data: any) {
    try {
      return await Reimbursement.findByIdAndUpdate(id, data, { new: true }).lean();
    } catch (error) {
      console.error("Error updating reimbursement:", error);
      throw new Error("Failed to update reimbursement");
    }
  },

  async updateStatus(id: string, status: string, reason?: string) {
    try {
      const updateData: any = { 
        status,
        processedDate: new Date()
      };
      
      if (reason) {
        updateData.rejectionReason = reason;
      }

      return await Reimbursement.findByIdAndUpdate(id, updateData, { new: true }).lean();
    } catch (error) {
      console.error("Error updating reimbursement status:", error);
      throw new Error("Failed to update reimbursement status");
    }
  },

  async getByEmployee(employeeId: string) {
    try {
      const reimbursements = await Reimbursement.find({ employeeId })
        .sort({ submissionDate: -1 })
        .lean();

      return {
        reimbursements,
        total: reimbursements.length
      };
    } catch (error) {
      console.error("Error fetching employee reimbursements:", error);
      throw new Error("Failed to fetch employee reimbursements");
    }
  },

  async getStats() {
    try {
      const [
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalAmount
      ] = await Promise.all([
        Reimbursement.countDocuments(),
        Reimbursement.countDocuments({ status: "pending" }),
        Reimbursement.countDocuments({ status: "approved" }),
        Reimbursement.countDocuments({ status: "rejected" }),
        Reimbursement.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ]);

      return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        totalAmount: totalAmount[0]?.total || 0
      };
    } catch (error) {
      console.error("Error fetching reimbursement stats:", error);
      throw new Error("Failed to fetch reimbursement statistics");
    }
  }
};
