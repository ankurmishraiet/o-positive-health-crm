"use client";

import type React from "react";

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
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import axios from "@/axios/axios";
import { CreateLeadFormData, Gender, ModeOfPayment, LeadStatus } from "@/types/lead";

interface Employee {
  _id: string;
  name: string;
  designation?: string;
  department?: string;
}

interface AppConfig {
  leadSources: string[];
  treatments: string[];
  employees: Employee[];
  paymentModes: ModeOfPayment[];
  genders: Gender[];
}

export default function CreateLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [formData, setFormData] = useState<CreateLeadFormData & { leadStatus?: LeadStatus }>({
    patientName: "",
    contact: {
      mobile: "",
      email: "",
      whatsappNumber: "",
    },
    city: "",
    treatment: "",
    description: "",
    age: undefined,
    gender: Gender.MALE,
    dob: undefined,
    leadSource: "",
    workingProfession: "",
    modeOfPayment: ModeOfPayment.CASH,
    address: "",
    pincode: "",
    assignedTo: "",
    aadharNumber: "",
    pancardNumber: "",
    leadStatus: LeadStatus.NEW,
  });

  useEffect(() => {
    const fetchConfig = async () => {
      setConfigLoading(true);
      try {
        // Fetch complete form configuration from API
        const configResponse = await axios.get("/leads/config/form");

        setConfig({
          leadSources: configResponse.data.leadSources || [],
          treatments: configResponse.data.treatments || [],
          employees: configResponse.data.employees || [],
          paymentModes:
            configResponse.data.paymentModes || Object.values(ModeOfPayment),
          genders: configResponse.data.genders || Object.values(Gender),
        });
      } catch (error) {
        console.error("Error fetching config:", error);
        setConfig({
          leadSources: [
            "Website",
            "Referral",
            "Social Media",
            "Walk-in",
            "Phone Call",
          ],
          treatments: [
            "Consultation",
            "Follow-up",
            "Surgery",
            "Emergency",
            "Preventive Care",
          ],
          employees: [],
          paymentModes: Object.values(ModeOfPayment),
          genders: Object.values(Gender),
        });
        toast.error(
          "Failed to load form configuration. Using default options."
        );
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create properly structured data that matches backend schema
      const leadData: any = {
        patientName: formData.patientName,
        age: formData.age,
        gender: formData.gender,
        dob: formData.dob,
        contact: {
          mobile: formData.contact.mobile,
          email: formData.contact.email,
          whatsappNumber: formData.contact.whatsappNumber,
        },
        city: formData.city,
        treatment: formData.treatment,
        workingProfession: formData.workingProfession,
        leadSource: formData.leadSource,
        modeOfPayment: formData.modeOfPayment,
        address: formData.address,
        pincode: formData.pincode,
        assignedTo: formData.assignedTo || undefined,
        description: formData.description,
        aadharNumber: formData.aadharNumber,
        pancardNumber: formData.pancardNumber,
        leadStatus: formData.leadStatus,
      };

      const response = await axios.post("/leads", leadData);
      toast.success("Lead created successfully!");
      router.push("/dashboard/leads");
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(error.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Lead</h1>
        <p className="text-gray-600">Add a new patient lead to the system</p>
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
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.contact.mobile || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, mobile: e.target.value },
                    })
                  }
                  placeholder="Enter mobile number"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: Number.parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Enter age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as Gender })
                  }
                  disabled={configLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {configLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : config?.genders.length ? (
                      config.genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
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
                        !formData.dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob
                        ? format(formData.dob, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dob}
                      onSelect={(date) =>
                        setFormData({ ...formData, dob: date })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact.email || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value },
                    })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.contact.whatsappNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contact: {
                        ...formData.contact,
                        whatsappNumber: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter WhatsApp number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Treatment */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Treatment Details</CardTitle>
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
                  disabled={configLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lead source" />
                  </SelectTrigger>
                  <SelectContent>
                    {configLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading lead sources...
                      </SelectItem>
                    ) : config?.leadSources.length ? (
                      config.leadSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-sources" disabled>
                        No lead sources available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Professional & Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  placeholder="Enter profession"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                <Select
                  value={formData.modeOfPayment}
                  onValueChange={(value: ModeOfPayment) =>
                    setFormData({ ...formData, modeOfPayment: value })
                  }
                  disabled={configLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {configLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : config?.paymentModes.length ? (
                      config.paymentModes.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadharCardNumber">Aadhar Card Number</Label>
                <Input
                  id="aadharCardNumber"
                  value={formData.aadharNumber || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aadharNumber: e.target.value,
                    })
                  }
                  placeholder="Enter Aadhar number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pancardNumber">PAN Card Number</Label>
                <Input
                  id="pancardNumber"
                  value={formData.pancardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, pancardNumber: e.target.value })
                  }
                  placeholder="Enter PAN number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leadStatus">Initial Lead Status</Label>
              <Select
                value={formData.leadStatus}
                onValueChange={(value: LeadStatus) =>
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
          </CardContent>
        </Card>

        {/* Assignment & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment & Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign to Employee</Label>
                <Select
                  value={formData.assignedTo || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedTo: value })
                  }
                  disabled={configLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {configLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading employees...
                      </SelectItem>
                    ) : config?.employees.length ? (
                      config.employees.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name}
                          {employee.designation && ` - ${employee.designation}`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-employees" disabled>
                        No employees available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter additional details"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Lead"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
