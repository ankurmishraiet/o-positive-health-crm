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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Building2, Users, ChevronLeft, Save } from "lucide-react";
import axios from "@/axios/axios";
import { DocumentUploadSection, Document } from "@/components/ui/document-upload-section";

interface Partner {
  _id: string;
  partnerId: string;
  name: string;
  type: "Corporate" | "Individual";
  contactNumber: string;
  email?: string;
  city: string;
  services: string[];
  status: "Active" | "Inactive" | "Pending";
  contractStartDate: string;
  contractEndDate: string;
  contactPerson?: string;
  address?: string;
  notes?: string;
  businessType?: string;
  state?: string;
  commissionRate?: number;
  paymentTerms?: string;
  // Corporate specific fields
  companyName?: string;
  gstNumber?: string;
  panNumber?: string;
  registrationNumber?: string;
  companyType?: string;
  // Individual specific fields
  firstName?: string;
  lastName?: string;
  aadharNumber?: string;
  individualPanNumber?: string;
}

export default function EditPartnerPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
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
    status: "",
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
    contactPerson: "",
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

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const partnerId = params.id as string;
        const response = await axios.get(`/partners/${partnerId}`);
        const partnerData = response.data;
        setPartner(partnerData);
        
        // Populate form with existing data
        const names = partnerData.name ? partnerData.name.split(' ') : ['', ''];
        setFormData({
          name: partnerData.name || "",
          type: partnerData.type || "",
          contactNumber: partnerData.contactNumber || "",
          email: partnerData.email || "",
          address: partnerData.address || "",
          city: partnerData.city || "",
          state: partnerData.state || "",
          businessType: partnerData.businessType || "",
          status: partnerData.status || "",
          // Corporate specific
          companyName: partnerData.companyName || "",
          gstNumber: partnerData.gstNumber || "",
          panNumber: partnerData.panNumber || "",
          registrationNumber: partnerData.registrationNumber || "",
          companyType: partnerData.companyType || "",
          // Individual specific - try to split name if individual
          firstName: partnerData.type === "Individual" ? names[0] : (partnerData.firstName || ""),
          lastName: partnerData.type === "Individual" ? names.slice(1).join(' ') : (partnerData.lastName || ""),
          aadharNumber: partnerData.aadharNumber || "",
          individualPanNumber: partnerData.individualPanNumber || "",
          // Common fields
          services: partnerData.services || [],
          contractStartDate: partnerData.contractStartDate ? new Date(partnerData.contractStartDate).toISOString().split('T')[0] : "",
          contractEndDate: partnerData.contractEndDate ? new Date(partnerData.contractEndDate).toISOString().split('T')[0] : "",
          commissionRate: partnerData.commissionRate ? partnerData.commissionRate.toString() : "",
          paymentTerms: partnerData.paymentTerms || "",
          description: partnerData.notes || "",
          contactPerson: partnerData.contactPerson || "",
        });
        
        // Load documents if they exist
        if (partnerData.documents && Array.isArray(partnerData.documents)) {
          setDocuments(partnerData.documents);
        }
      } catch (error) {
        console.error("Error fetching partner:", error);
        toast({
          title: "Error",
          description: "Failed to load partner data",
          variant: "destructive",
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPartner();
  }, [params.id]);

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
        status: formData.status,
        contactPerson: formData.contactPerson,
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

      const partnerId = params.id as string;
      await axios.put(`/partners/${partnerId}`, transformedData);

      toast({
        title: "Success",
        description: "Partner updated successfully",
      });
      router.push(`/dashboard/partners/${partnerId}`);
    } catch (error: any) {
      console.error("Error updating partner:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update partner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Partner Not Found</h2>
        <p className="text-gray-600 mt-2">
          The partner you're trying to edit doesn't exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Edit Partner</h1>
            <p className="text-gray-600">
              Update information for {partner.name}
            </p>
          </div>
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
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Corporate Fields */}
            {formData.type === "Corporate" && (
              <>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </>
            )}

            {/* Individual Fields */}
            {formData.type === "Individual" && (
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
                    required={formData.type === "Individual"}
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
                    required={formData.type === "Individual"}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  type="tel"
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
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter complete address"
                rows={3}
              />
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
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Available Services</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
          </CardContent>
        </Card>

        {/* Contract Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractStartDate">Contract Start Date</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract End Date</Label>
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
                    setFormData({ ...formData, commissionRate: e.target.value })
                  }
                  placeholder="Enter commission rate"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData({ ...formData, paymentTerms: e.target.value })
                }
                placeholder="e.g., Net 30 days"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter any additional notes or information about the partner"
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

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
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
                <Save className="h-4 w-4 mr-2" />
                Update Partner
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}