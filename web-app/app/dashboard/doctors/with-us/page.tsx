"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Search, Plus, Filter, Stethoscope, MapPin, Calendar, Clock } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: string;
  city: string;
  joinedDate?: string;
  patientsToday?: number;
  nextAvailable?: string;
  status: string;
  availability?: string;
  consultationFee: string;
  type: string;
}

interface WithUsStats {
  totalWithUs: number;
  availableNow: number;
  consultationsToday: number;
  averageRating: string;
}

const columns = [
  {
    accessorKey: "name",
    header: "Doctor Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Stethoscope className="h-4 w-4 text-blue-500" />
        <span className="font-medium">{row.getValue("name") || "--"}</span>
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
    accessorKey: "city",
    header: "Location",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("city") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }: any) => (
      <span>{row.getValue("experience") || "--"}</span>
    ),
  },
  {
    accessorKey: "availability", 
    header: "Availability",
    cell: ({ row }: any) => {
      const availability = row.getValue("availability") || "Offline";
      const variant = availability === "Available" ? "default" : availability === "Busy" ? "secondary" : "outline";
      return <Badge variant={variant}>{availability}</Badge>;
    },
  },
  {
    accessorKey: "consultationFee",
    header: "Fee",
    cell: ({ row }: any) => {
      const fee = row.getValue("consultationFee");
      return <span>{fee ? `₹${fee}` : "--"}</span>;
    },
  },
];

export default function DoctorsWithUsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<WithUsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorsWithUs();
    fetchWithUsStats();
  }, []);

  const fetchDoctorsWithUs = async () => {
    try {
      const response = await axios.get("/doctors/type/With Us");
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Error fetching doctors with us:", error);
      setDoctors([]);
    }
  };

  const fetchWithUsStats = async () => {
    try {
      const response = await axios.get("/doctors/stats/with-us");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching with-us stats:", error);
      setStats({
        totalWithUs: 0,
        availableNow: 0,
        consultationsToday: 0,
        averageRating: "0.0",
      });
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
            <h1 className="text-3xl font-bold tracking-tight">Doctors With Us</h1>
            <p className="text-muted-foreground">Doctors directly associated with O Positive Health</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Doctors With Us</h1>
          <p className="text-muted-foreground">Doctors directly associated with O Positive Health</p>
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
            <CardTitle className="text-sm font-medium">Total With Us</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWithUs || 0}</div>
            <p className="text-xs text-muted-foreground">Direct association</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.availableNow || 0}</div>
            <p className="text-xs text-muted-foreground">Ready for consultation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.consultationsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Today's appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <div className="flex text-yellow-400">★★★★☆</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageRating || "0.0"}</div>
            <p className="text-xs text-muted-foreground">Based on patient feedback</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctors Directory - With Us</CardTitle>
          <CardDescription>Doctors directly employed or contracted with O Positive Health</CardDescription>
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
