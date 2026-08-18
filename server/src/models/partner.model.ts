import { Schema, model } from "mongoose";

const partnerSchema = new Schema(
  {
    partnerId: {
      type: String,
      required: true,
      unique: true,
      default: function() {
        return `PART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Corporate", "Individual"],
      required: true,
    },
    businessType: {
      type: String,
      enum: ["Lab", "Insurance", "Diagnostic", "Pharmacy", "Hospital", "Clinic", "Agency", "Consultant", "Other"],
    },
    contactPerson: String,
    contactNumber: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    city: { type: String, required: true },
    state: String,
    location: {
      city: String,
      state: String,
      pin: String,
    },
    // Corporate specific fields
    companyName: String,
    gstNumber: String,
    panNumber: String,
    registrationNumber: String,
    companyType: {
      type: String,
      enum: ["Private Limited", "Public Limited", "LLP", "Partnership", "Sole Proprietorship", "Other"]
    },
    // Individual specific fields
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    aadharNumber: String,
    individualPanNumber: String,
    // Common fields
    services: [String],
    contractStartDate: { type: Date, required: true },
    contractEndDate: { type: Date, required: true },
    contractValue: Number,
    commissionRate: Number,
    paymentTerms: String,
    status: {
      type: String,
      enum: ["Active", "Inactive", "Pending", "Suspended", "Terminated"],
      default: "Active"
    },
    performanceMetrics: {
      totalReferrals: { type: Number, default: 0 },
      successfulConversions: { type: Number, default: 0 },
      totalCommissionEarned: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 }
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String
    },
    documents: [{
      documentType: {
        type: String,
        enum: ["Aadhar Card", "Pan Card", "Bank Account Details", "Other"]
      },
      documentName: String,
      documentUrl: String,
      uploadedDate: { type: Date, default: Date.now }
    }],
    isActive: { type: Boolean, default: true },
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
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
partnerSchema.index({ type: 1 });
partnerSchema.index({ status: 1 });
partnerSchema.index({ city: 1 });
partnerSchema.index({ businessType: 1 });
partnerSchema.index({ createdAt: -1 });

// Virtual for full name (for individuals)
partnerSchema.virtual('fullName').get(function() {
  if (this.type === 'Individual' && this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Virtual for contract status
partnerSchema.virtual('contractStatus').get(function() {
  const now = new Date();
  if (this.contractEndDate < now) {
    return 'Expired';
  } else if (this.contractStartDate > now) {
    return 'Future';
  }
  return 'Active';
});

// Virtual for conversion rate
partnerSchema.virtual('conversionRate').get(function() {
  if (this.performanceMetrics?.totalReferrals > 0) {
    return Math.round((this.performanceMetrics.successfulConversions / this.performanceMetrics.totalReferrals) * 100);
  }
  return 0;
});

export const Partner = model("Partner", partnerSchema);
