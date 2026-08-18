import { Schema, model, Types } from "mongoose";

const transactionSchema = new Schema(
  {
    transactionId: { 
      type: String, 
      required: true, 
      unique: true,
      default: function() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    type: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true,
    },
    category: {
      type: String,
      enum: [
        // Existing categories
        "Doctor Fee",
        "Hospital Commission", 
        "Cab Service",
        "Insurance Claim",
        "Patient Payment",
        "Marketing",
        "Salary",
        "Office Expenses",
        "Consumables",
        "GST Payment",
        "Other",
        // New Expense Categories
        "Remuneration",
        "Surgery Fees",
        "EMI Payment",
        "Commission",
        "Cab",
        "Loan Return",
        "Food",
        "Water",
        "Stationary",
        "IT",
        "Office Charges",
        "OPD Charges",
        "Reimbursement",
        "Advance Salary",
        "Miscellaneous",
        "Incentive",
        "Entertainment",
        "Company FD",
        "Other Expenses",
        // New Income Categories
        "Payment from Patient",
        "Payment from Hospital",
        "Advance Salary Return",
        "Loan Taken",
        "Fibe Loan",
        "FD Close",
        "Other Income"
      ],
      required: true,
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    description: { 
      type: String, 
      required: true 
    },
    source: { 
      type: String, 
      required: true,
      default: "Internal" 
    },
    reference: { 
      type: String,
      default: ""
    },
    entityType: {
      type: String,
      enum: ["Doctor", "Hospital", "Cab", "Patient", "Employee", "Partner", "Other"],
      default: "Other"
    },
    entityId: { 
      type: Types.ObjectId, 
      refPath: "entityType" 
    },
    patientId: { 
      type: Types.ObjectId, 
      ref: "Lead"
    },
    patientName: String,
    date: { 
      type: Date, 
      default: Date.now 
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Cancelled"],
      default: "Completed"
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Cheque", "Other"],
      default: "Other"
    },
    gstAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
transactionSchema.index({ date: -1 });
transactionSchema.index({ type: 1, category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.amount);
});

export const Transaction = model("Transaction", transactionSchema);