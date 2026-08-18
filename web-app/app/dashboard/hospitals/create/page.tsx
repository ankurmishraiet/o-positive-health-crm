"use client";

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
import { Building2 } from "lucide-react";
import axios from "@/axios/axios";
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants/doctor-specializations";

export default function CreateHospitalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    city: "",
    state: "",
    pin: "",
    lat: "",
    lng: "",
    type: "",
    beds: "",
    rating: "",
    emergencyServices: "",
    ambulanceService: false,
    laboratoryService: false,
    pharmacyService: false,
    status: "Active",
    contactPersonName: "",
    contactPersonPhone: "",
    contactPersonEmail: "",
    contactPersonDesignation: "",
    website: "",
    description: "",
    facilities: "",
    specializations: [] as string[],
  });

  // Check if specializations should be shown based on hospital type
  const shouldShowSpecializations = () => {
    return ["Multi-specialty", "Specialty", "Super Specialty"].includes(formData.type);
  };

  // Handle specialization checkbox change
  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked
        ? [...prev.specializations, specialization]
        : prev.specializations.filter(s => s !== specialization)
    }));
  };

  // Add custom specialization
  const addCustomSpecialization = () => {
    const trimmedSpec = customSpecialization.trim();
    if (trimmedSpec && !formData.specializations.includes(trimmedSpec)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, trimmedSpec]
      }));
      setCustomSpecialization("");
      toast({
        title: "Success",
        description: `Added "${trimmedSpec}" to specializations`,
      });
    } else if (formData.specializations.includes(trimmedSpec)) {
      toast({
        title: "Already exists",
        description: "This specialization is already selected",
        variant: "destructive",
      });
    }
  };

  // Remove custom specialization
  const removeSpecialization = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(s => s !== specialization)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform form data to match backend schema
      const transformedData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        // Location Information
        location: {
          city: formData.city,
          state: formData.state,
          pin: formData.pin,
          lat: formData.lat ? parseFloat(formData.lat) : undefined,
          lng: formData.lng ? parseFloat(formData.lng) : undefined,
        },
        // Hospital Details
        type: formData.type,
        beds: parseInt(formData.beds) || 0,
        rating: parseFloat(formData.rating) || 0,
        // Services
        emergencyServices: formData.emergencyServices,
        ambulanceService: formData.ambulanceService,
        laboratoryService: formData.laboratoryService,
        pharmacyService: formData.pharmacyService,
        // Partnership Details
        partnerSince: new Date(),
        status: formData.status,
        // Contact Person
        contactPerson: {
          name: formData.contactPersonName,
          phone: formData.contactPersonPhone,
          email: formData.contactPersonEmail,
          designation: formData.contactPersonDesignation,
        },
        // Additional Information
        website: formData.website,
        description: formData.description,
        facilities: formData.facilities
          ? formData.facilities.split(",").map((f) => f.trim())
          : [],
        specializations: formData.specializations,
        isActive: true,
      };

      await axios.post("/hospitals", transformedData);

      toast({
        title: "Success",
        description: "Hospital added successfully",
      });
      router.push("/dashboard/hospitals");
    } catch (error: any) {
      console.error("Error adding hospital:", error);

      let errorTitle = "Error";
      let errorMessage = "Failed to add hospital. Please try again.";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          errorTitle = "Validation Error";
          errorMessage = data.message || "Please check the form fields and try again.";
        } else if (status === 401) {
          errorTitle = "Session Expired";
          errorMessage = "Your session has expired. Please log in again.";
        } else if (status === 403) {
          errorTitle = "Permission Denied";
          errorMessage = "You don't have permission to add hospitals. Please contact your administrator.";
        } else if (status === 409) {
          errorTitle = "Duplicate Entry";
          errorMessage = data.message || "A hospital with these details already exists.";
        } else if (status === 500) {
          errorTitle = "Server Error";
          errorMessage = "An error occurred on the server. Please try again later or contact support.";
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorTitle = "Network Error";
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.message) {
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
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Add New Hospital</h1>
          <p className="text-gray-600">
            Add a new partner hospital to the network
          </p>
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
                <Label htmlFor="name">Hospital Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ABC Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Hospital Type *</Label>
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
                    <SelectItem value="Multi-specialty">
                      Multi-specialty
                    </SelectItem>
                    <SelectItem value="Specialty">
                      Specialty Hospital
                    </SelectItem>
                    <SelectItem value="General">General Hospital</SelectItem>
                    <SelectItem value="Super Specialty">
                      Super Specialty
                    </SelectItem>
                    <SelectItem value="Teaching">Teaching Hospital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 22 1234 5678"
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
                  placeholder="info@hospital.com"
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
                  placeholder="Mumbai"
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
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
                  }
                  placeholder="400001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({ ...formData, lat: e.target.value })
                  }
                  placeholder="19.0760"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData({ ...formData, lng: e.target.value })
                  }
                  placeholder="72.8777"
                />
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
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://hospital.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Partnership Status</Label>
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
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds">Number of Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={formData.beds}
                  onChange={(e) =>
                    setFormData({ ...formData, beds: e.target.value })
                  }
                  placeholder="500"
                />
              </div>
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
                <Label htmlFor="emergencyServices">Emergency Services</Label>
                <Select
                  value={formData.emergencyServices}
                  onValueChange={(value) =>
                    setFormData({ ...formData, emergencyServices: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Additional Services</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ambulanceService"
                    checked={formData.ambulanceService}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        ambulanceService: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="ambulanceService" className="text-sm">
                    Ambulance Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="laboratoryService"
                    checked={formData.laboratoryService}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        laboratoryService: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="laboratoryService" className="text-sm">
                    Laboratory Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pharmacyService"
                    checked={formData.pharmacyService}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        pharmacyService: checked as boolean,
                      })
                    }
                  />
                  <Label htmlFor="pharmacyService" className="text-sm">
                    Pharmacy Service
                  </Label>
                </div>
              </div>
            </div>

            {shouldShowSpecializations() && (
              <div className="space-y-3">
                <Label>Specializations *</Label>
                <p className="text-sm text-gray-600">
                  Select the medical specializations available at this hospital
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto border rounded-md p-4">
                  {DOCTOR_SPECIALIZATIONS.map((specialization) => (
                    <div key={specialization} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${specialization}`}
                        checked={formData.specializations.includes(specialization)}
                        onCheckedChange={(checked) =>
                          handleSpecializationChange(specialization, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`spec-${specialization}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {specialization}
                      </Label>
                    </div>
                  ))}
                </div>
                
                {/* Add custom specialization */}
                <div className="space-y-2 mt-4">
                  <Label className="text-sm font-medium">Add Custom Specialization</Label>
                  <p className="text-xs text-gray-500">
                    Can't find a specialization? Add it here
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={customSpecialization}
                      onChange={(e) => setCustomSpecialization(e.target.value)}
                      placeholder="Enter custom specialization"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomSpecialization();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={addCustomSpecialization}
                      disabled={!customSpecialization.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Display custom specializations separately */}
                {formData.specializations.some(s => !DOCTOR_SPECIALIZATIONS.includes(s)) && (
                  <div className="space-y-2 mt-3">
                    <Label className="text-sm font-medium">Custom Specializations</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.specializations
                        .filter(s => !DOCTOR_SPECIALIZATIONS.includes(s))
                        .map((specialization, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {specialization}
                            <button
                              type="button"
                              onClick={() => removeSpecialization(specialization)}
                              className="ml-2 hover:text-blue-900 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {formData.specializations.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected: {formData.specializations.length} specialization(s)
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="facilities">Facilities</Label>
              <Input
                id="facilities"
                value={formData.facilities}
                onChange={(e) =>
                  setFormData({ ...formData, facilities: e.target.value })
                }
                placeholder="ICU, CCU, OT, Blood Bank (comma-separated)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Person Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Person</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Person Name</Label>
                <Input
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPersonName: e.target.value,
                    })
                  }
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonDesignation">Designation</Label>
                <Input
                  id="contactPersonDesignation"
                  value={formData.contactPersonDesignation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPersonDesignation: e.target.value,
                    })
                  }
                  placeholder="Chief Medical Officer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonPhone">Contact Phone</Label>
                <Input
                  id="contactPersonPhone"
                  value={formData.contactPersonPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPersonPhone: e.target.value,
                    })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">Contact Email</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  value={formData.contactPersonEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPersonEmail: e.target.value,
                    })
                  }
                  placeholder="contact@hospital.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description about the hospital"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Hospital"}
          </Button>
        </div>
      </form>
    </div>
  );
}
