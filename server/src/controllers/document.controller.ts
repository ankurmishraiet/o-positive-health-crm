import { Request, Response, NextFunction } from "express";
import { DocumentService } from "../services/document.service";
import { s3Service } from "../services/s3.service";
import { UserRole } from "../constants/roles.enum";
import fs from "fs";
import path from "path";

// Extend Request interface to include file
interface MulterRequest extends Request {
  file?: any; // Simplified type for multer file
}

export const DocumentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        patientId: req.query.patientId as string,
        uploadedBy: req.query.uploadedBy as string,
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });
      
      const documents = await DocumentService.list(filters);
      res.json(documents);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.getById(req.params.id);
      if (!document) return res.status(404).json({ message: "Document not found" });
      res.json(document);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.update(req.params.id, req.body);
      if (!document) return res.status(404).json({ message: "Document not found" });
      res.json(document);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.delete(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async upload(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          message: "No file uploaded",
          error: "FILE_MISSING" 
        });
      }
      
      // Validate required fields
      if (!req.body.entityType || !req.body.entityId) {
        return res.status(400).json({ 
          message: "Entity type and entity ID are required",
          error: "MISSING_REQUIRED_FIELDS",
          details: {
            entityType: !req.body.entityType ? "required" : "ok",
            entityId: !req.body.entityId ? "required" : "ok"
          }
        });
      }
      
      const userId = (req as any).user?.id;
      const documentMeta = {
        category: req.body.category || req.body.documentType,
        entityType: req.body.entityType,
        entityId: req.body.entityId,
        patientName: req.body.patientName,
        patientId: req.body.patientId,
        hospital: req.body.hospital,
        description: req.body.description,
        tags: req.body.tags,
        isConfidential: req.body.isConfidential === 'true',
        uploadedByName: (req as any).user?.name,
      };
      
      const document = await DocumentService.upload(req.file, documentMeta, userId);
      res.status(201).json({
        message: "File uploaded successfully",
        document,
        url: document.fileUrl,
        documentId: document._id,
      });
    } catch (err: any) {
      console.error("Document upload error:", err);
      res.status(500).json({
        message: err.message || "Failed to upload document",
        error: "UPLOAD_FAILED",
        details: err.toString()
      });
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      // First get the document to check if it's confidential
      const document = await DocumentService.getById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check if document is confidential and user is not admin
      if (document.isConfidential && userRole !== UserRole.ADMIN) {
        return res.status(403).json({ 
          message: "You don't have permission to access this file. Contact Admin.",
          error: "ACCESS_DENIED"
        });
      }
      
      const downloadInfo = await DocumentService.download(req.params.id, userId, ipAddress);
      
      // If it's an S3 file, redirect to presigned URL
      if (downloadInfo.isS3 && downloadInfo.downloadUrl) {
        return res.redirect(downloadInfo.downloadUrl);
      }
      
      // Handle local file download
      if (!downloadInfo.filePath || !fs.existsSync(downloadInfo.filePath)) {
        return res.status(404).json({ message: "File not found on server" });
      }
      
      res.setHeader('Content-Disposition', `attachment; filename="${downloadInfo.fileName}"`);
      res.setHeader('Content-Type', downloadInfo.mimeType);
      
      const fileStream = fs.createReadStream(downloadInfo.filePath);
      fileStream.pipe(res);
    } catch (err) {
      next(err);
    }
  },

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DocumentService.getDocumentStatistics();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const documents = await DocumentService.getDocumentsByCategory(req.params.category);
      res.json(documents);
    } catch (err) {
      next(err);
    }
  },

  async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, entityId } = req.params;
      const documents = await DocumentService.getDocumentsByEntity(entityType, entityId);
      res.json(documents);
    } catch (err) {
      next(err);
    }
  },

  // Salary Slip specific endpoints
  async generateSalarySlip(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, month, year } = req.params;
      const salaryData = req.body;
      const userId = (req as any).user?.id;
      
      const document = await DocumentService.generateSalarySlip(
        employeeId,
        month,
        parseInt(year),
        salaryData,
        userId
      );
      
      res.status(201).json({
        message: "Salary slip generated successfully",
        document,
      });
    } catch (err) {
      next(err);
    }
  },

  async getSalarySlips(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        employeeId: req.query.employeeId as string,
        month: req.query.month as string,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
        department: req.query.department as string,
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });
      
      const salarySlips = await DocumentService.getSalarySlips(filters);
      res.json(salarySlips);
    } catch (err) {
      next(err);
    }
  },

  async markSalarySlipEmailSent(req: Request, res: Response, next: NextFunction) {
    try {
      const document = await DocumentService.markSalarySlipEmailSent(req.params.id);
      if (!document) return res.status(404).json({ message: "Salary slip not found" });
      res.json(document);
    } catch (err) {
      next(err);
    }
  },

  async generateBulkSalarySlips(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year, employees } = req.body;
      const userId = (req as any).user?.id;
      const results = [];
      
      for (const employee of employees) {
        try {
          const document = await DocumentService.generateSalarySlip(
            employee.employeeId,
            month,
            year,
            employee.salaryData,
            userId
          );
          results.push({ success: true, employeeId: employee.employeeId, document });
        } catch (error: any) {
          results.push({ 
            success: false, 
            employeeId: employee.employeeId, 
            error: error.message 
          });
        }
      }
      
      res.json({
        message: "Bulk salary slip generation completed",
        results,
        totalProcessed: employees.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get presigned URL for direct S3 upload
  async getPresignedUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, contentType } = req.body;
      
      if (!fileName || !contentType) {
        return res.status(400).json({ 
          message: "fileName and contentType are required" 
        });
      }

      if (!s3Service.isConfigured()) {
        return res.status(503).json({ 
          message: "S3 service not configured. Using local upload instead." 
        });
      }

      const { uploadUrl, key } = await s3Service.getPresignedUploadUrl(fileName, contentType);
      
      res.json({
        uploadUrl,
        key,
        message: "Presigned URL generated successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const userId = (req as any).user?.id;
      const userName = (req as any).user?.name || "Unknown";

      if (!comment || !comment.trim()) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const document = await DocumentService.addComment(id, userId, userName, comment);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      res.json({
        message: "Comment added successfully",
        document,
      });
    } catch (err) {
      next(err);
    }
  },

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const comments = await DocumentService.getComments(id);
      res.json(comments);
    } catch (err) {
      next(err);
    }
  },
};