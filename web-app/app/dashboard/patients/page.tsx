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
import { DataTable } from "@/components/ui/data-table";
import { Search, UserCog, Phone, MapPin, Activity, Eye } from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";
import { toast } from "sonner";

const columns = [
  {
    accessorKey: "patientName",
    header: "Patient Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <UserCog className="h-4 w-4 text-blue-500" />
        <Link
          href={`/dashboard/patients/${row.original._id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          {row.getValue("patientName")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "patientId",
    header: "Patient ID",
    cell: ({ row }: any) => (
      <span className="text-sm text-gray-600">
        {row.getValue("patientId") || "--"}
      </span>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }: any) => <span>{row.getValue("age") || "--"}</span>,
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }: any) => <span>{row.getValue("gender") || "--"}</span>,
  },
  {
    accessorKey: "contact.mobile",
    header: "Phone",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Phone className="h-3 w-3 text-gray-500" />
        <span>{row.original.contact?.mobile || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("city") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "treatment",
    header: "Treatment",
    cell: ({ row }: any) => (
      <span className="text-sm">{row.getValue("treatment") || "--"}</span>
    ),
  },
  {
    accessorKey: "leadStatus",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("leadStatus");
      const getStatusColor = (status: string) => {
        switch (status) {
          case "New":
            return "bg-blue-100 text-blue-800";
          case "Close":
            return "bg-green-100 text-green-800";
          case "Follow-up":
            return "bg-yellow-100 text-yellow-800";
          case "Hot Lead":
            return "bg-red-100 text-red-800";
          case "Cold Lead":
            return "bg-gray-100 text-gray-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };
      return (
        <Badge className={getStatusColor(status as string)}>
          {status || "--"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <Link href={`/dashboard/patients/${row.original._id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </Link>
    ),
  },
];

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage]);

  const fetchPatients = async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get("/patients", {
        params: {
          page: page,
          limit: 50,
          sortBy: "createdAt",
          sortOrder: "desc",
          search: searchTerm || undefined,
        },
      });
      setPatients(response.data?.patients || []);
      setPagination(response.data?.pagination || {});
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPatients(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredPatients = patients;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-muted-foreground">
            View and manage all patient records with complete history
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter((p) => 
                ["Follow-up", "Hot Lead", "OPD Schedule", "IPD Schedule"].includes(p.leadStatus)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in treatment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Patients</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter((p) => p.leadStatus === "New").length}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Cases
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patients.filter((p) => 
                ["Close", "OPD Done", "IPD Done"].includes(p.leadStatus)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully treated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Directory</CardTitle>
          <CardDescription>
            Browse all patients and view their complete medical history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, city, or treatment..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredPatients}
            searchable={false}
          />
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} patients
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
