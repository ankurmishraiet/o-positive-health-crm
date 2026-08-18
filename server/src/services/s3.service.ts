import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import multerS3 from "multer-s3";

// AWS configuration from environment variables
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || "";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";

export class S3Service {
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor() {
    this.bucketName = AWS_S3_BUCKET_NAME;

    // Only create S3 client if credentials are configured
    if (this.isConfigured()) {
      this.s3Client = new S3Client({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  // Check if S3 is configured
  isConfigured(): boolean {
    return !!(
      AWS_ACCESS_KEY_ID &&
      AWS_SECRET_ACCESS_KEY &&
      this.bucketName
    );
  }

  // Get S3 client
  private getS3Client(): S3Client {
    if (!this.s3Client) {
      throw new Error(
        "S3 is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME environment variables."
      );
    }

    return this.s3Client;
  }

  // Create multer storage for S3
  createS3Storage() {
    const s3Client = this.getS3Client();

    return multerS3({
      s3: s3Client,
      bucket: this.bucketName,

      metadata: function (req, file, cb) {
        cb(null, {
          fieldName: file.fieldname,
        });
      },

      key: function (req, file, cb) {
        const uniqueSuffix =
          Date.now() + "-" + Math.round(Math.random() * 1e9);

        const fileExtension =
          file.originalname.split(".").pop();

        const fileName =
          `documents/${uniqueSuffix}.${fileExtension}`;

        cb(null, fileName);
      },
    });
  }

  // Create multer upload instance
  createMulterUpload() {
    const storage = this.createS3Storage();

    return multer({
      storage: storage,

      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/webp",
          "text/csv",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              "Invalid file type. Only PDF, Word docs, Images, CSV and Excel files are allowed."
            )
          );
        }
      },

      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    });
  }

  // Upload file directly to S3
  async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string
  ): Promise<string> {
    const s3Client = this.getS3Client();

    const key = `documents/${Date.now()}-${fileName}`;

    console.log(
      "Uploading to S3 with key:",
      key,
      fileName,
      contentType
    );

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await s3Client.send(command);

    return `https://${this.bucketName}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  }

  // Generate presigned URL for secure file access
  async getPresignedDownloadUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const s3Client = this.getS3Client();

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return await getSignedUrl(
      s3Client,
      command,
      { expiresIn }
    );
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    const s3Client = this.getS3Client();

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await s3Client.send(command);
  }

  // Generate presigned URL for direct upload from frontend
  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    expiresIn: number = 3600
  ): Promise<{ uploadUrl: string; key: string }> {
    const s3Client = this.getS3Client();

    const key = `documents/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(
      s3Client,
      command,
      { expiresIn }
    );

    return {
      uploadUrl,
      key,
    };
  }
}

export const s3Service = new S3Service();