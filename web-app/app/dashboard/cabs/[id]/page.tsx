"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  Car,
  ChevronLeft,
  User,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";

interface CabBooking {
  _id: string;
  bookingId: string;
  patientName: string;
  phone: string;
  requestedByModel: string;
  pickupLocation: {
    address: string;
    lat?: number;
    lng?: number;
  };
  destination: {
    address: string;
    lat?: number;
    lng?: number;
  };
  serviceType: string;
  department?: string;
  appointmentTime?: string;
  admissionType?: string;
  roomNumber?: string;
  urgency: string;
  pickupTime: string;
  isScheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  driver?: any;
  driverName?: string;
  vehicleNumber?: string;
  status: string;
  fare?: string;
  estimatedFare?: string;
  distance?: string;
  returnTrip: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CabDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [cab, setCab] = useState<CabBooking | null>(null);
  const [loading, setLoading] = useState(true);

  const cabId = params.id as string;

  useEffect(() => {
    if (cabId) {
      fetchCabDetails();
    }
  }, [cabId]);

  const fetchCabDetails = async () => {
    try {
      const response = await axios.get(`/cabs/${cabId}`);
      setCab(response.data);
    } catch (error) {
      console.error("Error fetching cab details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cab details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this cab booking?")) {
      return;
    }

    try {
      await axios.delete(`/cabs/${cabId}`);
      toast({
        title: "Success",
        description: "Cab booking deleted successfully",
      });
      router.push("/dashboard/cabs");
    } catch (error) {
      console.error("Error deleting cab:", error);
      toast({
        title: "Error",
        description: "Failed to delete cab booking",
        variant: "destructive",
      });
    }
  };

  const copyBookingId = () => {
    if (cab?.bookingId) {
      navigator.clipboard.writeText(cab.bookingId);
      toast({
        title: "Copied",
        description: "Booking ID copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!cab) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Cab Not Found</h2>
          <p className="text-gray-500 mt-2">The requested cab booking could not be found.</p>
          <Button onClick={() => router.push("/dashboard/cabs")} className="mt-4">
            Back to Cabs
          </Button>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Confirmed":
        return "outline";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getUrgencyVariant = (urgency: string) => {
    switch (urgency) {
      case "Emergency":
        return "destructive";
      case "High":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/cabs")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Car className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">Cab Booking Details</h1>
              <p className="text-gray-600">
                Booking ID: {cab.bookingId}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copyBookingId}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Booking ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/cabs/${cabId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Booking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Patient:</span>
              <span>{cab.patientName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Phone:</span>
              <span>{cab.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Service Type:</span>
              <Badge>{cab.serviceType}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Urgency:</span>
              <Badge variant={getUrgencyVariant(cab.urgency)}>{cab.urgency}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusVariant(cab.status)}>{cab.status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-green-500" />
                <span className="font-medium">Pickup Location:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {cab.pickupLocation?.address || "Not specified"}
              </p>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="h-4 w-4 text-red-500" />
                <span className="font-medium">Destination:</span>
              </div>
              <p className="text-sm text-gray-600 ml-6">
                {cab.destination?.address || "Not specified"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Specific Details */}
        {(cab.serviceType === "OPD" || cab.serviceType === "IPD") && (
          <Card>
            <CardHeader>
              <CardTitle>{cab.serviceType} Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cab.serviceType === "OPD" && (
                <>
                  {cab.department && (
                    <div>
                      <span className="font-medium">Department:</span>
                      <span className="ml-2">{cab.department}</span>
                    </div>
                  )}
                  {cab.appointmentTime && (
                    <div>
                      <span className="font-medium">Appointment Time:</span>
                      <span className="ml-2">{cab.appointmentTime}</span>
                    </div>
                  )}
                </>
              )}
              {cab.serviceType === "IPD" && (
                <>
                  {cab.admissionType && (
                    <div>
                      <span className="font-medium">Admission Type:</span>
                      <span className="ml-2">{cab.admissionType}</span>
                    </div>
                  )}
                  {cab.roomNumber && (
                    <div>
                      <span className="font-medium">Room Number:</span>
                      <span className="ml-2">{cab.roomNumber}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scheduling Information */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Pickup Time:</span>
              <span>{new Date(cab.pickupTime).toLocaleString()}</span>
            </div>
            {cab.isScheduled && (
              <>
                {cab.scheduledDate && (
                  <div>
                    <span className="font-medium">Scheduled Date:</span>
                    <span className="ml-2">
                      {new Date(cab.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {cab.scheduledTime && (
                  <div>
                    <span className="font-medium">Scheduled Time:</span>
                    <span className="ml-2">{cab.scheduledTime}</span>
                  </div>
                )}
              </>
            )}
            <div>
              <span className="font-medium">Return Trip:</span>
              <Badge variant="outline" className="ml-2">
                {cab.returnTrip}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Driver & Vehicle Information */}
        {(cab.driverName || cab.vehicleNumber) && (
          <Card>
            <CardHeader>
              <CardTitle>Driver & Vehicle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cab.driverName && (
                <div>
                  <span className="font-medium">Driver:</span>
                  <span className="ml-2">{cab.driverName}</span>
                </div>
              )}
              {cab.vehicleNumber && (
                <div>
                  <span className="font-medium">Vehicle Number:</span>
                  <span className="ml-2 font-mono">{cab.vehicleNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pricing Information */}
        {(cab.estimatedFare || cab.fare || cab.distance) && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Distance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cab.estimatedFare && (
                <div>
                  <span className="font-medium">Estimated Fare:</span>
                  <span className="ml-2">₹{cab.estimatedFare}</span>
                </div>
              )}
              {cab.fare && (
                <div>
                  <span className="font-medium">Actual Fare:</span>
                  <span className="ml-2">₹{cab.fare}</span>
                </div>
              )}
              {cab.distance && (
                <div>
                  <span className="font-medium">Distance:</span>
                  <span className="ml-2">{cab.distance} km</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {cab.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{cab.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Booking Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Booking Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{new Date(cab.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2">{new Date(cab.updatedAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}