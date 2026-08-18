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
import { toast } from "sonner";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/models/lead";
import axios from "@/axios/axios";
import { LeadStatus, OpdStatus, IpdStatus } from "@/types/lead";

interface AppConfig {
  leadSources: string[];
  treatments: string[];
  bdTeams: string[];
  paymentModes: string[];
  genders: string[];
  leadStatuses: string[];
  priorities: string[];
}

// Add default configuration values as fallback
const defaultConfig: AppConfig = {
  leadSources: ["Website", "Referral", "Social Media", "Walk-in", "Other"],
  treatments: ["Dental", "Cosmetic", "General Checkup", "Surgery", "Therapy"],
  bdTeams: ["Team A", "Team B", "Team C"],
  paymentModes: ["Cash", "Credit Card", "Insurance", "EMI"],
  genders: ["Male", "Female", "Other"],
  leadStatuses: ["New", "Contacted", "Qualified", "Converted", "Lost"],
  priorities: ["Low", "Medium", "High", "Urgent"],
};

export default function EditLeadPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig>(defaultConfig); // Initialize with default config
  const [lead, setLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    mobile: "",
    email: "",
    whatsappNumber: "",
    age: 0,
    gender: "",
    dateOfBirth: undefined as Date | undefined,
    city: "",
    address: "",
    pincode: "",
    treatment: "",
    leadSource: "",
    workingProfession: "",
    modeOfPayment: "",
    leadStatus: "",
    opdStatus: "",
    ipdStatus: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setConfig({
          leadSources: ["Website", "Referral", "Social Media"],
          treatments: ["Consultation", "Follow-up", "Surgery"],
          bdTeams: ["Team A", "Team B", "Team C"],
          paymentModes: ["Cash", "Card", "Insurance"],
          genders: ["Male", "Female", "Other"],
          leadStatuses: ["New", "Contacted", "Qualified", "Lost"],
          priorities: ["Low", "Medium", "High"],
        });

        const leadResponse = await axios.get(`/leads/${params.id}`);
        const leadData = leadResponse.data;
        setLead(leadData);

        setFormData({
          patientName: leadData.patientName || "",
          mobile: leadData.contact?.mobile || leadData.mobile || "",
          email: leadData.contact?.email || leadData.email || "",
          whatsappNumber: leadData.contact?.whatsappNumber || "",
          age: leadData.age || 0,
          gender: leadData.gender || "",
          dateOfBirth: leadData.dob ? new Date(leadData.dob) : undefined,
          city: leadData.city || "",
          address: leadData.address || "",
          pincode: leadData.pincode || "",
          treatment: leadData.treatment || "",
          leadSource: leadData.leadSource || "",
          workingProfession: leadData.workingProfession || "",
          modeOfPayment: leadData.modeOfPayment || "",
          leadStatus: leadData.leadStatus || "",
          opdStatus: leadData.opdStatus || "",
          ipdStatus: leadData.ipdStatus || "",
          description: leadData.description || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/leads/${params.id}`, {
        patientName: formData.patientName,
        age: formData.age,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        contact: {
          mobile: formData.mobile,
          email: formData.email,
          whatsappNumber: formData.whatsappNumber,
        },
        treatment: formData.treatment,
        city: formData.city,
        address: formData.address,
        pincode: formData.pincode,
        modeOfPayment: formData.modeOfPayment,
        leadStatus: formData.leadStatus,
        opdStatus: formData.opdStatus,
        ipdStatus: formData.ipdStatus,
        leadSource: formData.leadSource,
        workingProfession: formData.workingProfession,
        description: formData.description,
        engagement: {
          ...lead?.engagement,
          lastEngagement: new Date(),
        },
      });

      toast.success("Lead updated successfully!");
      router.push(`/dashboard/leads/${params.id}`);
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  if (!lead) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Lead Not Found</h1>
          <p className="text-gray-600 mt-2">
            The lead you're trying to edit doesn't exist.
          </p>
          <Button
            onClick={() => router.push("/dashboard/leads")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/leads/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lead
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Lead</h1>
          <p className="text-gray-600">Update lead information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter age"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.genders.map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? (
                        format(formData.dateOfBirth, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dateOfBirth}
                      onSelect={(date) =>
                        setFormData({ ...formData, dateOfBirth: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  placeholder="Enter mobile number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  placeholder="Enter pincode"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter full address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical & Lead Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical & Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) =>
                    setFormData({ ...formData, treatment: e.target.value })
                  }
                  placeholder="Enter treatment details"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(value) =>
                    setFormData({ ...formData, leadSource: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.leadSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workingProfession">Working Profession</Label>
                <Input
                  id="workingProfession"
                  value={formData.workingProfession}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workingProfession: e.target.value,
                    })
                  }
                  placeholder="Enter working profession"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                <Select
                  value={formData.modeOfPayment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, modeOfPayment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.paymentModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadStatus">Lead Status</Label>
                <Select
                  value={formData.leadStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, leadStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(LeadStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opdStatus">OPD Status</Label>
                <Select
                  value={formData.opdStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, opdStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select OPD status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(OpdStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipdStatus">IPD Status</Label>
                <Select
                  value={formData.ipdStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ipdStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select IPD status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(IpdStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter any additional notes or description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/leads/${params.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Lead"}
          </Button>
        </div>
      </form>
    </div>
  );
}
