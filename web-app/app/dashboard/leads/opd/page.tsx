"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Stethoscope,
  ArrowRight,
  Filter,
  Monitor,
  MapPinned,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";
import { OPDTodayResponse, AppointmentData, Lead } from "@/types/lead";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OPDPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("today");
  const [opdData, setOpdData] = useState<OPDTodayResponse>({
    appointments: [],
    leads: [],
  });
  const [filteredData, setFilteredData] = useState<OPDTodayResponse>({
    appointments: [],
    leads: [],
  });
  const [loading, setLoading] = useState(true);
  const [opdTypeFilter, setOpdTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchOPD(activeTab);
  }, [activeTab]);

  useEffect(() => {
    applyFilters();
  }, [opdData, opdTypeFilter]);

  const fetchOPD = async (filter: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/leads/opd/${filter}`);
      const data = response.data || { appointments: [], leads: [] };

      // Transform data to match our interfaces
      const transformedData: OPDTodayResponse = {
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

      setOpdData(transformedData);
    } catch (error) {
      console.error(`Error fetching ${filter} OPD:`, error);
      setOpdData({ appointments: [], leads: [] });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (opdTypeFilter === "all") {
      setFilteredData(opdData);
    } else {
      const filtered: OPDTodayResponse = {
        appointments: opdData.appointments,
        leads: opdData.leads.filter((lead) => {
          if (opdTypeFilter === "online") {
            return lead.opdStatus === "Online OPD";
          } else if (opdTypeFilter === "offline") {
            return lead.opdStatus === "Offline OPD";
          }
          return true;
        }),
      };
      setFilteredData(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Online OPD":
        return "bg-purple-100 text-purple-800";
      case "Offline OPD":
        return "bg-cyan-100 text-cyan-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAppointments = opdData.appointments.length + opdData.leads.length;

  const convertToIPD = async (leadId: string, patientName: string) => {
    try {
      // Update the lead status to IPD Schedule
      await axios.patch(`/leads/${leadId}`, {
        leadStatus: "IPD Schedule",
        ipdStatus: "Scheduled",
      });

      toast({
        title: "Success",
        description: `${patientName} has been converted to IPD Schedule`,
      });

      // Refresh the data
      fetchOPD(activeTab);

      // Optionally navigate to IPD page
      router.push("/dashboard/leads/ipd");
    } catch (error: any) {
      console.error("Error converting to IPD:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to convert to IPD",
        variant: "destructive",
      });
    }
  };

  const changeOPDType = async (
    leadId: string,
    patientName: string,
    newType: "Online OPD" | "Offline OPD"
  ) => {
    try {
      await axios.patch(`/leads/${leadId}`, {
        opdStatus: newType,
      });

      toast({
        title: "Success",
        description: `${patientName}'s OPD type changed to ${newType}`,
      });

      // Refresh the data
      fetchOPD(activeTab);
    } catch (error: any) {
      console.error("Error changing OPD type:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change OPD type",
        variant: "destructive",
      });
    }
  };

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
          <Stethoscope className="h-4 w-4 text-gray-500" />
          <span>{appointment.treatment || "General consultation"}</span>
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
          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
            Update Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderLeadCard = (lead: Lead) => {
    const isOnlineOPD = lead.opdStatus === "Online OPD";
    const isOfflineOPD = lead.opdStatus === "Offline OPD";
    const hasOPDType = isOnlineOPD || isOfflineOPD;

    return (
      <Card key={lead._id} className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{lead.patientName}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(lead.opdStatus)}>
                {lead.opdStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-gray-500" />
            <span>{lead.contact.mobile || "No phone"}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Stethoscope className="h-4 w-4 text-gray-500" />
            <span>{lead.treatment || "No treatment specified"}</span>
          </div>

          {/* OPD Type Status - Always displayed for all leads */}
          <div className="flex items-center space-x-2 text-sm p-2 bg-gray-50 rounded-md border border-gray-200">
            {hasOPDType ? (
              <>
                {isOnlineOPD ? (
                  <Monitor className="h-4 w-4 text-purple-600" />
                ) : (
                  <MapPinned className="h-4 w-4 text-cyan-600" />
                )}
                <span className="font-medium">
                  {isOnlineOPD ? "Online Consultation" : "Offline Visit"}
                </span>
              </>
            ) : (
              <>
                <Stethoscope className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Set OPD Type</span>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 ml-auto"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    changeOPDType(lead._id, lead.patientName, "Online OPD")
                  }
                  disabled={isOnlineOPD}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  {isOnlineOPD ? "✓ Online OPD" : "Set as Online"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    changeOPDType(lead._id, lead.patientName, "Offline OPD")
                  }
                  disabled={isOfflineOPD}
                >
                  <MapPinned className="h-4 w-4 mr-2" />
                  {isOfflineOPD ? "✓ Offline OPD" : "Set as Offline"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => convertToIPD(lead._id, lead.patientName)}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Convert to IPD
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Stethoscope className="mr-3 h-8 w-8 text-green-600" />
            OPD - Outpatient Department
          </h1>
          <p className="text-gray-600">
            Manage outpatient appointments and consultations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={opdTypeFilter} onValueChange={setOpdTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by OPD Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All OPD Types</SelectItem>
                <SelectItem value="online">
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2 text-purple-600" />
                    Online OPD
                  </div>
                </SelectItem>
                <SelectItem value="offline">
                  <div className="flex items-center">
                    <MapPinned className="h-4 w-4 mr-2 text-cyan-600" />
                    Offline OPD
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">
            {filteredData.appointments.length + filteredData.leads.length}{" "}
            appointments
          </Badge>
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
            <OPDContent
              opdData={filteredData}
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
            <OPDContent
              opdData={filteredData}
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
            <OPDContent
              opdData={filteredData}
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
            <OPDContent
              opdData={filteredData}
              renderAppointmentCard={renderAppointmentCard}
              renderLeadCard={renderLeadCard}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OPDContent({
  opdData,
  renderAppointmentCard,
  renderLeadCard,
}: {
  opdData: OPDTodayResponse;
  renderAppointmentCard: (appointment: AppointmentData) => React.ReactNode;
  renderLeadCard: (lead: Lead) => React.ReactNode;
}) {
  const totalAppointments = opdData.appointments.length + opdData.leads.length;

  if (totalAppointments === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No OPD Appointments
          </h3>
          <p className="text-gray-500">
            No outpatient appointments found for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {opdData.appointments.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Scheduled Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opdData.appointments.map(renderAppointmentCard)}
          </div>
        </div>
      )}

      {opdData.leads.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Leads with OPD Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opdData.leads.map(renderLeadCard)}
          </div>
        </div>
      )}
    </>
  );
}
