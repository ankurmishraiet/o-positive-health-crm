"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  FileText,
  IndianRupeeIcon,
  AlertTriangle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

interface AppointmentDetail {
  _id: string;
  appointmentId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  doctorName: string;
  hospitalName: string;
  department: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status: string;
  priority: string;
  symptoms?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  consultationFee?: number;
  isPaid?: boolean;
  paymentMethod?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  notes?: string;
  reminderSent?: boolean;
  reminderDate?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ViewAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAppointment();
    }
  }, [params.id]);

  const fetchAppointment = async () => {
    try {
      const response = await axios.get(`/appointments/${params.id}`);
      setAppointment(response.data);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      });
      router.push("/dashboard/appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "default";
      case "Completed":
        return "secondary";
      case "In Progress":
        return "outline";
      case "Cancelled":
        return "destructive";
      case "No Show":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "Emergency":
        return "destructive";
      case "High":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (loading) {
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
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Appointment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Appointment Details
            </h1>
            <p className="text-muted-foreground">
              {appointment.appointmentId} • Created on{" "}
              {new Date(appointment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Link
          href={`/dashboard/hospitals/appointments/${appointment._id}/edit`}
        >
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Appointment
          </Button>
        </Link>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Appointment Overview</span>
            <div className="flex space-x-2">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status}
              </Badge>
              <Badge variant={getPriorityVariant(appointment.priority)}>
                {appointment.priority}
              </Badge>
              <Badge variant="outline">{appointment.type}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.appointmentTime} ({appointment.duration} mins)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Doctor</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctorName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Hospital</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.hospitalName}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patientName}
              </p>
            </div>
            {appointment.patientPhone && (
              <div>
                <p className="text-sm font-medium flex items-center">
                  <Phone className="mr-1 h-3 w-3" />
                  Phone
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.patientPhone}
                </p>
              </div>
            )}
            {appointment.patientEmail && (
              <div>
                <p className="text-sm font-medium flex items-center">
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.patientEmail}
                </p>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-sm font-medium">Department</p>
              <p className="text-sm text-muted-foreground">
                {appointment.department}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.symptoms && (
              <div>
                <p className="text-sm font-medium">Symptoms</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.symptoms}
                </p>
              </div>
            )}
            {appointment.medicalHistory && (
              <div>
                <p className="text-sm font-medium">Medical History</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.medicalHistory}
                </p>
              </div>
            )}
            {appointment.allergies && (
              <div>
                <p className="text-sm font-medium flex items-center">
                  <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />
                  Allergies
                </p>
                <p className="text-sm text-muted-foreground">
                  {appointment.allergies}
                </p>
              </div>
            )}
            {appointment.currentMedications && (
              <div>
                <p className="text-sm font-medium">Current Medications</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.currentMedications}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IndianRupeeIcon className="mr-2 h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.consultationFee && (
              <div>
                <p className="text-sm font-medium">Consultation Fee</p>
                <p className="text-sm text-muted-foreground">
                  ₹{appointment.consultationFee}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Payment Status</p>
              <Badge variant={appointment.isPaid ? "default" : "destructive"}>
                {appointment.isPaid ? "Paid" : "Unpaid"}
              </Badge>
            </div>
            {appointment.paymentMethod && (
              <div>
                <p className="text-sm font-medium">Payment Method</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.paymentMethod}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointment.followUpRequired && (
              <div>
                <p className="text-sm font-medium">Follow-up Required</p>
                <Badge variant="outline">Yes</Badge>
                {appointment.followUpDate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Scheduled for{" "}
                    {new Date(appointment.followUpDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            {appointment.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.notes}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Reminder Status</p>
              <Badge
                variant={appointment.reminderSent ? "default" : "secondary"}
              >
                {appointment.reminderSent ? "Sent" : "Not Sent"}
              </Badge>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground">
              <p>
                Last updated: {new Date(appointment.updatedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
