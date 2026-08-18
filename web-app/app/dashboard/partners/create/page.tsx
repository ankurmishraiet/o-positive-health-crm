"use client";

import type React from "react";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Building2, Users } from "lucide-react";
import axios from "@/axios/axios";
import { DocumentUploadSection, Document } from "@/components/ui/document-upload-section";

export default function CreatePartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    businessType: "",
    // Corporate specific fields
    companyName: "",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    companyType: "",
    // Individual specific fields
    firstName: "",
    lastName: "",
    aadharNumber: "",
    individualPanNumber: "",
    // Common fields
    services: [] as string[],
    contractStartDate: "",
    contractEndDate: "",
    commissionRate: "",
    paymentTerms: "",
    description: "",
  });

  const availableServices = [
    "Health Insurance",
    "Wellness program",
    "Referral Services",
    "Supply medical equipments",
    "IT services",
    "Marketing services",
    "Training program",
    "Cab services",
    "Ambulance service",
    "Blood Bank",
    "Pathology and Radiology services",
    "Home health services",
    "Oxygen supply and Medical Gases",
    "Drugs and medicine supplier",
    "Security services",
    "Housekeeping services",
    "Legal Services",
    "Medical Tourism Facilitators",
  ];

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, services: [...formData.services, service] });
    } else {
      setFormData({
        ...formData,
        services: formData.services.filter((s) => s !== service),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform form data to match backend schema
      const transformedData = {
        name: formData.type === "Individual" ? `${formData.firstName} ${formData.lastName}` : formData.name,
        type: formData.type,
        businessType: formData.businessType,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        // Corporate specific fields
        ...(formData.type === "Corporate" && {
          companyName: formData.companyName,
          gstNumber: formData.gstNumber,
          panNumber: formData.panNumber,
          registrationNumber: formData.registrationNumber,
          companyType: formData.companyType,
        }),
        // Individual specific fields
        ...(formData.type === "Individual" && {
          firstName: formData.firstName,
          lastName: formData.lastName,
          aadharNumber: formData.aadharNumber,
          individualPanNumber: formData.individualPanNumber,
        }),
        // Common fields
        services: formData.services,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : undefined,
        paymentTerms: formData.paymentTerms,
        notes: formData.description,
        documents: documents.filter(doc => doc.documentUrl), // Only include uploaded documents
      };

      const response = await axios.post("/partners", transformedData);

      toast({
        title: "Success",
        description: "Partner onboarded successfully",
      });
      router.push("/dashboard/partners");
    } catch (error: any) {
      console.error("Error creating partner:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to onboard partner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Onboard New Partner</h1>
          <p className="text-gray-600">
            Add a new corporate or individual partner to the network
          </p>
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
                <Label htmlFor="type">Partner Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Corporate">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        Corporate
                      </div>
                    </SelectItem>
                    <SelectItem value="Individual">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Individual
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, businessType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                    <SelectItem value="Clinic">Clinic</SelectItem>
                    <SelectItem value="Agency">Agency</SelectItem>
                    <SelectItem value="Consultant">Consultant</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Corporate Specific Fields */}
            {formData.type === "Corporate" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType">Company Type</Label>
                    <Select
                      value={formData.companyType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, companyType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Private Limited">Private Limited</SelectItem>
                        <SelectItem value="Public Limited">Public Limited</SelectItem>
                        <SelectItem value="LLP">LLP</SelectItem>
                        <SelectItem value="Partnership">Partnership</SelectItem>
                        <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, gstNumber: e.target.value })
                      }
                      placeholder="Enter GST number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, panNumber: e.target.value })
                      }
                      placeholder="Enter PAN number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, registrationNumber: e.target.value })
                      }
                      placeholder="Enter registration number"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Individual Specific Fields */}
            {formData.type === "Individual" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, aadharNumber: e.target.value })
                      }
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="individualPanNumber">PAN Number</Label>
                    <Input
                      id="individualPanNumber"
                      value={formData.individualPanNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, individualPanNumber: e.target.value })
                      }
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNumber: e.target.value })
                  }
                  placeholder="Enter contact number"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Enter city"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="Enter state"
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
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Services & Contract */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Services Offered</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={formData.services.includes(service)}
                      onCheckedChange={(checked) =>
                        handleServiceChange(service, checked as boolean)
                      }
                    />
                    <Label htmlFor={service} className="text-sm">
                      {service}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractStartDate">Contract Start Date *</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={formData.contractStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractStartDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract End Date *</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractEndDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  value={formData.commissionRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commissionRate: e.target.value,
                    })
                  }
                  placeholder="Enter commission rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select
                  value={formData.paymentTerms}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentTerms: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                    <SelectItem value="Net 90">Net 90</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Advance">Advance</SelectItem>
                    <SelectItem value="On Delivery">On Delivery</SelectItem>
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
                placeholder="Enter additional details about the partnership"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploadSection
              documents={documents}
              onDocumentsChange={setDocuments}
              documentTypes={[
                { value: "Aadhar Card", label: "Aadhar Card" },
                { value: "Pan Card", label: "Pan Card" },
                { value: "Bank Account Details", label: "Bank Account Details" },
                { value: "Other", label: "Other" },
              ]}
              allowCustomName={true}
            />
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Onboarding Partner..." : "Onboard Partner"}
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
