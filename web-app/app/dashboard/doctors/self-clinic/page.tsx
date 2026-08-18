"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Search, Plus, Filter, Building, MapPin, Star, Stethoscope } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  clinicName?: string;
  city: string;
  phone: string;
  experience: string;
  rating?: number;
  partnerSince?: string;
  consultationFee: string;
  status: string;
  type: string;
}

const columns = [
  {
    accessorKey: "name",
    header: "Doctor Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Stethoscope className="h-4 w-4 text-blue-500" />
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "clinicName",
    header: "Clinic",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Building className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("clinicName") || "Private Practice"}</span>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("city")}</span>
      </div>
    ),
  },
  {
    accessorKey: "experience",
    header: "Experience",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const variant = status === "Active" ? "default" : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "consultationFee",
    header: "Fee",
  },
];

export default function SelfClinicDoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSelfClinicDoctors();
  }, []);

  const fetchSelfClinicDoctors = async () => {
    try {
      const response = await axios.get("/doctors/type/Self Clinic");
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Error fetching self clinic doctors:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Self Clinic Doctors</h1>
            <p className="text-muted-foreground">Partner doctors with their own clinics</p>
          </div>
          <Link href="/dashboard/doctors/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Self Clinic Doctors</h1>
          <p className="text-muted-foreground">Partner doctors with their own clinics</p>
        </div>
        <Link href="/dashboard/doctors/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Self Clinic</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">Independent practices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.filter(d => d.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently accepting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specializations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(doctors.map(d => d.specialization)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different specialties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Covered</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(doctors.map(d => d.city)).size}
            </div>
            <p className="text-xs text-muted-foreground">Locations served</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Self Clinic Doctors Directory</CardTitle>
          <CardDescription>Partner doctors operating their own independent clinics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          <DataTable columns={columns} data={filteredDoctors} />
        </CardContent>
      </Card>
    </div>
  );
}
