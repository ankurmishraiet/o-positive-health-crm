import { Schema, model, Types } from "mongoose";

const ReimbursementSchema = new Schema(
  {
    requestId: {
      type: String,
      unique: true,
      sparse: true
    },
    employeeId: { 
      type: Types.ObjectId, 
      ref: "Employee", 
      required: true 
    },
    employeeName: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["Travel", "Medical", "Communication", "Equipment", "Training", "Other"],
      default: "Other"
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    purpose: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processing"],
      default: "pending"
    },
    receiptFile: {
      type: String
    },
    attachments: [{
      type: String
    }],
    approvedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    approvedDate: {
      type: Date
    },
    processedDate: {
      type: Date
    },
    rejectionReason: {
      type: String
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "Cheque"],
      default: "Bank Transfer"
    },
    paymentDate: {
      type: Date
    },
    remarks: {
      type: String
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries
ReimbursementSchema.index({ employeeId: 1, submissionDate: -1 });
ReimbursementSchema.index({ status: 1 });
ReimbursementSchema.index({ category: 1 });

export const Reimbursement = model("Reimbursement", ReimbursementSchema);
