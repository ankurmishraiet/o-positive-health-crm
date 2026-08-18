"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Upload, Download, FileText, Check, AlertCircle, X, Users, Building2, Stethoscope } from "lucide-react";
import { useDropzone } from "react-dropzone";
import axios from "@/axios/axios";

interface UploadResult {
  totalRows: number;
  successfulImports: number;
  failures: number;
  errors: string[];
}

type EntityType = "employees" | "hospitals" | "doctors";

const entityConfig = {
  employees: {
    title: "Employees",
    icon: Users,
    endpoint: "/bulk-upload/employees",
    templateFile: "employees_template.csv",
    templateColumns: [
      "Name", "Email", "Phone", "Age", "Gender", "Designation", 
      "Department", "Salary", "Address", "Qualification", "Joining Date", "Status"
    ],
    sampleRow: "John Doe,john.doe@example.com,9876543210,30,Male,Senior Developer,IT,75000,123 Main St,B.Tech,2024-01-15,Active"
  },
  hospitals: {
    title: "Hospitals",
    icon: Building2,
    endpoint: "/bulk-upload/hospitals",
    templateFile: "hospitals_template.csv",
    templateColumns: [
      "Name", "Address", "Phone", "Email", "City", "State", "PIN", 
      "Type", "Beds", "Emergency Services", "Status"
    ],
    sampleRow: "Apollo Hospital,123 MG Road,9123456789,apollo@hospital.com,Mumbai,Maharashtra,400001,Multi-specialty,500,Yes,Active"
  },
  doctors: {
    title: "Doctors",
    icon: Stethoscope,
    endpoint: "/bulk-upload/doctors",
    templateFile: "doctors_template.csv",
    templateColumns: [
      "Name", "Specialization", "Email", "Phone", "Qualifications", 
      "Experience Years", "Location", "Consultation Fee", "Availability"
    ],
    sampleRow: "Dr. Amit Kumar,Cardiology,amit.kumar@doctor.com,9234567890,MBBS MD Cardiology,15,Mumbai,1500,Monday-Friday 9AM-5PM"
  }
};

function EntityUploadTab({ entityType }: { entityType: EntityType }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const config = entityConfig[entityType];
  const Icon = config.icon;

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setResult(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
  });

  const downloadTemplate = () => {
    const csvContent = [
      config.templateColumns.join(","),
      config.sampleRow
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.templateFile;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await axios.post(config.endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
      
      if (response.data.failures === 0) {
        toast.success(`Successfully imported ${response.data.successfulImports} ${entityType}`);
      } else {
        toast.warning(`Imported ${response.data.successfulImports} ${entityType}, ${response.data.failures} failed`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || `Failed to upload ${entityType}`);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
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
            <div className="flex flex-wrap gap-2">
              {config.templateColumns.map((col) => (
                <Badge key={col} variant="outline">{col}</Badge>
              ))}
            </div>
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
                  <Button onClick={uploadFile} disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload CSV"}
                  </Button>
                  <Button onClick={clearFile} variant="outline" disabled={uploading}>
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">
                    {isDragActive ? "Drop the CSV file here" : "Drag & drop CSV file here"}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.failures === 0 ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span>Upload Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{result.totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{result.successfulImports}</p>
                <p className="text-sm text-gray-600">Successful</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{result.failures}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
                <div className="bg-red-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                  <ul className="space-y-1 text-sm">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="text-red-700">• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BulkUploadPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
        <p className="text-gray-600 mt-1">
          Import multiple records at once using CSV files
        </p>
      </div>

      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="hospitals" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Hospitals
          </TabsTrigger>
          <TabsTrigger value="doctors" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Doctors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="mt-6">
          <EntityUploadTab entityType="employees" />
        </TabsContent>
        
        <TabsContent value="hospitals" className="mt-6">
          <EntityUploadTab entityType="hospitals" />
        </TabsContent>
        
        <TabsContent value="doctors" className="mt-6">
          <EntityUploadTab entityType="doctors" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
