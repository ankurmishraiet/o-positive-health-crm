"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, Check } from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

interface S3FileUploadProps {
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  onUploadError?: (error: string) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

export function S3FileUpload({
  onUploadComplete,
  onUploadError,
  acceptedFileTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  maxFileSize = 10,
  className = ""
}: S3FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: `Please select a file with one of these extensions: ${acceptedFileTypes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadComplete(false);
  };

  const uploadToS3 = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      // First, try to get presigned URL for direct S3 upload
      try {
        const presignedResponse = await axios.post("/documents/presigned-url", {
          fileName: selectedFile.name,
          contentType: selectedFile.type,
        });

        if (presignedResponse.data.uploadUrl) {
          // Upload directly to S3
          await fetch(presignedResponse.data.uploadUrl, {
            method: 'PUT',
            body: selectedFile,
            headers: {
              'Content-Type': selectedFile.type,
            },
          });

          const fileUrl = presignedResponse.data.uploadUrl.split('?')[0]; // Remove query parameters
          setUploadComplete(true);
          onUploadComplete?.(fileUrl, selectedFile.name);
          
          toast({
            title: "Upload successful",
            description: "File uploaded to S3 successfully",
          });
          return;
        }
      } catch (s3Error) {
        console.log("S3 upload not available, falling back to traditional upload");
      }

      // Fallback to traditional upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'Other');
      formData.append('entityType', 'Document');
      formData.append('description', 'File uploaded via S3 component');

      const response = await axios.post("/documents/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      setUploadComplete(true);
      onUploadComplete?.(response.data.url, selectedFile.name);
      
      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || "Upload failed";
      onUploadError?.(errorMessage);
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadComplete(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="file-upload">Choose File</Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <p className="text-sm text-gray-500">
          Accepted types: {acceptedFileTypes.join(', ')} (max {maxFileSize}MB)
        </p>
      </div>

      {selectedFile && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <File className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              {uploadComplete && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-gray-500 mb-3">
            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            </div>
          )}

          {!uploadComplete && !uploading && (
            <Button onClick={uploadToS3} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}

          {uploadComplete && (
            <div className="flex items-center space-x-2 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-sm">Upload completed successfully</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}