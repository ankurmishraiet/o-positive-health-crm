"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Car } from "lucide-react";
import axios from "@/axios/axios";
import { PatientCombobox } from "@/components/ui/patient-combobox";

// Constants for requester types
const REQUESTER_TYPE = {
  EMPLOYEE: "Employee",
  DOCTOR: "Doctor",
  USER: "User",
} as const;

interface Employee {
  _id: string;
  name: string;
  phone: string;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

export default function CreateCabBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedRequestedBy, setSelectedRequestedBy] = useState("");
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    requestedBy: "",
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
    // Company and Vehicle
    driver: "",
    driverName: "",
    vehicleNumber: "",
    // Return Trip
    returnTrip: "No",
    notes: "",
  });

  useEffect(() => {
    if (formData.requestedByModel === REQUESTER_TYPE.EMPLOYEE) {
      fetchEmployees();
    } else if (formData.requestedByModel === REQUESTER_TYPE.DOCTOR) {
      fetchDoctors();
    }
  }, [formData.requestedByModel]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/doctors");
      setDoctors(response.data.doctors || response.data || []);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.requestedByModel) {
      toast({
        title: "Validation Error",
        description: "Please select a requester type",
        variant: "destructive",
      });
      return;
    }

    // Validate person name and phone (always required)
    if (!formData.patientName || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Person name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    // Validate requester selection for Employee/Doctor
    if (formData.requestedByModel !== REQUESTER_TYPE.USER && !formData.requestedBy) {
      toast({
        title: "Validation Error",
        description: `Please select a ${formData.requestedByModel.toLowerCase()}`,
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
      console.log("Creating cab booking with data:", formData);
      
      // Transform form data to match backend schema
      const transformedData = {
        patientName: formData.patientName.trim(),
        phone: formData.phone.trim(),
        requestedBy: formData.requestedBy || undefined,
        requestedByModel: formData.requestedByModel || REQUESTER_TYPE.USER,
        pickupLocation: {
          address: formData.pickupAddress.trim(),
          lat: formData.pickupLat ? parseFloat(formData.pickupLat) : undefined,
          lng: formData.pickupLng ? parseFloat(formData.pickupLng) : undefined,
        },
        destination: {
          address: formData.destinationAddress.trim(),
          lat: formData.destinationLat ? parseFloat(formData.destinationLat) : undefined,
          lng: formData.destinationLng ? parseFloat(formData.destinationLng) : undefined,
        },
        serviceType: formData.serviceType,
        department: formData.department || "",
        appointmentTime: formData.appointmentTime || "",
        admissionType: formData.admissionType || "",
        roomNumber: formData.roomNumber || "",
        urgency: formData.urgency,
        pickupTime: formData.pickupTime ? new Date(formData.pickupTime) : new Date(),
        isScheduled: formData.isScheduled,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        scheduledTime: formData.scheduledTime || "",
        // Driver Assignment
        driver: formData.driver || undefined,
        driverName: formData.driverName || "",
        vehicleNumber: formData.vehicleNumber || "",
        returnTrip: formData.returnTrip,
        notes: formData.notes || "",
      };

      console.log("Sending transformed data:", transformedData);
      
      const response = await axios.post("/cabs", transformedData);
      console.log("Cab booking response:", response.data);

      toast({
        title: "Success",
        description: "Cab booking created successfully",
      });
      router.push("/dashboard/cabs");
    } catch (error: any) {
      console.error("Error creating cab booking:", error);
      
      let errorMessage = "Failed to create cab booking";
      
      if (error.response) {
        // Server responded with error status
        console.error("Server response error:", error.response.data);
        errorMessage = error.response.data?.message || 
                     error.response.data?.error || 
                     `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network error:", error.request);
        errorMessage = "Network error: Unable to reach server. Please check your connection.";
      } else {
        // Something else happened
        console.error("Request setup error:", error.message);
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

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Car className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Create Cab Booking</h1>
          <p className="text-gray-600">
            Book a cab for patient transportation
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Person Information */}
        <Card>
          <CardHeader>
            <CardTitle>Person Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Requested By Type - First Field */}
            <div className="space-y-2">
              <Label htmlFor="requestedByModel">Requested By Type *</Label>
              <Select
                value={formData.requestedByModel}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    requestedByModel: value,
                    requestedBy: "", // Reset requested by when type changes
                    patientName: "", // Reset patient name when type changes
                    phone: "", // Reset phone when type changes
                  });
                  setSelectedRequestedBy("");
                  setSelectedPatientId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requester type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={REQUESTER_TYPE.EMPLOYEE}>Employee</SelectItem>
                  <SelectItem value={REQUESTER_TYPE.DOCTOR}>Doctor</SelectItem>
                  <SelectItem value={REQUESTER_TYPE.USER}>User/Patient</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Requested By - Searchable Dropdown based on type */}
            {formData.requestedByModel && formData.requestedByModel !== REQUESTER_TYPE.USER && (
              <div className="space-y-2">
                <Label>
                  {formData.requestedByModel === REQUESTER_TYPE.EMPLOYEE ? "Select Employee" : "Select Doctor"}
                </Label>
                <Select
                  value={selectedRequestedBy}
                  onValueChange={(value) => {
                    setSelectedRequestedBy(value);
                    setFormData({ ...formData, requestedBy: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Search ${formData.requestedByModel.toLowerCase()}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.requestedByModel === REQUESTER_TYPE.EMPLOYEE && employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name} {emp.phone && `- ${emp.phone}`}
                      </SelectItem>
                    ))}
                    {formData.requestedByModel === REQUESTER_TYPE.DOCTOR && doctors.map((doc) => (
                      <SelectItem key={doc._id} value={doc._id}>
                        {doc.name} {doc.specialization && `- ${doc.specialization}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Person Details - Always required */}
            {formData.requestedByModel === REQUESTER_TYPE.USER ? (
              <>
                <div className="space-y-2">
                  <Label>Search Patient *</Label>
                  <PatientCombobox
                    value={selectedPatientId}
                    onSelect={(patientId, patientName, patientPhone) => {
                      setSelectedPatientId(patientId);
                      setFormData({
                        ...formData,
                        patientName: patientName,
                        phone: patientPhone || "",
                      });
                    }}
                    placeholder="Search by patient name or phone..."
                  />
                  <p className="text-xs text-gray-500">
                    Start typing to search for existing patients
                  </p>
                </div>
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
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Person Name *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    placeholder="Enter person name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupAddress">Pickup Address *</Label>
                <Input
                  id="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupAddress: e.target.value })
                  }
                  placeholder="Complete pickup address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationAddress">Destination Address *</Label>
                <Input
                  id="destinationAddress"
                  value={formData.destinationAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, destinationAddress: e.target.value })
                  }
                  placeholder="Hospital/destination address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Pickup Coordinates (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    value={formData.pickupLat}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLat: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    value={formData.pickupLng}
                    onChange={(e) =>
                      setFormData({ ...formData, pickupLng: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Destination Coordinates (Optional)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    placeholder="Latitude"
                    type="number"
                    step="any"
                    value={formData.destinationLat}
                    onChange={(e) =>
                      setFormData({ ...formData, destinationLat: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Longitude"
                    type="number"
                    step="any"
                    value={formData.destinationLng}
                    onChange={(e) =>
                      setFormData({ ...formData, destinationLng: e.target.value })
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
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
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
                      setFormData({ ...formData, appointmentTime: e.target.value })
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
                      setFormData({ ...formData, admissionType: e.target.value })
                    }
                    placeholder="Emergency"
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
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Company and Vehicle Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.driverName}
                  onChange={(e) =>
                    setFormData({ ...formData, driverName: e.target.value })
                  }
                  placeholder="Enter cab company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Number (Optional)</Label>
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
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any special instructions or requirements"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
}
