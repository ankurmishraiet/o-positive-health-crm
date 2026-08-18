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
  IndianRupee,
  Eye,
  Send,
  MessageSquare,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/components/ui/use-toast";
import DocumentComments from "@/components/document-comments";

const columns = [
  {
    accessorKey: "salarySlipData.employeeName",
    header: "Employee",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {row.original.salarySlipData?.employeeName || "Unknown"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {row.original.salarySlipData?.employeeId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.designation",
    header: "Designation",
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">
          {row.original.salarySlipData?.designation || "N/A"}
        </div>
        <div className="text-sm text-gray-500">
          {row.original.salarySlipData?.department || "N/A"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.month",
    header: "Period",
    cell: ({ row }: any) => (
      <div>
        {row.original.salarySlipData?.month} {row.original.salarySlipData?.year}
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.basicSalary",
    header: "Basic Salary",
    cell: ({ row }: any) => (
      <div className="font-medium">
        ₹{(row.original.salarySlipData?.basicSalary || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.allowances",
    header: "Allowances",
    cell: ({ row }: any) => (
      <div className="text-green-600">
        +₹{(row.original.salarySlipData?.allowances || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.deductions",
    header: "Deductions",
    cell: ({ row }: any) => (
      <div className="text-red-600">
        -₹{(row.original.salarySlipData?.deductions || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "salarySlipData.netSalary",
    header: "Net Salary",
    cell: ({ row }: any) => (
      <div className="font-bold text-blue-600">
        ₹{(row.original.salarySlipData?.netSalary || 0).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      return (
        <Badge variant={status === "Active" ? "default" : "outline"}>
          {status === "Active" ? "Generated" : status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "salarySlipData.emailSent",
    header: "Email",
    cell: ({ row }: any) => {
      const sent = row.original.salarySlipData?.emailSent;
      return (
        <Badge variant={sent ? "default" : "destructive"}>
          {sent ? "Sent" : "Not Sent"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "salarySlipData.generatedDate",
    header: "Generated Date",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span>
          {new Date(
            row.original.salarySlipData?.generatedDate ||
              row.original.uploadDate
          ).toLocaleDateString()}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleView(row.original.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleDownload(row.original.id)}
        >
          <Download className="h-4 w-4" />
        </Button>
        {!row.original.salarySlipData?.emailSent && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSendEmail(row.original.id)}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
        <DocumentComments 
          documentId={row.original._id || row.original.id} 
          documentName={`Salary Slip - ${row.original.salarySlipData?.employeeName}`}
        />
      </div>
    ),
  },
];

// Function handlers - will be initialized in component
let handleView = (id: string) => console.log("View function not initialized");
let handleDownload = (id: string) =>
  console.log("Download function not initialized");
let handleSendEmail = (id: string) =>
  console.log("Send email function not initialized");

export default function SalarySlipsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalarySlips();
  }, []);

  // Initialize handlers
  useEffect(() => {
    handleView = viewSalarySlip;
    handleDownload = downloadSalarySlip;
    handleSendEmail = sendEmail;
  }, []);

  const fetchSalarySlips = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/documents/salary-slips/list");
      setSalarySlips(response.data || []);
    } catch (error: any) {
      console.error("Error fetching salary slips:", error);
      toast({
        title: "Error",
        description: "Failed to fetch salary slips",
        variant: "destructive",
      });
      setSalarySlips([]);
    } finally {
      setLoading(false);
    }
  };

  const viewSalarySlip = async (id: string) => {
    try {
      // Open in new tab
      window.open(`/api/v1/documents/${id}/download`, "_blank");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to view salary slip",
        variant: "destructive",
      });
    }
  };

  const downloadSalarySlip = async (id: string) => {
    try {
      const response = await axios.get(`/documents/${id}/download`, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];
      let filename = "salary_slip.pdf";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Salary slip downloaded successfully",
      });

      // Refresh data
      fetchSalarySlips();
    } catch (error: any) {
      console.error("Error downloading salary slip:", error);
      toast({
        title: "Error",
        description: "Failed to download salary slip",
        variant: "destructive",
      });
    }
  };

  const sendEmail = async (id: string) => {
    try {
      await axios.put(`/documents/salary-slips/${id}/mark-email-sent`);
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
      fetchSalarySlips(); // Refresh data
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
    }
  };

  const generateBulkSalarySlips = async () => {
    try {
      const response = await axios.post("/hr/salary-slips/generate-bulk", {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      
      toast({
        title: "Success", 
        description: "Bulk salary slips generated successfully",
      });
      
      fetchSalarySlips(); // Refresh the list
    } catch (error: any) {
      console.error("Error generating bulk salary slips:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate salary slips",
        variant: "destructive",
      });
    }
  };

  const sendAllEmails = async () => {
    const unsent = salarySlips.filter(
      (slip) => !slip.salarySlipData?.emailSent
    );

    try {
      for (const slip of unsent) {
        await sendEmail(slip.id);
      }
      toast({
        title: "Success",
        description: `Sent ${unsent.length} emails successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send some emails",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = async () => {
    try {
      const response = await axios.get("/hr/salary-slips/download-bulk", {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-slips-${new Date().getFullYear()}-${new Date().getMonth() + 1}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Salary slips downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading salary slips:", error);
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to download salary slips",
        variant: "destructive",
      });
    }
  };

  const filteredSlips = salarySlips.filter(
    (slip) =>
      (slip.salarySlipData?.employeeName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (slip.salarySlipData?.employeeId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (slip.salarySlipData?.designation || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (slip.salarySlipData?.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getSlipsByStatus = (status: string) => {
    if (status === "all") return filteredSlips;
    if (status === "generated")
      return filteredSlips.filter((slip) => slip.status === "Active");
    if (status === "pending")
      return filteredSlips.filter((slip) => slip.status !== "Active");
    return filteredSlips;
  };

  const totalEmployees = salarySlips.length;
  const generatedSlips = salarySlips.filter(
    (slip) => slip.status === "Active"
  ).length;
  const totalSalaryAmount = salarySlips.reduce(
    (sum, slip) => sum + (slip.salarySlipData?.netSalary || 0),
    0
  );
  const emailsSent = salarySlips.filter(
    (slip) => slip.salarySlipData?.emailSent
  ).length;
  const totalDownloads = salarySlips.reduce(
    (sum, slip) => sum + (slip.downloads || 0),
    0
  );

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
          <h1 className="text-3xl font-bold tracking-tight">Salary Slips</h1>
          <p className="text-muted-foreground">
            Generate, manage, and distribute employee salary slips
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={sendAllEmails}>
            <Send className="mr-2 h-4 w-4" />
            Send All Emails
          </Button>
          <Button onClick={generateBulkSalarySlips}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Bulk
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Slips</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Salary slips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {generatedSlips}
            </div>
            <p className="text-xs text-muted-foreground">Ready to distribute</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salary</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{(totalSalaryAmount / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Send className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {emailsSent}
            </div>
            <p className="text-xs text-muted-foreground">
              Of {totalEmployees} slips
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalDownloads}
            </div>
            <p className="text-xs text-muted-foreground">Total downloads</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search salary slips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Department
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Select Period
        </Button>
      </div>

      {/* Salary Slips Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Salary Slips</TabsTrigger>
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Salary Slips</CardTitle>
              <CardDescription>
                Complete list of employee salary slips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getSlipsByStatus("all")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated">
          <Card>
            <CardHeader>
              <CardTitle>Generated Salary Slips</CardTitle>
              <CardDescription>
                Salary slips that have been generated and are ready for
                distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getSlipsByStatus("generated")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Salary Slips</CardTitle>
              <CardDescription>
                Salary slips that are yet to be generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getSlipsByStatus("pending")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Department Analysis & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Wise Salary Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(
                  salarySlips
                    .map((slip) => slip.salarySlipData?.department)
                    .filter(Boolean)
                )
              ).map((department) => {
                const departmentSlips = salarySlips.filter(
                  (slip) => slip.salarySlipData?.department === department
                );
                const departmentTotal = departmentSlips.reduce(
                  (sum, slip) => sum + (slip.salarySlipData?.netSalary || 0),
                  0
                );
                const avgSalary = departmentTotal / departmentSlips.length;
                const generated = departmentSlips.filter(
                  (slip) => slip.status === "Active"
                ).length;

                return (
                  <div key={department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{department}</span>
                      <Badge variant="outline">
                        {generated}/{departmentSlips.length} generated
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>
                        Total: ₹{(departmentTotal / 100000).toFixed(1)}L
                      </span>
                      <span>Avg: ₹{avgSalary.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {departmentSlips.length} employees
                    </div>
                  </div>
                );
              })}
              {salarySlips.length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No salary slips available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Generate Missing Slips</div>
                  <Badge variant="destructive">
                    {
                      salarySlips.filter((slip) => slip.status !== "Active")
                        .length
                    }{" "}
                    pending
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={generateBulkSalarySlips}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate All Pending
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Send Email Notifications</div>
                  <Badge variant="secondary">
                    {
                      salarySlips.filter(
                        (slip) =>
                          !slip.salarySlipData?.emailSent &&
                          slip.status === "Active"
                      ).length
                    }{" "}
                    unsent
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={sendAllEmails}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send All Emails
                </Button>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Download All Slips</div>
                  <Badge variant="outline">ZIP archive</Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={handleBulkDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Bulk Download
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">
                  Distribution Summary
                </div>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Generated:</span>
                    <span>
                      {generatedSlips}/{totalEmployees}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emails Sent:</span>
                    <span>
                      {emailsSent}/{generatedSlips}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloaded:</span>
                    <span>{totalDownloads} times</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
