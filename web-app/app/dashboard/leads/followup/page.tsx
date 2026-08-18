"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Clock, User } from "lucide-react";
import axios from "@/axios/axios";
import { FollowUpLead } from "@/types/lead";

export default function FollowUpPage() {
  const [followUps, setFollowUps] = useState<FollowUpLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchFollowUps();
  }, [page]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/leads/followup/today?page=${page}&limit=${limit}`);
      
      // Handle different response formats
      let followUpData = [];
      let paginationData = null;
      
      if (Array.isArray(response.data)) {
        // Direct array response
        followUpData = response.data;
      } else if (response.data.leads) {
        // Object with leads array
        followUpData = response.data.leads;
        paginationData = response.data.pagination;
      } else {
        followUpData = [];
      }
      
      // Transform data to match interface (backend already filters by status)
      const transformedFollowUps: FollowUpLead[] = followUpData
        .map((lead: any) => ({
          _id: lead._id,
          patientName: lead.patientName,
          contact: lead.contact || { mobile: "", email: "", whatsappNumber: "" },
          treatment: lead.treatment,
          leadStatus: lead.leadStatus,
          engagement: lead.engagement || {},
          assignedTo: lead.assignedTo,
        }));

      if (page === 1) {
        setFollowUps(transformedFollowUps);
      } else {
        setFollowUps((prev) => [...prev, ...transformedFollowUps]);
      }
      
      // Update pagination info
      if (paginationData) {
        setHasMore(paginationData.hasMore || false);
        setTotal(paginationData.total || transformedFollowUps.length);
      } else {
        setHasMore(false);
        setTotal(transformedFollowUps.length);
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      if (page === 1) {
        setFollowUps([]);
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const getPriorityColor = (priority: string = "Medium") => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFollowUpDate = (engagement: FollowUpLead["engagement"]) => {
    if (engagement.followUpAt) {
      return new Date(engagement.followUpAt).toLocaleString();
    }
    return "Today";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Phone className="mr-3 h-8 w-8 text-blue-600" />
            Follow-up Calls
          </h1>
          <p className="text-gray-600">
            Today&apos;s pending follow-up calls and appointments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{total} pending calls</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {followUps.map((lead) => (
          <Card key={lead._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{lead.patientName}</CardTitle>
                <Badge className={getPriorityColor("Medium")}>
                  Medium
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{lead.contact.mobile || "No phone"}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span>{lead.treatment || "No treatment"}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{formatFollowUpDate(lead.engagement)}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Assigned to: {lead.assignedTo?.name || "Unassigned"}</span>
              </div>

              <Badge variant="outline">{lead.leadStatus}</Badge>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Phone className="mr-1 h-3 w-3" />
                  Call Now
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 bg-transparent"
                >
                  Reschedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}

      {loading && page > 1 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {!loading && followUps.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Follow-ups Today
            </h3>
            <p className="text-gray-500">
              All follow-up calls are completed for today!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
