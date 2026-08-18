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
import { toast } from "@/hooks/use-toast";
import { Stethoscope, ChevronLeft, Save } from "lucide-react";
import axios from "@/axios/axios";
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants/doctor-specializations";
import { DocumentUploadSection, Document } from "@/components/ui/document-upload-section";

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
  qualifications?: string[];
  languages?: string[];
  bio?: string;
  address?: string;
  availability?: string;
  notes?: string;
}

export default function EditDoctorPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    qualification: "",
    location: "",
    phone: "",
    email: "",
    consultationFee: "",
    type: "",
    hospital: "",
    address: "",
    availability: "",
    languages: "",
    description: "",
    status: "",
    registrationNumber: "",
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const doctorId = params.id as string;
        const response = await axios.get(`/doctors/${doctorId}`);
        const doctorData = response.data;

        setDoctor(doctorData);

        setFormData({
          name: doctorData.name || "",
          specialization: doctorData.specialization || "",
          experience: doctorData.experienceYears?.toString() || "",
          qualification: doctorData.qualifications || "",
          location: doctorData.location || "",
          phone: doctorData.phone || "",
          email: doctorData.email || "",
          consultationFee: doctorData.consultationFee?.toString() || "",
          type: doctorData.type || "",
          hospital: "",
          address: doctorData.address || "",
          availability: doctorData.availability || "",
          languages: Array.isArray(doctorData.languages)
            ? doctorData.languages.join(", ")
            : doctorData.languages || "",
          description: doctorData.bio || doctorData.notes || "",
          status: doctorData.isActive ? "Active" : "Inactive",
          registrationNumber: doctorData.registrationNumber || "",
        });
        
        // Load documents if they exist
        if (doctorData.documents && Array.isArray(doctorData.documents)) {
          setDocuments(doctorData.documents);
        }
      } catch (error) {
        console.error("Error fetching doctor:", error);
        toast({
          title: "Error",
          description: "Failed to load doctor data",
          variant: "destructive",
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform form data to match backend schema
      const transformedData = {
        name: formData.name,
        specialization: formData.specialization,
        email: formData.email,
        phone: formData.phone,
        qualifications: formData.qualification,
        experienceYears: formData.experience
          ? parseInt(formData.experience)
          : undefined,
        languages: formData.languages
          ? formData.languages.split(",").map((lang) => lang.trim())
          : [],
        notes: formData.description,
        location: formData.location,
        consultationFee: formData.consultationFee
          ? parseFloat(formData.consultationFee)
          : undefined,
        type: formData.type,
        address: formData.address,
        availability: formData.availability,
        status: formData.status,
        bio: formData.description,
        registrationNumber: formData.registrationNumber,
        documents: documents.filter(doc => doc.documentUrl), // Only include uploaded documents
        ...(formData.hospital && { hospitalIds: [formData.hospital] }),
      };

      const doctorId = params.id as string;
      await axios.put(`/doctors/${doctorId}`, transformedData);

      toast({
        title: "Success",
        description: "Doctor updated successfully",
      });
      router.push(`/dashboard/doctors/${doctorId}`);
    } catch (error: any) {
      console.error("Error updating doctor:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update doctor",
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

  if (!doctor) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Doctor Not Found</h2>
        <p className="text-gray-600 mt-2">
          The doctor you're trying to edit doesn't exist.
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
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Edit Doctor</h1>
            <p className="text-gray-600">
              Update information for {doctor.name}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter doctor's full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(value) =>
                    setFormData({ ...formData, specialization: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {DOCTOR_SPECIALIZATIONS.map((specialization) => (
                      <SelectItem key={specialization} value={specialization}>
                        {specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years) *</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="Years of experience"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualifications *</Label>
                <Input
                  id="qualification"
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  placeholder="e.g., MBBS, MD, MS"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location/City *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter city/location"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFee: e.target.value,
                    })
                  }
                  placeholder="Enter consultation fee"
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
                placeholder="Enter complete address"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Doctor Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="With Us">With Us</SelectItem>
                    <SelectItem value="Self Clinic">Self Clinic</SelectItem>
                    <SelectItem value="Hospital">Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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
                    <SelectItem value="On Leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) =>
                    setFormData({ ...formData, availability: e.target.value })
                  }
                  placeholder="e.g., Mon-Fri 9AM-5PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages (comma separated)</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  placeholder="e.g., English, Hindi, Tamil"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) =>
                  setFormData({ ...formData, registrationNumber: e.target.value })
                }
                placeholder="Enter medical registration number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Biography/Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter doctor's biography or description"
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
                { value: "Registration Certificate", label: "Registration Certificate" },
                { value: "Other", label: "Other" },
              ]}
              allowCustomName={true}
            />
          </CardContent>
        </Card>

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
                Update Doctor
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
