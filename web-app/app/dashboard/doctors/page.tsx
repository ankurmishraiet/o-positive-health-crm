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
import { Search, Plus, Filter, Stethoscope, MapPin, Upload } from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";

const columns = [
  {
    accessorKey: "name",
    header: "Doctor Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Stethoscope className="h-4 w-4 text-blue-500" />
        <Link
          href={`/dashboard/doctors/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        >
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }: any) => (
      <span>{row.getValue("specialization") || "--"}</span>
    ),
  },
  {
    accessorKey: "experienceYears",
    header: "Experience (Years)",
    cell: ({ row }: any) => (
      <span>{row.getValue("experienceYears") || "--"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: any) => <span>{row.getValue("phone") || "--"}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("location") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: any) => (
      <Badge
        variant={row.getValue("type") === "With Us" ? "default" : "secondary"}
      >
        {row.getValue("type") || "--"}
      </Badge>
    ),
  },
  {
    accessorKey: "consultationFee",
    header: "Consultation Fee",
    cell: ({ row }: any) => (
      <span>
        {row.getValue("consultationFee")
          ? `₹${row.getValue("consultationFee")}`
          : "--"}
      </span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <span>{row.getValue("rating") || "--"}</span>
        {row.getValue("rating") && <div className="text-yellow-400">★</div>}
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }: any) => (
      <Badge
        variant={row.getValue("isActive") === true ? "default" : "destructive"}
      >
        {row.getValue("isActive") === true ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsResponse, statsResponse] = await Promise.all([
        axios.get("/doctors"),
        axios.get("/doctors/stats"),
      ]);
      setDoctors(doctorsResponse.data?.doctors || doctorsResponse.data || []);
      setStats(statsResponse.data?.stats || statsResponse.data || {});
    } catch (error) {
      console.error("Error fetching doctors data:", error);
      setDoctors([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Display actual data from API only
  const doctorsData = doctors || [];

  const filteredDoctors = doctorsData.filter(
    (doctor: any) =>
      (doctor?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doctor?.specialization || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (doctor?.location || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Doctors</h1>
          <p className="text-muted-foreground">
            Manage and view all doctors in the network
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/doctors/upload-csv">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </Link>
          <Link href="/dashboard/doctors/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.growthPercentage
                ? `+${stats.growthPercentage}% from last month`
                : "Data available"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.withUs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(stats?.total || 0) > 0
                ? `${Math.round(
                    ((stats?.withUs || 0) / (stats?.total || 1)) * 100
                  )}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Self Clinic</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.selfClinic || 0}</div>
            <p className="text-xs text-muted-foreground">
              {(stats?.total || 0) > 0
                ? `${Math.round(
                    ((stats?.selfClinic || 0) / (stats?.total || 1)) * 100
                  )}% of total`
                : "0% of total"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeToday || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available for consultation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors Directory</CardTitle>
          <CardDescription>
            Complete list of all doctors in the network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name, specialization, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            {/* ❌ Button commented: Filter functionality not implemented in backend */}
            {/* <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button> */}
          </div>
          <DataTable columns={columns} data={filteredDoctors} />
        </CardContent>
      </Card>
    </div>
  );
}
