"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import axios from "@/axios/axios";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

interface Hospital {
  _id: string;
  name: string;
  city: string;
}

interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctor: string;
  hospital: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: string;
  type: string;
  status: string;
  priority: string;
  symptoms: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  consultationFee: string;
  isPaid: boolean;
  paymentMethod: string;
  followUpRequired: boolean;
  followUpDate: string;
  notes: string;
}

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    doctor: "",
    hospital: "",
    department: "",
    appointmentDate: "",
    appointmentTime: "",
    duration: "30",
    type: "OPD",
    status: "Scheduled",
    priority: "Normal",
    symptoms: "",
    medicalHistory: "",
    allergies: "",
    currentMedications: "",
    consultationFee: "",
    isPaid: false,
    paymentMethod: "",
    followUpRequired: false,
    followUpDate: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchDoctors(),
          fetchHospitals(),
          fetchAppointment(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [params.id]);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("/doctors");
      const doctorsData = response.data.doctors || response.data || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    }
  };

  const fetchHospitals = async () => {
    try {
      const response = await axios.get("/hospitals");
      const hospitalsData = response.data.hospitals || response.data || [];
      setHospitals(hospitalsData);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "Error",
        description: "Failed to load hospitals",
        variant: "destructive",
      });
    }
  };

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/appointments/${params.id}`);
      const appointment = response.data;

      // Handle cases where doctor/hospital might be objects with _id properties
      const doctorId =
        typeof appointment.doctor === "object"
          ? appointment.doctor._id
          : appointment.doctor;

      const hospitalId =
        typeof appointment.hospital === "object"
          ? appointment.hospital._id
          : appointment.hospital;

      setFormData({
        patientName: appointment.patientName || "",
        patientPhone: appointment.patientPhone || "",
        patientEmail: appointment.patientEmail || "",
        doctor: doctorId || "",
        hospital: hospitalId || "",
        department: appointment.department || "",
        appointmentDate: appointment.appointmentDate
          ? new Date(appointment.appointmentDate).toISOString().split("T")[0]
          : "",
        appointmentTime: appointment.appointmentTime || "",
        duration: appointment.duration?.toString() || "30",
        type: appointment.type || "OPD",
        status: appointment.status || "Scheduled",
        priority: appointment.priority || "Normal",
        symptoms: appointment.symptoms || "",
        medicalHistory: appointment.medicalHistory || "",
        allergies: appointment.allergies || "",
        currentMedications: appointment.currentMedications || "",
        consultationFee: appointment.consultationFee?.toString() || "",
        isPaid: appointment.isPaid || false,
        paymentMethod: appointment.paymentMethod || "",
        followUpRequired: appointment.followUpRequired || false,
        followUpDate: appointment.followUpDate
          ? new Date(appointment.followUpDate).toISOString().split("T")[0]
          : "",
        notes: appointment.notes || "",
      });
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      });
      router.push("/dashboard/appointments");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.patientPhone ||
      !formData.doctor ||
      !formData.hospital ||
      !formData.appointmentDate ||
      !formData.appointmentTime
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const selectedDoctor = doctors.find((d) => d._id === formData.doctor);
      const selectedHospital = hospitals.find(
        (h) => h._id === formData.hospital
      );

      const transformedData = {
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        doctor: formData.doctor,
        doctorName: selectedDoctor?.name || "",
        hospital: formData.hospital,
        hospitalName: selectedHospital?.name || "",
        department: formData.department || selectedDoctor?.specialization || "",
        appointmentDate: new Date(formData.appointmentDate),
        appointmentTime: formData.appointmentTime,
        duration: parseInt(formData.duration) || 30,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        symptoms: formData.symptoms,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        currentMedications: formData.currentMedications,
        consultationFee: formData.consultationFee
          ? parseFloat(formData.consultationFee)
          : 0,
        isPaid: formData.isPaid,
        paymentMethod: formData.paymentMethod,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate)
          : null,
        notes: formData.notes,
      };

      await axios.put(`/appointments/${params.id}`, transformedData);

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      router.push(`/dashboard/appointments/${params.id}`);
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update appointment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Get the selected doctor and hospital objects for display
  const selectedDoctor = doctors.find((d) => d._id === formData.doctor);
  const selectedHospital = hospitals.find((h) => h._id === formData.hospital);

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Appointment
          </h1>
          <p className="text-muted-foreground">
            Update appointment details and medical information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    handleInputChange("patientName", e.target.value)
                  }
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientPhone">Phone Number *</Label>
                <Input
                  id="patientPhone"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    handleInputChange("patientPhone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientEmail">Email Address</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    handleInputChange("patientEmail", e.target.value)
                  }
                  placeholder="Enter email address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor *</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => handleInputChange("doctor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospital">Hospital *</Label>
                <Select
                  value={formData.hospital}
                  onValueChange={(value) =>
                    handleInputChange("hospital", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((hospital) => (
                      <SelectItem key={hospital._id} value={hospital._id}>
                        {hospital.name} - {hospital.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  placeholder="Enter department"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Appointment Date *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    handleInputChange("appointmentDate", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Appointment Time *</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) =>
                    handleInputChange("appointmentTime", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    handleInputChange("duration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="IPD">IPD</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="No Show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                placeholder="Describe symptoms"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Medical History</Label>
              <Textarea
                id="medicalHistory"
                value={formData.medicalHistory}
                onChange={(e) =>
                  handleInputChange("medicalHistory", e.target.value)
                }
                placeholder="Previous medical history"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                placeholder="Known allergies"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Textarea
                id="currentMedications"
                value={formData.currentMedications}
                onChange={(e) =>
                  handleInputChange("currentMedications", e.target.value)
                }
                placeholder="Current medications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment & Additional Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    handleInputChange("consultationFee", e.target.value)
                  }
                  placeholder="Enter fee amount"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPaid"
                  checked={formData.isPaid}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPaid", !!checked)
                  }
                />
                <Label htmlFor="isPaid">Payment completed</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleInputChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Follow-up & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="followUpRequired"
                  checked={formData.followUpRequired}
                  onCheckedChange={(checked) =>
                    handleInputChange("followUpRequired", !!checked)
                  }
                />
                <Label htmlFor="followUpRequired">Follow-up required</Label>
              </div>
              {formData.followUpRequired && (
                <div className="space-y-2">
                  <Label htmlFor="followUpDate">Follow-up Date</Label>
                  <Input
                    id="followUpDate"
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) =>
                      handleInputChange("followUpDate", e.target.value)
                    }
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              "Updating..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Appointment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
