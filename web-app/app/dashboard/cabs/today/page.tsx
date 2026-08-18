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
import { Search, Filter, Car, Clock, MapPin, User, Plus } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface TodayCab {
  _id: string;
  bookingId: string;
  patientName: string;
  driverName?: string;
  vehicleNumber?: string;
  pickupLocation: {
    address: string;
  };
  destination: {
    address: string;
  };
  pickupTime: string;
  status: string;
  fare?: string;
  distance?: string;
}

interface CabStats {
  todayBookings: number;
  completed: number;
  inProgress: number;
  scheduled: number;
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
    accessorKey: "driverName",
    header: "Driver",
    cell: ({ row }: any) => row.getValue("driverName") || "Not Assigned",
  },
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Car className="h-4 w-4 text-gray-500" />
        <span className="font-mono text-sm">
          {row.getValue("vehicleNumber") || "Not Assigned"}
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
          {row.original.destination?.address || row.getValue("destination")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "pickupTime",
    header: "Pickup Time",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-sm">
          {new Date(row.getValue("pickupTime")).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const variant =
        status === "Completed"
          ? "default"
          : status === "In Progress"
            ? "secondary"
            : "outline";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "fare",
    header: "Fare",
    cell: ({ row }: any) => row.getValue("fare") || "Pending",
  },
];

export default function TodayCabsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabs, setCabs] = useState<TodayCab[]>([]);
  const [stats, setStats] = useState<CabStats>({
    todayBookings: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysCabs();
    fetchStats();
  }, []);

  const fetchTodaysCabs = async () => {
    try {
      const response = await axios.get("/cabs?today=true");
      setCabs(response.data || []);
    } catch (error) {
      console.error("Error fetching today's cabs:", error);
      setCabs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/cabs/stats");
      setStats(response.data);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Today's Cabs</h1>
            <p className="text-muted-foreground">
              All cab bookings and trips for today
            </p>
          </div>
          <Link href="/dashboard/cabs/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Book Cab
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
          <h1 className="text-3xl font-bold tracking-tight">Today's Cabs</h1>
          <p className="text-muted-foreground">
            All cab bookings and trips for today
          </p>
        </div>
        <Link href="/dashboard/cabs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Book Cab
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">Today's bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduled}</div>
            <p className="text-xs text-muted-foreground">Upcoming trips</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Cab Bookings</CardTitle>
          <CardDescription>
            All cab services scheduled and completed for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
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
