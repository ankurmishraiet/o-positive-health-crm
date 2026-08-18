"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Trash2, FileText, Check } from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

export interface Document {
  documentType: string;
  documentName?: string;
  documentUrl: string;
  uploadedDate?: Date;
}

interface DocumentUploadSectionProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  documentTypes: { value: string; label: string }[];
  allowCustomName?: boolean;
}

export function DocumentUploadSection({
  documents,
  onDocumentsChange,
  documentTypes,
  allowCustomName = false,
}: DocumentUploadSectionProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{ [key: number]: string }>({});

  const addDocument = () => {
    onDocumentsChange([
      ...documents,
      {
        documentType: "",
        documentName: "",
        documentUrl: "",
      },
    ]);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    onDocumentsChange(newDocuments);
    // Clear error for this index
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const updateDocument = (
    index: number,
    field: keyof Document,
    value: string
  ) => {
    const newDocuments = [...documents];
    newDocuments[index] = { ...newDocuments[index], [field]: value };
    onDocumentsChange(newDocuments);
  };

  const handleFileUpload = async (index: number, file: File) => {
    if (!file) return;

    // Clear previous error for this index
    setUploadErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = "File size must be less than 10MB";
      setUploadErrors((prev) => ({ ...prev, [index]: errorMsg }));
      toast({
        title: "File too large",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const fileExt = fileExtension ? `.${fileExtension}` : "";
    if (!allowedTypes.includes(fileExt)) {
      const errorMsg = `Please select a file with one of these extensions: ${allowedTypes.join(", ")}`;
      setUploadErrors((prev) => ({ ...prev, [index]: errorMsg }));
      toast({
        title: "Invalid file type",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setUploadingIndex(index);

    try {
      // Try presigned URL upload first
      try {
        const presignedResponse = await axios.post("/documents/presigned-url", {
          fileName: file.name,
          contentType: file.type,
        });

        if (presignedResponse.data.uploadUrl) {
          await fetch(presignedResponse.data.uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          const fileUrl = presignedResponse.data.uploadUrl.split("?")[0];
          updateDocument(index, "documentUrl", fileUrl);

          // Clear error on successful upload
          setUploadErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[index];
            return newErrors;
          });

          toast({
            title: "Upload successful",
            description: "Document uploaded successfully",
          });
          return;
        }
      } catch (s3Error) {
        console.log("S3 presigned URL not available, using fallback");
      }

      // Fallback to traditional upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "Document");
      formData.append("entityType", "document");
      // Generate a unique ID using crypto API for better uniqueness
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      formData.append("entityId", uniqueId);

      const response = await axios.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      updateDocument(index, "documentUrl", response.data.url);

      // Clear error on successful upload
      setUploadErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });

      toast({
        title: "Upload successful",
        description: "Document uploaded successfully",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      
      // Extract detailed error message
      let errorMessage = "Failed to upload document";
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        if (errorData.error) {
          errorMessage += ` (${errorData.error})`;
        }
        if (errorData.details) {
          // Format details in a more readable way
          if (typeof errorData.details === 'object') {
            const detailPairs = Object.entries(errorData.details)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            errorMessage += ` - ${detailPairs}`;
          } else {
            errorMessage += ` - ${errorData.details}`;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set error for this specific upload field
      setUploadErrors((prev) => ({ ...prev, [index]: errorMessage }));
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select
                  value={doc.documentType}
                  onValueChange={(value) =>
                    updateDocument(index, "documentType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {allowCustomName && doc.documentType === "Other" && (
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={doc.documentName || ""}
                    onChange={(e) =>
                      updateDocument(index, "documentName", e.target.value)
                    }
                    placeholder="Enter document name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Upload Document</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(index, file);
                    }}
                    disabled={uploadingIndex === index}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeDocument(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {uploadingIndex === index && (
                  <p className="text-sm text-gray-600">Uploading...</p>
                )}
                {uploadErrors[index] && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    <strong>Error:</strong> {uploadErrors[index]}
                  </div>
                )}
                {doc.documentUrl && uploadingIndex !== index && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    <span>Document uploaded</span>
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addDocument}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        Add Document
      </Button>
    </div>
  );
}
