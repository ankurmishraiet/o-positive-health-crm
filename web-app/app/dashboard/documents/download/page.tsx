"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import {
  Search,
  Download,
  Filter,
  FileText,
  User,
  Calendar,
  FolderOpen,
  File,
  Image,
  FileIcon,
  X,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();

  if (type.includes("pdf")) {
    return <FileText className="h-4 w-4 text-red-500" />;
  }

  if (
    type.includes("image") ||
    ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(type)
  ) {
    return <Image className="h-4 w-4 text-blue-500" />;
  }

  if (type.includes("word") || type.includes("doc")) {
    return <FileText className="h-4 w-4 text-blue-600" />;
  }

  if (type.includes("excel") || type.includes("xls")) {
    return <FileText className="h-4 w-4 text-green-600" />;
  }

  if (type.includes("zip") || type.includes("rar") || type.includes("tar")) {
    return <FileText className="h-4 w-4 text-yellow-600" />;
  }

  return <FileIcon className="h-4 w-4 text-gray-500" />;
};

const columns = [
  {
    accessorKey: "fileName",
    header: "File Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        {getFileIcon(row.original.fileType)}
        <div>
          <div className="font-medium max-w-xs truncate">
            {row.getValue("fileName")}
          </div>
          <div className="text-sm text-gray-500">{row.original.fileSize}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: any) => (
      <Badge variant="outline">{row.getValue("category")}</Badge>
    ),
  },
  {
    accessorKey: "entityType",
    header: "Entity Type",
    cell: ({ row }: any) => (
      <Badge variant="secondary">{row.getValue("entityType")}</Badge>
    ),
  },
  {
    accessorKey: "patientName",
    header: "Patient/Entity",
    cell: ({ row }: any) => (
      <div>
        {row.original.patientName && (
          <>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{row.original.patientName}</span>
            </div>
            <div className="text-sm text-gray-500">
              {row.original.patientId}
            </div>
          </>
        )}
        {!row.original.patientName && row.original.entityId && (
          <div className="text-sm text-gray-500">
            ID: {row.original.entityId.toString().substring(0, 8)}...
          </div>
        )}
        {!row.original.patientName && !row.original.entityId && (
          <span className="text-gray-400">N/A</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "hospital",
    header: "Hospital",
    cell: ({ row }: any) =>
      row.original.hospital || <span className="text-gray-400">N/A</span>,
  },
  {
    accessorKey: "uploadedByName",
    header: "Uploaded By",
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">
          {row.original.uploadedByName || "Unknown"}
        </div>
        {row.original.description && (
          <div className="text-xs text-gray-500 max-w-xs truncate">
            {row.original.description}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "uploadDate",
    header: "Upload Date",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span>{new Date(row.getValue("uploadDate")).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "downloads",
    header: "Downloads",
    cell: ({ row }: any) => (
      <div className="text-center font-medium">
        {row.getValue("downloads") || 0}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const isConfidential = row.original.isConfidential;
      return (
        <div className="flex flex-col gap-1">
          <Badge variant={status === "Active" ? "default" : "secondary"}>
            {status}
          </Badge>
          {isConfidential && (
            <Badge variant="destructive" className="text-xs">
              Confidential
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleDownload(row.original.id || row.original._id)}
      >
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    ),
  },
];

// Function to handle download - will be passed via context or props
let handleDownload = (id: string) => {
  console.log("Download function not initialized");
};

export default function DocumentsDownloadPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
  }, []);

  // Initialize download handler
  useEffect(() => {
    handleDownload = downloadDocument;
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/documents");
      setDocuments(response.data || []);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("/documents/statistics");
      setStats(response.data || {});
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const downloadDocument = async (id: string) => {
    try {
      const response = await axios.get(`/documents/${id}/download`, {
        responseType: "blob",
      });

      // Get the content type from response headers
      const contentType = response.headers["content-type"];

      // Create blob with proper type
      const blob = new Blob([response.data], {
        type: contentType || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from Content-Disposition header with better parsing
      let filename = "download";
      const contentDisposition = response.headers["content-disposition"];

      if (contentDisposition) {
        // More robust filename extraction
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      // If no filename from header, try to get from original document data
      if (filename === "download") {
        const originalDoc = documents.find(
          (doc) => doc.id === id || doc._id === id
        );
        if (originalDoc && originalDoc.fileName) {
          filename = originalDoc.fileName;
          // Ensure file extension if missing
          if (originalDoc.fileType && !filename.includes(".")) {
            filename += `.${originalDoc.fileType.toLowerCase()}`;
          }
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });

      // Refresh documents to update download count
      fetchDocuments();
    } catch (error: any) {
      console.error("Error downloading document:", error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    // Search filter
    const matchesSearch =
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.patientName &&
        doc.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.hospital &&
        doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = filterType === "all" || doc.category === filterType;

    // Date range filter
    let matchesDateRange = true;
    if (startDate || endDate) {
      const docDate = new Date(doc.uploadDate || doc.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDateRange = matchesDateRange && docDate >= start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDateRange = matchesDateRange && docDate <= end;
      }
    }

    return matchesSearch && matchesType && matchesDateRange;
  });

  const clearFilters = () => {
    setFilterType("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  const hasActiveFilters =
    filterType !== "all" || startDate || endDate || searchTerm;

  const getDocumentsByCategory = (category: string) => {
    if (category === "all") return filteredDocuments;
    return filteredDocuments.filter((doc) =>
      doc.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Document Downloads
          </h1>
          <p className="text-muted-foreground">
            Access and download patient documents, reports, and medical records
          </p>
        </div>
        <Button onClick={fetchDocuments}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Refresh Files
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDocuments || documents.length}
            </div>
            <p className="text-xs text-muted-foreground">Available files</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
            <Download className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalDownloads || 0}
            </div>
            <p className="text-xs text-muted-foreground">Times downloaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <File className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalSizeFormatted || "0 MB"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.storageUsageDisplay || "0 MB / 5 GB used"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.categories || 0}
            </div>
            <p className="text-xs text-muted-foreground">Document types</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filter by Type */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter by Type
              {filterType !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {filterType}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Document Type</h4>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Medical Reports">
                      Medical Reports
                    </SelectItem>
                    <SelectItem value="Insurance Documents">
                      Insurance Documents
                    </SelectItem>
                    <SelectItem value="Lab Reports">Lab Reports</SelectItem>
                    <SelectItem value="Prescriptions">Prescriptions</SelectItem>
                    <SelectItem value="Discharge Documents">
                      Discharge Documents
                    </SelectItem>
                    <SelectItem value="Surgery Reports">
                      Surgery Reports
                    </SelectItem>
                    <SelectItem value="Salary Slips">Salary Slips</SelectItem>
                    <SelectItem value="Loan Documents">
                      Loan Documents
                    </SelectItem>
                    <SelectItem value="Reimbursement Bills">
                      Reimbursement Bills
                    </SelectItem>
                    <SelectItem value="TPA Forms">TPA Forms</SelectItem>
                    <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
                    <SelectItem value="PAN Card">PAN Card</SelectItem>
                    <SelectItem value="Passport Photo">
                      Passport Photo
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
              {(startDate || endDate) && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Filter by Date Range</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear All Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Documents Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="medical">Medical Reports</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="lab">Lab Reports</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>
                Complete list of available documents for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getDocumentsByCategory("all")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Medical Reports</CardTitle>
              <CardDescription>
                Patient medical reports and clinical documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getDocumentsByCategory("medical")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Documents</CardTitle>
              <CardDescription>
                Insurance policies, claims, and related documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getDocumentsByCategory("insurance")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab">
          <Card>
            <CardHeader>
              <CardTitle>Lab Reports</CardTitle>
              <CardDescription>
                Laboratory test results and diagnostic reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getDocumentsByCategory("lab")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
              <CardDescription>
                Doctor prescriptions and medication lists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getDocumentsByCategory("prescriptions")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions & Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.categoryCounts?.map((categoryData: any) => {
                const categoryDocs = documents.filter(
                  (doc) => doc.category === categoryData._id
                );
                const categoryDownloads = categoryDocs.reduce(
                  (sum, doc) => sum + (doc.downloads || 0),
                  0
                );

                return (
                  <div
                    key={categoryData._id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {categoryData._id}
                      </span>
                      <div className="text-xs text-gray-500">
                        {categoryData.count} files
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {categoryDownloads} downloads
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!stats.categoryCounts || stats.categoryCounts.length === 0) && (
                <div className="text-gray-500 text-center py-4">
                  No categories available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents
                .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
                .slice(0, 5)
                .map((doc) => (
                  <div
                    key={doc.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-2">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <div className="text-sm font-medium max-w-xs truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.patientName || "System"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {doc.downloads || 0}
                      </div>
                      <div className="text-xs text-gray-500">downloads</div>
                    </div>
                  </div>
                ))}
              {documents.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No documents available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
