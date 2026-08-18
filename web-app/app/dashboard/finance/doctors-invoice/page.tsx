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
  User,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const columns = [
  {
    accessorKey: "id",
    header: "Invoice ID",
    cell: ({ row }: any) => (
      <span className="font-medium">
        {row.getValue("id") || row.original.invoiceNumber}
      </span>
    ),
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {row.getValue("doctorName") || row.original.entityName || "N/A"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {row.original.specialization || row.original.category || ""}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "hospital",
    header: "Hospital",
    cell: ({ row }: any) => (
      <span>
        {row.getValue("hospital") || row.original.description || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "consultations",
    header: "Consultations",
    cell: ({ row }: any) => (
      <div className="text-center font-medium">
        {row.getValue("consultations") || row.original.quantity || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total Amount",
    cell: ({ row }: any) => (
      <div className="font-medium">
        ₹
        {(
          row.getValue("totalAmount") ||
          row.original.totalAmount ||
          0
        ).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "commission",
    header: "Commission",
    cell: ({ row }: any) => (
      <div className="font-medium text-green-600">
        ₹
        {(
          row.getValue("commission") ||
          row.original.paidAmount ||
          0
        ).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status =
        row.getValue("status") || row.original.paymentStatus || "Unknown";
      const variant = ["Paid", "Completed"].includes(status)
        ? "default"
        : ["Processing", "Pending", "Draft", "Sent"].includes(status)
          ? "secondary"
          : ["Overdue", "Failed"].includes(status)
            ? "destructive"
            : "outline";
      const icon = ["Paid", "Completed"].includes(status) ? CheckCircle : Clock;
      const IconComponent = icon;
      return (
        <div className="flex items-center space-x-2">
          <IconComponent className="h-3 w-3" />
          <Badge variant={variant}>{status}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }: any) => {
      const date =
        row.getValue("invoiceDate") ||
        row.original.date ||
        row.original.createdAt;
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{date ? new Date(date).toLocaleDateString() : "N/A"}</span>
        </div>
      );
    },
  },
];

export default function DoctorsInvoicePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDoctorInvoices();
  }, []);

  const fetchDoctorInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/invoices", {
        params: { entityType: "Doctor" },
      });
      setInvoices(response.data?.invoices || []);
    } catch (error) {
      console.error("Error fetching doctor invoices:", error);
      setError(
        "Failed to load doctor invoices from API. Please check your connection.",
      );
      setInvoices([]); // No fallback to static data
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await axios.delete(`/invoices/${invoiceToDelete}`);
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
      // Refresh the invoice list
      fetchDoctorInvoices();
    } catch (error: any) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleGenerateInvoice = () => {
    // Navigate to create doctor invoice form
    router.push("/dashboard/finance/invoices/create?entityType=Doctor");
  };

  const handleView = (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid invoice ID",
        variant: "destructive",
      });
      return;
    }

    router.push(`/dashboard/finance/invoices/${id}`);
  };

  const handleEdit = (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid invoice ID",
        variant: "destructive",
      });
      return;
    }
    router.push(`/dashboard/finance/invoices/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid invoice ID",
        variant: "destructive",
      });
      return;
    }
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDownload = async (id: string) => {
    try {
      if (!id) {
        toast({
          title: "Error",
          description: "Invalid invoice ID",
          variant: "destructive",
        });
        return;
      }

      // Request a ready-made PDF from the backend
      const response = await axios.get(`/invoices/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `doctor-invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Doctor invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading doctor invoice:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to download doctor invoice";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const columnsWithActions = [
    ...columns,
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const invoice = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(
                  "Viewing invoice with ID:",
                  invoice.id || invoice._id,
                  "Full invoice:",
                  invoice,
                );
                handleView(invoice.id || invoice._id);
              }}
              title="View Invoice Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(
                  "Editing invoice with ID:",
                  invoice.id || invoice._id,
                  "Full invoice:",
                  invoice,
                );
                handleEdit(invoice.id || invoice._id);
              }}
              title="Edit Invoice"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(
                  "Downloading invoice with ID:",
                  invoice.id || invoice._id,
                  "Full invoice:",
                  invoice,
                );
                handleDownload(invoice.id || invoice._id);
              }}
              title="Download Invoice PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                console.log(
                  "Deleting invoice with ID:",
                  invoice.id || invoice._id,
                  "Full invoice:",
                  invoice,
                );
                handleDeleteClick(invoice.id || invoice._id);
              }}
              title="Delete Invoice"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const doctorsInvoiceData = invoices.map((invoice: any) => ({
    id: invoice._id,
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    doctorName: invoice.entityName || invoice.entityId?.name,
    doctorId: invoice.entityId?._id || invoice.entityId,
    specialization: invoice.entityId?.specialization || invoice.category,
    hospital: invoice.entityId?.hospital || invoice.description,
    consultations: invoice.patientCount ?? invoice.items?.length ?? 0,
    totalAmount: invoice.totalAmount,
    commission:
      invoice.invoiceType === "Commission"
        ? invoice.totalAmount
        : invoice.paidAmount || 0,
    invoiceDate: invoice.issueDate || invoice.date,
    status: invoice.paymentStatus || invoice.status,
    paymentDate: invoice.paymentDate,
    month: invoice.issueDate
      ? new Date(invoice.issueDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "",
  }));

  const filteredInvoices = doctorsInvoiceData.filter(
    (invoice: any) =>
      (invoice.doctorName || invoice.entityName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.specialization || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.hospital || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.id || invoice.invoiceNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const getInvoicesByStatus = (status: string) => {
    if (status === "all") return filteredInvoices;
    return filteredInvoices.filter(
      (invoice: any) =>
        (invoice.status || invoice.paymentStatus || "").toLowerCase() ===
        status.toLowerCase(),
    );
  };

  const totalPaid = doctorsInvoiceData
    .filter(
      (invoice: any) =>
        invoice.status === "Paid" || invoice.paymentStatus === "Paid",
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.commission || invoice.totalAmount || 0),
      0,
    );

  const totalPending = doctorsInvoiceData
    .filter((invoice: any) =>
      ["Pending", "Processing", "Draft", "Sent"].includes(
        invoice.status || invoice.paymentStatus,
      ),
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.commission || invoice.pendingAmount || 0),
      0,
    );

  const totalOverdue = doctorsInvoiceData
    .filter(
      (invoice: any) =>
        invoice.status === "Overdue" || invoice.paymentStatus === "Overdue",
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.commission || invoice.pendingAmount || 0),
      0,
    );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctors Invoice</h1>
            <p className="text-gray-600">Loading doctor invoices...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Doctors Invoice</h1>
          <p className="text-muted-foreground">
            Manage doctor consultation fees and commission payments
          </p>
        </div>
        <Button onClick={handleGenerateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
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
              onClick={fetchDoctorInvoices}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue Amount
            </CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invoices
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctorsInvoiceData.length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {/* <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Hospital
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button> */}
      </div>

      {/* Invoices Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Invoices</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Doctor Invoices</CardTitle>
              <CardDescription>
                Complete list of doctor consultation invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsWithActions}
                data={getInvoicesByStatus("all")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invoices</CardTitle>
              <CardDescription>
                Invoices awaiting payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsWithActions}
                data={getInvoicesByStatus("pending")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Invoices</CardTitle>
              <CardDescription>
                Invoices currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsWithActions}
                data={getInvoicesByStatus("processing")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Invoices</CardTitle>
              <CardDescription>
                Successfully paid doctor invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsWithActions}
                data={getInvoicesByStatus("paid")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices</CardTitle>
              <CardDescription>
                Invoices that are past their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columnsWithActions}
                data={getInvoicesByStatus("overdue")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Specialization Wise Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(
                  doctorsInvoiceData.map((invoice) => invoice.specialization),
                ),
              ).map((specialization) => {
                const specializationInvoices = doctorsInvoiceData.filter(
                  (invoice) => invoice.specialization === specialization,
                );
                const specializationTotal = specializationInvoices
                  .filter((invoice) => invoice.status === "Paid")
                  .reduce((sum, invoice) => sum + invoice.commission, 0);

                return (
                  <div
                    key={specialization}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{specialization}</span>
                    <span className="font-medium text-green-600">
                      ₹{specializationTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Wise Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(doctorsInvoiceData.map((invoice) => invoice.hospital)),
              ).map((hospital) => {
                const hospitalInvoices = doctorsInvoiceData.filter(
                  (invoice) => invoice.hospital === hospital,
                );
                const hospitalTotal = hospitalInvoices
                  .filter((invoice) => invoice.status === "Paid")
                  .reduce((sum, invoice) => sum + invoice.commission, 0);

                return (
                  <div
                    key={hospital}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{hospital}</span>
                    <span className="font-medium text-green-600">
                      ₹{hospitalTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
