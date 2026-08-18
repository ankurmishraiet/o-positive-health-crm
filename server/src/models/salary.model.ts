import { Schema, model, Types } from "mongoose";

const salarySchema = new Schema(
  {
    salaryId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `SAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },
    allowances: {
      hra: { type: Number, default: 0, min: 0 },
      da: { type: Number, default: 0, min: 0 },
      conveyance: { type: Number, default: 0, min: 0 },
      medical: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    incentives: {
      performance: { type: Number, default: 0, min: 0 },
      target: { type: Number, default: 0, min: 0 },
      bonus: { type: Number, default: 0, min: 0 },
      commission: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    deductions: {
      pf: { type: Number, default: 0, min: 0 },
      esi: { type: Number, default: 0, min: 0 },
      tds: { type: Number, default: 0, min: 0 },
      insurance: { type: Number, default: 0, min: 0 },
      loan: { type: Number, default: 0, min: 0 },
      advance: { type: Number, default: 0, min: 0 },
      other: { type: Number, default: 0, min: 0 }
    },
    totalAllowances: {
      type: Number,
      default: 0
    },
    totalIncentives: {
      type: Number,
      default: 0
    },
    totalDeductions: {
      type: Number,
      default: 0
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Paid", "Partially Paid", "Unpaid", "Hold", "Cancelled"],
      default: "Pending"
    },
    partiallyPaidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    paymentDate: {
      type: Date
    },
    paymentMethod: {
      type: String,
      enum: ["Bank Transfer", "Cash", "Cheque", "UPI", "Other"],
      default: "Bank Transfer"
    },
    bankDetails: {
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String }
    },
    workingDays: {
      type: Number,
      required: true,
      min: 0,
      max: 31
    },
    presentDays: {
      type: Number,
      required: true,
      min: 0,
      max: 31
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimeRate: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimeAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    leavesTaken: {
      type: Number,
      default: 0,
      min: 0
    },
    leaveDeduction: {
      type: Number,
      default: 0,
      min: 0
    },
    salarySlipUrl: {
      type: String
    },
    remarks: {
      type: String
    },
    approvedBy: {
      type: Types.ObjectId,
      ref: "User"
    },
    approvedDate: {
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
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ paymentStatus: 1 });
salarySchema.index({ month: 1, year: 1 });
salarySchema.index({ createdAt: -1 });
salarySchema.index({ department: 1 });

// Virtual for salary period
salarySchema.virtual('salaryPeriod').get(function() {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[this.month - 1]} ${this.year}`;
});

// Virtual for attendance percentage
salarySchema.virtual('attendancePercentage').get(function() {
  if (this.workingDays === 0) return 0;
  return Math.round((this.presentDays / this.workingDays) * 100);
});

// Pre-save middleware to calculate totals
salarySchema.pre('save', function(next) {
  // Calculate total allowances
  this.totalAllowances = Object.values(this.allowances).reduce((sum, val) => sum + val, 0);
  
  // Calculate total incentives
  this.totalIncentives = Object.values(this.incentives).reduce((sum, val) => sum + val, 0);
  
  // Calculate total deductions
  this.totalDeductions = Object.values(this.deductions).reduce((sum, val) => sum + val, 0);
  
  // Calculate overtime amount
  this.overtimeAmount = this.overtimeHours * this.overtimeRate;
  
  // Calculate gross salary
  this.grossSalary = this.basicSalary + this.totalAllowances + this.totalIncentives + this.overtimeAmount;
  
  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions - this.leaveDeduction;
  
  next();
});

export const Salary = model("Salary", salarySchema);