"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  Save,
  Calendar as CalendarIcon,
} from "lucide-react";
import axios from "@/axios/axios";

interface Employee {
  _id: string;
  name: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
}

function CreateLoanLeadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [loadingLead, setLoadingLead] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    leadName: "",
    contactNumber: "",
    alternateNumber: "",
    email: "",
    city: "",
    state: "",
    loanAmount: "",
    purpose: "",
    treatmentType: "",
    urgency: "Medium",
    hospital: "",
    status: "Fresh",
    priority: "Medium",
    leadSource: "Manual",
    assignedTo: "",
    notes: "",
    followUpDate: "",
  });

  useEffect(() => {
    fetchEmployees();
    if (leadId) {
      fetchLoanLead();
    }
  }, [leadId]);

  const fetchLoanLead = async () => {
    try {
      setLoadingLead(true);
      const response = await axios.get(`/loan-leads/${leadId}`);
      const lead = response.data;

      setFormData({
        leadName: lead.leadName || "",
        contactNumber: lead.contactNumber || "",
        alternateNumber: lead.alternateNumber || "",
        email: lead.email || "",
        city: lead.city || "",
        state: lead.state || "",
        loanAmount: lead.loanAmount?.toString() || "",
        purpose: lead.purpose || "",
        treatmentType: lead.treatmentType || "",
        urgency: lead.urgency || "Medium",
        hospital: lead.hospital || "",
        status: lead.status || "Fresh",
        priority: lead.priority || "Medium",
        leadSource: lead.leadSource || "Manual",
        assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
        notes: lead.notes || "",
        followUpDate: lead.followUpDate
          ? new Date(lead.followUpDate).toISOString().split("T")[0]
          : "",
      });
    } catch (error) {
      console.error("Error fetching loan lead:", error);
      toast({
        title: "Error",
        description: "Failed to load loan lead",
        variant: "destructive",
      });
    } finally {
      setLoadingLead(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const loanLeadData = {
        leadName: formData.leadName,
        contactNumber: formData.contactNumber,
        alternateNumber: formData.alternateNumber,
        email: formData.email,
        city: formData.city,
        state: formData.state,
        loanAmount: parseFloat(formData.loanAmount) || 0,
        purpose: formData.purpose,
        treatmentType: formData.treatmentType,
        urgency: formData.urgency,
        hospital: formData.hospital,
        status: formData.status,
        priority: formData.priority,
        leadSource: formData.leadSource,
        assignedTo: formData.assignedTo || undefined,
        assignedToName: employees.find((e) => e._id === formData.assignedTo)
          ?.name,
        notes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
      };

      if (leadId) {
        // Update existing lead
        await axios.put(`/loan-leads/${leadId}`, loanLeadData);
        toast({
          title: "Success",
          description: "Loan lead updated successfully",
        });
      } else {
        // Create new lead
        await axios.post("/loan-leads", loanLeadData);
        toast({
          title: "Success",
          description: "Loan lead created successfully",
        });
      }

      router.push("/dashboard/loans/new");
    } catch (error: any) {
      console.error("Error creating loan lead:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create loan lead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {leadId ? "Update Loan Lead" : "Create Loan Lead"}
          </h1>
          <p className="text-muted-foreground">
            {leadId
              ? "Update loan inquiry details"
              : "Quick capture of new loan inquiry"}
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={loading || loadingLead}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : leadId ? "Update Lead" : "Save Lead"}
        </Button>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Contact Information</CardTitle>
            </div>
            <CardDescription>Basic contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leadName">Lead Name *</Label>
              <Input
                id="leadName"
                value={formData.leadName}
                onChange={(e) => handleInputChange("leadName", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alternateNumber">Alternate Number</Label>
              <Input
                id="alternateNumber"
                value={formData.alternateNumber}
                onChange={(e) =>
                  handleInputChange("alternateNumber", e.target.value)
                }
                placeholder="Alternate contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Requirements */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Loan Requirements</CardTitle>
            </div>
            <CardDescription>Loan details and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount Required *</Label>
              <Input
                id="loanAmount"
                type="number"
                value={formData.loanAmount}
                onChange={(e) =>
                  handleInputChange("loanAmount", e.target.value)
                }
                placeholder="Enter amount in ₹"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                placeholder="e.g., Heart Surgery, Cancer Treatment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatmentType">Treatment Type</Label>
              <Input
                id="treatmentType"
                value={formData.treatmentType}
                onChange={(e) =>
                  handleInputChange("treatmentType", e.target.value)
                }
                placeholder="Type of treatment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospital">Hospital</Label>
              <Input
                id="hospital"
                value={formData.hospital}
                onChange={(e) => handleInputChange("hospital", e.target.value)}
                placeholder="Hospital name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select
                  value={formData.urgency}
                  onValueChange={(value) => handleInputChange("urgency", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lead Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Lead Management</CardTitle>
            </div>
            <CardDescription>Lead tracking and assignment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fresh">Fresh</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Interested">Interested</SelectItem>
                    <SelectItem value="Not Interested">
                      Not Interested
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select
                  value={formData.leadSource}
                  onValueChange={(value) =>
                    handleInputChange("leadSource", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="CSV Upload">CSV Upload</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Phone">Phone</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Walk-in">Walk-in</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) =>
                    handleInputChange("assignedTo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp._id} value={emp._id}>
                        {emp.name}{" "}
                        {emp.employeeCode ? `(${emp.employeeCode})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow Up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={(e) =>
                  handleInputChange("followUpDate", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes or requirements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CreateLoanLeadPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Loan Lead
            </h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CreateLoanLeadForm />
    </Suspense>
  );
}
