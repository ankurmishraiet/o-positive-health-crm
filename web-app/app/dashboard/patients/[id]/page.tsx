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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  Activity,
  Stethoscope,
  Building2,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/axios/axios";

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [patientData, setPatientData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchPatientHistory();
  }, [params.id]);

  const fetchPatientHistory = async () => {
    try {
      const response = await axios.get(`/patients/${params.id}/history`);
      setPatientData(response.data);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      toast.error("Failed to load patient details");
    } finally {
      setLoading(false);
    }
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

  if (!patientData || !patientData.patient) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Patient Not Found</h1>
          <p className="text-gray-600 mt-2">
            The patient you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/dashboard/patients")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  const { patient, history } = patientData;

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.patientName || "Unnamed Patient"}
            </h1>
            <p className="text-gray-600">
              Patient ID: {patient.patientId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-lg font-semibold">{patient.patientName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Age / Gender
                </label>
                <p className="text-lg">
                  {patient.age || "N/A"} / {patient.gender || "N/A"}
                </p>
              </div>
              {patient.contact?.mobile && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    Phone
                  </label>
                  <p className="text-lg">{patient.contact.mobile}</p>
                </div>
              )}
              {patient.contact?.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </label>
                  <p className="text-lg">{patient.contact.email}</p>
                </div>
              )}
              {patient.city && (
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    City
                  </label>
                  <p className="text-lg">{patient.city}</p>
                </div>
              )}
              {patient.treatment && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Treatment
                  </label>
                  <p className="text-lg">{patient.treatment}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lead Status
                </label>
                <Badge className="mt-1">{patient.leadStatus || "N/A"}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  OPD Status
                </label>
                <Badge variant="outline" className="mt-1">
                  {patient.opdStatus || "N/A"}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  IPD Status
                </label>
                <Badge variant="outline" className="mt-1">
                  {patient.ipdStatus || "N/A"}
                </Badge>
              </div>
              {patient.assignedTo && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Assigned To
                  </label>
                  <p className="text-sm">{patient.assignedTo.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <Card>
            <CardHeader>
              <CardTitle>History Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Appointments</span>
                <span className="font-bold">
                  {history.summary.totalAppointments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cab Bookings</span>
                <span className="font-bold">
                  {history.summary.totalCabBookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hospitals Visited</span>
                <span className="font-bold">
                  {history.summary.uniqueHospitals}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doctors Consulted</span>
                <span className="font-bold">
                  {history.summary.uniqueDoctors}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="appointments">
                    Appointments ({history.appointments.length})
                  </TabsTrigger>
                  <TabsTrigger value="cabs">
                    Cab Bookings ({history.cabBookings.length})
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {history.summary.lastAppointment && (
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Last Appointment</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(history.summary.lastAppointment)}
                            </p>
                          </div>
                        </div>
                      )}
                      {history.summary.lastCabBooking && (
                        <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                          <Car className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Last Cab Booking</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(history.summary.lastCabBooking)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("appointments")}
                      >
                        <Stethoscope className="h-4 w-4 mr-2" />
                        View Appointments
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("cabs")}
                      >
                        <Car className="h-4 w-4 mr-2" />
                        View Cab Bookings
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-4 mt-4">
                  {history.appointments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No appointments found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.appointments.map((appointment: any) => (
                        <Card key={appointment._id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Stethoscope className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold">
                                    {appointment.doctorName}
                                  </span>
                                  {appointment.doctor?.specialization && (
                                    <Badge variant="outline" className="text-xs">
                                      {appointment.doctor.specialization}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <Building2 className="h-3 w-3" />
                                  <span>{appointment.hospitalName}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {formatDate(appointment.appointmentDate)} at{" "}
                                    {appointment.appointmentTime}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                  <Badge>{appointment.type}</Badge>
                                  <Badge
                                    variant={
                                      appointment.status === "Completed"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {appointment.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Cab Bookings Tab */}
                <TabsContent value="cabs" className="space-y-4 mt-4">
                  {history.cabBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No cab bookings found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {history.cabBookings.map((cab: any) => (
                        <Card key={cab._id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Car className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold">
                                    {cab.bookingId}
                                  </span>
                                  <Badge variant="outline">{cab.serviceType}</Badge>
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                  <strong>Pickup:</strong>{" "}
                                  {cab.pickupLocation?.address || "N/A"}
                                </div>
                                <div className="text-sm text-gray-600 mb-1">
                                  <strong>Destination:</strong>{" "}
                                  {cab.destination?.address || "N/A"}
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDateTime(cab.pickupTime)}</span>
                                </div>
                                {cab.driver && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    <strong>Driver:</strong> {cab.driver.name} (
                                    {cab.driver.phone})
                                  </div>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    variant={
                                      cab.status === "Completed"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {cab.status}
                                  </Badge>
                                  {cab.fare && (
                                    <Badge variant="outline">₹{cab.fare}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
