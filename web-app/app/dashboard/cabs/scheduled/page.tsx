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
import { Search, Filter, Calendar, Clock, MapPin, User } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface ScheduledCab {
  _id: string;
  bookingId: string;
  patientName: string;
  phone: string;
  pickupLocation: {
    address: string;
  };
  destination: {
    address: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  serviceType: string;
  driverName?: string;
  vehicleNumber?: string;
  status: string;
  estimatedFare?: string;
}

interface ScheduledStats {
  totalBookings: number;
  confirmed: number;
  pending: number;
}

const columns = [
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    cell: ({ row }: any) => (
      <span className="font-mono text-sm">{row.getValue("bookingId")}</span>
    ),
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-blue-500" />
        <span className="font-medium">{row.getValue("patientName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "scheduledDate",
    header: "Date",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Calendar className="h-3 w-3 text-gray-500" />
        <span className="text-sm">
          {row.getValue("scheduledDate")
            ? new Date(row.getValue("scheduledDate")).toLocaleDateString()
            : "Not Scheduled"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "scheduledTime",
    header: "Time",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-sm">
          {row.getValue("scheduledTime") || "TBD"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "destination",
    header: "Destination",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <MapPin className="h-3 w-3 text-gray-500" />
        <span className="text-sm">
          {row.original.destination?.address || "TBD"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "serviceType",
    header: "Type",
    cell: ({ row }: any) => (
      <Badge
        variant={
          row.getValue("serviceType") === "OPD" ? "default" : "secondary"
        }
      >
        {row.getValue("serviceType")}
      </Badge>
    ),
  },
  {
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }: any) => row.getValue("driverName") || "Not Assigned",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const variant = status === "Confirmed" ? "default" : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "estimatedFare",
    header: "Est. Fare",
    cell: ({ row }: any) => row.getValue("estimatedFare") || "TBD",
  },
];

export default function ScheduledCabsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabs, setCabs] = useState<ScheduledCab[]>([]);
  const [stats, setStats] = useState<ScheduledStats>({
    totalBookings: 0,
    confirmed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledCabs();
    fetchStats();
  }, []);

  const fetchScheduledCabs = async () => {
    try {
      const response = await axios.get("/cabs?scheduled=true");
      setCabs(response.data || []);
    } catch (error) {
      console.error("Error fetching scheduled cabs:", error);
      setCabs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/cabs/stats");
      setStats({
        totalBookings: response.data.totalBookings || 0,
        confirmed: response.data.confirmed || 0,
        pending: response.data.pending || 0,
      });
    } catch (error) {
      console.error("Error fetching cab stats:", error);
    }
  };

  const filteredCabs = cabs.filter(
    (cab) =>
      cab.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cab.destination?.address || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  // Calculate tomorrow's bookings
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const tomorrowBookings = cabs.filter(
    (cab) => cab.scheduledDate === tomorrowStr,
  ).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Scheduled Cabs
            </h1>
            <p className="text-muted-foreground">
              Pre-booked cab services for upcoming appointments
            </p>
          </div>
          <Link href="/dashboard/cabs/create">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Cab
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Cabs</h1>
          <p className="text-muted-foreground">
            Pre-booked cab services for upcoming appointments
          </p>
        </div>
        <Link href="/dashboard/cabs/create">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Cab
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Scheduled
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Scheduled bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowBookings}</div>
            <p className="text-xs text-muted-foreground">
              Bookings for tomorrow
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Driver assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Bookings</CardTitle>
          <CardDescription>
            All pre-booked cab services with appointment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scheduled bookings..."
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
          <DataTable columns={columns} data={filteredCabs} />
        </CardContent>
      </Card>
    </div>
  );
}
