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
import {
  Search,
  Filter,
  MapPin,
  Building,
  Stethoscope,
  Plus,
} from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface CityStats {
  _id: string;
  count: number;
}

interface City {
  name: string;
  totalDoctors: number;
  withUs: number;
  selfClinic: number;
}

export default function CitiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCityStats();
  }, []);

  const fetchCityStats = async () => {
    try {
      const [statsResponse, doctorsResponse] = await Promise.all([
        axios.get("/doctors/stats"),
        axios.get("/doctors"),
      ]);

      const cityStats: CityStats[] = statsResponse.data.cityStats || [];
      const allDoctors = doctorsResponse.data.doctors || [];

      const citiesData = cityStats.map((city) => {
        const cityDoctors = allDoctors.filter(
          (doc: any) =>
            doc.location &&
            doc.location.toLowerCase() === city._id.toLowerCase()
        );

        const withUs = cityDoctors.filter(
          (doc: any) => doc.type === "With Us"
        ).length;
        const selfClinic = cityDoctors.filter(
          (doc: any) => doc.type === "Self Clinic"
        ).length;

        return {
          name: city._id,
          totalDoctors: city.count,
          withUs,
          selfClinic,
        };
      });

      setCities(citiesData);
    } catch (error) {
      console.error("Error fetching city stats:", error);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
            <p className="text-muted-foreground">
              Browse doctors by city and location
            </p>
          </div>
          <Link href="/dashboard/doctors/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Cities</h1>
          <p className="text-muted-foreground">
            Browse doctors by city and location
          </p>
        </div>
        <Link href="/dashboard/doctors/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* City Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCities.map((city) => (
          <Card
            key={city.name}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  {city.name}
                </CardTitle>
                <Badge variant="secondary">{city.totalDoctors} docs</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Doctors:</span>
                <span className="font-medium">{city.totalDoctors}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">With Us:</span>
                <span className="font-medium">{city.withUs}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Self Clinic:</span>
                <span className="font-medium">{city.selfClinic}</span>
              </div>

              <div className="pt-2">
                <Link
                  href={`/dashboard/doctors?city=${encodeURIComponent(
                    city.name
                  )}`}
                >
                  <Button size="sm" className="w-full">
                    View Doctors
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCities.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No cities found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
