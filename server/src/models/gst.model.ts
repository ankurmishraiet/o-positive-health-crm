import { Schema, model, Types } from "mongoose";

const gstSchema = new Schema(
  {
    gstId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `GST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    gstNumber: {
      type: String,
      required: true
    },
    companyName: {
      type: String,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true,
      min: 2020
    },
    period: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annual"],
      default: "Monthly"
    },
    gstType: {
      type: String,
      enum: ["CGST", "SGST", "IGST", "UTGST", "Compensation Cess"],
      required: true
    },
    taxableAmount: {
      type: Number,
      required: true,
      min: 0
    },
    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 50
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionType: {
      type: String,
      enum: ["Sales", "Purchase", "Import", "Export", "Input Tax Credit", "Output Tax"],
      required: true
    },
    invoiceNumber: {
      type: String,
      required: true
    },
    invoiceDate: {
      type: Date,
      required: true
    },
    customerGstin: {
      type: String
    },
    customerName: {
      type: String,
      required: true
    },
    customerAddress: {
      type: String
    },
    supplierGstin: {
      type: String
    },
    supplierName: {
      type: String
    },
    supplierAddress: {
      type: String
    },
    placeOfSupply: {
      type: String,
      required: true
    },
    hsn: {
      type: String // HSN/SAC code
    },
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 0
    },
    unit: {
      type: String,
      default: "PCS"
    },
    rate: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Draft", "Filed", "Pending", "Error", "Cancelled"],
      default: "Draft"
    },
    filingDate: {
      type: Date
    },
    dueDate: {
      type: Date,
      required: true
    },
    penaltyAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    interestAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid", "Overdue"],
      default: "Unpaid"
    },
    paymentDate: {
      type: Date
    },
    paymentReference: {
      type: String
    },
    challanNumber: {
      type: String
    },
    bankName: {
      type: String
    },
    returnType: {
      type: String,
      enum: ["GSTR-1", "GSTR-2", "GSTR-3B", "GSTR-4", "GSTR-9", "GSTR-9C", "Other"],
      default: "GSTR-3B"
    },
    amendments: [{
      amendmentDate: { type: Date },
      reason: { type: String },
      previousAmount: { type: Number },
      newAmount: { type: Number },
      amendedBy: { type: Types.ObjectId, ref: "User" }
    }],
    attachments: [{
      fileName: { type: String },
      fileUrl: { type: String },
      fileType: { type: String },
      uploadDate: { type: Date, default: Date.now }
    }],
    remarks: {
      type: String
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    verifiedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    verifiedDate: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
gstSchema.index({ month: 1, year: 1 });
gstSchema.index({ gstNumber: 1 });
gstSchema.index({ status: 1 });
gstSchema.index({ paymentStatus: 1 });
gstSchema.index({ invoiceNumber: 1 });
gstSchema.index({ dueDate: 1 });
gstSchema.index({ returnType: 1 });

// Virtual for period string
gstSchema.virtual('periodString').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

// Virtual for overdue status
gstSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus !== 'Paid' && new Date() > this.dueDate;
});

// Virtual for total payable (including penalty and interest)
gstSchema.virtual('totalPayable').get(function() {
  return this.gstAmount + this.penaltyAmount + this.interestAmount;
});

// Pre-save middleware to calculate GST amount
gstSchema.pre('save', function(next) {
  this.gstAmount = (this.taxableAmount * this.gstRate) / 100;
  this.totalAmount = this.taxableAmount + this.gstAmount;
  
  // Check overdue status
  if (this.paymentStatus !== 'Paid' && new Date() > this.dueDate) {
    this.paymentStatus = 'Overdue';
  }
  
  next();
});

export const GST = model("GST", gstSchema);