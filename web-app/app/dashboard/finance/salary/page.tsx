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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Filter,
  User,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import axios from "@/axios/axios";

const salaryIncentiveDataStatic = [
  {
    id: "SAL-001",
    employeeName: "Rajesh Kumar",
    employeeId: "EMP001",
    designation: "Sales Manager",
    department: "Sales",
    baseSalary: 45000,
    incentives: 8500,
    deductions: 2500,
    netSalary: 51000,
    month: "January 2024",
    status: "Paid",
    paymentDate: "2024-01-31",
  },
  {
    id: "SAL-002",
    employeeName: "Priya Sharma",
    employeeId: "EMP002",
    designation: "Marketing Executive",
    department: "Marketing",
    baseSalary: 35000,
    incentives: 5500,
    deductions: 1500,
    netSalary: 39000,
    month: "January 2024",
    status: "Pending",
    paymentDate: null,
  },
  {
    id: "SAL-003",
    employeeName: "Amit Patel",
    employeeId: "EMP003",
    designation: "Customer Service Representative",
    department: "Customer Service",
    baseSalary: 28000,
    incentives: 3200,
    deductions: 1200,
    netSalary: 30000,
    month: "January 2024",
    status: "Paid",
    paymentDate: "2024-01-31",
  },
  {
    id: "SAL-004",
    employeeName: "Neha Singh",
    employeeId: "EMP004",
    designation: "Operations Manager",
    department: "Operations",
    baseSalary: 55000,
    incentives: 12000,
    deductions: 3000,
    netSalary: 64000,
    month: "January 2024",
    status: "Processing",
    paymentDate: null,
  },
  {
    id: "SAL-005",
    employeeName: "Vikash Gupta",
    employeeId: "EMP005",
    designation: "HR Executive",
    department: "Human Resources",
    baseSalary: 38000,
    incentives: 4500,
    deductions: 1800,
    netSalary: 40700,
    month: "January 2024",
    status: "Paid",
    paymentDate: "2024-01-31",
  },
];

const columns = [
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">
            {row.getValue("employeeName") ||
              row.original.employee?.name ||
              "--"}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {row.original.employeeId || row.original.employee?.employeeId || "--"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }: any) => (
      <span>
        {row.getValue("designation") || row.original.position || "--"}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }: any) => <span>{row.getValue("department") || "--"}</span>,
  },
  {
    accessorKey: "baseSalary",
    header: "Base Salary",
    cell: ({ row }: any) => {
      const salary = row.getValue("baseSalary") || row.original.grossSalary;
      return (
        <div className="font-medium">
          {salary ? `₹${salary.toLocaleString()}` : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "incentives",
    header: "Incentives",
    cell: ({ row }: any) => {
      const incentives =
        row.getValue("incentives") || row.original.bonuses || 0;
      return (
        <div className="font-medium text-green-600">
          {incentives ? `+₹${incentives.toLocaleString()}` : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "deductions",
    header: "Deductions",
    cell: ({ row }: any) => {
      const deductions =
        row.getValue("deductions") || row.original.totalDeductions || 0;
      return (
        <div className="font-medium text-red-600">
          {deductions ? `-₹${deductions.toLocaleString()}` : "--"}
        </div>
      );
    },
  },
  {
    accessorKey: "netSalary",
    header: "Net Salary",
    cell: ({ row }: any) => {
      const netSalary = row.getValue("netSalary") || row.original.finalAmount;
      return (
        <div className="font-bold text-blue-600">
          {netSalary ? `₹${netSalary.toLocaleString()}` : "--"}
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
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }: any) => {
      const date = row.getValue("paymentDate");
      return date ? (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-gray-400">Pending</span>
      );
    },
  },
];

const incentiveColumns = [
  {
    accessorKey: "employeeName",
    header: "Employee",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("employeeName")}</span>
        </div>
        <div className="text-sm text-gray-500">{row.original.employeeCode}</div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "incentiveType",
    header: "Type",
    cell: ({ row }: any) => (
      <Badge variant="outline">{row.getValue("incentiveType")}</Badge>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }: any) => (
      <div className="font-medium text-green-600">
        ₹{row.getValue("amount").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }: any) => {
      const status = row.getValue("paymentStatus");
      const variant =
        status === "Paid"
          ? "default"
          : status === "Processing"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "approvalStatus",
    header: "Approval Status",
    cell: ({ row }: any) => {
      const status = row.getValue("approvalStatus");
      const variant =
        status === "Approved"
          ? "default"
          : status === "Under Review"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "paymentDate",
    header: "Payment Date",
    cell: ({ row }: any) => {
      const date = row.getValue("paymentDate");
      return date ? (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{new Date(date).toLocaleDateString()}</span>
        </div>
      ) : (
        <span className="text-gray-400">Pending</span>
      );
    },
  },
];

export default function SalaryIncentivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [salaries, setSalaries] = useState<any[]>([]);
  const [incentives, setIncentives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [payrollForm, setPayrollForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    department: "All"
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    Promise.all([fetchSalaries(), fetchIncentives()]);
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/finance/salaries");
      setSalaries(response.data?.salaries || []);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      setError("Failed to load salary data from API. Please check connection.");
      setSalaries([]); // No fallback to static data
    } finally {
      setLoading(false);
    }
  };

  const fetchIncentives = async () => {
    try {
      const response = await axios.get("/hr/incentives");
      setIncentives(response.data?.incentives || []);
    } catch (error) {
      console.error("Error fetching incentives:", error);
    }
  };

  const handleProcessPayroll = () => {
    setShowProcessDialog(true);
  };

  const handleSubmitPayroll = async () => {
    setIsProcessing(true);
    try {
      await axios.post("/hr/payroll/process", {
        month: payrollForm.month,
        year: payrollForm.year,
        department: payrollForm.department === "All" ? undefined : payrollForm.department
      });

      toast({
        title: "Success",
        description: `Payroll processed for ${getMonthName(payrollForm.month)} ${payrollForm.year}`,
      });

      setShowProcessDialog(false);
      fetchSalaries(); // Refresh the salary data
    } catch (error: any) {
      console.error("Error processing payroll:", error);
      toast({
        title: "Error", 
        description: error.response?.data?.message || "Failed to process payroll",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  const salaryIncentiveData = salaries;

  // Enhance salary data with incentive information
  const enhancedSalaryData = (salaryIncentiveData || []).map((salary: any) => {
    const employeeIncentives = (incentives || []).filter(
      (inc: any) =>
        inc?.employeeId === salary?.employeeId ||
        inc?.employeeName === salary?.employeeName
    );

    const totalIncentiveAmount = employeeIncentives.reduce(
      (sum: number, inc: any) => sum + (inc?.amount || 0),
      0
    );

    return {
      ...salary,
      incentives: salary?.incentives || totalIncentiveAmount,
      relatedIncentives: employeeIncentives,
    };
  });

  const filteredSalaries = (enhancedSalaryData || []).filter(
    (salary: any) =>
      (salary?.employeeName || salary?.employee?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (salary?.designation || salary?.position || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (salary?.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (salary?.employeeId || salary?.employee?.employeeId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getSalariesByStatus = (status: string) => {
    if (status === "all") return filteredSalaries || [];
    return (filteredSalaries || []).filter(
      (salary: any) =>
        (salary?.status || salary?.paymentStatus || "").toLowerCase() ===
        status.toLowerCase()
    );
  };

  const totalSalaryPaid = (enhancedSalaryData || [])
    .filter(
      (salary: any) =>
        salary?.status === "Paid" || salary?.paymentStatus === "Paid"
    )
    .reduce(
      (sum: number, salary: any) =>
        sum + (salary?.netSalary || salary?.finalAmount || 0),
      0
    );

  const totalIncentivesPaid = (enhancedSalaryData || [])
    .filter(
      (salary: any) =>
        salary?.status === "Paid" || salary?.paymentStatus === "Paid"
    )
    .reduce(
      (sum: number, salary: any) =>
        sum + (salary?.incentives || salary?.bonuses || 0),
      0
    );

  const totalPendingPayments = (enhancedSalaryData || [])
    .filter((salary: any) =>
      ["Pending", "Processing", "Approved"].includes(
        salary?.status || salary?.paymentStatus
      )
    )
    .reduce(
      (sum: number, salary: any) =>
        sum + (salary?.netSalary || salary?.finalAmount || 0),
      0
    );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Salary & Incentives</h1>
            <p className="text-gray-600">Loading salary data...</p>
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
            Salary & Incentives
          </h1>
          <p className="text-muted-foreground">
            Manage employee salaries, incentives, and payroll processing
          </p>
        </div>
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleProcessPayroll}>
              <Plus className="mr-2 h-4 w-4" />
              Process Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Process Payroll</DialogTitle>
              <DialogDescription>
                Generate salary and incentive payments for employees.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <Select
                  value={payrollForm.month.toString()}
                  onValueChange={(value) => setPayrollForm({ ...payrollForm, month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {getMonthName(i + 1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Select
                  value={payrollForm.year.toString()}
                  onValueChange={(value) => setPayrollForm({ ...payrollForm, year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select
                  value={payrollForm.department}
                  onValueChange={(value) => setPayrollForm({ ...payrollForm, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Departments</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowProcessDialog(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitPayroll}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Process Payroll"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              onClick={() => {
                fetchSalaries();
                fetchIncentives();
              }}
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
            <CardTitle className="text-sm font-medium">
              Total Salary Paid
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalSalaryPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Incentives Paid
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₹{totalIncentivesPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Performance bonuses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalPendingPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(enhancedSalaryData || []).length}
            </div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Department
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Select Month
        </Button>
      </div>

      {/* Salary Table */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">All Employees</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="incentives">Incentives</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Employee Salary & Incentives</CardTitle>
              <CardDescription>
                Complete payroll information for all employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={getSalariesByStatus("all")} 
                exportFilename="employee_salaries"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle>Paid Salaries</CardTitle>
              <CardDescription>
                Successfully processed salary payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getSalariesByStatus("paid")}
                exportFilename="paid_salaries"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Salaries awaiting payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getSalariesByStatus("pending")}
                exportFilename="pending_salaries"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Payments</CardTitle>
              <CardDescription>
                Salaries currently being processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={getSalariesByStatus("processing")}
                exportFilename="processing_salaries"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives">
          <Card>
            <CardHeader>
              <CardTitle>Employee Incentives</CardTitle>
              <CardDescription>
                Performance-based incentives and bonuses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={incentiveColumns} 
                data={incentives} 
                exportFilename="employee_incentives"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Department Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Wise Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(
                  (enhancedSalaryData || [])
                    .map((salary) => salary?.department)
                    .filter(Boolean)
                )
              ).map((department) => {
                const departmentSalaries = (enhancedSalaryData || []).filter(
                  (salary) => salary?.department === department
                );
                const departmentTotal = departmentSalaries.reduce(
                  (sum, salary) => sum + (salary?.netSalary || 0),
                  0
                );
                const employeeCount = departmentSalaries.length;

                return (
                  <div
                    key={department}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="text-sm font-medium">{department}</span>
                      <div className="text-xs text-gray-500">
                        {employeeCount} employees
                      </div>
                    </div>
                    <span className="font-medium">
                      ₹{departmentTotal.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incentive Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(enhancedSalaryData || [])
                .sort((a, b) => (b?.incentives || 0) - (a?.incentives || 0))
                .map((employee) => (
                  <div
                    key={employee?.employeeId || employee?.id}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="text-sm font-medium">
                        {employee?.employeeName || "Unknown"}
                      </span>
                      <div className="text-xs text-gray-500">
                        {employee?.designation || "N/A"}
                      </div>
                      {employee?.relatedIncentives?.length > 0 && (
                        <div className="text-xs text-blue-500">
                          {employee.relatedIncentives.length} incentive(s) this
                          period
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-green-600">
                      ₹{(employee?.incentives || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
