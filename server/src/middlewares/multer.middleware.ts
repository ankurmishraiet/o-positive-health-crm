import multer from "multer";
import path from "path";
import fs from "fs";
import { s3Service } from "../services/s3.service";

// Create the upload directory if it doesn't exist
const uploadDir = path.join(__dirname, "../../uploads/disbursal-letters");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create CSV upload directory
const csvUploadDir = path.join(__dirname, "../../uploads/csv");
if (!fs.existsSync(csvUploadDir)) {
  fs.mkdirSync(csvUploadDir, { recursive: true });
}

// Multer storage config for documents
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Multer storage config for CSV files
const csvStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, csvUploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `leads-upload-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = function (_req: any, file: any, cb: any) {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF, Word documents, and images are allowed"), false);
  }
  cb(null, true);
};

const csvFileFilter = function (_req: any, file: any, cb: any) {
  if (file.mimetype !== "text/csv" && !file.originalname.toLowerCase().endsWith('.csv')) {
    return cb(new Error("Only CSV files are allowed"), false);
  }
  cb(null, true);
};

// Create upload instance - use S3 if configured, otherwise local storage
let upload: multer.Multer;
let csvUpload: multer.Multer;

if (s3Service.isConfigured()) {
  // Use S3 storage
  upload = s3Service.createMulterUpload();
  
  // For CSV, still use local storage for processing
  csvUpload = multer({ 
    storage: csvStorage, 
    fileFilter: csvFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for CSV files
    }
  });
} else {
  // Use local storage
  upload = multer({ storage, fileFilter });
  csvUpload = multer({ 
    storage: csvStorage, 
    fileFilter: csvFileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for CSV files
    }
  });
}

export default upload;
export { csvUpload };
