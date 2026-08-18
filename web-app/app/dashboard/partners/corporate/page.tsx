"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FileText, TrendingUp } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface CorporateStats {
  totalCorporate: number;
  activeContracts: number;
  pendingContracts: number;
  expiringSoon: number;
  revenue: string;
  growth: string;
}

export default function CorporatePartnersPage() {
  const [stats, setStats] = useState<CorporateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCorporateStats();
  }, []);

  const fetchCorporateStats = async () => {
    try {
      const response = await axios.get("/partners/stats/corporate");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching corporate partner stats:", error);
      // Fallback to default values
      setStats({
        totalCorporate: 0,
        activeContracts: 0,
        pendingContracts: 0,
        expiringSoon: 0,
        revenue: "₹0L",
        growth: "0%",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-blue-600" />
              Corporate Partners
            </h1>
            <p className="text-gray-600">Manage corporate partnerships and enterprise clients</p>
          </div>
          <Link href="/dashboard/partners/create">
            <Button>Add Corporate Partner</Button>
          </Link>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gray-200 animate-pulse">
                    <div className="h-6 w-6"></div>
                  </div>
                  <div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-blue-600" />
            Corporate Partners
          </h1>
          <p className="text-gray-600">Manage corporate partnerships and enterprise clients</p>
        </div>
        <Link href="/dashboard/partners/create">
          <Button>Add Corporate Partner</Button>
        </Link>
      </div>

      {/* Corporate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Corporate</p>
                <p className="text-2xl font-bold">{stats?.totalCorporate || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Contracts</p>
                <p className="text-2xl font-bold">{stats?.activeContracts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">{stats?.revenue || "₹0L"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-orange-50">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Growth</p>
                <p className="text-2xl font-bold">{stats?.growth || "0%"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Corporate Partners Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Corporate Partnership Hub</h3>
            <p className="text-gray-600 mb-6">
              Manage enterprise partnerships, contracts, and corporate client relationships.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Building2 className="h-6 w-6 mb-2" />
                Enterprise Clients
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <FileText className="h-6 w-6 mb-2" />
                Contract Management
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <TrendingUp className="h-6 w-6 mb-2" />
                Performance Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
