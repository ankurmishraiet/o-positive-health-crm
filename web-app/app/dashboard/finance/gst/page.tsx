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
  Plus,
  Filter,
  FileText,
  Calendar,
  IndianRupee,
  Calculator,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const gstDataStatic = [
  {
    id: "GST-001",
    invoiceNumber: "INV-2024-001",
    customerName: "Kokilaben Hospital",
    customerGSTIN: "27AADCK8765F1ZV",
    invoiceDate: "2024-01-15",
    taxableAmount: 100000,
    cgst: 9000,
    sgst: 9000,
    igst: 0,
    totalTax: 18000,
    totalAmount: 118000,
    status: "Filed",
    period: "January 2024",
  },
  {
    id: "GST-002",
    invoiceNumber: "INV-2024-002",
    customerName: "Lilavati Hospital",
    customerGSTIN: "27BBBDK8765F1ZV",
    invoiceDate: "2024-01-16",
    taxableAmount: 85000,
    cgst: 7650,
    sgst: 7650,
    igst: 0,
    totalTax: 15300,
    totalAmount: 100300,
    status: "Pending",
    period: "January 2024",
  },
  {
    id: "GST-003",
    invoiceNumber: "INV-2024-003",
    customerName: "Apollo Hospital Delhi",
    customerGSTIN: "07CCCDK8765F1ZV",
    invoiceDate: "2024-01-17",
    taxableAmount: 150000,
    cgst: 0,
    sgst: 0,
    igst: 27000,
    totalTax: 27000,
    totalAmount: 177000,
    status: "Filed",
    period: "January 2024",
  },
  {
    id: "GST-004",
    invoiceNumber: "INV-2024-004",
    customerName: "Fortis Hospital",
    customerGSTIN: "27DDDDK8765F1ZV",
    invoiceDate: "2024-01-18",
    taxableAmount: 75000,
    cgst: 6750,
    sgst: 6750,
    igst: 0,
    totalTax: 13500,
    totalAmount: 88500,
    status: "Pending",
    period: "January 2024",
  },
  {
    id: "GST-005",
    invoiceNumber: "INV-2024-005",
    customerName: "Max Hospital",
    customerGSTIN: "27EEEDK8765F1ZV",
    invoiceDate: "2024-01-19",
    taxableAmount: 120000,
    cgst: 10800,
    sgst: 10800,
    igst: 0,
    totalTax: 21600,
    totalAmount: 141600,
    status: "Draft",
    period: "January 2024",
  },
];

export default function GSTPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [gstRecords, setGstRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchGSTRecords();
  }, []);

  const fetchGSTRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/finance/gst");
      setGstRecords(response.data?.gstRecords || []);
    } catch (error) {
      console.error("Error fetching GST records:", error);
      setError("Failed to load GST data from API. Please check connection.");
      setGstRecords([]); // No fallback to static data
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGST = () => {
    // Navigate to create GST form or open modal
    router.push("/dashboard/finance/gst/create");
  };

  const handleView = (id: string) => {
    // Navigate to view GST record
    router.push(`/dashboard/finance/gst/${id}`);
  };

  const handleEdit = (id: string) => {
    // Navigate to edit GST record
    router.push(`/dashboard/finance/gst/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this GST record?")) {
      return;
    }

    try {
      await axios.delete(`/finance/gst/${id}`);
      toast({
        title: "Success",
        description: "GST record deleted successfully",
      });
      fetchGSTRecords(); // Refresh the list
    } catch (error) {
      console.error("Error deleting GST record:", error);
      toast({
        title: "Error",
        description: "Failed to delete GST record",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await axios.get(`/finance/gst/${id}/download`, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `gst-record-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "GST record downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading GST record:", error);
      toast({
        title: "Error",
        description: "Failed to download GST record",
        variant: "destructive",
      });
    }
  };

  const handleFilterByPeriod = () => {
    // Implement period filter functionality
    toast({
      title: "Feature Coming Soon",
      description: "Period filtering will be available soon",
    });
  };

  const handleDownloadGSTR1 = async () => {
    try {
      const response = await axios.get("/finance/gst/gstr1/download", {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `GSTR1-${new Date().toISOString().split("T")[0]}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "GSTR-1 downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading GSTR-1:", error);
      toast({
        title: "Error",
        description: "Failed to download GSTR-1",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue("customerName")}</div>
          <div className="text-sm text-gray-500">
            {row.original.customerGSTIN}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "taxableAmount",
      header: "Taxable Amount",
      cell: ({ row }: any) => (
        <div className="font-medium">
          ₹{row.getValue("taxableAmount").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "cgst",
      header: "CGST",
      cell: ({ row }: any) => (
        <div className="text-blue-600">
          ₹{row.getValue("cgst").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "sgst",
      header: "SGST",
      cell: ({ row }: any) => (
        <div className="text-green-600">
          ₹{row.getValue("sgst").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "igst",
      header: "IGST",
      cell: ({ row }: any) => (
        <div className="text-purple-600">
          ₹{row.getValue("igst").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "totalTax",
      header: "Total Tax",
      cell: ({ row }: any) => (
        <div className="font-medium text-red-600">
          ₹{row.getValue("totalTax").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }: any) => (
        <div className="font-bold">
          ₹{row.getValue("totalAmount").toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        const variant =
          status === "Filed"
            ? "default"
            : status === "Pending"
              ? "secondary"
              : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Date",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {new Date(row.getValue("invoiceDate")).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const gstRecord = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleView(gstRecord.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(gstRecord.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(gstRecord.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(gstRecord.id)}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const gstData = gstRecords;

  const filteredGST = gstData.filter(
    (gst: any) =>
      (gst.customerName || gst.entityName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (gst.invoiceNumber || gst.gstNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (gst.customerGSTIN || gst.gstNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const getGSTByStatus = (status: string) => {
    if (status === "all") return filteredGST;
    return filteredGST.filter(
      (gst: any) => (gst.status || "").toLowerCase() === status.toLowerCase(),
    );
  };

  const totalTaxableAmount = gstData.reduce(
    (sum: number, gst: any) =>
      sum + (gst.taxableAmount || gst.totalAmount || 0),
    0,
  );
  const totalTaxCollected = gstData.reduce(
    (sum: number, gst: any) => sum + (gst.totalTax || gst.taxAmount || 0),
    0,
  );
  const totalCGST = gstData.reduce(
    (sum: number, gst: any) => sum + (gst.cgst || gst.taxes?.cgst || 0),
    0,
  );
  const totalSGST = gstData.reduce(
    (sum: number, gst: any) => sum + (gst.sgst || gst.taxes?.sgst || 0),
    0,
  );
  const totalIGST = gstData.reduce(
    (sum: number, gst: any) => sum + (gst.igst || gst.taxes?.igst || 0),
    0,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GST Management</h1>
            <p className="text-gray-600">Loading GST data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GST Management</h1>
          <p className="text-muted-foreground">
            Track GST compliance, tax calculations, and filing status
          </p>
        </div>
        <Button onClick={handleCreateGST}>
          <Plus className="mr-2 h-4 w-4" />
          Generate GST Invoice
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <div className="text-orange-800">
              <p className="font-medium">API Connection Issue</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchGSTRecords}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxable Amount
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalTaxableAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total turnover</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
            <Calculator className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalTaxCollected.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Tax collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CGST</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ₹{totalCGST.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Central GST</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SGST</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalSGST.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">State GST</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IGST</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{totalIGST.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Integrated GST</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search GST records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleFilterByPeriod}>
          <Filter className="mr-2 h-4 w-4" />
          Filter by Period
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadGSTR1}>
          <FileText className="mr-2 h-4 w-4" />
          Download GSTR-1
        </Button>
      </div>

      {/* GST Records Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="filed">Filed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All GST Records</CardTitle>
              <CardDescription>
                Complete GST transaction records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getGSTByStatus("all")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filed">
          <Card>
            <CardHeader>
              <CardTitle>Filed Returns</CardTitle>
              <CardDescription>
                GST returns that have been filed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getGSTByStatus("filed")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Returns</CardTitle>
              <CardDescription>GST returns awaiting filing</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getGSTByStatus("pending")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft">
          <Card>
            <CardHeader>
              <CardTitle>Draft Invoices</CardTitle>
              <CardDescription>Invoices being prepared</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getGSTByStatus("draft")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* GST Summary & Compliance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tax Rate Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">18% GST (Standard Rate)</span>
                <span className="font-medium">
                  ₹{totalTaxCollected.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Most transactions fall under 18% GST rate for healthcare
                services
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>CGST (9%)</span>
                  <span>₹{totalCGST.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST (9%)</span>
                  <span>₹{totalSGST.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IGST (18%)</span>
                  <span>₹{totalIGST.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">GSTR-1 Filing</span>
                <Badge variant="default">Up to Date</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">GSTR-3B Filing</span>
                <Badge variant="secondary">Due Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Annual Return</span>
                <Badge variant="outline">Not Due</Badge>
              </div>

              <div className="pt-4 space-y-2">
                <div className="text-sm font-medium">Next Due Dates:</div>
                <div className="text-xs text-gray-600">
                  GSTR-1: 11th Feb 2024
                </div>
                <div className="text-xs text-gray-600">
                  GSTR-3B: 20th Feb 2024
                </div>
              </div>

              <Button size="sm" className="w-full mt-4">
                <FileText className="mr-2 h-4 w-4" />
                Generate GSTR-1
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
