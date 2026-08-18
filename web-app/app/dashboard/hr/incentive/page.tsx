"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Award,
  Target,
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "@/axios/axios";

interface Incentive {
  _id: string;
  incentiveId: string;
  employeeName: string;
  employeeId: string;
  employeeCode: string;
  department: string;
  designation: string;
  incentiveType: string;
  title: string;
  description: string;
  amount: number;
  month: number;
  year: number;
  quarter: string;
  paymentStatus: "Pending" | "Processing" | "Paid" | "Hold" | "Cancelled";
  approvalStatus:
    | "Draft"
    | "Submitted"
    | "Under Review"
    | "Approved"
    | "Rejected";
  submittedDate?: string;
  approvedDate?: string;
  paymentDate?: string;
  netAmount: number;
  criteria?: {
    targetValue?: number;
    achievedValue?: number;
    achievementPercentage?: number;
  };
}

interface Employee {
  _id: string;
  name: string;
  employeeId?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
}

interface Stats {
  totalIncentives: number;
  totalAmount: number;
  currentMonthAmount: number;
  pendingApproval: number;
  topPerformersCount: number;
}

export default function IncentivePage() {
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(
    null,
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [creating, setCreating] = useState(false);
  const [incentiveForm, setIncentiveForm] = useState({
    employeeId: "",
    incentiveType: "",
    title: "",
    description: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [stats, setStats] = useState<Stats>({
    totalIncentives: 0,
    totalAmount: 0,
    currentMonthAmount: 0,
    pendingApproval: 0,
    topPerformersCount: 0,
  });

  useEffect(() => {
    fetchIncentives();
    fetchStats();
  }, []);

  const fetchIncentives = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/hr/incentives`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIncentives(data);
      }
    } catch (error) {
      console.error("Error fetching incentives:", error);
      toast({
        title: "Error",
        description: "Failed to fetch incentives",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${API_BASE_URL}/api/v1/hr/incentives/stats`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching incentive stats:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
      case "Submitted":
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
      case "Paid":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
      case "Submitted":
      case "Under Review":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month - 1];
  };

  const handleIncentiveAction = async (
    incentiveId: string,
    action: "approve" | "reject" | "submit",
  ) => {
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${API_BASE_URL}/api/v1/hr/incentives/${incentiveId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            reviewComments:
              action === "approve" ? "Approved via dashboard" : undefined,
            rejectionReason:
              action === "reject" ? "Rejected via dashboard" : undefined,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Incentive ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "submitted"} successfully`,
        });
        fetchIncentives();
        fetchStats();
      } else {
        throw new Error("Failed to update incentive");
      }
    } catch (error) {
      console.error("Error updating incentive:", error);
      toast({
        title: "Error",
        description: `Failed to ${action} incentive`,
        variant: "destructive",
      });
    }
  };

  const handleCreateIncentive = () => {
    setShowCreateDialog(true);
    if (employees.length === 0) {
      fetchEmployees();
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Warning",
        description: "Could not load employees list",
        variant: "destructive",
      });
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmitIncentive = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !incentiveForm.employeeId ||
      !incentiveForm.incentiveType ||
      !incentiveForm.title ||
      !incentiveForm.amount
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const selectedEmployee = employees.find(
        (e) => e._id === incentiveForm.employeeId,
      );
      if (!selectedEmployee) {
        throw new Error("Employee not found");
      }

      await axios.post("/hr/incentives", {
        employeeId: incentiveForm.employeeId,
        employeeName: selectedEmployee.name,
        employeeCode:
          selectedEmployee.employeeCode ||
          selectedEmployee.employeeId ||
          selectedEmployee._id,
        department: selectedEmployee.department || "Not Specified",
        designation: selectedEmployee.designation || "Not Specified",
        incentiveType: incentiveForm.incentiveType,
        title: incentiveForm.title,
        description: incentiveForm.description,
        amount: parseFloat(incentiveForm.amount),
        month: incentiveForm.month,
        year: incentiveForm.year,
      });

      toast({
        title: "Success",
        description: "Incentive plan created successfully",
      });

      setShowCreateDialog(false);
      setIncentiveForm({
        employeeId: "",
        incentiveType: "",
        title: "",
        description: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
      });
      fetchIncentives();
      fetchStats();
    } catch (error: any) {
      console.error("Error creating incentive:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create incentive plan",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateIncentive = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedIncentive) return;

    if (
      !incentiveForm.incentiveType ||
      !incentiveForm.title ||
      !incentiveForm.amount
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await axios.put(`/hr/incentives/${selectedIncentive._id}`, {
        incentiveType: incentiveForm.incentiveType,
        title: incentiveForm.title,
        description: incentiveForm.description,
        amount: parseFloat(incentiveForm.amount),
        month: incentiveForm.month,
        year: incentiveForm.year,
      });

      toast({
        title: "Success",
        description: "Incentive updated successfully",
      });

      setShowEditSheet(false);
      fetchIncentives();
      fetchStats();
    } catch (error: any) {
      console.error("Error updating incentive:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update incentive",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleProcessPayment = async (incentiveId: string) => {
    try {
      await axios.post(`/hr/incentives/${incentiveId}/process-payment`);
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
      fetchIncentives();
      fetchStats();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const handleView = (incentiveId: string) => {
    const incentive = incentives.find((i) => i._id === incentiveId);
    if (incentive) {
      setSelectedIncentive(incentive);
      setShowViewSheet(true);
    }
  };

  const handleEdit = (incentiveId: string) => {
    const incentive = incentives.find((i) => i._id === incentiveId);
    if (incentive) {
      setSelectedIncentive(incentive);
      setIncentiveForm({
        employeeId: incentive.employeeId,
        incentiveType: incentive.incentiveType,
        title: incentive.title,
        description: incentive.description,
        amount: incentive.amount.toString(),
        month: incentive.month,
        year: incentive.year,
      });
      setShowEditSheet(true);
    }
  };

  const handleDelete = async (incentiveId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this incentive? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/hr/incentives/${incentiveId}`);
      toast({
        title: "Success",
        description: "Incentive deleted successfully",
      });
      fetchIncentives();
      fetchStats();
    } catch (error: any) {
      console.error("Error deleting incentive:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete incentive",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (
    incentiveId: string,
    paymentStatus?: string,
    approvalStatus?: string,
  ) => {
    try {
      await axios.patch(`/hr/incentives/${incentiveId}/status`, {
        paymentStatus,
        approvalStatus,
      });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      fetchIncentives();
      fetchStats();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Hold":
        return "bg-orange-100 text-orange-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Award className="mr-3 h-8 w-8 text-orange-600" />
            Incentive Management
          </h1>
          <p className="text-gray-600">
            Manage employee incentives and performance bonuses
          </p>
        </div>
        <Button onClick={handleCreateIncentive}>
          <Plus className="mr-2 h-4 w-4" />
          Create Incentive Plan
        </Button>
      </div>

      {/* Create Incentive Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Incentive Plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitIncentive} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <Select
                  value={incentiveForm.employeeId}
                  onValueChange={(value) =>
                    setIncentiveForm({ ...incentiveForm, employeeId: value })
                  }
                  disabled={loadingEmployees}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingEmployees ? "Loading..." : "Select employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name}{" "}
                        {employee.department ? `- ${employee.department}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incentiveType">Incentive Type *</Label>
                <Select
                  value={incentiveForm.incentiveType}
                  onValueChange={(value) =>
                    setIncentiveForm({ ...incentiveForm, incentiveType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Target Achievement">
                      Target Achievement
                    </SelectItem>
                    <SelectItem value="Bonus">Bonus</SelectItem>
                    <SelectItem value="Commission">Commission</SelectItem>
                    <SelectItem value="Annual Bonus">Annual Bonus</SelectItem>
                    <SelectItem value="Project Completion">
                      Project Completion
                    </SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Incentive on IPD">
                      Incentive on IPD
                    </SelectItem>
                    <SelectItem value="Incentive on Loan/EMI">
                      Incentive on Loan/EMI
                    </SelectItem>
                    <SelectItem value="Incentive on Subscription">
                      Incentive on Subscription
                    </SelectItem>
                    <SelectItem value="Incentive on Extra Cases">
                      Incentive on Extra Cases
                    </SelectItem>
                    <SelectItem value="Incentive on Insurance">
                      Incentive on Insurance
                    </SelectItem>
                    <SelectItem value="Employee of the Month">
                      Employee of the Month
                    </SelectItem>
                    <SelectItem value="Star Performer of the Month">
                      Star Performer of the Month
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={incentiveForm.title}
                onChange={(e) =>
                  setIncentiveForm({ ...incentiveForm, title: e.target.value })
                }
                placeholder="Q4 Performance Bonus"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={incentiveForm.description}
                onChange={(e) =>
                  setIncentiveForm({
                    ...incentiveForm,
                    description: e.target.value,
                  })
                }
                placeholder="Details about the incentive..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={incentiveForm.amount}
                  onChange={(e) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month *</Label>
                <Select
                  value={incentiveForm.month.toString()}
                  onValueChange={(value) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      month: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(
                      (month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2024, month - 1).toLocaleString("default", {
                            month: "long",
                          })}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Select
                  value={incentiveForm.year.toString()}
                  onValueChange={(value) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      year: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 3 },
                      (_, i) => new Date().getFullYear() - 1 + i,
                    ).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create Incentive"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Incentive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Incentives</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.currentMonthAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-orange-50">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold">{stats.totalIncentives}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incentive Records */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentives
                  .filter(
                    (i) =>
                      i.approvalStatus === "Submitted" ||
                      i.approvalStatus === "Under Review",
                  )
                  .map((incentive) => (
                    <div
                      key={incentive._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {incentive.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {incentive.employeeCode} • {incentive.department}
                          </p>
                          <p className="text-sm text-blue-600">
                            {incentive.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(incentive.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(incentive.month)} {incentive.year}
                          </p>
                          <p className="text-xs text-gray-400">
                            {incentive.incentiveType}
                          </p>
                        </div>

                        <Badge
                          className={getStatusColor(incentive.approvalStatus)}
                        >
                          {getStatusIcon(incentive.approvalStatus)}
                          <span className="ml-1">
                            {incentive.approvalStatus}
                          </span>
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleIncentiveAction(incentive._id, "approve")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleIncentiveAction(incentive._id, "reject")
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(incentive._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Incentives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentives
                  .filter((i) => i.approvalStatus === "Approved")
                  .map((incentive) => (
                    <div
                      key={incentive._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {incentive.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {incentive.employeeCode} • {incentive.department}
                          </p>
                          <p className="text-sm text-blue-600">
                            {incentive.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(incentive.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(incentive.month)} {incentive.year}
                          </p>
                          <p className="text-xs text-gray-400">
                            {incentive.incentiveType}
                          </p>
                        </div>

                        <Badge
                          className={getStatusColor(incentive.paymentStatus)}
                        >
                          <span className="ml-1">
                            {incentive.paymentStatus}
                          </span>
                        </Badge>

                        <div className="flex space-x-2">
                          {incentive.paymentStatus === "Pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                handleProcessPayment(incentive._id)
                              }
                            >
                              Process Payment
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(incentive._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Incentives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentives
                  .filter((i) => i.paymentStatus === "Paid")
                  .map((incentive) => (
                    <div
                      key={incentive._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {incentive.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {incentive.employeeCode} • {incentive.department}
                          </p>
                          <p className="text-sm text-blue-600">
                            {incentive.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(incentive.netAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(incentive.month)} {incentive.year}
                          </p>
                          {incentive.paymentDate && (
                            <p className="text-xs text-gray-400">
                              Paid:{" "}
                              {new Date(
                                incentive.paymentDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <Badge
                          className={getStatusColor(incentive.paymentStatus)}
                        >
                          {getStatusIcon(incentive.paymentStatus)}
                          <span className="ml-1">
                            {incentive.paymentStatus}
                          </span>
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(incentive._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Incentive Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incentives.map((incentive) => (
                  <div
                    key={incentive._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{incentive.employeeName}</p>
                        <p className="text-sm text-gray-500">
                          {incentive.employeeCode} • {incentive.department}
                        </p>
                        <p className="text-sm text-blue-600">
                          {incentive.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(incentive.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getMonthName(incentive.month)} {incentive.year}
                        </p>
                        <p className="text-xs text-gray-400">
                          {incentive.incentiveType}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <Badge
                          className={getStatusColor(incentive.approvalStatus)}
                        >
                          {incentive.approvalStatus}
                        </Badge>
                        <Badge
                          className={getStatusColor(incentive.paymentStatus)}
                        >
                          {incentive.paymentStatus}
                        </Badge>
                      </div>

                      <div className="flex space-x-2">
                        <Select
                          value={incentive.paymentStatus}
                          onValueChange={(value) =>
                            handleUpdateStatus(incentive._id, value, undefined)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Hold">Hold</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(incentive._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(incentive._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(incentive._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Incentive Sheet */}
      <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Incentive Details</SheetTitle>
            <SheetDescription>
              View complete information about this incentive
            </SheetDescription>
          </SheetHeader>
          {selectedIncentive && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">
                      Employee Name
                    </Label>
                    <p className="text-base font-medium">
                      {selectedIncentive.employeeName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Employee Code
                    </Label>
                    <p className="text-base font-medium">
                      {selectedIncentive.employeeCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Department</Label>
                    <p className="text-base font-medium">
                      {selectedIncentive.department}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Designation</Label>
                    <p className="text-base font-medium">
                      {selectedIncentive.designation}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">
                    Incentive Type
                  </Label>
                  <p className="text-base font-medium">
                    {selectedIncentive.incentiveType}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Title</Label>
                  <p className="text-base font-medium">
                    {selectedIncentive.title}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-gray-500">Description</Label>
                  <p className="text-base">{selectedIncentive.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Amount</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedIncentive.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Period</Label>
                    <p className="text-base font-medium">
                      {getMonthName(selectedIncentive.month)}{" "}
                      {selectedIncentive.year}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">
                      Approval Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        className={getStatusColor(
                          selectedIncentive.approvalStatus,
                        )}
                      >
                        {selectedIncentive.approvalStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Payment Status
                    </Label>
                    <div className="mt-1">
                      <Badge
                        className={getPaymentStatusColor(
                          selectedIncentive.paymentStatus,
                        )}
                      >
                        {selectedIncentive.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedIncentive.submittedDate && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Submitted Date
                    </Label>
                    <p className="text-base">
                      {new Date(
                        selectedIncentive.submittedDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedIncentive.approvedDate && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Approved Date
                    </Label>
                    <p className="text-base">
                      {new Date(
                        selectedIncentive.approvedDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedIncentive.paymentDate && (
                  <div>
                    <Label className="text-sm text-gray-500">
                      Payment Date
                    </Label>
                    <p className="text-base">
                      {new Date(
                        selectedIncentive.paymentDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Incentive Sheet */}
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Incentive</SheetTitle>
            <SheetDescription>Update incentive information</SheetDescription>
          </SheetHeader>
          {selectedIncentive && (
            <form onSubmit={handleUpdateIncentive} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <p className="text-sm font-medium text-gray-700">
                  {selectedIncentive.employeeName} (
                  {selectedIncentive.employeeCode})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-incentiveType">Incentive Type *</Label>
                <Select
                  value={incentiveForm.incentiveType}
                  onValueChange={(value) =>
                    setIncentiveForm({ ...incentiveForm, incentiveType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Performance">Performance</SelectItem>
                    <SelectItem value="Target Achievement">
                      Target Achievement
                    </SelectItem>
                    <SelectItem value="Bonus">Bonus</SelectItem>
                    <SelectItem value="Commission">Commission</SelectItem>
                    <SelectItem value="Annual Bonus">Annual Bonus</SelectItem>
                    <SelectItem value="Project Completion">
                      Project Completion
                    </SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Incentive on IPD">
                      Incentive on IPD
                    </SelectItem>
                    <SelectItem value="Incentive on Loan/EMI">
                      Incentive on Loan/EMI
                    </SelectItem>
                    <SelectItem value="Incentive on Subscription">
                      Incentive on Subscription
                    </SelectItem>
                    <SelectItem value="Incentive on Extra Cases">
                      Incentive on Extra Cases
                    </SelectItem>
                    <SelectItem value="Incentive on Insurance">
                      Incentive on Insurance
                    </SelectItem>
                    <SelectItem value="Employee of the Month">
                      Employee of the Month
                    </SelectItem>
                    <SelectItem value="Star Performer of the Month">
                      Star Performer of the Month
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={incentiveForm.title}
                  onChange={(e) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Q4 Performance Bonus"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={incentiveForm.description}
                  onChange={(e) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the incentive"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={incentiveForm.amount}
                  onChange={(e) =>
                    setIncentiveForm({
                      ...incentiveForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-month">Month</Label>
                  <Select
                    value={incentiveForm.month.toString()}
                    onValueChange={(value) =>
                      setIncentiveForm({
                        ...incentiveForm,
                        month: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                          {getMonthName(m)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    value={incentiveForm.year}
                    onChange={(e) =>
                      setIncentiveForm({
                        ...incentiveForm,
                        year: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditSheet(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
