"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import axios from "@/axios/axios";
import { Hospital, ContactPerson, Location } from "@/types/hospital";
import { DOCTOR_SPECIALIZATIONS } from "@/lib/constants/doctor-specializations";

export default function EditHospitalPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Hospital>>({
    name: "",
    address: "",
    phone: "",
    email: "",
    location: {
      city: "",
      state: "",
      pin: "",
      lat: 0,
      lng: 0,
    },
    type: "",
    beds: 0,
    rating: 0,
    emergencyServices: "",
    ambulanceService: false,
    laboratoryService: false,
    pharmacyService: false,
    status: "Active",
    facilities: [],
    specializations: [],
    contactPerson: {
      name: "",
      phone: "",
      email: "",
      designation: "",
    },
    website: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilityInput, setFacilityInput] = useState("");
  const [specializationInput, setSpecializationInput] = useState("");
  const [customSpecialization, setCustomSpecialization] = useState("");

  useEffect(() => {
    if (params.id) {
      fetchHospitalDetails();
    }
  }, [params.id]);

  const fetchHospitalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/hospitals/${params.id}`);
      const hospital = response.data;

      if (hospital) {
        setFormData({
          _id: hospital._id,
          name: hospital.name || "",
          address: hospital.address || "",
          phone: hospital.phone || "",
          email: hospital.email || "",
          location: hospital.location || {
            city: "",
            state: "",
            pin: "",
            lat: 0,
            lng: 0,
          },
          type: hospital.type || "",
          beds: hospital.beds || 0,
          rating: hospital.rating || 0,
          emergencyServices: hospital.emergencyServices || "",
          ambulanceService: hospital.ambulanceService || false,
          laboratoryService: hospital.laboratoryService || false,
          pharmacyService: hospital.pharmacyService || false,
          status: hospital.status || "Active",
          facilities: hospital.facilities || [],
          specializations: hospital.specializations || [],
          contactPerson: hospital.contactPerson || {
            name: "",
            phone: "",
            email: "",
            designation: "",
          },
          website: hospital.website || "",
          description: hospital.description || "",
          isActive: hospital.isActive !== undefined ? hospital.isActive : true,
        });
      }
    } catch (error) {
      console.error("Error fetching hospital details:", error);
      setError("Failed to load hospital details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof Location, value: any) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location!,
        [field]: value,
      },
    }));
  };

  const handleContactPersonChange = (
    field: keyof ContactPerson,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson!,
        [field]: value,
      },
    }));
  };

  // Check if specializations should be shown based on hospital type
  const shouldShowSpecializations = () => {
    return ["Multi-specialty", "Specialty", "Super Specialty"].includes(formData.type || "");
  };

  // Handle specialization checkbox change
  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked
        ? [...(prev.specializations || []), specialization]
        : (prev.specializations || []).filter(s => s !== specialization)
    }));
  };

  // Add custom specialization for checkbox mode
  const addCustomSpecialization = () => {
    const trimmedSpec = customSpecialization.trim();
    if (trimmedSpec && !(formData.specializations || []).includes(trimmedSpec)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), trimmedSpec]
      }));
      setCustomSpecialization("");
    }
  };

  // Remove specialization (works for both custom and standard)
  const removeSpecializationFromList = (specialization: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: (prev.specializations || []).filter(s => s !== specialization)
    }));
  };

  const addFacility = () => {
    if (
      facilityInput.trim() &&
      !formData.facilities?.includes(facilityInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...(prev.facilities || []), facilityInput.trim()],
      }));
      setFacilityInput("");
    }
  };

  const removeFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities?.filter((f) => f !== facility) || [],
    }));
  };

  const addSpecialization = () => {
    if (
      specializationInput.trim() &&
      !formData.specializations?.includes(specializationInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specializations: [
          ...(prev.specializations || []),
          specializationInput.trim(),
        ],
      }));
      setSpecializationInput("");
    }
  };

  const removeSpecialization = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations:
        prev.specializations?.filter((s) => s !== specialization) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await axios.put(`/hospitals/${params.id}`, formData);
      router.push(`/dashboard/hospitals/${params.id}`);
    } catch (error) {
      console.error("Error updating hospital:", error);
      setError("Failed to update hospital. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Hospital</h1>
            <p className="text-muted-foreground">
              Update hospital information and settings
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div className="text-red-800">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
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
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="ABC Hospital"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Hospital Type *</Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value) => handleInputChange("type", value)}
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
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+91 22 1234 5678"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="info@hospital.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Complete address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.location?.city || ""}
                  onChange={(e) => handleLocationChange("city", e.target.value)}
                  placeholder="Mumbai"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.location?.state || ""}
                  onChange={(e) =>
                    handleLocationChange("state", e.target.value)
                  }
                  placeholder="Maharashtra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN Code</Label>
                <Input
                  id="pin"
                  value={formData.location?.pin || ""}
                  onChange={(e) => handleLocationChange("pin", e.target.value)}
                  placeholder="400001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="any"
                  value={formData.location?.lat || 0}
                  onChange={(e) =>
                    handleLocationChange("lat", parseFloat(e.target.value) || 0)
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
                  value={formData.location?.lng || 0}
                  onChange={(e) =>
                    handleLocationChange("lng", parseFloat(e.target.value) || 0)
                  }
                  placeholder="72.8777"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://hospital.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "Active"}
                  onValueChange={(value) => handleInputChange("status", value)}
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
                  value={formData.beds || 0}
                  onChange={(e) =>
                    handleInputChange("beds", parseInt(e.target.value) || 0)
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
                  value={formData.rating || 0}
                  onChange={(e) =>
                    handleInputChange("rating", parseFloat(e.target.value) || 0)
                  }
                  placeholder="4.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyServices">Emergency Services</Label>
                <Select
                  value={formData.emergencyServices || ""}
                  onValueChange={(value) =>
                    handleInputChange("emergencyServices", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24/7 Available">
                      24/7 Available
                    </SelectItem>
                    <SelectItem value="Limited Hours">Limited Hours</SelectItem>
                    <SelectItem value="Not Available">Not Available</SelectItem>
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
                    checked={formData.ambulanceService || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("ambulanceService", checked)
                    }
                  />
                  <Label htmlFor="ambulanceService" className="text-sm">
                    Ambulance Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="laboratoryService"
                    checked={formData.laboratoryService || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("laboratoryService", checked)
                    }
                  />
                  <Label htmlFor="laboratoryService" className="text-sm">
                    Laboratory Service
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pharmacyService"
                    checked={formData.pharmacyService || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("pharmacyService", checked)
                    }
                  />
                  <Label htmlFor="pharmacyService" className="text-sm">
                    Pharmacy Service
                  </Label>
                </div>
              </div>
            </div>

            {shouldShowSpecializations() ? (
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
                        checked={formData.specializations?.includes(specialization) || false}
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
                {formData.specializations?.some(s => !DOCTOR_SPECIALIZATIONS.includes(s)) && (
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
                              onClick={() => removeSpecializationFromList(specialization)}
                              className="ml-2 hover:text-blue-900 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {formData.specializations && formData.specializations.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Selected: {formData.specializations.length} specialization(s)
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Specializations</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={specializationInput}
                    onChange={(e) => setSpecializationInput(e.target.value)}
                    placeholder="Add specialization"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSpecialization();
                      }
                    }}
                  />
                  <Button type="button" onClick={addSpecialization}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations?.map((specialization, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      {specialization}
                      <button
                        type="button"
                        onClick={() => removeSpecialization(specialization)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!formData.specializations ||
                    formData.specializations.length === 0) && (
                    <p className="text-sm text-muted-foreground">
                      No specializations added
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Facilities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={facilityInput}
                  onChange={(e) => setFacilityInput(e.target.value)}
                  placeholder="Add facility"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFacility();
                    }
                  }}
                />
                <Button type="button" onClick={addFacility}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.facilities?.map((facility, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-secondary px-2 py-1 rounded-md text-sm"
                  >
                    {facility}
                    <button
                      type="button"
                      onClick={() => removeFacility(facility)}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!formData.facilities || formData.facilities.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No facilities added
                  </p>
                )}
              </div>
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
                  value={formData.contactPerson?.name || ""}
                  onChange={(e) =>
                    handleContactPersonChange("name", e.target.value)
                  }
                  placeholder="Dr. John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonDesignation">Designation</Label>
                <Input
                  id="contactPersonDesignation"
                  value={formData.contactPerson?.designation || ""}
                  onChange={(e) =>
                    handleContactPersonChange("designation", e.target.value)
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
                  value={formData.contactPerson?.phone || ""}
                  onChange={(e) =>
                    handleContactPersonChange("phone", e.target.value)
                  }
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">Contact Email</Label>
                <Input
                  id="contactPersonEmail"
                  type="email"
                  value={formData.contactPerson?.email || ""}
                  onChange={(e) =>
                    handleContactPersonChange("email", e.target.value)
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
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
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
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
