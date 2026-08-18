import { Schema, model, Types } from "mongoose";

const paymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    patientId: {
      type: Types.ObjectId,
      ref: "Lead", // Using Lead as patient entity
      required: false
    },
    patientName: {
      type: String,
      required: true
    },
    patientPhone: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Credit Card", "Debit Card", "Cheque", "Insurance", "Other"],
      required: true
    },
    paymentType: {
      type: String,
      enum: ["Consultation", "Treatment", "Surgery", "Diagnostic", "Pharmacy", "Room Charges", "Subscription", "EMI Payment", "Surgery Amount", "Other"],
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Partial", "Completed", "Overdue", "Cancelled"],
      default: "Pending"
    },
    dueDate: {
      type: Date,
      required: true
    },
    paidDate: {
      type: Date
    },
    paymentReceivedDate: {
      type: Date
    },
    totalPaymentReceivable: {
      type: Number,
      min: 0,
      required: false
    },
    pendingPayment: {
      type: Number,
      default: 0,
      min: 0
    },
    receivedPayment: {
      type: Number,
      default: 0,
      min: 0
    },
    invoiceNumber: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    hospitalId: {
      type: Types.ObjectId,
      ref: "Hospital"
    },
    hospitalName: {
      type: String
    },
    doctorId: {
      type: Types.ObjectId,
      ref: "Doctor"
    },
    doctorName: {
      type: String
    },
    serviceType: {
      type: String,
      enum: ["OPD", "IPD", "Emergency", "Consultation", "Other"],
      default: "OPD"
    },
    gstAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionReference: {
      type: String
    },
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
paymentSchema.index({ patientId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ serviceType: 1 });

// Virtual for payment completion percentage
paymentSchema.virtual('completionPercentage').get(function() {
  if (this.amount === 0) return 0;
  return Math.round((this.paidAmount / this.amount) * 100);
});

// Virtual for overdue status
paymentSchema.virtual('isOverdue').get(function() {
  return this.status !== 'Completed' && new Date() > this.dueDate;
});

// Pre-save middleware to calculate pending amount
paymentSchema.pre('save', function(next) {
  this.pendingAmount = this.amount - this.paidAmount;
  
  // Auto-update status based on payment
  if (this.paidAmount === 0) {
    this.status = 'Pending';
  } else if (this.paidAmount >= this.amount) {
    this.status = 'Completed';
    this.paidDate = this.paidDate || new Date();
  } else {
    this.status = 'Partial';
  }
  
  // Check for overdue
  if (this.status !== 'Completed' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  
  next();
});

export const Payment = model("Payment", paymentSchema);