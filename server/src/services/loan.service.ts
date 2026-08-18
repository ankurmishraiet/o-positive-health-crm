import { Loan } from "../models/loan.model";
import { LoanLeadService } from "./loanLead.service";

export const LoanService = {
  async create(data: any) {
    const loan = new Loan(data);
    
    // If created from a loan lead, mark the lead as converted
    if (data.loanLeadId) {
      try {
        await LoanLeadService.convertToLoan(data.loanLeadId, loan._id.toString());
      } catch (error) {
        console.error("Error converting loan lead:", error);
      }
    }
    
    // If loan is approved, calculate EMI schedule
    if (data.status === 'Approved' && data.approvedAmount && data.interestRate && data.tenureMonths) {
      (loan as any).calculateEMISchedule();
    }
    
    return await loan.save();
  },

  async list(filters: any = {}) {
    const query: any = {};
    
    // Search functionality
    if (filters.search) {
      query.$or = [
        { 'applicantDetails.fullName': { $regex: filters.search, $options: 'i' } },
        { loanPurpose: { $regex: filters.search, $options: 'i' } },
        { hospital: { $regex: filters.search, $options: 'i' } },
        { applicantId: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
    
    const loans = await Loan.find(query)
      .populate("applicantId")
      .populate("assignedTo", "name employeeCode department designation")
      .lean();
    
    // Transform data to match frontend expectations
    return loans.map(loan => ({
      ...loan,
      id: loan._id,
      applicantName: loan.applicantDetails?.fullName || 'Unknown',
      loanType: this.getLoanType(loan.loanPurpose),
      loanAmount: loan.amount,
      emi: loan.emiAmount,
      applicationDate: loan.applicationDate || loan.createdAt,
      assignedToName: loan.assignedToName || (loan.assignedTo as any)?.name || loan.assignTo,
    }));
  },

  async getById(id: string) {
    const loan = await Loan.findById(id)
      .populate("applicantId")
      .populate("assignedTo", "name employeeCode department designation")
      .lean();
    if (!loan) return null;
    
    return {
      ...loan,
      id: loan._id,
      applicantName: loan.applicantDetails?.fullName || 'Unknown',
      loanType: this.getLoanType(loan.loanPurpose),
      assignedToName: loan.assignedToName || (loan.assignedTo as any)?.name || loan.assignTo,
    };
  },

  async updateStatus(id: string, status: string) {
    const loan = await Loan.findById(id);
    if (!loan) throw new Error("Loan not found");
    
    // Validate status
    const validStatuses = ["New", "Processing", "Under Review", "Approved", "Active", "Rejected", "Closed"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status");
    }
    
    (loan as any).status = status;
    
    // If approved and EMI schedule not created, create it
    if (status === 'Approved' && loan.approvedAmount && (!loan.emiDetails || loan.emiDetails.length === 0)) {
      (loan as any).calculateEMISchedule();
    }
    
    if (status === 'Approved') {
      loan.approvalDate = new Date();
    }
    
    return await loan.save();
  },

  async updateLoan(id: string, updateData: any) {
    const loan = await Loan.findByIdAndUpdate(id, updateData, { new: true });
    if (!loan) return null;
    
    // Recalculate EMI if loan terms changed
    if (updateData.approvedAmount || updateData.interestRate || updateData.tenureMonths) {
      (loan as any).calculateEMISchedule();
      await loan.save();
    }
    
    return loan;
  },

  async deleteLoan(id: string) {
    return await Loan.findByIdAndDelete(id);
  },

  async uploadDisbursalLetter(id: string, url: string) {
    return await Loan.findByIdAndUpdate(
      id,
      { 
        disbursalLetterUrl: url,
        disbursalDate: new Date(),
        disbursementStatus: 'Disbursed',
        status: 'Active'
      },
      { new: true }
    );
  },

  async getPendingPayments() {
    const loans = await Loan.find({
      status: { $in: ['Active', 'Approved'] },
      'emiDetails.status': { $in: ['PENDING', 'OVERDUE'] }
    }).lean();

    const pendingPayments = [];
    
    for (const loan of loans) {
      // Update overdue status
      const loanDoc = await Loan.findById(loan._id);
      if (loanDoc) {
        (loanDoc as any).updateOverdueEMIs();
        await loanDoc.save();
      }
      
      // Get pending/overdue EMIs
      const pendingEmis = loan.emiDetails?.filter((emi: any) => 
        emi.status === 'PENDING' || emi.status === 'OVERDUE'
      ) || [];
      
      for (const emi of pendingEmis) {
        pendingPayments.push({
          id: `${loan._id}-${emi.emiNumber}`,
          borrowerName: loan.applicantDetails?.fullName || 'Unknown',
          loanId: loan._id,
          loanAmount: loan.amount,
          emiAmount: emi.amount,
          dueDate: emi.dueDate,
          daysPastDue: emi.daysPastDue || 0,
          totalOutstanding: loan.totalOutstanding || loan.amount,
          emiNumber: emi.emiNumber,
          contactNumber: loan.applicantDetails?.contactNumber || '',
          status: emi.status === 'OVERDUE' ? 'Overdue' : 'Due',
          lastPaymentDate: loan.lastPaymentDate,
          penaltyAmount: emi.penaltyAmount || 0,
        });
      }
    }
    
    return pendingPayments;
  },

  async processPayment(loanId: string, emiNumber: string, paymentData: any) {
    const loan = await Loan.findById(loanId);
    if (!loan) throw new Error("Loan not found");
    
    const emi = loan.emiDetails?.find((e: any) => e.emiNumber === emiNumber);
    if (!emi) throw new Error("EMI not found");
    
    // Update EMI status
    (emi as any).status = 'PAID';
    (emi as any).paidDate = new Date();
    (emi as any).daysPastDue = 0;
    (emi as any).penaltyAmount = 0;
    
    // Update loan
    loan.lastPaymentDate = new Date();
    loan.totalOutstanding = Math.max(0, (loan.totalOutstanding || loan.amount) - emi.amount);
    
    // Check if loan is fully paid
    const pendingEmis = loan.emiDetails?.filter((e: any) => e.status !== 'PAID') || [];
    if (pendingEmis.length === 0) {
      (loan as any).status = 'Closed';
    }
    
    await loan.save();
    return loan;
  },

  async getLoanStatistics() {
    const totalLoans = await Loan.countDocuments();
    const approvedLoans = await Loan.countDocuments({ status: { $in: ['Approved', 'Active'] } });
    const totalAmount = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const approvedAmount = await Loan.aggregate([
      { $match: { status: { $in: ['Approved', 'Active'] } } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } }
    ]);
    
    return {
      totalLoans,
      approvedLoans,
      totalAmount: totalAmount[0]?.total || 0,
      approvedAmount: approvedAmount[0]?.total || 0,
    };
  },

  getLoanType(loanPurpose: string) {
    if (!loanPurpose) return 'Medical Loan';
    if (loanPurpose.includes('Emergency')) return 'Emergency Medical Loan';
    if (loanPurpose.includes('Equipment')) return 'Medical Equipment Loan';
    return 'Healthcare Loan';
  },
};
