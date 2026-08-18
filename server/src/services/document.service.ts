import { Document } from "../models/document.model";
import { Employee } from "../models/employee.model";
import { s3Service } from "./s3.service";
import fs from "fs";
import path from "path";

export const DocumentService = {
  async create(documentData: any) {
    return await Document.create(documentData);
  },

  async list(filters: any = {}) {
    const query: any = { status: "Active" };

    if (filters.category) query.category = filters.category;
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.patientId) query.patientId = filters.patientId;
    if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;

    const documents = await Document.find(query)
      .populate("uploadedBy", "name email")
      .sort({ uploadDate: -1 })
      .lean();

    return documents.map((doc) => ({
      ...doc,
      id: doc._id,
      fileSize: this.formatFileSize(doc.fileSize),
      uploadedByName:
        doc.uploadedByName || (doc.uploadedBy as any)?.name || "Unknown",
    }));
  },

  async getById(id: string) {
    const document = await Document.findById(id)
      .populate("uploadedBy", "name email")
      .lean();

    if (!document) return null;

    return {
      ...document,
      id: document._id,
      fileSize: this.formatFileSize(document.fileSize),
      uploadedByName:
        document.uploadedByName ||
        (document.uploadedBy as any)?.name ||
        "Unknown",
    };
  },

  async update(id: string, updateData: any) {
    return await Document.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id: string) {
    const document = await Document.findById(id);
    if (!document) throw new Error("Document not found");

    // Mark as deleted instead of actually deleting
    document.status = "Deleted";
    await document.save();

    // Optionally delete the physical file
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }

    return document;
  },

  async download(id: string, userId: string, ipAddress?: string) {
    const document = await Document.findById(id);
    if (!document) throw new Error("Document not found");

    // Record the download - manually update
    document.downloads += 1;
    document.lastDownloaded = new Date();
    document.downloadHistory.push({
      downloadedBy: userId as any,
      downloadedAt: new Date(),
      ipAddress: ipAddress,
    });
    await document.save();

    // Ensure filename has proper extension based on mime type
    let downloadFileName = document.originalName;
    if (downloadFileName && !downloadFileName.includes(".")) {
      // If originalName has no extension, add one based on mime type
      const extension = this.getFileExtensionFromMimeType(document.mimeType);
      downloadFileName = `${downloadFileName}.${extension}`;
    } else if (downloadFileName) {
      // Verify the extension matches the mime type
      const currentExt = downloadFileName.split(".").pop()?.toLowerCase();
      const expectedExt = this.getFileExtensionFromMimeType(document.mimeType);
      if (currentExt !== expectedExt && expectedExt !== "file") {
        // Replace incorrect extension with correct one
        const nameWithoutExt = downloadFileName.substring(
          0,
          downloadFileName.lastIndexOf(".")
        );
        downloadFileName = `${nameWithoutExt}.${expectedExt}`;
      }
    }

    // If document is stored in S3, return presigned URL
    if (document.isS3Stored && document.s3Key && s3Service.isConfigured()) {
      try {
        const presignedUrl = await s3Service.getPresignedDownloadUrl(
          document.s3Key
        );
        return {
          filePath: null,
          fileName: downloadFileName,
          mimeType: document.mimeType,
          downloadUrl: presignedUrl,
          isS3: true,
        };
      } catch (error) {
        console.error("Failed to generate S3 presigned URL:", error);
        throw new Error("Failed to generate download URL");
      }
    }

    // Return local file path for local storage
    return {
      filePath: document.filePath,
      fileName: downloadFileName,
      mimeType: document.mimeType,
      downloadUrl: null,
      isS3: false,
    };
  },

  async upload(fileData: any, documentMeta: any, userId: string) {
    let fileUrl = `/uploads/${fileData.filename}`;
    let filePath = fileData.path;
    let s3Key: string | null = null;

    console.log("Uploading file:", fileData);

    // Only attempt S3 upload if configured
    if (s3Service.isConfigured()) {
      try {
        if (fileData.location) {
          // File was uploaded directly to S3 via multer-s3
          fileUrl = fileData.location;
          s3Key = fileData.key;
          filePath = fileData.key; // Store S3 key as path for S3 files
        } else {
          // Upload existing local file to S3
          const fileBuffer = fs.readFileSync(fileData.path);

          // ✅ Use fallback filename if originalname is missing
          const fallbackName = `file-${Date.now()}.bin`;
          const fileName = fileData.originalname || fallbackName;

          // ✅ Use safe fallback content type
          const contentType = fileData.mimetype || "application/octet-stream";

          // Upload to S3
          fileUrl = await s3Service.uploadFile(
            fileBuffer,
            fileName,
            contentType
          );

          // Extract the S3 key from the returned URL
          const urlParts = fileUrl.split("/");
          s3Key = urlParts.slice(-2).join("/"); // e.g. documents/filename.ext

          // ✅ Clean up local file safely
          try {
            fs.unlinkSync(fileData.path);
          } catch (cleanupError) {
            console.warn("Failed to delete local file:", cleanupError);
          }

          filePath = s3Key;
        }
      } catch (error) {
        console.error(
          "S3 upload failed, falling back to local storage:",
          error
        );
        // Fallback to local file URL
        fileUrl = `/uploads/${fileData.filename}`;
        filePath = fileData.path;
      }
    }

    // Generate filename with fallback
    const generatedFileName = fileData.filename || `file-${Date.now()}-${Math.floor(Math.random() * 10000)}${path.extname(fileData.originalname || '.bin')}`;
    const originalFileName = fileData.originalname || generatedFileName;

    const documentData = {
      fileName: generatedFileName,
      originalName: originalFileName,
      fileType: this.getFileType(fileData.mimetype),
      mimeType: fileData.mimetype,
      fileSize: fileData.size,
      filePath: filePath,
      fileUrl: fileUrl,
      s3Key: s3Key,
      isS3Stored: !!s3Key,
      category: documentMeta.category || "Other",
      entityType: documentMeta.entityType || "Patient",
      entityId: documentMeta.entityId,
      patientName: documentMeta.patientName,
      patientId: documentMeta.patientId,
      hospital: documentMeta.hospital,
      uploadedBy: userId,
      uploadedByName: documentMeta.uploadedByName,
      description: documentMeta.description,
      tags: documentMeta.tags ? documentMeta.tags.split(",") : [],
      isConfidential: documentMeta.isConfidential || false,
    };

    return await this.create(documentData);
  },

  // Salary Slip specific methods
  async generateSalarySlip(
    employeeId: string,
    month: string,
    year: number,
    salaryData: any,
    userId: string
  ) {
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    // Generate PDF (placeholder for now - would use a PDF library)
    const fileName = `salary_slip_${employee.name}_${month}_${year}.pdf`;
    const filePath = path.join(process.cwd(), "uploads", fileName);

    // TODO: Implement actual PDF generation using libraries like puppeteer or jsPDF
    // For now, create a placeholder file
    const pdfContent = this.generateSalarySlipPDF(
      employee,
      month,
      year,
      salaryData
    );
    fs.writeFileSync(filePath, pdfContent);

    const documentData = {
      fileName: fileName,
      originalName: fileName,
      fileType: "PDF",
      mimeType: "application/pdf",
      fileSize: fs.statSync(filePath).size,
      filePath: filePath,
      fileUrl: `/uploads/${fileName}`,
      category: "Salary Slips",
      entityType: "Employee",
      entityId: employeeId,
      uploadedBy: userId,
      uploadedByName: "System Generated",
      salarySlipData: {
        employeeId: employee._id,
        employeeName: employee.name,
        designation: (employee as any).designation || "Employee",
        department: (employee as any).department || "General",
        month: month,
        year: year,
        basicSalary: salaryData.basicSalary,
        allowances: salaryData.allowances,
        deductions: salaryData.deductions,
        netSalary: salaryData.netSalary,
        generatedDate: new Date(),
        emailSent: false,
      },
    };

    return await this.create(documentData);
  },

  async getSalarySlips(filters: any = {}) {
    const query: any = {
      category: "Salary Slips",
      status: "Active",
    };

    if (filters.employeeId)
      query["salarySlipData.employeeId"] = filters.employeeId;
    if (filters.month) query["salarySlipData.month"] = filters.month;
    if (filters.year) query["salarySlipData.year"] = filters.year;
    if (filters.department)
      query["salarySlipData.department"] = filters.department;

    return await Document.find(query)
      .populate("uploadedBy", "name email")
      .sort({ "salarySlipData.generatedDate": -1 })
      .lean();
  },

  async markSalarySlipEmailSent(id: string) {
    return await Document.findByIdAndUpdate(
      id,
      {
        "salarySlipData.emailSent": true,
        "salarySlipData.emailSentAt": new Date(),
      },
      { new: true }
    );
  },

  async getDocumentsByCategory(category: string) {
    return await this.list({ category });
  },

  async getDocumentsByEntity(entityType: string, entityId: string) {
    return await this.list({ entityType, entityId });
  },

  async getDocumentStatistics() {
    const totalDocs = await Document.countDocuments({ status: "Active" });
    const totalDownloads = await Document.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);
    const totalSize = await Document.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: null, total: { $sum: "$fileSize" } } },
    ]);
    const categoryCounts = await Document.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalStorageBytes = totalSize[0]?.total || 0;
    const maxStorageBytes = 5 * 1024 * 1024 * 1024; // 5GB in bytes
    const storageUsagePercentage = (totalStorageBytes / maxStorageBytes) * 100;

    return {
      totalDocuments: totalDocs,
      totalDownloads: totalDownloads[0]?.total || 0,
      totalSize: totalStorageBytes,
      totalSizeFormatted: this.formatFileSize(totalStorageBytes),
      maxStorage: maxStorageBytes,
      maxStorageFormatted: "5 GB",
      storageUsagePercentage: Math.round(storageUsagePercentage * 100) / 100,
      storageUsageDisplay: `${this.formatFileSize(totalStorageBytes)} / 5 GB used`,
      categoryCounts: categoryCounts,
      categories: categoryCounts.length,
    };
  },

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  getFileType(mimeType: string): string {
    // Return specific file type based on mimetype
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "text/csv": "csv",
      "text/plain": "txt",
    };

    return mimeTypeMap[mimeType] || "file";
  },

  getFileExtensionFromMimeType(mimeType: string): string {
    // Return file extension based on mimetype (same as getFileType)
    const mimeTypeMap: { [key: string]: string } = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "application/pdf": "pdf",
      "application/msword": "doc",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.ms-excel": "xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",
      "text/csv": "csv",
      "text/plain": "txt",
    };

    return mimeTypeMap[mimeType] || "file";
  },

  generateSalarySlipPDF(
    employee: any,
    month: string,
    year: number,
    salaryData: any
  ): string {
    // Placeholder PDF content - in real implementation, use proper PDF library
    return `
      SALARY SLIP
      ${month} ${year}
      
      Employee: ${employee.name}
      Designation: ${employee.designation}
      Department: ${employee.department}
      
      Basic Salary: ₹${salaryData.basicSalary}
      Allowances: ₹${salaryData.allowances}
      Deductions: ₹${salaryData.deductions}
      Net Salary: ₹${salaryData.netSalary}
      
      Generated on: ${new Date().toLocaleDateString()}
    `;
  },

  async addComment(
    documentId: string,
    userId: string,
    userName: string,
    comment: string
  ) {
    const document = await Document.findById(documentId);
    if (!document) return null;

    // Initialize comments array if it doesn't exist, or cast to any to satisfy TypeScript
    (document as any).comments = (document as any).comments || [];
    (document as any).comments.push({
      userId: userId as any,
      userName,
      comment,
      createdAt: new Date(),
    });

    return await document.save();
  },

  async getComments(documentId: string) {
    const document = await Document.findById(documentId)
      .populate("comments.userId", "name email")
      .lean();

    if (!document) {
      throw new Error("Document not found");
    }

    return document.comments || [];
  },
};
