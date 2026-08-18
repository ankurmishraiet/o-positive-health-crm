"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Stethoscope, Heart, Brain, Bone, Eye, Plus } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface DepartmentStats {
  _id: string;
  count: number;
}

interface Department {
  name: string;
  icon: any;
  totalDoctors: number;
  color: string;
}

const departmentIcons: { [key: string]: { icon: any; color: string } } = {
  "Cardiology": { icon: Heart, color: "text-red-500" },
  "Neurology": { icon: Brain, color: "text-purple-500" },
  "Orthopedics": { icon: Bone, color: "text-blue-500" },
  "Ophthalmology": { icon: Eye, color: "text-green-500" },
  "Pediatrics": { icon: Users, color: "text-yellow-500" },
  "General Medicine": { icon: Stethoscope, color: "text-indigo-500" },
  "Dermatology": { icon: Stethoscope, color: "text-pink-500" },
  "Gynecology": { icon: Stethoscope, color: "text-orange-500" },
};

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      const response = await axios.get("/doctors/stats");
      const departmentStats: DepartmentStats[] = response.data.departmentStats || [];
      
      const departmentsData = departmentStats.map((dept) => {
        const iconData = departmentIcons[dept._id] || { 
          icon: Stethoscope, 
          color: "text-gray-500" 
        };
        
        return {
          name: dept._id,
          icon: iconData.icon,
          totalDoctors: dept.count,
          color: iconData.color,
        };
      });

      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error fetching department stats:", error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Browse doctors by department and specialization</p>
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
                  <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Browse doctors by department and specialization</p>
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
                placeholder="Search departments..."
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

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <Card key={department.name} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <department.icon className={`h-5 w-5 mr-2 ${department.color}`} />
                  {department.name}
                </CardTitle>
                <Badge variant="secondary">{department.totalDoctors} docs</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Doctors:</span>
                <span className="font-medium">{department.totalDoctors}</span>
              </div>

              <div className="pt-2">
                <Link href={`/dashboard/doctors?department=${encodeURIComponent(department.name)}`}>
                  <Button size="sm" className="w-full">
                    View Doctors
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDepartments.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
