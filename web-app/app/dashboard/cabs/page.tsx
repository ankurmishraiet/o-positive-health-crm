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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Filter,
  Car,
  MapPin,
  Clock,
  User,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const columns = [
  {
    accessorKey: "bookingId",
    header: "Booking ID",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Car className="h-4 w-4 text-blue-500" />
        <span className="font-mono font-medium">
          {row.getValue("bookingId") || "--"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "patientName",
    header: "Patient Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-gray-500" />
        <span className="font-medium">
          {row.getValue("patientName") || "--"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: any) => <span>{row.getValue("phone") || "--"}</span>,
  },
  {
    accessorKey: "serviceType",
    header: "Service Type",
    cell: ({ row }: any) => <span>{row.getValue("serviceType") || "--"}</span>,
  },
  {
    accessorKey: "pickupLocation",
    header: "Pickup Location",
    cell: ({ row }: any) => {
      const location = row.original.pickupLocation;
      return (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{location?.address || "--"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "urgency",
    header: "Urgency",
    cell: ({ row }: any) => {
      const urgency = row.getValue("urgency");
      const variant =
        urgency === "Emergency"
          ? "destructive"
          : urgency === "High"
          ? "default"
          : "outline";
      return <Badge variant={variant}>{urgency || "--"}</Badge>;
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
          : status === "Cancelled"
          ? "destructive"
          : "outline";
      return (
        <Badge
          variant={
            status === "Completed"
              ? "default"
              : status === "In Progress"
              ? "secondary"
              : status === "Cancelled"
              ? "destructive"
              : "outline"
          }
        >
          {status || "--"}
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "driverName",
  //   header: "Driver",
  //   cell: ({ row }: any) => (
  //     <span>{row.getValue("driverName") || "Not Assigned"}</span>
  //   ),
  // },
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle",
    cell: ({ row }: any) => (
      <span className="font-mono">
        {row.getValue("vehicleNumber") || "Not Assigned"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }: any) => {
      const cab = row.original;

      const handleDelete = async () => {
        if (
          !window.confirm("Are you sure you want to delete this cab booking?")
        ) {
          return;
        }

        try {
          await axios.delete(`/cabs/${cab._id}`);
          toast({
            title: "Success",
            description: "Cab booking deleted successfully",
          });
          // Refresh the data
          window.location.reload();
        } catch (error) {
          console.error("Error deleting cab:", error);
          toast({
            title: "Error",
            description: "Failed to delete cab booking",
            variant: "destructive",
          });
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/cabs/${cab._id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/cabs/${cab._id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function CabsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cabs, setCabs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cabsResponse, statsResponse] = await Promise.all([
        axios.get("/cabs"),
        axios.get("/cabs/stats"),
      ]);
      setCabs(cabsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Error fetching cabs data:", error);
      setCabs([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Use API data
  const cabsData = cabs;

  // Helper function to check if booking is today
  const isToday = (dateString: string) => {
    if (!dateString) return false;
    const bookingDate = new Date(dateString);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  };

  // Filter based on tab
  const getFilteredCabsByTab = () => {
    let filtered = cabsData;
    
    switch (activeTab) {
      case "today":
        filtered = cabsData.filter((cab: any) => 
          isToday(cab.pickupDate || cab.createdAt)
        );
        break;
      case "opd":
        filtered = cabsData.filter((cab: any) => 
          cab.serviceType?.toLowerCase().includes("opd") ||
          cab.purpose?.toLowerCase().includes("opd")
        );
        break;
      case "ipd":
        filtered = cabsData.filter((cab: any) => 
          cab.serviceType?.toLowerCase().includes("ipd") ||
          cab.purpose?.toLowerCase().includes("ipd")
        );
        break;
      case "all":
      default:
        filtered = cabsData;
        break;
    }

    return filtered;
  };

  // Filter based on search term
  const filteredCabs = getFilteredCabsByTab().filter(
    (booking: any) =>
      (booking?.patientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking?.bookingId || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking?.serviceType || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (booking?.status || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Use API statistics or fallback to calculated values based on booking data
  const totalBookings = stats.total || cabsData.length;
  const pendingBookings =
    stats.pending ||
    cabsData.filter(
      (booking) =>
        booking.status === "Pending Assignment" ||
        booking.status === "Scheduled"
    ).length;
  const inProgressBookings =
    stats.inProgress ||
    cabsData.filter((booking) => booking.status === "In Progress").length;
  const completedToday =
    stats.completedToday ||
    cabsData.filter((booking) => 
      booking.status === "Completed" && isToday(booking.completedAt || booking.updatedAt)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cab Bookings</h1>
          <p className="text-muted-foreground">
            Manage and monitor all cab booking requests
          </p>
        </div>
        <Link href="/dashboard/cabs/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Booking
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
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressBookings}</div>
            <p className="text-xs text-muted-foreground">Currently serving</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Today
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Today's completed trips
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cab Booking Management</CardTitle>
          <CardDescription>
            Real-time status and information of all cab bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings by patient name, booking ID, or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="opd">Cab for OPD</TabsTrigger>
              <TabsTrigger value="ipd">Cab for IPD</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <DataTable columns={columns} data={filteredCabs} />
            </TabsContent>
            <TabsContent value="today" className="mt-4">
              <DataTable columns={columns} data={filteredCabs} />
            </TabsContent>
            <TabsContent value="opd" className="mt-4">
              <DataTable columns={columns} data={filteredCabs} />
            </TabsContent>
            <TabsContent value="ipd" className="mt-4">
              <DataTable columns={columns} data={filteredCabs} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
