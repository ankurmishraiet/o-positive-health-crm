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
  Plus,
  Filter,
  Building2,
  MapPin,
  Star,
  Bed,
  ExternalLink,
  Edit,
  Upload,
} from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";
import { usePermissions } from "@/hooks/use-permissions";

const columns = [
  {
    accessorKey: "name",
    header: "Hospital Name",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4 text-blue-500" />
        <span className="font-medium">{row.getValue("name") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }: any) => {
      const location = row.original.location || {};
      const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
      const displayLocation = location.city && location.state 
        ? `${location.city}, ${location.state}` 
        : location.city || location.state || "--";

      return (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="text-sm">{displayLocation}</span>
          </div>
          {location.lat && location.lng && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="text-xs">Maps</span>
            </a>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: any) => (
      <span>{row.getValue("type") || "--"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: any) => (
      <span>{row.getValue("phone") || "--"}</span>
    ),
  },
  {
    accessorKey: "beds",
    header: "Beds",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Bed className="h-3 w-3 text-gray-500" />
        <span>{row.getValue("beds") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-1">
        <Star className="h-3 w-3 text-yellow-400 fill-current" />
        <span>{row.getValue("rating") || "--"}</span>
      </div>
    ),
  },
  {
    accessorKey: "emergencyServices",
    header: "Emergency",
    cell: ({ row }: any) => (
      <Badge
        variant={
          row.getValue("emergencyServices") === "Yes" ? "default" : "outline"
        }
      >
        {row.getValue("emergencyServices") || "--"}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => (
      <Badge
        variant={
          row.getValue("status") === "Active" ? "default" : "destructive"
        }
      >
        {row.getValue("status") || "--"}
      </Badge>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Link href={`/dashboard/hospitals/${row.original._id || row.original.id}`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        </Link>
        {/* ❌ Button commented: Edit functionality not implemented in backend */}
        {/* <Button variant="outline" size="sm">
          <Edit className="h-3 w-3 mr-1" />
          Edit
        </Button> */}
      </div>
    ),
  },
];

export default function HospitalsPage() {
  const { canCreate, isAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalBeds: 0,
    emergencyServices: 0,
    avgRating: 0,
  });

  useEffect(() => {
    fetchHospitals();
    fetchStats();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get("/hospitals");
      console;
      setHospitals(response.data || []);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/hospitals/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching hospital stats:", error);
    }
  };

  // Use API data and create filtered hospitals
  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hospital.location?.city || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (hospital.type || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate dynamic statistics using API stats
  const totalHospitals = stats.totalHospitals || hospitals.length;
  const totalBeds =
    stats.totalBeds ||
    hospitals.reduce((sum, hospital) => sum + (hospital.beds || 0), 0);
  const emergencyServices =
    stats.emergencyServices ||
    hospitals.filter(
      (hospital) =>
        hospital.emergencyServices === "Yes" ||
        hospital.emergencyServices === "24x7"
    ).length;
  const avgRating =
    stats.avgRating ||
    (hospitals.length > 0
      ? hospitals.reduce((sum, hospital) => sum + (hospital.rating || 0), 0) /
        hospitals.length
      : 0);

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
          <h1 className="text-3xl font-bold tracking-tight">All Hospitals</h1>
          <p className="text-muted-foreground">
            Manage partner hospitals and healthcare facilities
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin() && (
            <Link href="/dashboard/hospitals/upload-csv">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
            </Link>
          )}
          {canCreate("hospitals") && (
            <Link href="/dashboard/hospitals/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Hospital
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hospitals
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHospitals}</div>
            <p className="text-xs text-muted-foreground">Partner network</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBeds.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emergency Services
            </CardTitle>
            <div className="h-2 w-2 bg-red-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emergencyServices}</div>
            <p className="text-xs text-muted-foreground">24/7 emergency care</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Patient satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hospital Network</CardTitle>
          <CardDescription>
            Complete list of partner hospitals and healthcare facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hospitals..."
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
          <DataTable columns={columns} data={filteredHospitals} />
        </CardContent>
      </Card>
    </div>
  );
}
