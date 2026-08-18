"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, MapPin, User, Bed, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";
import { IPDTodayResponse, AppointmentData, Lead } from "@/types/lead";

export default function IPDPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  const [ipdData, setIpdData] = useState<IPDTodayResponse>({
    appointments: [],
    leads: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIPD(activeTab);
  }, [activeTab]);

  const fetchIPD = async (filter: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/leads/ipd/${filter}`);
      const data = response.data || { appointments: [], leads: [] };

      // Transform data to match our interfaces
      const transformedData: IPDTodayResponse = {
        appointments: (data.appointments || []).map((apt: any) => ({
          _id: apt._id,
          appointmentId: apt.appointmentId,
          patientName: apt.patientName,
          patientPhone: apt.patientPhone,
          treatment: apt.treatment,
          doctorName: apt.doctorName,
          hospitalName: apt.hospitalName,
          appointmentDate: apt.appointmentDate,
          appointmentTime: apt.appointmentTime,
          status: apt.status,
          duration: apt.duration,
        })),
        leads: (data.leads || []).map((lead: any) => ({
          ...lead,
          contact: lead.contact || {
            mobile: "",
            email: "",
            whatsappNumber: "",
          },
          engagement: lead.engagement || {},
        })),
      };

      setIpdData(transformedData);
    } catch (error) {
      console.error(`Error fetching ${filter} IPD:`, error);
      setIpdData({ appointments: [], leads: [] });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Admitted":
        return "bg-yellow-100 text-yellow-800";
      case "Discharged":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAdmissions = ipdData.appointments.length + ipdData.leads.length;

  const renderAppointmentCard = (appointment: AppointmentData) => (
    <Card key={appointment._id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{appointment.patientName}</CardTitle>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>{appointment.patientPhone || "No phone"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span>{appointment.treatment || "General treatment"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {appointment.appointmentTime
              ? appointment.appointmentTime
              : new Date(appointment.appointmentDate).toLocaleTimeString()}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>Dr. {appointment.doctorName}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{appointment.hospitalName}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Bed className="h-4 w-4 text-gray-500" />
          <span>
            Duration:{" "}
            {appointment.duration
              ? `${appointment.duration} min`
              : "Not specified"}
          </span>
        </div>
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() =>
              router.push(
                `/dashboard/hospitals/appointments/${appointment._id}`
              )
            }
          >
            View Details
          </Button>
          {/* <Button size="sm" variant="outline" className="flex-1 bg-transparent">Update Status</Button> */}
        </div>
      </CardContent>
    </Card>
  );

  const renderLeadCard = (lead: Lead) => (
    <Card key={lead._id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{lead.patientName}</CardTitle>
          <Badge className={getStatusColor(lead.ipdStatus)}>
            {lead.ipdStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>{lead.contact.mobile || "No phone"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span>{lead.treatment || "No treatment specified"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {lead.engagement.followUpAt
              ? new Date(lead.engagement.followUpAt).toLocaleTimeString()
              : "No time scheduled"}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>{lead.assignedTo?.name || "Unassigned"}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span>{lead.city || "No city"}</span>
        </div>
        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/dashboard/leads/${lead._id}`)}
          >
            View Details
          </Button>
          {/* <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            Update Status
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bed className="mr-3 h-8 w-8 text-purple-600" />
            IPD - Inpatient Department
          </h1>
          <p className="text-gray-600">
            Manage inpatient admissions and hospitalizations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{totalAdmissions} admissions</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="future">Future</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <IPDContent
              ipdData={ipdData}
              renderAppointmentCard={renderAppointmentCard}
              renderLeadCard={renderLeadCard}
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <IPDContent
              ipdData={ipdData}
              renderAppointmentCard={renderAppointmentCard}
              renderLeadCard={renderLeadCard}
            />
          )}
        </TabsContent>

        <TabsContent value="future" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <IPDContent
              ipdData={ipdData}
              renderAppointmentCard={renderAppointmentCard}
              renderLeadCard={renderLeadCard}
            />
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <IPDContent
              ipdData={ipdData}
              renderAppointmentCard={renderAppointmentCard}
              renderLeadCard={renderLeadCard}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IPDContent({
  ipdData,
  renderAppointmentCard,
  renderLeadCard,
}: {
  ipdData: IPDTodayResponse;
  renderAppointmentCard: (appointment: AppointmentData) => React.ReactNode;
  renderLeadCard: (lead: Lead) => React.ReactNode;
}) {
  const totalAdmissions = ipdData.appointments.length + ipdData.leads.length;

  if (totalAdmissions === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Bed className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No IPD Admissions
          </h3>
          <p className="text-gray-500">
            No inpatient admissions found for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {ipdData.appointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Scheduled Admissions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ipdData.appointments.map(renderAppointmentCard)}
          </div>
        </div>
      )}

      {ipdData.leads.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Leads with IPD Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ipdData.leads.map(renderLeadCard)}
          </div>
        </div>
      )}
    </>
  );
}
