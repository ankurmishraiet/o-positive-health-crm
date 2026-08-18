import { Schema, model, Types } from "mongoose";

const incentiveSchema = new Schema(
  {
    incentiveId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `INC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    employeeId: {
      type: Types.ObjectId,
      ref: "Employee",
      required: true
    },
    employeeName: {
      type: String,
      required: true
    },
    employeeCode: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    designation: {
      type: String,
      required: true
    },
    incentiveType: {
      type: String,
      enum: [
        "Performance", 
        "Target Achievement", 
        "Bonus", 
        "Commission", 
        "Annual Bonus", 
        "Project Completion", 
        "Referral", 
        "Incentive on IPD",
        "Incentive on Loan/EMI",
        "Incentive on Subscription",
        "Incentive on Extra Cases",
        "Incentive on Insurance",
        "Employee of the Month",
        "Star Performer of the Month",
        "Other"
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: "INR"
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
    quarter: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4"]
    },
    criteria: {
      targetValue: { type: Number },
      achievedValue: { type: Number },
      achievementPercentage: { type: Number },
      kpiMetrics: [String],
      notes: { type: String, maxlength: 500 }
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Hold", "Cancelled"],
      default: "Pending"
    },
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ["With Salary", "Separate Transfer", "Cash", "Cheque", "Other"],
      default: "With Salary"
    },
    taxDeducted: {
      type: Number,
      default: 0,
      min: 0
    },
    netAmount: {
      type: Number,
      min: 0
    },
    approvalStatus: {
      type: String,
      enum: ["Draft", "Submitted", "Under Review", "Approved", "Rejected"],
      default: "Draft"
    },
    submittedDate: {
      type: Date
    },
    approvedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    approvedDate: {
      type: Date
    },
    rejectionReason: {
      type: String,
      maxlength: 500
    },
    documents: [{
      fileName: { type: String },
      fileUrl: { type: String },
      fileType: { type: String },
      uploadedDate: { type: Date, default: Date.now }
    }],
    reviewComments: {
      type: String,
      maxlength: 1000
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringFrequency: {
      type: String,
      enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly"]
    },
    nextPaymentDate: {
      type: Date
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
incentiveSchema.index({ employeeId: 1, month: 1, year: 1 });
incentiveSchema.index({ paymentStatus: 1 });
incentiveSchema.index({ approvalStatus: 1 });
incentiveSchema.index({ incentiveType: 1 });
incentiveSchema.index({ createdAt: -1 });
incentiveSchema.index({ department: 1 });

// Virtual for incentive period
incentiveSchema.virtual('incentivePeriod').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

// Virtual for achievement percentage
incentiveSchema.virtual('performancePercentage').get(function() {
  if (this.criteria?.targetValue && this.criteria?.achievedValue) {
    return Math.round((this.criteria.achievedValue / this.criteria.targetValue) * 100);
  }
  return 0;
});

// Pre-save middleware to calculate net amount and quarter
incentiveSchema.pre('save', function(next) {
  // Calculate net amount
  this.netAmount = this.amount - (this.taxDeducted || 0);
  
  // Calculate quarter based on month
  if (this.month >= 1 && this.month <= 3) {
    this.quarter = "Q4"; // Q4 of previous financial year (Jan-Mar)
  } else if (this.month >= 4 && this.month <= 6) {
    this.quarter = "Q1";
  } else if (this.month >= 7 && this.month <= 9) {
    this.quarter = "Q2";
  } else {
    this.quarter = "Q3";
  }
  
  // Calculate achievement percentage if criteria provided
  if (this.criteria?.targetValue && this.criteria?.achievedValue) {
    this.criteria.achievementPercentage = Math.round(
      (this.criteria.achievedValue / this.criteria.targetValue) * 100
    );
  }
  
  next();
});

export const Incentive = model("Incentive", incentiveSchema);