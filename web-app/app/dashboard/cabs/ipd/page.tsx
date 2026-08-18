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
import {
  Search,
  Filter,
  Car,
  Clock,
  User,
  Building2,
  Bed,
  Plus,
  MapPin,
} from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface IPDCab {
  _id: string;
  bookingId: string;
  patientName: string;
  phone: string;
  pickupLocation: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  department?: string;
  appointmentTime?: string;
  driverName: string;
  vehicleNumber: string;
  pickupTime: string;
  status: string;
  fare: string;
  returnTrip?: string;
  serviceType: string;
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
    accessorKey: "pickupLocation",
    header: "Pickup",
    cell: ({ row }: any) => {
      const pickup = row.original.pickupLocation;
      return (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-green-500" />
          <span className="text-sm">{pickup?.address || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "destination",
    header: "Hospital",
    cell: ({ row }: any) => {
      const dest = row.original.destination;
      return (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{dest?.address || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "admissionType",
    header: "Admission Type",
    cell: ({ row }: any) => (
      <span className="text-sm">{row.getValue("admissionType") || "IPD"}</span>
    ),
  },
  {
    accessorKey: "roomNumber",
    header: "Room",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Bed className="h-3 w-3 text-gray-500" />
        <span className="text-sm font-mono">
          {row.getValue("roomNumber") || "-"}
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
        <span className="text-sm">{row.getValue("pickupTime")}</span>
      </div>
    ),
  },
  {
    accessorKey: "urgency",
    header: "Urgency",
    cell: ({ row }: any) => {
      const urgency = row.getValue("urgency") || "Medium";
      const variant =
        urgency === "High"
          ? "destructive"
          : urgency === "Medium"
          ? "secondary"
          : "outline";
      return <Badge variant={variant}>{urgency}</Badge>;
    },
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
  },
];

export default function IPDCabsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabs, setCabs] = useState<IPDCab[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayBookings: 0,
    completedTrips: 0,
    inProgressTrips: 0,
    scheduledTrips: 0,
  });

  useEffect(() => {
    fetchIPDCabs();
    fetchStats();
  }, []);

  const fetchIPDCabs = async () => {
    try {
      const response = await axios.get("/cabs?serviceType=IPD");
      setCabs(response.data || []);
    } catch (error) {
      console.error("Error fetching IPD cabs:", error);
      setCabs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/cabs/stats?serviceType=IPD");
      const { totalBookings, completed, inProgress, scheduled } = response.data;
      setStats({
        todayBookings: totalBookings,
        completedTrips: completed,
        inProgressTrips: inProgress,
        scheduledTrips: scheduled,
      });
    } catch (error) {
      console.error("Error fetching IPD cab stats:", error);
    }
  };

  const filteredCabs = cabs.filter(
    (cab) =>
      cab.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cab.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((cab.destination?.address || cab.destination || "") as any)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const todayBookings = stats.todayBookings;
  const completedTrips = stats.completedTrips;
  const inProgressTrips = stats.inProgressTrips;
  const scheduledTrips = stats.scheduledTrips;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              IPD Cab Services
            </h1>
            <p className="text-muted-foreground">
              Cab bookings for In-Patient Department services
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
          <h1 className="text-3xl font-bold tracking-tight">
            IPD Cab Services
          </h1>
          <p className="text-muted-foreground">
            Cab bookings for In-Patient Department services
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
              Total IPD Bookings
            </CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayBookings}</div>
            <p className="text-xs text-muted-foreground">Today's bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTrips}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTrips}</div>
            <p className="text-xs text-muted-foreground">Currently ongoing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTrips}</div>
            <p className="text-xs text-muted-foreground">Upcoming trips</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>IPD Cab Bookings</CardTitle>
          <CardDescription>
            All cab services for in-patient admissions and transfers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, booking ID, or hospital..."
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
