"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import axiosClient from "@/axios/axios";
import { Activity } from "@/types/activity";

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "scheduled":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
    case "done":
      return "bg-green-100 text-green-800";
    case "success":
      return "bg-green-100 text-green-800";
    case "booked":
      return "bg-purple-100 text-purple-800";
    case "in_progress":
      return "bg-orange-100 text-orange-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        
        const response = await axiosClient.get("/dashboard/recent-activities?limit=10", {
          headers: {
            authorization: token ? `Bearer ${token}` : "",
          },
        });
        
        setActivities(response.data || []);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching recent activities:", error);
        setError("Failed to load recent activities");
        // Fallback to empty array on error
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center py-4">
              {error}
            </div>
          )}
          {activities.length === 0 && !error && (
            <div className="text-gray-500 text-sm text-center py-8">
              No recent activities found
            </div>
          )}
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-500">
                  by {activity.user} • {activity.time}
                </p>
              </div>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
