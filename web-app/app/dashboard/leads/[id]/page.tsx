"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Calendar,
  User,
  FileText,
  Activity,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "@/axios/axios";
import { usePermissions } from "@/hooks/use-permissions";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  const fetchLead = async () => {
    try {
      const response = await axios.get(`/leads/${params.id}`);
      setLead(response.data);
    } catch (error) {
      console.error("Error fetching lead:", error);
      toast.error("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/leads/${params.id}`);
      toast.success("Lead deleted successfully");
      router.push("/dashboard/leads");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/leads/${params.id}/edit`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lead Not Found</h1>
          <p className="text-gray-600 mt-2">
            The lead you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/dashboard/leads")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/leads")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.patientName || "Unnamed Patient"}
            </h1>
            <p className="text-gray-600">ID: {lead.patientId}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canUpdate("leads") && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </DropdownMenuItem>
            )}
            {canDelete("leads") && (
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="text-lg">{lead.patientName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Age
                  </label>
                  <p className="text-lg">{lead.age || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gender
                  </label>
                  <p className="text-lg">{lead.gender || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </label>
                  <p className="text-lg">
                    {lead.dob ? new Date(lead.dob).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Treatment
                  </label>
                  <p className="text-lg">{lead.treatment || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Working Profession
                  </label>
                  <p className="text-lg">{lead.workingProfession || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Mobile
                  </label>
                  <p className="text-lg flex items-center">
                    {lead.contact?.mobile || lead.mobile || "N/A"}
                    {(lead.contact?.mobile || lead.mobile) && (
                      <Button size="sm" variant="ghost" className="ml-2">
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-lg flex items-center">
                    {lead.contact?.email || lead.email || "N/A"}
                    {(lead.contact?.email || lead.email) && (
                      <Button size="sm" variant="ghost" className="ml-2">
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    WhatsApp
                  </label>
                  <p className="text-lg flex items-center">
                    {lead.contact?.whatsappNumber || "N/A"}
                    {lead.contact?.whatsappNumber && (
                      <Button size="sm" variant="ghost" className="ml-2">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    City
                  </label>
                  <p className="text-lg">{lead.city || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Pincode
                  </label>
                  <p className="text-lg">{lead.pincode || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-lg">{lead.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {lead.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{lead.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Status Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lead Status
                </label>
                <div className="mt-1">
                  <Badge variant="secondary">{lead.leadStatus || "N/A"}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  OPD Status
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.opdStatus || "N/A"}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  IPD Status
                </label>
                <div className="mt-1">
                  <Badge variant="outline">{lead.ipdStatus || "N/A"}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Mode
                </label>
                <p className="text-lg">{lead.modeOfPayment || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lead Source
                </label>
                <p className="text-lg">{lead.leadSource || "N/A"}</p>
              </div>
              {lead.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Assigned To
                  </label>
                  <p className="text-lg flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {lead.assignedTo?.name || "N/A"}
                  </p>
                </div>
              )}
              {lead.assignedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Assigned By
                  </label>
                  <p className="text-lg flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {lead.assignedBy?.name || "N/A"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created
                </label>
                <p className="text-sm">
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="text-sm">
                  {lead.updatedAt
                    ? new Date(lead.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              {lead.engagement?.firstEngagement && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    First Engagement
                  </label>
                  <p className="text-sm">
                    {new Date(lead.engagement.firstEngagement).toLocaleString()}
                  </p>
                </div>
              )}
              {lead.engagement?.lastEngagement && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Engagement
                  </label>
                  <p className="text-sm">
                    {new Date(lead.engagement.lastEngagement).toLocaleString()}
                  </p>
                </div>
              )}
              {lead.engagement?.followUpAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Next Follow Up
                  </label>
                  <p className="text-sm">
                    {new Date(lead.engagement.followUpAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
