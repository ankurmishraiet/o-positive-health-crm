import { Schema, model, Types } from "mongoose";

const documentSchema = new Schema(
  {
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true }, // PDF, Image, Doc, etc.
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true }, // in bytes
    filePath: { type: String, required: true }, // server file path or S3 key
    fileUrl: { type: String, required: true }, // public URL

    // S3 integration fields
    s3Key: { type: String }, // S3 object key
    isS3Stored: { type: Boolean, default: false }, // flag to identify S3 vs local storage

    // Document categorization
    category: {
      type: String,
      required: true,
    },

    // Entity association
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },

    // Patient/Lead information
    patientName: String,
    patientId: String,
    hospital: String,

    // Upload information
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
    uploadedByName: String,
    uploadDate: { type: Date, default: Date.now },

    // Access tracking
    downloads: { type: Number, default: 0 },
    lastDownloaded: Date,
    downloadHistory: [
      {
        downloadedBy: { type: Types.ObjectId, ref: "User" },
        downloadedAt: { type: Date, default: Date.now },
        ipAddress: String,
      },
    ],

    // Status and metadata
    status: {
      type: String,
      enum: ["Active", "Archived", "Deleted"],
      default: "Active",
    },
    description: String,
    tags: [String],
    isConfidential: { type: Boolean, default: false },

    // Comments functionality
    comments: [
      {
        userId: { type: Types.ObjectId, ref: "User" },
        userName: String,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Salary slip specific fields
    salarySlipData: {
      employeeId: String,
      employeeName: String,
      designation: String,
      department: String,
      month: String,
      year: Number,
      basicSalary: Number,
      allowances: Number,
      deductions: Number,
      netSalary: Number,
      generatedDate: Date,
      emailSent: { type: Boolean, default: false },
      emailSentAt: Date,
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
documentSchema.index({ entityType: 1, entityId: 1 });
documentSchema.index({ category: 1, status: 1 });
documentSchema.index({ uploadedBy: 1, uploadDate: -1 });
documentSchema.index({ patientId: 1 });
documentSchema.index({
  "salarySlipData.employeeId": 1,
  "salarySlipData.month": 1,
  "salarySlipData.year": 1,
});

// Virtual for file size in human readable format
documentSchema.virtual("fileSizeFormatted").get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
});

// Method to increment download count
documentSchema.methods.recordDownload = function (
  userId: string,
  ipAddress?: string
) {
  this.downloads += 1;
  this.lastDownloaded = new Date();
  this.downloadHistory.push({
    downloadedBy: userId,
    downloadedAt: new Date(),
    ipAddress: ipAddress,
  });
  return this.save();
};

export const Document = model("Document", documentSchema);
