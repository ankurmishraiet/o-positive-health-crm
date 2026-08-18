"use client";

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
import { toast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";
import axios from "@/axios/axios";
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants/doctor-specializations";
import { DocumentUploadSection, Document } from "@/components/ui/document-upload-section";

interface Hospital {
  _id: string;
  name: string;
  location?: {
    city?: string;
  };
}

export default function CreateDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experienceYears: "",
    qualifications: "",
    location: "",
    phone: "",
    email: "",
    consultationFee: "",
    type: "",
    hospitalIds: "",
    address: "",
    availability: "",
    languages: "",
    notes: "",
    rating: "",
    tags: "",
    registrationNumber: "",
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await axios.get("/hospitals");
      setHospitals(response.data.hospitals || []);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      toast({
        title: "Warning",
        description: "Could not load hospitals. You can still create the doctor.",
        variant: "destructive",
      });
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation with detailed messages
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Doctor name is required. Please enter the doctor's full name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.phone.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required. Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid phone number (at least 10 digits).",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.specialization) {
      toast({
        title: "Validation Error",
        description: "Specialization is required. Please select a specialization from the dropdown.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.type) {
      toast({
        title: "Validation Error",
        description: "Doctor type is required. Please select whether the doctor is With Us, Self Clinic, or Partner Hospital.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Validate experience years if provided
    if (formData.experienceYears && parseInt(formData.experienceYears) < 0) {
      toast({
        title: "Validation Error",
        description: "Experience years cannot be negative.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate consultation fee if provided
    if (formData.consultationFee && parseFloat(formData.consultationFee) < 0) {
      toast({
        title: "Validation Error",
        description: "Consultation fee cannot be negative.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate rating if provided
    if (formData.rating && (parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      toast({
        title: "Validation Error",
        description: "Rating must be between 0 and 5.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Transform form data to match backend schema
      const transformedData = {
        name: formData.name.trim(),
        specialization: formData.specialization,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim(),
        qualifications: formData.qualifications.trim() || undefined,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        languages: formData.languages ? formData.languages.split(',').map(lang => lang.trim()).filter(lang => lang) : [],
        notes: formData.notes.trim() || undefined,
        location: formData.location.trim() || undefined,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : undefined,
        type: formData.type,
        address: formData.address.trim() || undefined,
        availability: formData.availability.trim() || undefined,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        isActive: true, // Default to active
        registrationNumber: formData.registrationNumber.trim() || undefined,
        documents: documents.filter(doc => doc.documentUrl && doc.documentType), // Only include complete documents
        ...(formData.hospitalIds && { hospitalIds: [formData.hospitalIds] }),
      };

      const response = await axios.post("/doctors", transformedData);

      toast({
        title: "Success!",
        description: `Doctor "${formData.name}" has been added successfully.`,
      });
      
      // Navigate to doctor details page or list
      router.push("/dashboard/doctors");
    } catch (error: any) {
      console.error("Error adding doctor:", error);
      
      // Handle different types of errors with detailed messages
      let errorTitle = "Error";
      let errorMessage = "Failed to add doctor. Please try again.";
      
      if (error.response) {
        // Server responded with an error
        const { status, data } = error.response;
        
        if (status === 400) {
          errorTitle = "Validation Error";
          if (data.message) {
            errorMessage = data.message;
          } else if (data.errors) {
            // Handle validation errors from backend
            const errors = Object.values(data.errors)
              .map((err: any) => err.message || err)
              .join('\n• ');
            errorMessage = `Please fix the following issues:\n• ${errors}`;
          }
        } else if (status === 401) {
          errorTitle = "Authentication Error";
          errorMessage = "You are not authorized to perform this action. Please log in again.";
        } else if (status === 403) {
          errorTitle = "Permission Denied";
          errorMessage = "You don't have permission to add doctors. Please contact your administrator.";
        } else if (status === 409) {
          errorTitle = "Duplicate Entry";
          errorMessage = data.message || "A doctor with this phone number or email already exists.";
        } else if (status === 500) {
          errorTitle = "Server Error";
          errorMessage = "An error occurred on the server. Please try again later or contact support.";
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorTitle = "Network Error";
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message) {
        // Something else happened
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Stethoscope className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Add New Doctor</h1>
          <p className="text-gray-600">Add a new doctor to the network</p>
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
                  placeholder="Dr. John Doe"
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
                <Label htmlFor="experienceYears">Experience (Years)</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: e.target.value })
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  value={formData.qualifications}
                  onChange={(e) =>
                    setFormData({ ...formData, qualifications: e.target.value })
                  }
                  placeholder="MBBS, MD"
                />
              </div>
            </div>

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
                  placeholder="+91 98765 43210"
                  required
                />
                <p className="text-xs text-gray-500">Enter a valid 10-digit phone number</p>
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
                  placeholder="doctor@hospital.com"
                />
                <p className="text-xs text-gray-500">Optional: Doctor's email address</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
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
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with-us">With Us</SelectItem>
                    <SelectItem value="self-clinic">Self Clinic</SelectItem>
                    <SelectItem value="partner">Partner Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFee: e.target.value,
                    })
                  }
                  placeholder="1500"
                />
                <p className="text-xs text-gray-500">Optional: Enter consultation fee in rupees</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location/City</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Mumbai"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalIds">Hospital/Clinic</Label>
                {loadingHospitals ? (
                  <Input
                    id="hospitalIds"
                    value="Loading hospitals..."
                    disabled
                  />
                ) : hospitals.length > 0 ? (
                  <Select
                    value={formData.hospitalIds}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hospitalIds: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital) => (
                        <SelectItem key={hospital._id} value={hospital._id}>
                          {hospital.name}
                          {hospital.location?.city && ` - ${hospital.location.city}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="hospitalIds"
                    value={formData.hospitalIds}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalIds: e.target.value })
                    }
                    placeholder="No hospitals available"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Complete address"
                rows={3}
              />
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
                  placeholder="Mon-Fri 9AM-5PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  placeholder="English, Hindi, Marathi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (out of 5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  placeholder="4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="Senior Doctor, Surgeon, Consultant (comma-separated)"
                />
              </div>
            </div>

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
              <Label htmlFor="notes">Additional Details</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information about the doctor"
                rows={3}
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

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
