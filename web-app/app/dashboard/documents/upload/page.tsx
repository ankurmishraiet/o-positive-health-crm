"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Upload, type File, X, Check, AlertCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface UploadedFile {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  documentId?: string;
}

interface AppConfig {
  documentTypes: { value: string; label: string }[];
  entityTypes: { value: string; label: string }[];
}

export default function DocumentUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [hospital, setHospital] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const response = await fetch(`${API_BASE_URL}/api/v1/config`);
        if (response.ok) {
          const configData = await response.json();
          setConfig(configData);
        } else {
          // Fallback to default config if endpoint doesn't exist
          setConfig({
            documentTypes: [
              { value: "Medical Reports", label: "Medical Reports" },
              { value: "Insurance Documents", label: "Insurance Documents" },
              { value: "Lab Reports", label: "Lab Reports" },
              { value: "Prescriptions", label: "Prescriptions" },
              { value: "Discharge Documents", label: "Discharge Documents" },
              { value: "Surgery Reports", label: "Surgery Reports" },
              { value: "Salary Slips", label: "Salary Slips" },
              { value: "Loan Documents", label: "Loan Documents" },
              { value: "Reimbursement Bills", label: "Reimbursement Bills" },
              { value: "TPA Forms", label: "TPA Forms" },
              { value: "Aadhar Card", label: "Aadhar Card" },
              { value: "PAN Card", label: "PAN Card" },
              { value: "Passport Photo", label: "Passport Photo" },
              { value: "Cancel Cheque", label: "Cancel Cheque" },
              {
                value: "Doctor's Medical Certificate",
                label: "Doctor's Medical Certificate",
              },
              { value: "GST Certificate", label: "GST Certificate" },
              {
                value: "Incorporation Certificate",
                label: "Incorporation Certificate",
              },
              {
                value: "Other Official Documents",
                label: "Other Official Documents",
              },
              { value: "Other", label: "Other" },
            ],
            entityTypes: [
              { value: "Patient", label: "Patient" },
              { value: "Employee", label: "Employee" },
              { value: "Doctor", label: "Doctor" },
              { value: "Hospital", label: "Hospital" },
              { value: "Lead", label: "Lead" },
              { value: "Loan", label: "Loan" },
              { value: "Insurance", label: "Insurance" },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        // Fallback to default config on error
        setConfig({
          documentTypes: [
            { value: "Medical Reports", label: "Medical Reports" },
            { value: "Insurance Documents", label: "Insurance Documents" },
            { value: "Lab Reports", label: "Lab Reports" },
            { value: "Prescriptions", label: "Prescriptions" },
            { value: "Discharge Documents", label: "Discharge Documents" },
            { value: "Surgery Reports", label: "Surgery Reports" },
            { value: "Salary Slips", label: "Salary Slips" },
            { value: "Loan Documents", label: "Loan Documents" },
            { value: "Reimbursement Bills", label: "Reimbursement Bills" },
            { value: "TPA Forms", label: "TPA Forms" },
            { value: "Aadhar Card", label: "Aadhar Card" },
            { value: "PAN Card", label: "PAN Card" },
            { value: "Passport Photo", label: "Passport Photo" },
            { value: "Cancel Cheque", label: "Cancel Cheque" },
            {
              value: "Doctor's Medical Certificate",
              label: "Doctor's Medical Certificate",
            },
            { value: "GST Certificate", label: "GST Certificate" },
            {
              value: "Incorporation Certificate",
              label: "Incorporation Certificate",
            },
            {
              value: "Other Official Documents",
              label: "Other Official Documents",
            },
            { value: "Other", label: "Other" },
          ],
          entityTypes: [
            { value: "Patient", label: "Patient" },
            { value: "Employee", label: "Employee" },
            { value: "Doctor", label: "Doctor" },
            { value: "Hospital", label: "Hospital" },
            { value: "Lead", label: "Lead" },
            { value: "Loan", label: "Loan" },
            { value: "Insurance", label: "Insurance" },
          ],
        });
      }
    };

    fetchConfig();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending" as const, // Changed from "uploading" to "pending"
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((fileRejection) => {
        const error = fileRejection.errors[0];
        toast({
          title: "File Rejected",
          description: `${fileRejection.file.name}: ${error.message}`,
          variant: "destructive",
        });
      });
    },
  });

  const startUpload = async () => {
    // Validate required fields before upload
    if (!entityType || !entityId || !documentType) {
      toast({
        title: "Validation Error",
        description:
          "Please select entity type, entity ID, and document type before uploading",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    // Start upload for each pending file
    uploadedFiles.forEach((fileObj, index) => {
      if (fileObj.status === "pending") {
        uploadFile(fileObj, index);
      }
    });
  };

  const uploadFile = async (fileObj: UploadedFile, index: number) => {
    // Update status to uploading
    setUploadedFiles((prev) =>
      prev.map((file, i) =>
        i === index ? { ...file, status: "uploading" } : file,
      ),
    );

    const formData = new FormData();
    formData.append("file", fileObj.file);
    formData.append("entityType", entityType);
    formData.append("entityId", entityId);
    formData.append("documentType", documentType);
    formData.append("category", documentType);

    // Add optional fields if they have values
    if (patientName) formData.append("patientName", patientName);
    if (patientId) formData.append("patientId", patientId);
    if (hospital) formData.append("hospital", hospital);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    formData.append("isConfidential", String(isConfidential));

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");

      // Validate API URL
      if (!API_BASE_URL) {
        throw new Error("API URL is not configured");
      }

      const xhr = new XMLHttpRequest();

      // Progress event
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadedFiles((prev) =>
            prev.map((file, i) => (i === index ? { ...file, progress } : file)),
          );
        }
      });

      // Load event (success)
      xhr.addEventListener("load", () => {
        console.log("Upload response status:", xhr.status);
        console.log("Upload response:", xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            setUploadedFiles((prev) =>
              prev.map((file, i) =>
                i === index
                  ? {
                      ...file,
                      status: "completed",
                      progress: 100,
                      url: response.url,
                      documentId: response.documentId,
                    }
                  : file,
              ),
            );
            toast({
              title: "✅ Upload Successful",
              description: `${fileObj.file.name} uploaded successfully`,
              duration: 4000,
            });

            // Check if all files are completed and clear form
            setTimeout(() => {
              setUploadedFiles((currentFiles) => {
                const allCompleted = currentFiles.every(
                  (f) => f.status === "completed" || f.status === "error",
                );
                if (allCompleted) {
                  // Clear form fields after all uploads complete
                  setEntityType("");
                  setEntityId("");
                  setDocumentType("");
                  setPatientName("");
                  setPatientId("");
                  setHospital("");
                  setDescription("");
                  setTags("");
                  setIsConfidential(false);
                  setUploadedFiles([]);

                  toast({
                    title: "🎉 All Files Processed",
                    description:
                      "Form has been cleared and ready for new uploads",
                    duration: 4000,
                  });
                }
                return currentFiles;
              });
            }, 500);
          } catch (parseError) {
            console.error("Error parsing response:", parseError);
            setUploadedFiles((prev) =>
              prev.map((file, i) =>
                i === index ? { ...file, status: "error" } : file,
              ),
            );
            toast({
              title: "Upload Error",
              description: `Failed to parse server response for ${fileObj.file.name}`,
              variant: "destructive",
            });
          }
        } else {
          // Handle error response
          let errorMessage = `Upload failed with status: ${xhr.status}`;
          let errorDetails = "";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
            if (errorResponse.details) {
              console.error("Upload error details:", errorResponse.details);
              errorDetails =
                typeof errorResponse.details === "string"
                  ? errorResponse.details
                  : JSON.stringify(errorResponse.details);
            }
            if (errorResponse.error) {
              errorDetails += ` (${errorResponse.error})`;
            }
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = xhr.statusText || errorMessage;
          }

          setUploadedFiles((prev) =>
            prev.map((file, i) =>
              i === index
                ? {
                    ...file,
                    status: "error",
                    errorMessage:
                      errorMessage + (errorDetails ? ` - ${errorDetails}` : ""),
                  }
                : file,
            ),
          );
          toast({
            title: "Upload Failed",
            description: (
              <div>
                <p>{errorMessage}</p>
                {errorDetails && <p className="text-xs mt-1">{errorDetails}</p>}
              </div>
            ),
            variant: "destructive",
            duration: 5000,
          });
        }
      });

      // Error event
      xhr.addEventListener("error", () => {
        console.error("XHR error occurred during upload");
        setUploadedFiles((prev) =>
          prev.map((file, i) =>
            i === index ? { ...file, status: "error" } : file,
          ),
        );
        toast({
          title: "Network Error",
          description: `Failed to upload ${fileObj.file.name}. Check your connection.`,
          variant: "destructive",
        });
      });

      // Set timeout
      xhr.timeout = 30000; // 30 seconds timeout
      xhr.ontimeout = () => {
        setUploadedFiles((prev) =>
          prev.map((file, i) =>
            i === index ? { ...file, status: "error" } : file,
          ),
        );
        toast({
          title: "Timeout Error",
          description: `Upload timed out for ${fileObj.file.name}`,
          variant: "destructive",
        });
      };

      // Open and send request
      xhr.open("POST", `${API_BASE_URL}/api/v1/documents/upload`);

      // Set headers
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadedFiles((prev) =>
        prev.map((file, i) =>
          i === index ? { ...file, status: "error" } : file,
        ),
      );
      toast({
        title: "Upload Error",
        description: `Failed to upload ${fileObj.file.name}: ${
          (error as any).message
        }`,
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    const fileObj = uploadedFiles[index];
    if (fileObj && fileObj.status === "error") {
      // Reset status to pending and retry
      setUploadedFiles((prev) =>
        prev.map((file, i) =>
          i === index ? { ...file, status: "pending", progress: 0 } : file,
        ),
      );
      // Upload the file again
      uploadFile(fileObj, index);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "uploading":
        return <Upload className="h-4 w-4 text-blue-600" />;
      default:
        return (
          <div className="h-4 w-4 rounded-full border-2 border-gray-400" />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "uploading":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "completed";
      case "error":
        return "error";
      case "uploading":
        return "uploading";
      default:
        return "pending";
    }
  };

  const hasPendingFiles = uploadedFiles.some(
    (file) => file.status === "pending",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Upload</h1>
        <p className="text-gray-600">
          Upload patient documents, insurance papers, and other files
        </p>
      </div>

      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entityType">Entity Type *</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {config?.entityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  )) || (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entityId">Entity ID *</Label>
              <Input
                id="entityId"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Enter Document ID, Entity Number,Entity ID etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {config?.documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  )) || (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional fields row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input
                id="patientName"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Enter patient name (if applicable)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input
                id="patientId"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient ID (if applicable)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Input
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="Enter hospital name"
              />
            </div>
          </div>

          {/* Description and tags row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this document"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>

          {/* Confidential checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isConfidential"
              checked={isConfidential}
              onChange={(e) => setIsConfidential(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isConfidential" className="cursor-pointer">
              Mark as Confidential
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop files here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Supports: Images (JPEG, PNG, GIF), PDF, Word documents
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((fileObj, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(fileObj.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate">
                        {fileObj.file.name}
                      </p>
                      <Badge className={getStatusColor(fileObj.status)}>
                        {getStatusText(fileObj.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <span>{fileObj.file.type}</span>
                    </div>

                    {fileObj.status === "uploading" && (
                      <Progress value={fileObj.progress} className="mt-2" />
                    )}

                    {fileObj.status === "error" &&
                      (fileObj as any).errorMessage && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {(fileObj as any).errorMessage}
                        </div>
                      )}
                  </div>

                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {fileObj.status === "error" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(index)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {uploadedFiles.length > 0 && hasPendingFiles && (
        <div className="flex w-full mt-4">
          <Button onClick={startUpload} className="w-10/12 mx-auto">
            Upload Documents &amp; Save
          </Button>
        </div>
      )}

      {/* Required Documents Checklist */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Required Documents Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-3">Required Documents</h4>
              <div className="space-y-2">
                {config?.documentTypes
                  .filter((doc) =>
                    [
                      "aadhar_front",
                      "aadhar_back",
                      "pancard",
                      "passport_photo",
                    ].includes(doc.value)
                  )
                  .map((doc) => (
                    <div
                      key={doc.value}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 rounded border border-red-300 bg-red-50" />
                      <span className="text-sm">{doc.label}</span>
                    </div>
                  )) || <div className="text-sm text-gray-500">Loading...</div>}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Optional Documents</h4>
              <div className="space-y-2">
                {config?.documentTypes
                  .filter(
                    (doc) =>
                      ![
                        "aadhar_front",
                        "aadhar_back",
                        "pancard",
                        "passport_photo",
                      ].includes(doc.value)
                  )
                  .slice(0, 6)
                  .map((doc) => (
                    <div
                      key={doc.value}
                      className="flex items-center space-x-2"
                    >
                      <div className="w-4 h-4 rounded border border-gray-300 bg-gray-50" />
                      <span className="text-sm">{doc.label}</span>
                    </div>
                  )) || <div className="text-sm text-gray-500">Loading...</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
