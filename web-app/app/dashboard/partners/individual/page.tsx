"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, Phone, TrendingUp } from "lucide-react";
import axios from "@/axios/axios";
import Link from "next/link";

interface IndividualStats {
  totalIndividual: number;
  activeAgents: number;
  pendingAgents: number;
  topPerformers: number;
  referrals: string;
  commission: string;
}

export default function IndividualPartnersPage() {
  const [stats, setStats] = useState<IndividualStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndividualStats();
  }, []);

  const fetchIndividualStats = async () => {
    try {
      const response = await axios.get("/partners/stats/individual");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching individual partner stats:", error);
      // Fallback to default values
      setStats({
        totalIndividual: 0,
        activeAgents: 0,
        pendingAgents: 0,
        topPerformers: 0,
        referrals: "0",
        commission: "₹0L",
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
              <Users className="mr-3 h-8 w-8 text-purple-600" />
              Individual Partners
            </h1>
            <p className="text-gray-600">Manage individual agents and referral partners</p>
          </div>
          <Link href="/dashboard/partners/create">
            <Button>Add Individual Partner</Button>
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
            <Users className="mr-3 h-8 w-8 text-purple-600" />
            Individual Partners
          </h1>
          <p className="text-gray-600">Manage individual agents and referral partners</p>
        </div>
        <Link href="/dashboard/partners/create">
          <Button>Add Individual Partner</Button>
        </Link>
      </div>

      {/* Individual Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Individual</p>
                <p className="text-2xl font-bold">{stats?.totalIndividual || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold">{stats?.activeAgents || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Referrals</p>
                <p className="text-2xl font-bold">{stats?.referrals || "0"}</p>
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
                <p className="text-sm text-gray-600">Commission</p>
                <p className="text-2xl font-bold">{stats?.commission || "₹0L"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Partners Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Individual Agent Network</h3>
            <p className="text-gray-600 mb-6">
              Manage individual agents, referral partners, and commission structures.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <User className="h-6 w-6 mb-2" />
                Agent Management
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Phone className="h-6 w-6 mb-2" />
                Referral Tracking
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <TrendingUp className="h-6 w-6 mb-2" />
                Commission Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
