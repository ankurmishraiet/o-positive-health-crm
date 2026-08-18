"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Download, FileText, Check, AlertCircle, X, ArrowLeft } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";

interface UploadResult {
  totalRows: number;
  successfulImports: number;
  failures: number;
  errors: string[];
}

export default function PartnersCsvUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "text/csv" || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast.error("Please select a CSV file");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const downloadTemplate = () => {
    const csvContent = "Name,Contact Person,Phone,Email,Address,City,Type\nABC Corporation,John Doe,9876543210,john@abc.com,123 Street,Mumbai,corporate\nXYZ Healthcare,Jane Smith,8765432109,jane@xyz.com,456 Avenue,Delhi,individual";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'partners_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Template downloaded successfully");
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      toast.error("Please select a CSV file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("csvFile", selectedFile);

    try {
      const response = await axios.post("/bulk-upload/partners", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      setUploadResult({
        totalRows: response.data.totalRows || 0,
        successfulImports: response.data.successfulImports || 0,
        failures: response.data.failures || 0,
        errors: response.data.errors || [],
      });

      toast.success("CSV upload completed");
    } catch (error: any) {
      console.error("Error uploading CSV:", error);
      toast.error(error.response?.data?.message || "Failed to upload CSV file");
      setUploadResult({
        totalRows: 0,
        successfulImports: 0,
        failures: 0,
        errors: [error.response?.data?.message || "Failed to upload CSV file"],
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Partners CSV</h1>
          <p className="text-gray-600">
            Bulk import partners from a CSV file
          </p>
        </div>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CSV Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Download the CSV template to see the required format for partner imports.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-mono text-sm">
              <strong>Required columns:</strong> Name, Contact Person, Phone, Email, Address, City, Type
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload CSV File</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? "Drop the CSV file here"
                : "Drag & drop a CSV file here, or click to select"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximum file size: 5MB
            </p>
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-gray-600">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/partners")}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFile}
              disabled={!selectedFile || uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Partners
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {uploadResult.failures === 0 ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{uploadResult.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {uploadResult.successfulImports}
                </p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {uploadResult.failures}
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-red-600">Errors:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setUploadResult(null)}
              >
                Upload Another File
              </Button>
              <Button onClick={() => router.push("/dashboard/partners")}>
                View Partners
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
