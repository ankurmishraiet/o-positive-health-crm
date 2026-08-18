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
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  FileText,
  AlertTriangle,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
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

export default function HospitalInvoicePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    fetchHospitalInvoices();
  }, []);

  const fetchHospitalInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/invoices", {
        params: { entityType: "Hospital" },
      });
      console.log("Fetched hospital invoices:", response.data);
      setInvoices(response.data?.invoices || []);
    } catch (error) {
      console.error("Error fetching hospital invoices:", error);
      setError(
        "Failed to load hospital invoices from API. Please check connection.",
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
      fetchHospitalInvoices();
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

  const columns = [
    {
      accessorKey: "id",
      header: "Invoice ID",
      cell: ({ row }: any) => (
        <div className="font-medium text-blue-600 uppercase">
          {row.getValue("id")
            ? row.getValue("id").toString().slice(-7)
            : row.original.invoiceNumber || "--"}
        </div>
      ),
    },
    {
      accessorKey: "hospitalName",
      header: "Hospital",
      cell: ({ row }: any) => (
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {row.getValue("hospitalName") || row.original.entityName || "--"}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {row.original.location || row.original.address || "--"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalPatients",
      header: "Patients",
      cell: ({ row }: any) => (
        <div className="text-center font-medium">
          {row.getValue("totalPatients") ?? row.original.patientCount ?? "--"}
        </div>
      ),
    },
    {
      accessorKey: "totalRevenue",
      header: "Total Revenue",
      cell: ({ row }: any) => {
        const revenue =
          row.getValue("totalRevenue") ||
          row.original.amount ||
          row.original.totalAmount;
        return (
          <div className="font-medium">
            {revenue ? `₹${revenue?.toLocaleString()}` : "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "hospitalShare",
      header: "Hospital Share",
      cell: ({ row }: any) => {
        const share =
          row.getValue("hospitalShare") || row.original.partnerShare;
        return (
          <div className="font-medium text-blue-600">
            {share ? `₹${share?.toLocaleString()}` : "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "ourCommission",
      header: "Our Commission",
      cell: ({ row }: any) => {
        const commission =
          row.getValue("ourCommission") || row.original.commission;
        return (
          <div className="font-medium text-green-600">
            {commission ? `₹${commission?.toLocaleString()}` : "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        const variant =
          status === "Paid"
            ? "default"
            : status === "Processing"
              ? "secondary"
              : status === "Overdue"
                ? "destructive"
                : "outline";
        const icon = status === "Paid" ? CheckCircle : Clock;
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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const invoice = row.original;
        const handleDownload = async (id: string) => {
          try {
            if (!id) {
              console.error("Invalid invoice ID:", id);
              return;
            }

            const response = await axios.get(`/invoices/${id}/download`, {
              responseType: "blob",
            });

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `hospital-invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast({
              title: "Success",
              description: "Hospital invoice downloaded successfully",
            });
          } catch (error: any) {
            console.error("Error downloading hospital invoice:", error);
            const errorMessage =
              error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to download invoice";
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        };

        const handleView = (id: string) => {
          if (!id) {
            console.error("Invalid invoice ID:", id);
            return;
          }
          router.push(`/dashboard/finance/invoices/${id}`);
        };

        const handleEdit = (id: string) => {
          if (!id) {
            console.error("Invalid invoice ID:", id);
            return;
          }
          router.push(`/dashboard/finance/invoices/${id}/edit`);
        };

        const handleDeleteClick = (id: string) => {
          if (!id) {
            console.error("Invalid invoice ID:", id);
            return;
          }
          setInvoiceToDelete(id);
          setDeleteDialogOpen(true);
        };

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(
                  "Viewing hospital invoice with ID:",
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
                  "Editing hospital invoice with ID:",
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
                  "Downloading hospital invoice with ID:",
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
                  "Deleting hospital invoice with ID:",
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

  const hospitalInvoiceData = invoices.map((invoice: any) => ({
    id: invoice._id,
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    hospitalName: invoice.entityName || invoice.entityId?.name,
    location: invoice.entityId?.location?.city
      ? `${invoice.entityId.location.city}, ${invoice.entityId.location.state}`
      : invoice.entityId?.address,
    totalPatients: invoice.patientCount ?? invoice.items?.length ?? 0,
    totalRevenue: invoice.totalAmount,
    ourCommission:
      invoice.invoiceType === "Commission" ? invoice.totalAmount : 0,
    hospitalShare:
      invoice.invoiceType === "Service"
        ? invoice.totalAmount - (invoice.commission || 0)
        : null,
    status: invoice.paymentStatus || invoice.status,
    invoiceDate: invoice.issueDate,
    services: invoice.entityId?.facilities || [],
  }));

  const filteredInvoices = hospitalInvoiceData.filter(
    (invoice: any) =>
      (invoice.hospitalName || invoice.entityName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.location || invoice.description || "")
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

  const totalPaid = hospitalInvoiceData
    .filter(
      (invoice: any) =>
        invoice.status === "Paid" || invoice.paymentStatus === "Paid",
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.ourCommission || invoice.totalAmount || 0),
      0,
    );

  const totalPending = hospitalInvoiceData
    .filter((invoice: any) =>
      ["Pending", "Processing", "Draft", "Sent"].includes(
        invoice.status || invoice.paymentStatus,
      ),
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.ourCommission || invoice.pendingAmount || 0),
      0,
    );

  const totalOverdue = hospitalInvoiceData
    .filter(
      (invoice: any) =>
        invoice.status === "Overdue" || invoice.paymentStatus === "Overdue",
    )
    .reduce(
      (sum: number, invoice: any) =>
        sum + (invoice.ourCommission || invoice.pendingAmount || 0),
      0,
    );

  const totalRevenue = hospitalInvoiceData.reduce(
    (sum: number, invoice: any) =>
      sum + (invoice.totalRevenue || invoice.totalAmount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hospital Invoice</h1>
            <p className="text-gray-600">Loading hospital invoices...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">
            Hospital Invoice
          </h1>
          <p className="text-muted-foreground">
            Manage hospital partnership invoices and commission settlements
          </p>
        </div>
        <Link href="/dashboard/finance/invoices/create?entityType=Hospital">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
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
              onClick={fetchHospitalInvoices}
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalRevenue?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Combined revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commission Received
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPaid?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Paid commissions</p>
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
              ₹{totalPending?.toLocaleString()}
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
              ₹{totalOverdue?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hospital invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {/* <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Location
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button> */}
      </div>

      {/* Hospital Invoices Table */}
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
              <CardTitle>All Hospital Invoices</CardTitle>
              <CardDescription>
                Complete list of hospital partnership invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getInvoicesByStatus("all")} />
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
                columns={columns}
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
                columns={columns}
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
                Successfully settled hospital invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getInvoicesByStatus("paid")} />
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
                columns={columns}
                data={getInvoicesByStatus("overdue")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalInvoiceData.map((hospital) => {
                const commissionRate = hospital.totalRevenue
                  ? (
                      (hospital.ourCommission / hospital.totalRevenue) *
                      100
                    ).toFixed(1)
                  : 0;

                return (
                  <div key={hospital.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {hospital.hospitalName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {commissionRate}% commission
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Patients: {hospital.totalPatients}</span>
                      <span className="text-green-600">
                        ₹{hospital?.ourCommission?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hospitalInvoiceData.map((hospital) => (
                <div key={hospital.hospitalName} className="space-y-2">
                  <div className="text-sm font-medium">
                    {hospital.hospitalName}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hospitalInvoiceData.map((hospital) => (
                      <div key={hospital.id} className="space-y-2">
                        <div className="text-sm font-medium">
                          {hospital.hospitalName}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {hospital.services?.map((service: any) => (
                            <Badge
                              key={service}
                              variant="outline"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
