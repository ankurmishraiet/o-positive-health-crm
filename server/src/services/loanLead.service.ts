import { LoanLead } from "../models/loanLead.model";

export const LoanLeadService = {
  async create(data: any) {
    const loanLead = new LoanLead(data);
    return await loanLead.save();
  },

  async list(filters: any = {}) {
    const query: any = {};
    
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.status = { $in: filters.status };
      } else {
        query.status = filters.status;
      }
    }
    
    if (filters.assignedTo) {
      query.assignedTo = filters.assignedTo;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    if (filters.search) {
      query.$or = [
        { leadName: { $regex: filters.search, $options: 'i' } },
        { contactNumber: { $regex: filters.search, $options: 'i' } },
        { purpose: { $regex: filters.search, $options: 'i' } },
      ];
    }
    
    const loanLeads = await LoanLead.find(query)
      .populate("assignedTo", "name employeeCode department designation")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform data for frontend
    return loanLeads.map(lead => ({
      ...lead,
      id: lead._id,
      assignedToName: lead.assignedToName || (lead.assignedTo as any)?.name,
    }));
  },

  async getById(id: string) {
    const loanLead = await LoanLead.findById(id)
      .populate("assignedTo", "name employeeCode department designation")
      .populate("createdBy", "name email")
      .populate("convertedToLoanId")
      .lean();
    
    if (!loanLead) return null;
    
    return {
      ...loanLead,
      id: loanLead._id,
      assignedToName: loanLead.assignedToName || (loanLead.assignedTo as any)?.name,
    };
  },

  async update(id: string, updateData: any) {
    const loanLead = await LoanLead.findByIdAndUpdate(id, updateData, { new: true });
    return loanLead;
  },

  async updateStatus(id: string, status: string) {
    const loanLead = await LoanLead.findById(id);
    if (!loanLead) throw new Error("Loan lead not found");
    
    const validStatuses = ["Fresh", "Contacted", "Interested", "Not Interested", "Converted", "Lost"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }
    
    (loanLead as any).status = status;
    
    if (status === "Contacted" && !loanLead.lastContactedDate) {
      loanLead.lastContactedDate = new Date();
    }
    
    return await loanLead.save();
  },

  async delete(id: string) {
    return await LoanLead.findByIdAndDelete(id);
  },

  async convertToLoan(id: string, loanId: string) {
    const loanLead = await LoanLead.findById(id);
    if (!loanLead) throw new Error("Loan lead not found");
    
    loanLead.convertedToLoanId = loanId as any;
    loanLead.convertedAt = new Date();
    (loanLead as any).status = "Converted";
    
    return await loanLead.save();
  },

  async getStatistics() {
    const totalLeads = await LoanLead.countDocuments();
    const freshLeads = await LoanLead.countDocuments({ status: "Fresh" });
    const contactedLeads = await LoanLead.countDocuments({ status: "Contacted" });
    const interestedLeads = await LoanLead.countDocuments({ status: "Interested" });
    const convertedLeads = await LoanLead.countDocuments({ status: "Converted" });
    
    const totalAmount = await LoanLead.aggregate([
      { $group: { _id: null, total: { $sum: '$loanAmount' } } }
    ]);
    
    const highPriorityLeads = await LoanLead.countDocuments({ priority: "High" });
    
    return {
      totalLeads,
      freshLeads,
      contactedLeads,
      interestedLeads,
      convertedLeads,
      totalAmount: totalAmount[0]?.total || 0,
      highPriorityLeads,
    };
  },
};
