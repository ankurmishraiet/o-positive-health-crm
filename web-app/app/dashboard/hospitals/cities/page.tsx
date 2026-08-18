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
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Plus,
  Filter,
  MapPin,
  Building2,
  Users,
  Stethoscope,
} from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface CityData {
  city: string;
  hospitalCount: number;
  totalBeds: number;
  specialtyHospitals: number;
  emergencyServices: number;
  topHospitals: string[];
  status: string;
  partneredSince: string;
}

export default function CityWiseHospitalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cityData, setCityData] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityData();
  }, []);

  const fetchCityData = async () => {
    try {
      const response = await axios.get("/hospitals/cities");
      setCityData(response.data || []);
    } catch (error) {
      console.error("Error fetching city data:", error);
      setCityData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cityData.filter((city) =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              City wise Hospitals
            </h1>
            <p className="text-muted-foreground">
              Hospital network distribution across different cities
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add New Hospital
          </Button>
        </div>

        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            City wise Hospitals
          </h1>
          <p className="text-muted-foreground">
            Hospital network distribution across different cities
          </p>
        </div>

        <Link href="/dashboard/hospitals/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Hospital
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityData.length}</div>
            <p className="text-xs text-muted-foreground">Operational cities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hospitals
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cityData.reduce((sum, city) => sum + city.hospitalCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all cities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cityData
                .reduce((sum, city) => sum + city.totalBeds, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Specialty Centers
            </CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cityData.reduce((sum, city) => sum + city.specialtyHospitals, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Specialized care</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Cities Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCities.map((city) => (
          <Card key={city.city} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{city.city}</CardTitle>
                <Badge
                  variant={city.status === "Active" ? "default" : "secondary"}
                >
                  {city.status}
                </Badge>
              </div>
              <CardDescription>
                Partner since{" "}
                {new Date(city.partneredSince).getFullYear() || "2020"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hospitals</p>
                  <p className="text-2xl font-bold">{city.hospitalCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Beds</p>
                  <p className="text-2xl font-bold">
                    {city.totalBeds.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Specialty</p>
                  <p className="text-2xl font-bold">
                    {city.specialtyHospitals}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emergency</p>
                  <p className="text-2xl font-bold">{city.emergencyServices}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Top Hospitals:</p>
                <div className="flex flex-wrap gap-1">
                  {city.topHospitals.map((hospital) => (
                    <Badge key={hospital} variant="outline" className="text-xs">
                      {hospital}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
