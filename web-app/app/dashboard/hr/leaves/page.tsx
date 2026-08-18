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
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "@/axios/axios";

interface Leave {
  _id: string;
  employeeName: string;
  employeeId:
    | {
        _id: string;
        name: string;
        email?: string;
        designation?: string;
        department?: string;
      }
    | string;
  employeeCode: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  appliedDate: string;
  approvedBy?:
    | {
        _id: string;
        name: string;
        email?: string;
      }
    | string;
  comments?: string;
  replacementEmployee?: {
    _id: string;
    name: string;
    designation?: string;
  };
  isHalfDay?: boolean;
  leaveId?: string;
}

interface Employee {
  _id: string;
  name: string;
  employeeCode: string;
  designation?: string;
  department?: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    replacementEmployee: "",
  });
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    currentMonthLeaves: 0,
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    fetchStats();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get("/hr/leaves");
      setLeaves(response.data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/hr/leaves/stats");
      setStats(
        response.data || {
          totalLeaves: 0,
          pendingLeaves: 0,
          approvedLeaves: 0,
          rejectedLeaves: 0,
          currentMonthLeaves: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching leave stats:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !leaveForm.leaveType ||
      !leaveForm.startDate ||
      !leaveForm.endDate ||
      !leaveForm.reason
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setApplyLoading(true);

    try {
      const payload: any = {
        leaveType: leaveForm.leaveType,
        startDate: new Date(leaveForm.startDate),
        endDate: new Date(leaveForm.endDate),
        reason: leaveForm.reason,
      };

      // Only include replacementEmployee if selected and is a valid ObjectId format
      if (
        leaveForm.replacementEmployee &&
        leaveForm.replacementEmployee.match(/^[0-9a-fA-F]{24}$/)
      ) {
        payload.replacementEmployee = leaveForm.replacementEmployee;
      }

      await axios.post("/hr/leaves", payload);

      toast({
        title: "Success",
        description: "Leave application submitted successfully",
      });

      setShowApplyDialog(false);
      setLeaveForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        replacementEmployee: "",
      });
      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error applying for leave:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit leave application",
        variant: "destructive",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      await axios.post(`/hr/leaves/${leaveId}/approve`, {
        comments: "Approved by HR",
      });

      toast({
        title: "Success",
        description: "Leave approved successfully",
      });

      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast({
        title: "Error",
        description: "Failed to approve leave",
        variant: "destructive",
      });
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

    try {
      await axios.post(`/hr/leaves/${leaveId}/reject`, {
        rejectionReason: reason,
      });

      toast({
        title: "Success",
        description: "Leave rejected successfully",
      });

      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast({
        title: "Error",
        description: "Failed to reject leave",
        variant: "destructive",
      });
    }
  };

  const handleEditLeave = (leave: Leave) => {
    setEditingLeave(leave);
    setLeaveForm({
      leaveType: leave.leaveType,
      startDate: new Date(leave.startDate).toISOString().split("T")[0],
      endDate: new Date(leave.endDate).toISOString().split("T")[0],
      reason: leave.reason,
      replacementEmployee: leave.replacementEmployee?._id || "",
    });
    setShowEditDialog(true);
  };

  const handleUpdateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeave) return;

    if (
      !leaveForm.leaveType ||
      !leaveForm.startDate ||
      !leaveForm.endDate ||
      !leaveForm.reason
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setApplyLoading(true);

    try {
      const payload: any = {
        leaveType: leaveForm.leaveType,
        startDate: new Date(leaveForm.startDate),
        endDate: new Date(leaveForm.endDate),
        reason: leaveForm.reason,
      };

      // Only include replacementEmployee if selected and is a valid ObjectId format
      if (
        leaveForm.replacementEmployee &&
        leaveForm.replacementEmployee.match(/^[0-9a-fA-F]{24}$/)
      ) {
        payload.replacementEmployee = leaveForm.replacementEmployee;
      }

      await axios.put(`/hr/leaves/${editingLeave._id}`, payload);

      toast({
        title: "Success",
        description: "Leave updated successfully",
      });

      setShowEditDialog(false);
      setEditingLeave(null);
      setLeaveForm({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        replacementEmployee: "",
      });
      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error updating leave:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update leave",
        variant: "destructive",
      });
    } finally {
      setApplyLoading(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this leave request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/hr/leaves/${leaveId}`);

      toast({
        title: "Success",
        description: "Leave deleted successfully",
      });

      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error deleting leave:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete leave",
        variant: "destructive",
      });
    }
  };

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) {
      return;
    }

    try {
      await axios.put(`/hr/leaves/${leaveId}`, {
        status: "Cancelled",
      });

      toast({
        title: "Success",
        description: "Leave cancelled successfully",
      });

      fetchLeaves();
      fetchStats();
    } catch (error: any) {
      console.error("Error cancelling leave:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel leave",
        variant: "destructive",
      });
    }
  };

  const isDatePassed = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const leaveDate = new Date(dateString);
    leaveDate.setHours(0, 0, 0, 0);
    return leaveDate < today;
  };

  const getEmployeeIdString = (employeeId: Leave["employeeId"]): string => {
    if (typeof employeeId === "string") {
      return employeeId;
    }
    return employeeId._id;
  };

  const getEmployeeName = (leave: Leave): string => {
    if (typeof leave.employeeId === "object" && leave.employeeId.name) {
      return leave.employeeId.name;
    }
    return leave.employeeName;
  };

  const getEmployeeDesignation = (leave: Leave): string => {
    if (typeof leave.employeeId === "object" && leave.employeeId.designation) {
      return leave.employeeId.designation;
    }
    return "";
  };

  const getApprovedByName = (
    approvedBy: Leave["approvedBy"] | undefined
  ): string => {
    if (!approvedBy) return "";
    if (typeof approvedBy === "string") {
      return approvedBy;
    }
    return approvedBy.name;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4" />;
      case "Cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filterLeavesByStatus = (status: string) => {
    return leaves.filter((leave) => leave.status === status);
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
            <Calendar className="mr-3 h-8 w-8 text-blue-600" />
            Leave Management
          </h1>
          <p className="text-gray-600">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(value) =>
                    setLeaveForm({ ...leaveForm, leaveType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                    <SelectItem value="Maternity Leave">
                      Maternity Leave
                    </SelectItem>
                    <SelectItem value="Paternity Leave">
                      Paternity Leave
                    </SelectItem>
                    <SelectItem value="Emergency Leave">
                      Emergency Leave
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={leaveForm.endDate}
                    onChange={(e) =>
                      setLeaveForm({ ...leaveForm, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reason: e.target.value })
                  }
                  placeholder="Please provide reason for leave"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="replacementEmployee">
                  Replacement Employee (Optional)
                </Label>
                <Select
                  value={leaveForm.replacementEmployee}
                  onValueChange={(value) =>
                    setLeaveForm({ ...leaveForm, replacementEmployee: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select replacement employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name} ({employee.employeeCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApplyDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={applyLoading}>
                  {applyLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Leave Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Leave Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateLeave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editLeaveType">Leave Type *</Label>
              <Select
                value={leaveForm.leaveType}
                onValueChange={(value) =>
                  setLeaveForm({ ...leaveForm, leaveType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Maternity Leave">
                    Maternity Leave
                  </SelectItem>
                  <SelectItem value="Paternity Leave">
                    Paternity Leave
                  </SelectItem>
                  <SelectItem value="Emergency Leave">
                    Emergency Leave
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editStartDate">Start Date *</Label>
                <Input
                  id="editStartDate"
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEndDate">End Date *</Label>
                <Input
                  id="editEndDate"
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editReason">Reason *</Label>
              <Textarea
                id="editReason"
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
                placeholder="Please provide reason for leave"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editReplacementEmployee">
                Replacement Employee (Optional)
              </Label>
              <Select
                value={leaveForm.replacementEmployee}
                onValueChange={(value) =>
                  setLeaveForm({ ...leaveForm, replacementEmployee: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select replacement employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      {employee.name} ({employee.employeeCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingLeave(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applyLoading}>
                {applyLoading ? "Updating..." : "Update Leave"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-50">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approvedLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-red-50">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejectedLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.totalLeaves}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterLeavesByStatus("Pending").map((leave) => {
              const dateHasPassed = isDatePassed(leave.startDate);
              return (
                <Card
                  key={leave._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {getEmployeeName(leave)}
                      </CardTitle>
                      <Badge className={getStatusColor(leave.status)}>
                        {getStatusIcon(leave.status)}
                        <span className="ml-1">{leave.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        {leave.employeeCode ||
                          getEmployeeIdString(leave.employeeId)}
                      </span>
                    </div>

                    {getEmployeeDesignation(leave) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Designation:</span>
                        <span className="font-medium">
                          {getEmployeeDesignation(leave)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{leave.leaveType}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {leave.totalDays && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {leave.totalDays} day(s)
                        </span>
                      </div>
                    )}

                    {leave.replacementEmployee && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs">
                            Replacement:
                          </span>
                          <span className="font-medium">
                            {leave.replacementEmployee.name}
                          </span>
                          {leave.replacementEmployee.designation && (
                            <span className="text-gray-600 text-xs">
                              ({leave.replacementEmployee.designation})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="text-gray-600">Reason:</p>
                      <p className="text-gray-900">{leave.reason}</p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleApproveLeave(leave._id)}
                        disabled={dateHasPassed}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => handleRejectLeave(leave._id)}
                        disabled={dateHasPassed}
                      >
                        Reject
                      </Button>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditLeave(leave)}
                        disabled={dateHasPassed}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-orange-600 hover:text-orange-700"
                        onClick={() => handleCancelLeave(leave._id)}
                        disabled={dateHasPassed}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteLeave(leave._id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                    {dateHasPassed && (
                      <p className="text-xs text-gray-500 italic text-center pt-2">
                        Leave date has passed - actions disabled
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterLeavesByStatus("Approved").map((leave) => (
              <Card
                key={leave._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getEmployeeName(leave)}
                    </CardTitle>
                    <Badge className={getStatusColor(leave.status)}>
                      {getStatusIcon(leave.status)}
                      <span className="ml-1">{leave.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      {leave.employeeCode ||
                        getEmployeeIdString(leave.employeeId)}
                    </span>
                  </div>

                  {getEmployeeDesignation(leave) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">Designation:</span>
                      <span className="font-medium">
                        {getEmployeeDesignation(leave)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{leave.leaveType}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} -{" "}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {leave.totalDays && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {leave.totalDays} day(s)
                      </span>
                    </div>
                  )}

                  {leave.replacementEmployee && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">
                          Replacement:
                        </span>
                        <span className="font-medium">
                          {leave.replacementEmployee.name}
                        </span>
                        {leave.replacementEmployee.designation && (
                          <span className="text-gray-600 text-xs">
                            ({leave.replacementEmployee.designation})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {leave.approvedBy && (
                    <div className="text-sm">
                      <p className="text-gray-600">
                        Approved by: {getApprovedByName(leave.approvedBy)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterLeavesByStatus("Rejected").map((leave) => (
              <Card
                key={leave._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getEmployeeName(leave)}
                    </CardTitle>
                    <Badge className={getStatusColor(leave.status)}>
                      {getStatusIcon(leave.status)}
                      <span className="ml-1">{leave.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      {leave.employeeCode ||
                        getEmployeeIdString(leave.employeeId)}
                    </span>
                  </div>

                  {getEmployeeDesignation(leave) && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">Designation:</span>
                      <span className="font-medium">
                        {getEmployeeDesignation(leave)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{leave.leaveType}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} -{" "}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {leave.replacementEmployee && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs">
                          Replacement:
                        </span>
                        <span className="font-medium">
                          {leave.replacementEmployee.name}
                        </span>
                        {leave.replacementEmployee.designation && (
                          <span className="text-gray-600 text-xs">
                            ({leave.replacementEmployee.designation})
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {leave.comments && (
                    <div className="text-sm">
                      <p className="text-gray-600">Comments:</p>
                      <p className="text-gray-900">{leave.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaves.map((leave) => {
              const dateHasPassed = isDatePassed(leave.startDate);
              const isPending = leave.status === "Pending";
              return (
                <Card
                  key={leave._id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {getEmployeeName(leave)}
                      </CardTitle>
                      <Badge className={getStatusColor(leave.status)}>
                        {getStatusIcon(leave.status)}
                        <span className="ml-1">{leave.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>
                        {leave.employeeCode ||
                          getEmployeeIdString(leave.employeeId)}
                      </span>
                    </div>

                    {getEmployeeDesignation(leave) && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Designation:</span>
                        <span className="font-medium">
                          {getEmployeeDesignation(leave)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{leave.leaveType}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {leave.totalDays && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">
                          {leave.totalDays} day(s)
                        </span>
                      </div>
                    )}

                    {leave.replacementEmployee && (
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs">
                            Replacement:
                          </span>
                          <span className="font-medium">
                            {leave.replacementEmployee.name}
                          </span>
                          {leave.replacementEmployee.designation && (
                            <span className="text-gray-600 text-xs">
                              ({leave.replacementEmployee.designation})
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {leave.approvedBy && (
                      <div className="text-sm">
                        <p className="text-gray-600">
                          Approved by: {getApprovedByName(leave.approvedBy)}
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditLeave(leave)}
                          disabled={dateHasPassed}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-orange-600 hover:text-orange-700"
                          onClick={() => handleCancelLeave(leave._id)}
                          disabled={dateHasPassed}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                    {isPending && dateHasPassed && (
                      <p className="text-xs text-gray-500 italic text-center pt-2">
                        Leave date has passed - actions disabled
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
