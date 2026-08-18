import { Schema, model, Types } from "mongoose";

const employeeSchema = new Schema(
  {
    name: String,
    dateOfBirth: Date,
    gender: String,
    email: { type: String, unique: true },
    phone: { type: String, unique: true },
    photo: String,
    aadharNumber: String,
    pancardNumber: String,
    previousEmployer: String,
    qualification: String,
    designation: String,
    address: String,
    reportsTo: { type: Types.ObjectId, ref: "Employee" },
    resume: String,
    loans: [{ type: Types.ObjectId, ref: "Loan" }],
    incentives: [
      {
        month: String,
        amount: Number,
      },
    ],
    department: String,
    salary: Number,
    employeeId: { type: String, unique: true },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
    joiningDate: { type: Date, default: Date.now },
    // User account management
    hasAccount: { type: Boolean, default: false },
    userId: { type: Types.ObjectId, ref: "User" },

    // New fields for enhanced employee management
    dateOfEnding: Date, // Date of ending previous job
    startingSalary: Number,
    increments: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        reason: String,
        previousSalary: Number,
        newSalary: Number,
      },
    ],
    alternateNumber: String,
    fatherName: String,
    experience: String, // Years of experience or description
    addressPresent: String,
    addressPermanent: String,

    // Bank details
    bankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      ifscCode: String,
      notes: String,
    },

    documents: [
      {
        documentType: {
          type: String,
          enum: [
            "Aadhar Card",
            "Pan Card",
            "Last Company Salary Slip",
            "Last Company Offer Letter",
            "Experience Certificate",
            "Passport Size Photo",
            "Resume",
            "Other",
          ],
        },
        documentName: String,
        documentUrl: String,
        uploadedDate: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Virtual field to calculate system age (months since joining)
employeeSchema.virtual("systemAgeMonths").get(function () {
  if (!this.joiningDate) return 0;
  const now = new Date();
  const joining = new Date(this.joiningDate);
  const months =
    (now.getFullYear() - joining.getFullYear()) * 12 +
    (now.getMonth() - joining.getMonth());
  return Math.max(0, months);
});

// Enable virtuals in JSON and Object output
employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.set("toObject", { virtuals: true });

export const Employee = model("Employee", employeeSchema);
