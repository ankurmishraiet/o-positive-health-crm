import { Schema, model, Types } from "mongoose";

const leaveSchema = new Schema(
  {
    leaveId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `LEAVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    leaveType: {
      type: String,
      enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Maternity Leave", "Paternity Leave", "Emergency Leave", "Other"],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending"
    },
    appliedDate: {
      type: Date,
      default: Date.now
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
    comments: {
      type: String,
      maxlength: 1000
    },
    isHalfDay: {
      type: Boolean,
      default: false
    },
    contactDuringLeave: {
      phone: { type: String },
      email: { type: String },
      address: { type: String }
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relationship: { type: String }
    },
    medicalCertificate: {
      type: String // URL to uploaded medical certificate
    },
    handoverNotes: {
      type: String,
      maxlength: 1000
    },
    replacementEmployee: {
      type: Types.ObjectId,
      ref: "Employee"
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
leaveSchema.index({ employeeId: 1, startDate: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ leaveType: 1 });
leaveSchema.index({ appliedDate: -1 });
leaveSchema.index({ department: 1 });

// Virtual for leave duration calculation
leaveSchema.virtual('leaveDuration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return this.isHalfDay ? diffDays - 0.5 : diffDays;
  }
  return 0;
});

// Virtual for leave status color
leaveSchema.virtual('statusColor').get(function() {
  const colors = {
    'Pending': 'orange',
    'Approved': 'green',
    'Rejected': 'red',
    'Cancelled': 'gray'
  };
  return colors[this.status] || 'gray';
});

// Pre-save middleware to calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.totalDays = this.isHalfDay ? diffDays - 0.5 : diffDays;
  }
  next();
});

export const Leave = model("Leave", leaveSchema);