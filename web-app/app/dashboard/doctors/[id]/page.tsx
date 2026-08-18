"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  Star,
  ChevronLeft,
  Clock,
  IndianRupee,
  Building2,
  Edit,
  FileText,
  ExternalLink,
} from "lucide-react";
import axios from "@/axios/axios";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  experience: string;
  location: string;
  phone: string;
  email: string;
  status: string;
  type: string;
  consultationFee: string;
  rating?: number;
  totalPatients?: number;
  availability?: string[];
  bio?: string;
  qualifications?: string[];
  languages?: string[];
  registrationNumber?: string;
  documents?: {
    documentType: string;
    documentName?: string;
    documentUrl: string;
    uploadedDate?: string;
  }[];
}

interface Appointment {
  _id: string;
  patientName: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: string;
  type: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  const handleEdit = () => {
    router.push(`/dashboard/doctors/${params.id}/edit`);
  };

  const handleCallDoctor = () => {
    if (doctor?.phone) {
      window.open(`tel:${doctor.phone}`, '_self');
    } else {
      toast({
        title: "No Phone Number",
        description: "This doctor's phone number is not available.",
        variant: "destructive",
      });
    }
  };

  const handleEmailDoctor = () => {
    if (doctor?.email) {
      window.open(`mailto:${doctor.email}`, '_blank');
    } else {
      toast({
        title: "No Email Address",
        description: "This doctor's email address is not available.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleAppointment = () => {
    router.push(`/dashboard/hospitals/appointments/create?doctorId=${params.id}`);
  };

  const handleViewAppointments = async () => {
    if (appointments.length > 0) {
      // If already loaded, just scroll to appointments section
      document.getElementById('appointments-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setAppointmentsLoading(true);
    try {
      const response = await axios.get(`/doctors/${params.id}/appointments`);
      setAppointments(response.data.appointments || []);
      
      toast({
        title: "Appointments Loaded",
        description: `Found ${response.data.appointments?.length || 0} appointments for this doctor.`,
      });
      
      // Scroll to appointments section
      setTimeout(() => {
        document.getElementById('appointments-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAppointmentsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorId = params.id as string;
        const response = await axios.get(`/doctors/${doctorId}`);
        setDoctor(response.data);
      } catch (error) {
        console.error("Error fetching doctor:", error);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Not Found</h2>
        <p className="text-gray-600 mt-2">
          The doctor profile you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Doctor Profile</h1>
            <p className="text-muted-foreground">
              Detailed information about {doctor.name}
            </p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Doctor
        </Button>
      </div>

      {/* Doctor Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${doctor.name}`}
                />
                <AvatarFallback className="text-lg">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <p className="text-lg text-blue-600 font-medium">
                  {doctor.specialization}
                </p>
                <p className="text-gray-600">{doctor.experience} experience</p>

                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 font-medium">{doctor.rating}</span>
                  <span className="ml-2 text-gray-600">
                    ({doctor.totalPatients} patients)
                  </span>
                </div>
              </div>
            </div>

            {/* Contact and Status Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{doctor.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <IndianRupee className="h-4 w-4 text-gray-500" />
                  <span>Consultation: {doctor.consultationFee}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <Badge
                    variant={
                      doctor.type === "With Us" ? "default" : "secondary"
                    }
                  >
                    {doctor.type}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      doctor.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={
                      doctor.status === "Active"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {doctor.status}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{doctor.totalPatients} Total Patients</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>About Dr. {doctor.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Biography</h4>
                <p className="text-gray-600">{doctor.bio}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Languages Spoken</h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages?.map((lang) => (
                    <Badge key={lang} variant="outline">
                      {lang}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Available Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <div
                    key={day}
                    className={`p-3 rounded-lg border text-center ${
                      doctor.availability?.includes(day)
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-500"
                    }`}
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-sm font-medium">{day}</div>
                    <div className="text-xs">
                      {doctor.availability?.includes(day)
                        ? "Available"
                        : "Not Available"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card>
            <CardHeader>
              <CardTitle>Education & Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctor.registrationNumber && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-sm">Registration Number:</span>
                    <p className="text-gray-700 font-mono mt-1">{doctor.registrationNumber}</p>
                  </div>
                )}
                {/* <div className="space-y-3">
                {doctor.qualifications?.map((qualification, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{qualification}</span>
                  </div>
                ))}
              </div> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Patient Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {doctor.rating}/5
                </div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(doctor.rating || 0)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {doctor.totalPatients}
                </div>
                <p className="text-gray-600 text-sm">Lifetime patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {doctor?.experience?.split(" ")[0]}
                </div>
                <p className="text-gray-600 text-sm">Years of practice</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Appointments Section */}
      {appointments.length > 0 && (
        <div id="appointments-section">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.slice(0, 10).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        appointment.status === 'Completed' ? 'default' :
                        appointment.status === 'Scheduled' ? 'secondary' :
                        appointment.status === 'Cancelled' ? 'destructive' : 'outline'
                      }>
                        {appointment.status}
                      </Badge>
                      <Badge variant="outline">{appointment.type}</Badge>
                    </div>
                  </div>
                ))}
                {appointments.length > 10 && (
                  <div className="text-center py-2">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/hospitals/appointments?doctor=${params.id}`)}
                    >
                      View All {appointments.length} Appointments
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Documents */}
      {doctor.documents && doctor.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {doctor.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm break-words">{doc.documentType}</p>
                      {doc.documentName && (
                        <p className="text-xs text-gray-500 break-words">{doc.documentName}</p>
                      )}
                      {doc.uploadedDate && (
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.documentUrl, '_blank')}
                    className="flex-shrink-0 ml-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Doctor
            </Button>
            <Button variant="outline" onClick={handleCallDoctor}>
              <Phone className="h-4 w-4 mr-2" />
              Call Doctor
            </Button>
            <Button variant="outline" onClick={handleEmailDoctor}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" onClick={handleScheduleAppointment}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
            <Button variant="outline" onClick={handleViewAppointments} disabled={appointmentsLoading}>
              <Users className="h-4 w-4 mr-2" />
              {appointmentsLoading ? "Loading..." : "View Appointments"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
