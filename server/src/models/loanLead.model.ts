import { Schema, model, Types } from "mongoose";

const loanLeadSchema = new Schema(
  {
    // Basic lead information
    leadName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    alternateNumber: String,
    email: String,
    
    // Location
    city: String,
    state: String,
    
    // Loan requirements
    loanAmount: { type: Number, required: true },
    purpose: String,
    treatmentType: String,
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    hospital: String,
    
    // Lead tracking
    status: {
      type: String,
      enum: ["Fresh", "Contacted", "Interested", "Not Interested", "Converted", "Lost"],
      default: "Fresh"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    },
    leadSource: String,
    
    // Assignment
    assignedTo: {
      type: Types.ObjectId,
      ref: "Employee"
    },
    assignedToName: String,
    
    // Conversion tracking
    convertedToLoanId: {
      type: Types.ObjectId,
      ref: "Loan"
    },
    convertedAt: Date,
    
    // Additional details
    notes: String,
    followUpDate: Date,
    lastContactedDate: Date,
    
    // Created by
    createdBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes for better query performance
loanLeadSchema.index({ createdAt: -1 });
loanLeadSchema.index({ status: 1, createdAt: -1 });
loanLeadSchema.index({ assignedTo: 1, createdAt: -1 });
loanLeadSchema.index({ contactNumber: 1 });
loanLeadSchema.index({ leadName: 'text', purpose: 'text' });

export const LoanLead = model("LoanLead", loanLeadSchema);
