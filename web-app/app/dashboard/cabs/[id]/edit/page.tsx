"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Car, ChevronLeft, Save } from "lucide-react";
import axios from "@/axios/axios";

interface Driver {
  _id: string;
  name: string;
  employeeCode: string;
  phone: string;
}

interface FormData {
  patientName: string;
  phone: string;
  requestedByModel: string;
  // Pickup Location
  pickupAddress: string;
  pickupLat: string;
  pickupLng: string;
  // Destination
  destinationAddress: string;
  destinationLat: string;
  destinationLng: string;
  // Service Details
  serviceType: string;
  department: string;
  appointmentTime: string;
  admissionType: string;
  roomNumber: string;
  urgency: string;
  // Scheduling
  pickupTime: string;
  isScheduled: boolean;
  scheduledDate: string;
  scheduledTime: string;
  // Driver Assignment
  driver: string;
  driverName: string;
  vehicleNumber: string;
  status: string;
  // Return Trip
  returnTrip: string;
  notes: string;
}

export default function EditCabBookingPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    phone: "",
    requestedByModel: "",
    // Pickup Location
    pickupAddress: "",
    pickupLat: "",
    pickupLng: "",
    // Destination
    destinationAddress: "",
    destinationLat: "",
    destinationLng: "",
    // Service Details
    serviceType: "",
    department: "",
    appointmentTime: "",
    admissionType: "",
    roomNumber: "",
    urgency: "Normal",
    // Scheduling
    pickupTime: "",
    isScheduled: false,
    scheduledDate: "",
    scheduledTime: "",
    // Driver Assignment
    driver: "",
    driverName: "",
    vehicleNumber: "",
    status: "Pending",
    // Return Trip
    returnTrip: "No",
    notes: "",
  });

  const cabId = params.id as string;

  useEffect(() => {
    if (cabId) {
      fetchDrivers();
      fetchCabDetails();
    }
  }, [cabId]);

  const fetchDrivers = async () => {
    try {
      const response = await axios.get("/employees", {
        params: { designation: "Driver" },
      });
      const driversData = response.data.employees || response.data || [];
      setDrivers(driversData);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive",
      });
    }
  };

  const fetchCabDetails = async () => {
    try {
      const response = await axios.get(`/cabs/${cabId}`);
      const cab = response.data;

      // Transform backend data to form format
      setFormData({
        patientName: cab.patientName || "",
        phone: cab.phone || "",
        requestedByModel: cab.requestedByModel || "",
        pickupAddress: cab.pickupLocation?.address || "",
        pickupLat: cab.pickupLocation?.lat?.toString() || "",
        pickupLng: cab.pickupLocation?.lng?.toString() || "",
        destinationAddress: cab.destination?.address || "",
        destinationLat: cab.destination?.lat?.toString() || "",
        destinationLng: cab.destination?.lng?.toString() || "",
        serviceType: cab.serviceType || "",
        department: cab.department || "",
        appointmentTime: cab.appointmentTime || "",
        admissionType: cab.admissionType || "",
        roomNumber: cab.roomNumber || "",
        urgency: cab.urgency || "Normal",
        pickupTime: cab.pickupTime
          ? new Date(cab.pickupTime).toISOString().slice(0, 16)
          : "",
        isScheduled: cab.isScheduled || false,
        scheduledDate: cab.scheduledDate
          ? new Date(cab.scheduledDate).toISOString().slice(0, 10)
          : "",
        scheduledTime: cab.scheduledTime || "",
        // Driver Assignment
        driver: cab.driver?._id || cab.driver || "",
        driverName: cab.driverName || "",
        vehicleNumber: cab.vehicleNumber || "",
        status: cab.status || "Pending",
        returnTrip: cab.returnTrip || "No",
        notes: cab.notes || "",
      });
    } catch (error) {
      console.error("Error fetching cab details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cab details",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleDriverSelect = (driverId: string) => {
    const selectedDriver = drivers.find((d) => d._id === driverId);
    setFormData({
      ...formData,
      driver: driverId,
      driverName: selectedDriver?.name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.patientName || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Patient name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.pickupAddress) {
      toast({
        title: "Validation Error",
        description: "Pickup address is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.serviceType) {
      toast({
        title: "Validation Error",
        description: "Please select a service type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Updating cab booking with data:", formData);

      // Transform form data to match backend schema
      const transformedData = {
        patientName: formData.patientName.trim(),
        phone: formData.phone.trim(),
        requestedByModel: formData.requestedByModel || "User",
        pickupLocation: {
          address: formData.pickupAddress.trim(),
          lat: formData.pickupLat ? parseFloat(formData.pickupLat) : undefined,
          lng: formData.pickupLng ? parseFloat(formData.pickupLng) : undefined,
        },
        destination: {
          address: formData.destinationAddress.trim(),
          lat: formData.destinationLat
            ? parseFloat(formData.destinationLat)
            : undefined,
          lng: formData.destinationLng
            ? parseFloat(formData.destinationLng)
            : undefined,
        },
        serviceType: formData.serviceType,
        department: formData.department.trim() || undefined,
        appointmentTime: formData.appointmentTime.trim() || undefined,
        admissionType: formData.admissionType.trim() || undefined,
        roomNumber: formData.roomNumber.trim() || undefined,
        urgency: formData.urgency,
        pickupTime: formData.pickupTime
          ? new Date(formData.pickupTime).toISOString()
          : undefined,
        isScheduled: formData.isScheduled,
        scheduledDate: formData.scheduledDate
          ? new Date(formData.scheduledDate).toISOString()
          : undefined,
        scheduledTime: formData.scheduledTime.trim() || undefined,
        // Driver Assignment
        driver: formData.driver || undefined,
        driverName: formData.driverName.trim() || undefined,
        vehicleNumber: formData.vehicleNumber.trim() || undefined,
        status: formData.status,
        returnTrip: formData.returnTrip,
        notes: formData.notes.trim() || undefined,
      };

      // Remove undefined values
      Object.keys(transformedData).forEach((key) => {
        if (
          transformedData[key as keyof typeof transformedData] === undefined
        ) {
          delete transformedData[key as keyof typeof transformedData];
        }
      });

      const response = await axios.put(`/cabs/${cabId}`, transformedData);
      console.log("Update response:", response.data);

      toast({
        title: "Success",
        description: "Cab booking updated successfully",
      });

      router.push(`/dashboard/cabs/${cabId}`);
    } catch (error: any) {
      console.error("Error updating cab booking:", error);

      let errorMessage = "Failed to update cab booking";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Request error: ${error.message}`;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/cabs/${cabId}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Car className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Edit Cab Booking</h1>
            <p className="text-gray-600">Update booking information</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedByModel">Requested By</Label>
              <Select
                value={formData.requestedByModel}
                onValueChange={(value) =>
                  setFormData({ ...formData, requestedByModel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requester type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <Textarea
                  id="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupAddress: e.target.value })
                  }
                  placeholder="Enter pickup location"
                  rows={3}
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Latitude (optional)"
                    value={formData.pickupLat}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLat: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Longitude (optional)"
                    value={formData.pickupLng}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLng: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Textarea
                  id="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationAddress: e.target.value,
                    })
                  }
                  placeholder="Enter destination location"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Latitude (optional)"
                    value={formData.destinationLat}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinationLat: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Longitude (optional)"
                    value={formData.destinationLng}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destinationLng: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD (Outpatient)</SelectItem>
                    <SelectItem value="IPD">IPD (Inpatient)</SelectItem>
                    <SelectItem value="Employee">Employee Transport</SelectItem>
                    <SelectItem value="Doctor">Doctor Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, urgency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* OPD specific fields */}
            {formData.serviceType === "OPD" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    placeholder="Cardiology"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">Appointment Time</Label>
                  <Input
                    id="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentTime: e.target.value,
                      })
                    }
                    placeholder="10:30 AM"
                  />
                </div>
              </div>
            )}

            {/* IPD specific fields */}
            {formData.serviceType === "IPD" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionType">Admission Type</Label>
                  <Input
                    id="admissionType"
                    value={formData.admissionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admissionType: e.target.value,
                      })
                    }
                    placeholder="Emergency, Planned, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                    placeholder="101"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle>Scheduling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Pickup Time *</Label>
                <Input
                  id="pickupTime"
                  type="datetime-local"
                  value={formData.pickupTime}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnTrip">Return Trip Required</Label>
                <Select
                  value={formData.returnTrip}
                  onValueChange={(value) =>
                    setFormData({ ...formData, returnTrip: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Scheduled Time</Label>
                  <Input
                    id="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledTime: e.target.value,
                      })
                    }
                    placeholder="10:30 AM"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Assignment & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Assignment & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driver">Assign Driver</Label>
                <Select
                  value={formData.driver}
                  onValueChange={handleDriverSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="">No Driver Assigned</SelectItem> */}
                    {drivers.map((driver) => (
                      <SelectItem key={driver._id} value={driver._id}>
                        {driver.name} - {driver.employeeCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleNumber: e.target.value })
                  }
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Booking Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Special Instructions/Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any special instructions or notes for the driver..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/cabs/${cabId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Updating..." : "Update Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
