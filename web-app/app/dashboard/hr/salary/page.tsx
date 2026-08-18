"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IndianRupee,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  MoreVertical,
} from "lucide-react";
import axios from "@/axios/axios";
import { useRouter } from "next/navigation";

interface SalaryRecord {
  _id: string;
  salaryId: string;
  employeeName: string;
  employeeId: string;
  employeeCode: string;
  department: string;
  designation: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    da: number;
    conveyance: number;
    medical: number;
    other: number;
  };
  incentives: {
    performance: number;
    target: number;
    bonus: number;
    commission: number;
    other: number;
  };
  deductions: {
    pf: number;
    esi: number;
    tds: number;
    insurance: number;
    loan: number;
    advance: number;
    other: number;
  };
  totalAllowances: number;
  totalIncentives: number;
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  paymentStatus:
    | "Pending"
    | "Processing"
    | "Paid"
    | "Partially Paid"
    | "Unpaid"
    | "Hold"
    | "Cancelled";
  partiallyPaidAmount?: number;
  paymentDate?: string;
  paymentMethod: string;
  workingDays: number;
  presentDays: number;
  overtimeHours: number;
  overtimeAmount: number;
  leavesTaken: number;
  leaveDeduction: number;
}

export default function SalaryPage() {
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    totalGrossSalary: 0,
    totalNetSalary: 0,
    totalDeductions: 0,
    totalAllowances: 0,
    totalIncentives: 0,
    totalEmployees: 0,
    paidSalaries: 0,
    pendingSalaries: 0,
    processingSalaries: 0,
  });

  const router = useRouter();

  useEffect(() => {
    fetchSalaries();
    fetchStats();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await axios.get(`/finance/salaries`);

      const data = response.data.salaries;
      setSalaries(data);
    } catch (error) {
      console.error("Error fetching salaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/finance/salaries/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching salary stats:", error);
      // Calculate stats from local data if API fails
      calculateLocalStats();
    }
  };

  const calculateLocalStats = () => {
    const totalEmployees = new Set(salaries.map((s) => s.employeeId)).size;
    const totalGrossSalary = salaries.reduce(
      (sum, s) => sum + (s.grossSalary || 0),
      0,
    );
    const totalNetSalary = salaries.reduce(
      (sum, s) => sum + (s.netSalary || 0),
      0,
    );
    const totalDeductions = salaries.reduce(
      (sum, s) => sum + (s.totalDeductions || 0),
      0,
    );
    const totalAllowances = salaries.reduce(
      (sum, s) => sum + (s.totalAllowances || 0),
      0,
    );
    const totalIncentives = salaries.reduce(
      (sum, s) => sum + (s.totalIncentives || 0),
      0,
    );
    const paidSalaries = salaries.filter(
      (s) => s.paymentStatus === "Paid",
    ).length;
    const pendingSalaries = salaries.filter(
      (s) => s.paymentStatus === "Pending",
    ).length;
    const processingSalaries = salaries.filter(
      (s) => s.paymentStatus === "Processing",
    ).length;

    setStats({
      totalEmployees,
      totalGrossSalary,
      totalNetSalary,
      totalDeductions,
      totalAllowances,
      totalIncentives,
      paidSalaries,
      pendingSalaries,
      processingSalaries,
    });
  };

  const handleExportCSV = () => {
    // Prepare CSV data
    const headers = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Designation",
      "Month",
      "Year",
      "Basic Salary",
      "Allowances",
      "Incentives",
      "Deductions",
      "Gross Salary",
      "Net Salary",
      "Payment Status",
      "Payment Date",
      "Working Days",
      "Present Days",
    ];

    const rows = salaries.map((salary) => [
      salary.employeeName,
      salary.employeeCode,
      salary.department,
      salary.designation,
      getMonthName(salary.month),
      salary.year,
      salary.basicSalary,
      salary.totalAllowances,
      salary.totalIncentives,
      salary.totalDeductions,
      salary.grossSalary,
      salary.netSalary,
      salary.paymentStatus,
      salary.paymentDate
        ? new Date(salary.paymentDate).toLocaleDateString()
        : "N/A",
      salary.workingDays,
      salary.presentDays,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `salary_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncEmployees = async () => {
    if (
      !confirm(
        "This will create salary records for all active employees who don't have records for the current month. Continue?",
      )
    ) {
      return;
    }

    setSyncing(true);
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const response = await axios.post("/finance/salaries/sync-employees", {
        month: currentMonth,
        year: currentYear,
      });

      alert(
        `Sync complete!\nCreated: ${response.data.created}\nExisting: ${response.data.existing}\nErrors: ${response.data.errors?.length || 0}`,
      );

      // Refresh salary list
      fetchSalaries();
      fetchStats();
    } catch (error) {
      console.error("Error syncing employees:", error);
      alert("Failed to sync employees");
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdatePaymentStatus = async (
    salaryId: string,
    status: string,
    partiallyPaidAmount?: number,
  ) => {
    try {
      await axios.patch(`/finance/salaries/${salaryId}/payment-status`, {
        status,
        partiallyPaidAmount,
      });

      alert("Payment status updated successfully");
      fetchSalaries(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status");
    }
  };

  const handleQuickMarkAsPaid = async (salaryId: string) => {
    if (!confirm("Mark this salary as paid?")) {
      return;
    }
    await handleUpdatePaymentStatus(salaryId, "Paid");
  };

  const handleQuickMarkAsUnpaid = async (salaryId: string) => {
    if (!confirm("Mark this salary as unpaid?")) {
      return;
    }
    await handleUpdatePaymentStatus(salaryId, "Unpaid");
  };

  const handleQuickMarkAsPartiallyPaid = async (
    salaryId: string,
    netSalary: number,
  ) => {
    const amountStr = prompt(
      `Enter partially paid amount (Total: ${formatCurrency(netSalary)}):`,
    );
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0 || amount >= netSalary) {
      alert("Invalid amount. Must be greater than 0 and less than net salary.");
      return;
    }

    await handleUpdatePaymentStatus(salaryId, "Partially Paid", amount);
  };

  const handleMarkAsPaid = async (salaryId: string) => {
    if (!confirm("Are you sure you want to mark this salary as paid?")) {
      return;
    }

    try {
      await axios.post(`/finance/salaries/${salaryId}/process-payment`, {
        paymentMethod: "Bank Transfer",
        paymentDate: new Date(),
      });

      // Show success message (you can add toast notification here)
      alert("Salary marked as paid successfully");
      fetchSalaries(); // Refresh the list
    } catch (error) {
      console.error("Error marking salary as paid:", error);
      alert("Failed to mark salary as paid");
    }
  };

  const handleDeleteSalary = async (salaryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this salary record? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/finance/salaries/${salaryId}`);
      alert("Salary record deleted successfully");
      fetchSalaries(); // Refresh the list
    } catch (error) {
      console.error("Error deleting salary:", error);
      alert("Failed to delete salary record");
    }
  };

  const handleViewSalary = (salaryId: string) => {
    // Navigate to salary detail page or show modal with details
    router.push(`/dashboard/hr/salary/${salaryId}`);
  };

  const handleDownloadPayslip = async (salaryId: string) => {
    try {
      // This would typically generate and download a PDF
      alert("Payslip download feature coming soon");
      // const response = await axios.get(`/finance/salaries/${salaryId}/payslip`, {
      //   responseType: 'blob'
      // });
      // // Handle blob download
    } catch (error) {
      console.error("Error downloading payslip:", error);
      alert("Failed to download payslip");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Partially Paid":
        return "bg-orange-100 text-orange-800";
      case "Unpaid":
        return "bg-red-100 text-red-800";
      case "Hold":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  // Recalculate stats when salaries change
  useEffect(() => {
    if (salaries.length > 0) {
      calculateLocalStats();
    }
  }, [salaries]);

  const totalSalaryPaid = salaries
    ?.filter((s) => s.paymentStatus === "Paid")
    .reduce((sum, s) => sum + s.netSalary, 0);

  const totalSalaryPending = salaries
    ?.filter((s) => s.paymentStatus === "Pending")
    .reduce((sum, s) => sum + s.netSalary, 0);

  const totalSalaryProcessing = salaries
    ?.filter((s) => s.paymentStatus === "Processing")
    .reduce((sum, s) => sum + s.netSalary, 0);

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
            <IndianRupee className="mr-3 h-8 w-8 text-green-600" />
            Salary Management
          </h1>
          <p className="text-gray-600">Manage employee salaries and payroll</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleSyncEmployees}
            disabled={syncing}
            variant="default"
          >
            {syncing ? "Syncing..." : "Sync Employees"}
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Salary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalSalaryPaid)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.paidSalaries} employees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-yellow-50">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalSalaryPending)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingSalaries} employees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalSalaryProcessing)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.processingSalaries} employees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-gray-500">with salary records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Gross Salary</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalGrossSalary)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Deductions</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.totalDeductions)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Net Salary</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalNetSalary)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Records */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Month</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="paid">Paid Salaries</TabsTrigger>
          <TabsTrigger value="all">All Records</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Month Salaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaries
                  .filter(
                    (s) =>
                      s.month === new Date().getMonth() + 1 &&
                      s.year === new Date().getFullYear(),
                  )
                  .map((salary) => (
                    <div
                      key={salary._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{salary.employeeName}</p>
                          <p className="text-sm text-gray-500">
                            {salary.employeeId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(salary.netSalary)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(salary.month)} {salary.year}
                          </p>
                        </div>

                        <Badge className={getStatusColor(salary.paymentStatus)}>
                          {salary.paymentStatus}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSalary(salary._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPayslip(salary._id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Salary Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaries
                  .filter((s) => s.paymentStatus === "Pending")
                  .map((salary) => (
                    <div
                      key={salary._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{salary.employeeName}</p>
                          <p className="text-sm text-gray-500">
                            {salary.employeeId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(salary.netSalary)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(salary.month)} {salary.year}
                          </p>
                        </div>

                        <Badge className={getStatusColor(salary.paymentStatus)}>
                          {salary.paymentStatus}
                          {salary.paymentStatus === "Partially Paid" &&
                            salary.partiallyPaidAmount && (
                              <span className="ml-1 text-xs">
                                ({formatCurrency(salary.partiallyPaidAmount)})
                              </span>
                            )}
                        </Badge>

                        <div className="flex space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickMarkAsPaid(salary._id)
                                }
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickMarkAsPartiallyPaid(
                                    salary._id,
                                    salary.netSalary,
                                  )
                                }
                              >
                                Mark as Partially Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickMarkAsUnpaid(salary._id)
                                }
                              >
                                Mark as Unpaid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdatePaymentStatus(
                                    salary._id,
                                    "Pending",
                                  )
                                }
                              >
                                Mark as Pending
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSalary(salary._id)}
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
              <CardTitle>Paid Salaries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaries
                  .filter((s) => s.paymentStatus === "Paid")
                  .map((salary) => (
                    <div
                      key={salary._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{salary.employeeName}</p>
                          <p className="text-sm text-gray-500">
                            {salary.employeeId}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(salary.netSalary)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(salary.month)} {salary.year}
                          </p>
                          {salary.paymentDate && (
                            <p className="text-xs text-gray-400">
                              Paid:{" "}
                              {new Date(
                                salary.paymentDate,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <Badge className={getStatusColor(salary.paymentStatus)}>
                          {salary.paymentStatus}
                        </Badge>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPayslip(salary._id)}
                          >
                            <Download className="h-4 w-4" />
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
              <CardTitle>All Salary Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaries.map((salary) => (
                  <div
                    key={salary._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{salary.employeeName}</p>
                        <p className="text-sm text-gray-500">
                          {salary.employeeId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(salary.netSalary)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getMonthName(salary.month)} {salary.year}
                        </p>
                      </div>

                      <Badge className={getStatusColor(salary.paymentStatus)}>
                        {salary.paymentStatus}
                        {salary.paymentStatus === "Partially Paid" &&
                          salary.partiallyPaidAmount && (
                            <span className="ml-1 text-xs">
                              ({formatCurrency(salary.partiallyPaidAmount)})
                            </span>
                          )}
                      </Badge>

                      <div className="flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleQuickMarkAsPaid(salary._id)}
                            >
                              Mark as Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickMarkAsPartiallyPaid(
                                  salary._id,
                                  salary.netSalary,
                                )
                              }
                            >
                              Mark as Partially Paid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleQuickMarkAsUnpaid(salary._id)
                              }
                            >
                              Mark as Unpaid
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdatePaymentStatus(salary._id, "Pending")
                              }
                            >
                              Mark as Pending
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSalary(salary._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPayslip(salary._id)}
                        >
                          <Download className="h-4 w-4" />
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
    </div>
  );
}
