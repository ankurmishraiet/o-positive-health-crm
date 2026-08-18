"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Users,
  Building2,
  Car,
  CreditCard,
  Receipt,
  Banknote,
  AlertTriangle,
  ArrowUpIcon,
  ArrowDownIcon,
  Plus,
} from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";

interface FinanceStats {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    netCashFlow: number;
    totalPendingPayments: number;
    totalOverdue: number;
    profitMargin: number;
  };
  modules: {
    transactions: {
      totalCredits: number;
      totalDebits: number;
      netAmount: number;
      transactionCount: number;
    };
    payments: {
      totalAmount: number;
      totalPaid: number;
      totalPending: number;
      collectionRate: number;
      overdueCount: number;
    };
    salaries: {
      totalGrossSalary: number;
      totalNetSalary: number;
      totalDeductions: number;
      employeeCount: number;
      pendingPayments: number;
    };
    invoices: {
      totalAmount: number;
      totalPaid: number;
      totalPending: number;
      collectionRate: number;
      overdueCount: number;
    };
  };
  recentTransactions: any[];
  overduePayments: any[];
  overdueInvoices: any[];
}

interface DashboardMetrics {
  currentMonth: FinanceStats;
  growth: {
    revenue: number;
    expenses: number;
    profit: number;
    cashFlow: number;
  };
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [dashboard, setDashboard] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, dashboardResponse] = await Promise.all([
        axios.get("/finance/stats"),
        axios.get("/finance/dashboard"),
      ]);

      setStats(statsResponse.data);
      setDashboard(dashboardResponse.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      setError("Failed to load finance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <ArrowUpIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Finance Management</h1>
            <p className="text-gray-600">
              Track revenue, expenses, and financial performance
            </p>
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={fetchFinanceData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Management</h1>
          <p className="text-gray-600">
            Comprehensive financial tracking and management
          </p>
        </div>
        <div className="flex space-x-2">
          <Link href="/dashboard/finance/daily">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </Link>
          <Link href="/dashboard/finance/invoices/create">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Revenue
            </CardTitle>
            <div className="p-2 rounded-md bg-green-50">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.summary.totalRevenue)}
            </div>
            {dashboard && (
              <div
                className={`flex items-center mt-1 ${getGrowthColor(
                  dashboard.growth.revenue
                )}`}
              >
                {getGrowthIcon(dashboard.growth.revenue)}
                <span className="text-sm ml-1">
                  {formatPercentage(dashboard.growth.revenue)} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
            <div className="p-2 rounded-md bg-red-50">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.summary.totalExpenses)}
            </div>
            {dashboard && (
              <div
                className={`flex items-center mt-1 ${getGrowthColor(
                  dashboard.growth.expenses
                )}`}
              >
                {getGrowthIcon(dashboard.growth.expenses)}
                <span className="text-sm ml-1">
                  {formatPercentage(dashboard.growth.expenses)} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Net Profit
            </CardTitle>
            <div className="p-2 rounded-md bg-blue-50">
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatCurrency(stats.summary.netProfit)}
            </div>
            {dashboard && (
              <div
                className={`flex items-center mt-1 ${getGrowthColor(
                  dashboard.growth.profit
                )}`}
              >
                {getGrowthIcon(dashboard.growth.profit)}
                <span className="text-sm ml-1">
                  {formatPercentage(dashboard.growth.profit)} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cash Flow
            </CardTitle>
            <div className="p-2 rounded-md bg-orange-50">
              <Banknote className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.summary.netCashFlow >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(stats.summary.netCashFlow)}
            </div>
            {dashboard && (
              <div
                className={`flex items-center mt-1 ${getGrowthColor(
                  dashboard.growth.cashFlow
                )}`}
              >
                {getGrowthIcon(dashboard.growth.cashFlow)}
                <span className="text-sm ml-1">
                  {formatPercentage(dashboard.growth.cashFlow)} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module-wise Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/finance/daily">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-50">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Transactions</p>
                  <p className="text-xl font-bold">
                    {stats.modules.transactions.transactionCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Net: {formatCurrency(stats.modules.transactions.netAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/payments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-50">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patient Payments</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(stats.modules.payments.totalPaid)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.modules.payments.collectionRate.toFixed(1)}%
                    collection rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/salary">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-purple-50">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Salary Expenses</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(stats.modules.salaries.totalNetSalary)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.modules.salaries.employeeCount} employees
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/finance/gst">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-50">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">GST Management</p>
                  <p className="text-xl font-bold">View</p>
                  <p className="text-xs text-gray-500">Tax compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Detailed Finance Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
          <TabsTrigger value="invoices">Invoice Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Profit Margin</span>
                    <span
                      className={`font-bold ${
                        stats.summary.profitMargin >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stats.summary.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Payment Collection Rate</span>
                    <span className="font-bold text-blue-600">
                      {stats.modules.payments.collectionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Invoice Collection Rate</span>
                    <span className="font-bold text-purple-600">
                      {stats.modules.invoices.collectionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Pending Payments</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(stats.modules.payments.totalPending)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Invoices</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(stats.modules.invoices.totalPending)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pending Salaries</span>
                    <span className="font-bold text-red-600">
                      {stats.modules.salaries.pendingPayments} employees
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "Credit"
                            ? "bg-green-50"
                            : "bg-red-50"
                        }`}
                      >
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} •{" "}
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          transaction.type === "Credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "Credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Badge
                        variant={
                          transaction.type === "Credit"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
                {stats.recentTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No recent transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Overdue Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.overduePayments.map((payment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border border-red-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{payment.patientName}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(payment.pendingAmount)}
                      </span>
                    </div>
                  ))}
                  {stats.overduePayments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No overdue payments
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Overdue Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.overdueInvoices.map((invoice, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border border-red-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{invoice.entityName}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(invoice.pendingAmount)}
                      </span>
                    </div>
                  ))}
                  {stats.overdueInvoices.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No overdue invoices
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/dashboard/finance/doctors-invoice">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-medium">Doctor Invoices</h3>
                      <p className="text-sm text-gray-500">
                        Manage doctor payments
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/finance/hospital-invoice">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-medium">Hospital Invoices</h3>
                      <p className="text-sm text-gray-500">
                        Hospital billing management
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/dashboard/finance/invoices/create">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-medium">Create New Invoice</h3>
                      <p className="text-sm text-gray-500">
                        Generate custom invoices
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
