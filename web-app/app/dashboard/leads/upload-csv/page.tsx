"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Download, FileText, Check, AlertCircle, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";

interface UploadResult {
  totalRows: number;
  successfulImports: number;
  skippedRows: number;
  failedRows: number;
  summary?: {
    successPercentage: string;
    failurePercentage: string;
    skippedPercentage: string;
  };
  errors: string[];
}

interface LiveStats {
  processedCount: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
  totalRows: number;
  currentRow: number;
}

export default function CsvUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [processing, setProcessing] = useState(false);
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
    const csvContent = "Patient Name,Contact number,City,Treatment\nJohn Doe,9876543210,Mumbai,Consultation\nJane Smith,8765432109,Delhi,Surgery";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
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
    setLiveStats(null);
    setUploadResult(null);
    setProcessing(false);

    const formData = new FormData();
    formData.append("csvFile", selectedFile);

    try {
      const token = localStorage.getItem("authToken");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      
      // Use fetch for SSE since EventSource doesn't support POST with auth
      const response = await fetch(`${API_BASE_URL}/api/v1/leads/upload-csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // File uploaded, now start processing with SSE
      setUploading(false);
      setProcessing(true);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setProcessing(false);
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'start') {
                  toast.info(`Processing ${data.totalRows} rows...`);
                  setLiveStats({
                    processedCount: 0,
                    successCount: 0,
                    skippedCount: 0,
                    failedCount: 0,
                    totalRows: data.totalRows,
                    currentRow: 0,
                  });
                } else if (data.type === 'progress') {
                  setLiveStats({
                    processedCount: data.processedCount,
                    successCount: data.successCount,
                    skippedCount: data.skippedCount,
                    failedCount: data.failedCount,
                    totalRows: data.totalRows,
                    currentRow: data.currentRow,
                  });
                } else if (data.type === 'complete') {
                  setUploadResult({
                    totalRows: data.totalRows,
                    successfulImports: data.successfulImports,
                    skippedRows: data.skippedRows,
                    failedRows: data.failedRows,
                    summary: data.summary,
                    errors: data.errors,
                  });
                  toast.success(`CSV uploaded successfully! ${data.successfulImports} leads imported.`);
                } else if (data.type === 'error') {
                  toast.error(data.message);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
      
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message || "Error uploading CSV file";
      toast.error(errorMessage);
      setProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    setLiveStats(null);
    setProcessing(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Leads CSV</h1>
          <p className="text-gray-600 mt-1">
            Bulk import leads from a CSV file
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Leads
        </Button>
      </div>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>CSV Template</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Download the CSV template to ensure your data is in the correct format.
            The CSV should contain the following columns:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="font-mono text-sm">
              <strong>Required columns:</strong> Patient Name, Contact number, City, Treatment
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
              ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
              ${selectedFile ? "border-green-400 bg-green-50" : ""}
            `}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Check className="h-12 w-12 text-green-500" />
                </div>
                <div>
                  <p className="text-green-700 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex justify-center space-x-2">
                  <Button onClick={uploadFile} disabled={uploading || processing}>
                    {uploading ? "Uploading..." : processing ? "Processing..." : "Upload CSV"}
                  </Button>
                  <Button variant="outline" onClick={resetUpload} disabled={uploading || processing}>
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600">
                      Drag & drop a CSV file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum file size: 5MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && !processing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading and starting processing...</span>
              </div>
              <Progress value={50} className="w-full animate-pulse" />
            </div>
          )}

          {/* Processing Progress */}
          {processing && liveStats && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Processing CSV...</span>
                <span>{liveStats.currentRow} / {liveStats.totalRows}</span>
              </div>
              <Progress 
                value={(liveStats.currentRow / liveStats.totalRows) * 100} 
                className="w-full" 
              />
              
              {/* Live Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Processed</p>
                  <p className="text-xl font-bold text-blue-700">{liveStats.processedCount}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-medium">Successful</p>
                  <p className="text-xl font-bold text-green-700">{liveStats.successCount}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-600 font-medium">Skipped</p>
                  <p className="text-xl font-bold text-yellow-700">{liveStats.skippedCount}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-xs text-red-600 font-medium">Failed</p>
                  <p className="text-xl font-bold text-red-700">{liveStats.failedCount}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Upload Results - Final Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Total Rows</p>
                <p className="text-2xl font-bold text-blue-700">{uploadResult.totalRows}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Successful</p>
                <p className="text-2xl font-bold text-green-700">{uploadResult.successfulImports}</p>
                {uploadResult.summary && (
                  <p className="text-xs text-green-600 mt-1">{uploadResult.summary.successPercentage}</p>
                )}
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Skipped</p>
                <p className="text-2xl font-bold text-yellow-700">{uploadResult.skippedRows}</p>
                {uploadResult.summary && (
                  <p className="text-xs text-yellow-600 mt-1">{uploadResult.summary.skippedPercentage}</p>
                )}
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-700">{uploadResult.failedRows}</p>
                {uploadResult.summary && (
                  <p className="text-xs text-red-600 mt-1">{uploadResult.summary.failurePercentage}</p>
                )}
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                  Errors ({uploadResult.errors.length})
                </h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <Button onClick={() => router.push("/dashboard/leads")}>
                View All Leads
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                Upload Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}