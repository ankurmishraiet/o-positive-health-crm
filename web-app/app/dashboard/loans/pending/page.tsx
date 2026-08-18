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
  User,
  Calendar,
  AlertTriangle,
  Phone,
  Clock,
  IndianRupee,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/components/ui/use-toast";

const columns = [
  {
    accessorKey: "borrowerName",
    header: "Borrower",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("borrowerName")}</span>
        </div>
        <div className="text-sm text-gray-500">{row.original.loanId}</div>
      </div>
    ),
  },
  {
    accessorKey: "emiAmount",
    header: "EMI Amount",
    cell: ({ row }: any) => (
      <div className="font-medium">
        ₹{row.getValue("emiAmount").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span>{new Date(row.getValue("dueDate")).toLocaleDateString()}</span>
      </div>
    ),
  },
  {
    accessorKey: "daysPastDue",
    header: "Days Past Due",
    cell: ({ row }: any) => {
      const days = row.getValue("daysPastDue");
      return (
        <div
          className={`flex items-center space-x-1 ${
            days > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {days > 0 && <AlertTriangle className="h-4 w-4" />}
          <span className="font-medium">
            {days > 0 ? `${days} days` : "On time"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalOutstanding",
    header: "Outstanding",
    cell: ({ row }: any) => (
      <div className="font-medium text-blue-600">
        ₹{row.getValue("totalOutstanding").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "emiNumber",
    header: "EMI #",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Phone className="h-4 w-4 text-gray-500" />
        <span>{row.getValue("contactNumber")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const variant =
        status === "Overdue"
          ? "destructive"
          : status === "Critical"
          ? "destructive"
          : status === "Due"
          ? "secondary"
          : "outline";
      const icon =
        status === "Overdue" || status === "Critical" ? AlertTriangle : Clock;
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
    accessorKey: "penaltyAmount",
    header: "Penalty",
    cell: ({ row }: any) => {
      const penalty = row.getValue("penaltyAmount");
      return penalty > 0 ? (
        <div className="font-medium text-red-600">
          ₹{penalty.toLocaleString()}
        </div>
      ) : (
        <div className="text-gray-400">-</div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex space-x-1">
        <Button size="sm" variant="outline">
          View Details
        </Button>
        <Button size="sm">Process Payment</Button>
      </div>
    ),
  },
];

export default function PendingPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/loans/pending-payments");
      setPendingPayments(response.data || []);
    } catch (error: any) {
      console.error("Error fetching pending payments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending payments",
        variant: "destructive",
      });
      setPendingPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = pendingPayments.filter(
    (payment) =>
      (payment.borrowerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.loanId || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.contactNumber || '').includes(searchTerm) ||
      (payment.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPaymentsByStatus = (status: string) => {
    if (status === "all") return filteredPayments;
    if (status === "overdue")
      return filteredPayments.filter((payment) => (payment.daysPastDue || 0) > 0);
    if (status === "due-today")
      return filteredPayments.filter((payment) => {
        const today = new Date().toDateString();
        const dueDate = new Date(payment.dueDate).toDateString();
        return today === dueDate;
      });
    if (status === "due-soon")
      return filteredPayments.filter((payment) => {
        const today = new Date();
        const dueDate = new Date(payment.dueDate);
        const daysDiff = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff > 0 && daysDiff <= 7;
      });
    if (status === "critical")
      return filteredPayments.filter(
        (payment) => payment.status === "Critical" || (payment.daysPastDue || 0) > 30
      );
    return filteredPayments.filter((payment) =>
      (payment.status || '').toLowerCase().includes(status.toLowerCase())
    );
  };

  const totalPendingAmount = pendingPayments.reduce(
    (sum, payment) => sum + (payment.emiAmount || 0),
    0
  );
  const totalPenalty = pendingPayments.reduce(
    (sum, payment) => sum + (payment.penaltyAmount || 0),
    0
  );
  const overdueCount = pendingPayments.filter(
    (payment) => (payment.daysPastDue || 0) > 0
  ).length;
  const criticalCount = pendingPayments.filter(
    (payment) => payment.status === "Critical" || (payment.daysPastDue || 0) > 30
  ).length;

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
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Payments
          </h1>
          <p className="text-muted-foreground">
            Track and manage overdue EMIs and pending loan payments
          </p>
        </div>
        <Button onClick={fetchPendingPayments}>
          <Plus className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{(totalPendingAmount / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} payments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueCount}
            </div>
            <p className="text-xs text-muted-foreground">Payments overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penalty</CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalPenalty.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Penalty charges</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Cases
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {criticalCount}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pending payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filter
        </Button>
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" />
          Bulk SMS
        </Button>
      </div>

      {/* Pending Payments Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Pending</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="due-today">Due Today</TabsTrigger>
          <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Pending Payments</CardTitle>
              <CardDescription>
                Complete list of pending EMI payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getPaymentsByStatus("all")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical">
          <Card>
            <CardHeader>
              <CardTitle>Critical Cases</CardTitle>
              <CardDescription>
                Payments overdue by more than 30 days - requires immediate
                attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getPaymentsByStatus("critical")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Payments</CardTitle>
              <CardDescription>All overdue EMI payments</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getPaymentsByStatus("overdue")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="due-today">
          <Card>
            <CardHeader>
              <CardTitle>Due Today</CardTitle>
              <CardDescription>Payments due today</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getPaymentsByStatus("due-today")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="due-soon">
          <Card>
            <CardHeader>
              <CardTitle>Due Soon</CardTitle>
              <CardDescription>
                Payments due within the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getPaymentsByStatus("due-soon")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
