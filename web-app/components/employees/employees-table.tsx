"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import axios from "@/axios/axios";
import { format, differenceInMonths } from "date-fns";
import { usePermissions } from "@/hooks/use-permissions";

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  status: string;
  joiningDate?: string;
  dateOfBirth?: string;
  dateOfEnding?: string;
  startingSalary?: number;
  salary?: number;
  increments?: {
    date: string;
    amount: number;
    reason?: string;
    previousSalary?: number;
    newSalary?: number;
  }[];
  systemAgeMonths?: number;
  gender?: string;
  addressPresent?: string;
  addressPermanent?: string;
  alternateNumber?: string;
  fatherName?: string;
  qualification?: string;
  aadharNumber?: string;
  pancardNumber?: string;
  experience?: string;
  hasAccount?: boolean;
  userId?: string;
}

export default function EmployeesTablePage() {
  const { canUpdate, canDelete, isAdmin } = usePermissions();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const router = useRouter();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/dashboard/hr/employees/${employeeId}`);
  };

  const handleEditEmployee = (employeeId: string) => {
    router.push(`/dashboard/hr/employees/${employeeId}/edit`);
  };

  const handleDeleteEmployee = async (
    employeeId: string,
    employeeName: string,
  ) => {
    if (confirm(`Are you sure you want to delete ${employeeName}?`)) {
      try {
        await axios.delete(`/employees/${employeeId}`);
        setEmployees(employees.filter((emp) => emp._id !== employeeId));
        toast.success("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Failed to delete employee");
      }
    }
  };

  const handleCreateAccount = async (employee: Employee) => {
    try {
      const response = await axios.post(
        `/employees/${employee._id}/create-account`,
        {},
      );
      toast.success("Account created successfully");
      fetchEmployees();
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error(error.response?.data?.message || "Failed to create account");
    }
  };

  const handleRemoveAccount = async (employee: Employee) => {
    if (confirm(`Remove account access for ${employee.name}?`)) {
      try {
        await axios.delete(`/employees/${employee._id}/remove-account`);
        toast.success("Account removed successfully");
        fetchEmployees();
      } catch (error: any) {
        console.error("Error removing account:", error);
        toast.error(
          error.response?.data?.message || "Failed to remove account",
        );
      }
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const calculateSystemAge = (
    joiningDate?: string,
    systemAgeMonths?: number,
  ) => {
    if (systemAgeMonths !== undefined) {
      const years = Math.floor(systemAgeMonths / 12);
      const months = systemAgeMonths % 12;
      return years > 0 ? `${years}y ${months}m` : `${months}m`;
    }
    if (!joiningDate) return "N/A";
    try {
      const months = differenceInMonths(new Date(), new Date(joiningDate));
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return years > 0
        ? `${years}y ${remainingMonths}m`
        : `${remainingMonths}m`;
    } catch {
      return "N/A";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "employeeId",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Employee Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("employeeId")}</div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "joiningDate",
        header: "Date of Joining",
        cell: ({ row }) => formatDate(row.original.joiningDate),
      },
      {
        accessorKey: "dateOfEnding",
        header: "Date of Ending (Prev Job)",
        cell: ({ row }) => formatDate(row.original.dateOfEnding),
      },
      {
        accessorKey: "systemAgeMonths",
        header: "System Age",
        cell: ({ row }) =>
          calculateSystemAge(
            row.original.joiningDate,
            row.original.systemAgeMonths,
          ),
      },
      {
        accessorKey: "startingSalary",
        header: "Starting Salary",
        cell: ({ row }) => formatCurrency(row.original.startingSalary),
      },
      {
        accessorKey: "increments",
        header: "Increments",
        cell: ({ row }) => {
          const increments = row.original.increments || [];
          return (
            <div className="text-sm">
              {increments.length > 0 ? (
                <span className="font-medium">
                  {increments.length} increment(s)
                </span>
              ) : (
                <span className="text-gray-400">None</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "salary",
        header: "Current Salary",
        cell: ({ row }) => formatCurrency(row.original.salary),
      },
      {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => formatDate(row.original.dateOfBirth),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => row.original.gender || "N/A",
      },
      {
        accessorKey: "addressPresent",
        header: "Address Present",
        cell: ({ row }) => (
          <div
            className="max-w-[150px] sm:max-w-[200px] truncate"
            title={row.original.addressPresent}
          >
            {row.original.addressPresent || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "addressPermanent",
        header: "Address Permanent",
        cell: ({ row }) => (
          <div
            className="max-w-[150px] sm:max-w-[200px] truncate"
            title={row.original.addressPermanent}
          >
            {row.original.addressPermanent || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Contact Number",
        cell: ({ row }) => row.original.phone || "N/A",
      },
      {
        accessorKey: "alternateNumber",
        header: "Alternate Number",
        cell: ({ row }) => row.original.alternateNumber || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email ID",
        cell: ({ row }) => row.original.email || "N/A",
      },
      {
        accessorKey: "fatherName",
        header: "Father Name",
        cell: ({ row }) => row.original.fatherName || "N/A",
      },
      {
        accessorKey: "qualification",
        header: "Highest Qualification",
        cell: ({ row }) => row.original.qualification || "N/A",
      },
      {
        accessorKey: "aadharNumber",
        header: "Aadhar Card Number",
        cell: ({ row }) => row.original.aadharNumber || "N/A",
      },
      {
        accessorKey: "pancardNumber",
        header: "PAN Card",
        cell: ({ row }) => row.original.pancardNumber || "N/A",
      },
      {
        accessorKey: "experience",
        header: "Experience",
        cell: ({ row }) => row.original.experience || "N/A",
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => row.original.designation || "N/A",
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department || "N/A",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={getStatusColor(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleViewEmployee(employee._id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {canUpdate("employees") && (
                  <DropdownMenuItem
                    onClick={() => handleEditEmployee(employee._id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {/* Account operations restricted to ADMIN and HR with update permission for security */}
                {(isAdmin() || canUpdate("employees")) && (
                  <>
                    <DropdownMenuSeparator />
                    {employee.hasAccount ? (
                      <DropdownMenuItem
                        onClick={() => handleRemoveAccount(employee)}
                        className="text-red-600"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove Account
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => handleCreateAccount(employee)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {canDelete("employees") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        handleDeleteEmployee(employee._id, employee.name)
                      }
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [employees],
  );

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter: searchTerm,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">All Employees</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Comprehensive employee management table
          </p>
        </div>
        {canUpdate("employees") && (
          <Link href="/dashboard/hr/employees/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Employee
            </Button>
          </Link>
        )}
      </div>

      <Card className="w-full min-w-0 max-w-full overflow-hidden">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-w-0 p-0 sm:p-6">
          <div className="w-full min-w-0 max-w-full overflow-x-auto rounded-md border">
            <Table className="min-w-max w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap px-2 sm:px-4"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap px-2 sm:px-4"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 sm:px-0">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing{" "}
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}{" "}
              to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )}{" "}
              of {table.getFilteredRowModel().rows.length} employees
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>
              <div className="text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
