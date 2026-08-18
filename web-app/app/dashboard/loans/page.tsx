"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  CreditCard,
  User,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import axios from "@/axios/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/hooks/use-permissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoansPage() {
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>({
    totalLoans: 0,
    approvedLoans: 0,
    totalAmount: 0,
    approvedAmount: 0,
  });

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const handleEditLoan = (loan: any) => {
    router.push(`/dashboard/loans/edit/${loan.id || loan._id}`);
  };

  const handleDeleteLoan = (loan: any) => {
    setSelectedLoan(loan);
    setDeleteDialogOpen(true);
  };

  const handleUpdateStatus = (loan: any) => {
    setSelectedLoan(loan);
    setNewStatus(loan.status);
    setStatusDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedLoan) return;

    try {
      await axios.delete(`/loans/${selectedLoan.id || selectedLoan._id}`);
      
      toast({
        title: "Success",
        description: "Loan application deleted successfully",
      });
      
      setDeleteDialogOpen(false);
      setSelectedLoan(null);
      fetchLoans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete loan application",
        variant: "destructive",
      });
    }
  };

  const confirmStatusUpdate = async () => {
    if (!selectedLoan || !newStatus) return;

    try {
      await axios.put(`/loans/${selectedLoan.id || selectedLoan._id}/status`, {
        status: newStatus
      });
      
      toast({
        title: "Success",
        description: "Loan status updated successfully",
      });
      
      setStatusDialogOpen(false);
      setSelectedLoan(null);
      setNewStatus("");
      fetchLoans();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update loan status",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Loan ID",
    },
    {
      accessorKey: "applicantName",
      header: "Applicant",
      cell: ({ row }: any) => (
        <div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{row.getValue("applicantName")}</span>
          </div>
          <div className="text-sm text-gray-500">{row.original.applicantId}</div>
        </div>
      ),
    },
    {
      accessorKey: "loanType",
      header: "Loan Type",
    },
    {
      accessorKey: "loanAmount",
      header: "Requested Amount",
      cell: ({ row }: any) => {
        const amount = row.getValue("loanAmount") || row.original.amount || 0;
        return (
          <div className="font-medium">
            {amount > 0 ? `₹${amount.toLocaleString()}` : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "approvedAmount",
      header: "Approved Amount",
      cell: ({ row }: any) => {
        const amount = row.getValue("approvedAmount");
        return (
          <div
            className={`font-medium ${
              amount > 0 ? "text-green-600" : "text-gray-400"
            }`}
          >
            {amount > 0 ? `₹${amount.toLocaleString()}` : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "creditedAmount",
      header: "Credited Amount (after GST & deductions)",
      cell: ({ row }: any) => {
        const amount = row.getValue("creditedAmount");
        return (
          <div
            className={`font-medium ${
              amount > 0 ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {amount > 0 ? `₹${amount.toLocaleString()}` : "Not Disbursed"}
          </div>
        );
      },
    },
    {
      accessorKey: "interestRate",
      header: "Interest Rate",
      cell: ({ row }: any) => {
        const rate = row.getValue("interestRate");
        return rate > 0 ? `${rate}%` : "N/A";
      },
    },
    {
      accessorKey: "emi",
      header: "EMI",
      cell: ({ row }: any) => {
        const emi = row.getValue("emi") || row.original.emiAmount || 0;
        return emi > 0 ? `₹${emi.toLocaleString()}` : "N/A";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        const variant =
          status === "Approved" || status === "Active"
            ? "default"
            : status === "Under Review"
            ? "secondary"
            : status === "Rejected"
            ? "destructive"
            : "outline";
        const icon =
          status === "Approved" || status === "Active"
            ? CheckCircle
            : status === "Under Review"
            ? Clock
            : AlertCircle;
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
      accessorKey: "hospital",
      header: "Hospital",
    },
    {
      accessorKey: "applicationDate",
      header: "Application Date",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>
            {new Date(row.getValue("applicationDate")).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const loan = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canUpdate("loans") && (
                <DropdownMenuItem onClick={() => handleEditLoan(loan)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Loan
                </DropdownMenuItem>
              )}
              {canUpdate("loans") && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(loan)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Update Status
                </DropdownMenuItem>
              )}
              {canDelete("loans") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteLoan(loan)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Loan
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchLoans();
    fetchStatistics();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await axios.get("/loans");
      setLoans(response.data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("/loans/statistics");
      setStatistics(response.data || {
        totalLoans: 0,
        approvedLoans: 0,
        totalAmount: 0,
        approvedAmount: 0,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const loansData = loans;

  const filteredLoans = loansData.filter(
    (loan) =>
      (loan.applicantName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.loanType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loan.id || loan._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLoansByStatus = (status: string) => {
    if (status === "all") return filteredLoans;
    return filteredLoans.filter(
      (loan) => (loan.status || '').toLowerCase() === status.toLowerCase()
    );
  };

  const totalLoansAmount = loansData.reduce(
    (sum, loan) => sum + (loan.loanAmount || loan.amount || 0),
    0
  );
  const totalApprovedAmount = loansData
    .filter((loan) => loan.status === "Approved" || loan.status === "Active")
    .reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);
  const totalDisbursed = loansData
    .filter((loan) => loan.disbursementStatus === "Disbursed")
    .reduce((sum, loan) => sum + (loan.approvedAmount || 0), 0);

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
          <h1 className="text-3xl font-bold tracking-tight">All Loans</h1>
          <p className="text-muted-foreground">
            Comprehensive loan management and tracking system
          </p>
        </div>
        <Link href="/dashboard/loans/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Loan Application
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loansData.length}</div>
            <p className="text-xs text-muted-foreground">
              All loan applications
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requested
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{(totalLoansAmount / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Amount requested</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(totalApprovedAmount / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Amount approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disbursed</CardTitle>
            <IndianRupee className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹{(totalDisbursed / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">Amount disbursed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Type
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Loans Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="under review">Under Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Loan Applications</CardTitle>
              <CardDescription>
                Complete list of loan applications and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getLoansByStatus("all")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Applications</CardTitle>
              <CardDescription>
                Recently submitted loan applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getLoansByStatus("new")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing</CardTitle>
              <CardDescription>
                Loan applications currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getLoansByStatus("processing")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Loans</CardTitle>
              <CardDescription>
                Loans that have been approved for disbursement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getLoansByStatus("approved")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Loans</CardTitle>
              <CardDescription>
                Currently active loans with ongoing EMIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getLoansByStatus("active")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="under review">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <CardDescription>
                Loan applications currently being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getLoansByStatus("under review")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Applications</CardTitle>
              <CardDescription>
                Loan applications that were not approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getLoansByStatus("rejected")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Loan Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(loansData.map((loan) => loan.loanType))).map(
                (type) => {
                  const typeLoans = loansData.filter(
                    (loan) => loan.loanType === type
                  );
                  const typeTotal = typeLoans.reduce(
                    (sum, loan) => sum + loan.loanAmount,
                    0
                  );
                  const approved = typeLoans.filter(
                    (loan) =>
                      loan.status === "Approved" || loan.status === "Active"
                  ).length;

                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{type}</span>
                        <span className="text-sm text-gray-500">
                          {typeLoans.length} applications
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Amount: ₹{(typeTotal / 100000).toFixed(1)}L</span>
                        <span className="text-green-600">
                          {approved} approved
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Wise Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(loansData.map((loan) => loan.hospital))).map(
                (hospital) => {
                  const hospitalLoans = loansData.filter(
                    (loan) => loan.hospital === hospital
                  );
                  const hospitalTotal = hospitalLoans.reduce(
                    (sum, loan) => sum + loan.loanAmount,
                    0
                  );
                  const approved = hospitalLoans.filter(
                    (loan) =>
                      loan.status === "Approved" || loan.status === "Active"
                  ).length;

                  return (
                    <div key={hospital} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{hospital}</span>
                        <span className="text-sm text-gray-500">
                          {hospitalLoans.length} loans
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>₹{(hospitalTotal / 100000).toFixed(1)}L</span>
                        <span className="text-green-600">
                          {approved} approved
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Loan Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete loan application for {selectedLoan?.applicantName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Loan Status</DialogTitle>
            <DialogDescription>
              Update the status for loan application of {selectedLoan?.applicantName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
