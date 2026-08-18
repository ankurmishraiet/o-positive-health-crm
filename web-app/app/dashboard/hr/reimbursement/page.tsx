"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Upload,
  Download,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import axios from "@/axios/axios";
import { useRouter } from "next/navigation";

export default function ReimbursementPage() {
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchReimbursements();
  }, []);

  const fetchReimbursements = async () => {
    try {
      const response = await axios.get("/reimbursement");
      setReimbursements(response.data.reimbursements || []);
    } catch (error) {
      console.error("Error fetching reimbursements:", error);
      setReimbursements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reimbursementId: string) => {
    if (!confirm("Are you sure you want to approve this reimbursement?")) {
      return;
    }

    try {
      await axios.post(`/reimbursement/${reimbursementId}/approve`);
      alert("Reimbursement approved successfully");
      fetchReimbursements();
    } catch (error) {
      console.error("Error approving reimbursement:", error);
      alert("Failed to approve reimbursement");
    }
  };

  const handleReject = async (reimbursementId: string) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

    try {
      await axios.post(`/reimbursement/${reimbursementId}/reject`, {
        rejectionReason: reason,
      });
      alert("Reimbursement rejected successfully");
      fetchReimbursements();
    } catch (error) {
      console.error("Error rejecting reimbursement:", error);
      alert("Failed to reject reimbursement");
    }
  };

  const handleDelete = async (reimbursementId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this reimbursement? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/reimbursement/${reimbursementId}`);
      alert("Reimbursement deleted successfully");
      fetchReimbursements();
    } catch (error) {
      console.error("Error deleting reimbursement:", error);
      alert("Failed to delete reimbursement");
    }
  };

  const handleEdit = (reimbursementId: string) => {
    router.push(`/dashboard/hr/reimbursement/${reimbursementId}/edit`);
  };

  const handleView = (reimbursementId: string) => {
    // Show details in modal or navigate to detail page
    const reimbursement = reimbursements.find((r) => r._id === reimbursementId);
    if (reimbursement) {
      alert(
        `Reimbursement Details:\n\nEmployee: ${reimbursement.employeeName}\nCategory: ${reimbursement.category}\nAmount: ₹${reimbursement.amount}\nStatus: ${reimbursement.status}`,
      );
    }
  };

  // Calculate dynamic statistics
  const pendingAmount = reimbursements
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const approvedAmount = reimbursements
    .filter((r) => r.status === "approved")
    .reduce((sum, r) => sum + (r.amount || 0), 0);
  const thisMonthCount = reimbursements.filter(
    (r) =>
      new Date(r.createdAt || Date.now()).getMonth() === new Date().getMonth(),
  ).length;
  const processedCount = reimbursements.filter(
    (r) => r.status === "processed" || r.status === "approved",
  ).length;

  // Calculate category amounts from reimbursements data
  const getCategoryAmount = (category: string) => {
    return reimbursements
      .filter((r) => r.category === category)
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Receipt className="mr-3 h-8 w-8 text-blue-600" />
            Reimbursement Management
          </h1>
          <p className="text-gray-600">
            Manage employee reimbursement requests and approvals
          </p>
        </div>
        <Link href="/dashboard/hr/reimbursement/create">
          <Button>Submit Reimbursement</Button>
        </Link>
      </div>

      {/* Reimbursement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-50">
                <Receipt className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  ₹{pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">
                  ₹{approvedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{thisMonthCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold">{processedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reimbursement Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <Receipt className="h-8 w-8 mb-2 text-blue-600" />
              <span>Medical/OPD</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("medical").toLocaleString()}
              </span>
            </Button>

            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <FileText className="h-8 w-8 mb-2 text-green-600" />
              <span>IPD Bills</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("ipd").toLocaleString()}
              </span>
            </Button>

            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <Receipt className="h-8 w-8 mb-2 text-purple-600" />
              <span>Medicine Bills</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("medicine").toLocaleString()}
              </span>
            </Button>

            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <Upload className="h-8 w-8 mb-2 text-orange-600" />
              <span>Cab/Transport</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("transport").toLocaleString()}
              </span>
            </Button>

            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <FileText className="h-8 w-8 mb-2 text-red-600" />
              <span>EMI Assistance</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("emi").toLocaleString()}
              </span>
            </Button>

            <Button variant="outline" className="h-24 flex-col bg-transparent">
              <Receipt className="h-8 w-8 mb-2 text-indigo-600" />
              <span>Medical Certificate</span>
              <span className="text-xs text-gray-500">
                ₹{getCategoryAmount("certificate").toLocaleString()}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/hr/reimbursement/create">
              <Button className="h-16 flex-col">
                <Upload className="h-6 w-6 mb-1" />
                Submit New Request
              </Button>
            </Link>

            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <Download className="h-6 w-6 mb-1" />
              Download Forms
            </Button>

            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <FileText className="h-6 w-6 mb-1" />
              View Guidelines
            </Button>

            <Button variant="outline" className="h-16 flex-col bg-transparent">
              <Receipt className="h-6 w-6 mb-1" />
              Track Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reimbursement Records */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reimbursements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reimbursements
                  .filter((r) => r.status === "pending")
                  .map((reimbursement) => (
                    <div
                      key={reimbursement._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {reimbursement.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{reimbursement.amount?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.receiptDate
                              ? new Date(
                                  reimbursement.receiptDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <Badge className="bg-yellow-100 text-yellow-800">
                          {reimbursement.status}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reimbursement._id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(reimbursement._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(reimbursement._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(reimbursement._id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(reimbursement._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {reimbursements.filter((r) => r.status === "pending").length ===
                  0 && (
                  <p className="text-center text-gray-500 py-8">
                    No pending reimbursements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Reimbursements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reimbursements
                  .filter(
                    (r) => r.status === "approved" || r.status === "processed",
                  )
                  .map((reimbursement) => (
                    <div
                      key={reimbursement._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {reimbursement.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{reimbursement.amount?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.receiptDate
                              ? new Date(
                                  reimbursement.receiptDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <Badge className="bg-green-100 text-green-800">
                          {reimbursement.status}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(reimbursement._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {reimbursements.filter(
                  (r) => r.status === "approved" || r.status === "processed",
                ).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No approved reimbursements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Reimbursements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reimbursements
                  .filter((r) => r.status === "rejected")
                  .map((reimbursement) => (
                    <div
                      key={reimbursement._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">
                            {reimbursement.employeeName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            ₹{reimbursement.amount?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-500">
                            {reimbursement.receiptDate
                              ? new Date(
                                  reimbursement.receiptDate,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <Badge className="bg-red-100 text-red-800">
                          {reimbursement.status}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleView(reimbursement._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                {reimbursements.filter((r) => r.status === "rejected")
                  .length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No rejected reimbursements
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Reimbursement Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reimbursements.map((reimbursement) => (
                  <div
                    key={reimbursement._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">
                          {reimbursement.employeeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reimbursement.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          ₹{reimbursement.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          {reimbursement.receiptDate
                            ? new Date(
                                reimbursement.receiptDate,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>

                      <Badge
                        className={
                          reimbursement.status === "approved" ||
                          reimbursement.status === "processed"
                            ? "bg-green-100 text-green-800"
                            : reimbursement.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {reimbursement.status}
                      </Badge>

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(reimbursement._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {reimbursement.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(reimbursement._id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(reimbursement._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {reimbursements.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No reimbursement records found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
