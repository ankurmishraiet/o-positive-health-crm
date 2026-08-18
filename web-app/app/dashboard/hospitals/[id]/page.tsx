"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Bed,
  Calendar,
  AlertTriangle,
  Star,
  CheckCircle,
  User,
  Ambulance,
  Microscope,
  Pill,
  Globe,
  Navigation,
} from "lucide-react";
import axios from "@/axios/axios";
import { Hospital } from "@/types/hospital";
import { usePermissions } from "@/hooks/use-permissions";

export default function HospitalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchHospitalDetails();
    }
  }, [params.id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/hospitals/${params.id}`);
      setHospital(response.data);
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      setError(
        "Failed to load hospital details from API. Please check connection."
      );
      setHospital(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/hospitals/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this hospital? This action cannot be undone."
      )
    ) {
      try {
        await axios.delete(`/hospitals/${params.id}`);
        router.push("/dashboard/hospitals");
      } catch (error) {
        console.error("Error deleting hospital:", error);
        alert("Failed to delete hospital. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Hospital Details</h1>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-4" />
            <div className="text-red-800">
              <p className="font-medium">Hospital Not Found</p>
              <p className="text-sm">
                {error || "The requested hospital could not be found."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHospitalDetails}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {hospital.name || "--"}
            </h1>
            <p className="text-muted-foreground">
              Hospital Details & Management
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canUpdate("hospitals") && (
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete("hospitals") && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Basic Information
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Hospital Name</p>
                <p className="text-lg">{hospital.name || "--"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Type</p>
                <Badge variant="outline">{hospital.type || "--"}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge
                  variant={hospital.isActive ? "default" : "secondary"}
                  className={
                    hospital.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {hospital.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span>
                    {hospital.updatedAt
                      ? new Date(hospital.updatedAt).toLocaleDateString()
                      : "--"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Information
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Phone</p>
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3 text-gray-500" />
                  <span>{hospital.phone || "--"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3 text-gray-500" />
                  <span>{hospital.email || "--"}</span>
                </div>
              </div>
              {hospital.website && (
                <div>
                  <p className="text-sm font-medium">Website</p>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-3 w-3 text-gray-500" />
                    <a
                      href={hospital.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {hospital.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Address</p>
                <div className="flex items-start space-x-1">
                  <MapPin className="h-3 w-3 text-gray-500 mt-1" />
                  <span className="text-sm">{hospital.address || "--"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">City</p>
                  <p className="text-sm">{hospital.location?.city || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">State</p>
                  <p className="text-sm">{hospital.location?.state || "--"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">PIN Code</p>
                  <p className="text-sm">{hospital.location?.pin || "--"}</p>
                </div>
              </div>
              {hospital.location?.lat && hospital.location?.lng && (
                <div>
                  <p className="text-sm font-medium">Coordinates</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <Navigation className="h-3 w-3 text-gray-500" />
                    <span>
                      {hospital.location.lat.toFixed(6)},{" "}
                      {hospital.location.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Total Beds</p>
                <p className="text-2xl font-bold">{hospital.beds || "--"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Rating</p>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{hospital.rating || "--"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Ambulance className="h-4 w-4 text-gray-500" />
                <span>Ambulance: </span>
                <Badge
                  variant={hospital.ambulanceService ? "default" : "secondary"}
                >
                  {hospital.ambulanceService ? "Available" : "Not Available"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Microscope className="h-4 w-4 text-gray-500" />
                <span>Laboratory: </span>
                <Badge
                  variant={hospital.laboratoryService ? "default" : "secondary"}
                >
                  {hospital.laboratoryService ? "Available" : "Not Available"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Pill className="h-4 w-4 text-gray-500" />
                <span>Pharmacy: </span>
                <Badge
                  variant={hospital.pharmacyService ? "default" : "secondary"}
                >
                  {hospital.pharmacyService ? "Available" : "Not Available"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Emergency Services</p>
                <Badge variant="outline">
                  {hospital.emergencyServices || "--"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Specializations
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hospital.specializations &&
              hospital.specializations.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {hospital.specializations.map(
                    (specialization: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialization}
                      </Badge>
                    )
                  )}
                </div>
              ) : (
                <span>No specializations listed</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {hospital.facilities && hospital.facilities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map((facility: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {facility}
                  </Badge>
                ))}
              </div>
            ) : (
              <p>No facilities listed</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Person
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg">
                  {hospital.contactPerson?.name || "--"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Designation</p>
                <p className="text-sm">
                  {hospital.contactPerson?.designation || "--"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm">
                  {hospital.contactPerson?.phone || "--"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm">
                  {hospital.contactPerson?.email || "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {hospital.description && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {hospital.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
