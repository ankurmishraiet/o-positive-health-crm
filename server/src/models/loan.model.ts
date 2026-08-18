import { Schema, model, Types } from "mongoose";

const emiSchema = new Schema({
  emiNumber: String, // e.g., "3 of 24"
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "PAID", "OVERDUE"], default: "PENDING" },
  paidDate: Date,
  penaltyAmount: { type: Number, default: 0 },
  daysPastDue: { type: Number, default: 0 },
});

const applicantDetailsSchema = new Schema({
  fullName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  alternateNumber: String,
  email: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  dateOfBirth: Date,
  officeBusinessAddress: String,
  officeBusinessPincode: String,
});

const financialDetailsSchema = new Schema({
  occupation: String,
  monthlyIncome: Number,
  employerName: String,
  workExperience: String,
  isSalaryCreditedInBank: { type: Boolean, default: false },
  isPatientFilingITR: { type: Boolean, default: false },
});

const loanSchema = new Schema(
  {
    // Basic loan information
    leadId: { type: Types.ObjectId, ref: "Lead" },
    loanLeadId: { type: Types.ObjectId, ref: "LoanLead" }, // Track which loan lead this came from
    amount: { type: Number, required: true },
    approvedAmount: { type: Number, default: 0 },
    creditedAmount: { type: Number, default: 0 }, // after GST and deductions
    loanPurpose: {
      type: String,
      enum: ["Medical Treatment in our Hospital", "Medical Treatment in some other Hospital"]
    },
    treatmentType: String,
    urgency: String,
    hospital: String,
    doctorName: String,
    estimatedTreatmentCost: Number,

    // Applicant information
    applicantDetails: applicantDetailsSchema,
    financialDetails: financialDetailsSchema,

    // Loan terms
    interestRate: { type: Number, default: 12.5 },
    tenureMonths: { type: Number, default: 24 },
    emiAmount: Number,
    
    // Status and dates
    status: {
      type: String,
      enum: ["New", "Processing", "Under Review", "Approved", "Active", "Rejected", "Closed"],
      default: "New",
    },
    applicationDate: { type: Date, default: Date.now },
    approvalDate: Date,
    disbursalDate: Date,
    disbursementStatus: {
      type: String,
      enum: ["Pending", "Disbursed", "N/A"],
      default: "Pending",
    },

    // Assignment and tracking
    assignTo: String, // Legacy field - keep for backward compatibility
    assignedTo: {
      type: Types.ObjectId,
      ref: "Employee"
    },
    assignedToName: String,
    leadSource: String,
    priority: String,
    notes: String,

    // EMI and Payment tracking
    emiDetails: [emiSchema],
    totalOutstanding: Number,
    lastPaymentDate: Date,

    // Legacy fields for backward compatibility
    applicantType: {
      type: String,
      enum: ["Doctor", "Hospital", "Employee", "Patient"],
      default: "Patient",
    },
    applicantId: {
      type: Types.ObjectId,
      refPath: "applicantType",
    },

    // Documents
    disbursalLetterUrl: String,
    documents: [String], // Array of document URLs
  },
  { timestamps: true }
);

// Add virtual for applicant name from applicantDetails
loanSchema.virtual('applicantName').get(function() {
  return this.applicantDetails?.fullName || 'Unknown';
});

// Add virtual for loan type based on purpose
loanSchema.virtual('loanType').get(function() {
  if (this.loanPurpose) {
    return this.loanPurpose.includes('Emergency') ? 'Emergency Medical Loan' : 
           this.loanPurpose.includes('Equipment') ? 'Medical Equipment Loan' :
           'Healthcare Loan';
  }
  return 'Medical Loan';
});

// Method to calculate EMI schedule
loanSchema.methods.calculateEMISchedule = function() {
  if (!this.approvedAmount || !this.interestRate || !this.tenureMonths) return [];
  
  const principal = this.approvedAmount;
  const monthlyRate = this.interestRate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, this.tenureMonths)) / 
              (Math.pow(1 + monthlyRate, this.tenureMonths) - 1);
  
  this.emiAmount = Math.round(emi);
  
  const schedule = [];
  let balance = principal;
  const startDate = this.disbursalDate || new Date();
  
  for (let i = 1; i <= this.tenureMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    schedule.push({
      emiNumber: `${i} of ${this.tenureMonths}`,
      dueDate: dueDate,
      amount: this.emiAmount,
      status: 'PENDING',
      penaltyAmount: 0,
      daysPastDue: 0,
    });
  }
  
  this.emiDetails = schedule;
  this.totalOutstanding = principal;
  return schedule;
};

// Method to update overdue EMIs
loanSchema.methods.updateOverdueEMIs = function() {
  const today = new Date();
  let totalPenalty = 0;
  
  this.emiDetails.forEach((emi: any) => {
    if (emi.status === 'PENDING' && new Date(emi.dueDate) < today) {
      const daysPastDue = Math.floor((today.getTime() - new Date(emi.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      emi.daysPastDue = daysPastDue;
      emi.status = 'OVERDUE';
      
      // Calculate penalty: 2% of EMI amount per month overdue
      const monthsOverdue = Math.ceil(daysPastDue / 30);
      emi.penaltyAmount = Math.round(emi.amount * 0.02 * monthsOverdue);
      totalPenalty += emi.penaltyAmount;
    }
  });
  
  return totalPenalty;
};

export const Loan = model("Loan", loanSchema);
