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
import { toast } from "@/hooks/use-toast";
import { UserPlus, Upload } from "lucide-react";
import axios from "@/axios/axios";

export default function AddEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    personalEmail: "",
    mobile: "",
    address: "",
    aadharCardNumber: "",
    pancardNumber: "",
    designation: "",
    department: "",
    highestQualification: "",
    previousEmployer: "",
    reportingTo: "",
    salary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Transform form data to match backend schema
      const transformedData = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender,
        email: formData.personalEmail, // personalEmail -> email
        phone: formData.mobile, // mobile -> phone
        address: formData.address,
        aadharNumber: formData.aadharCardNumber, // aadharCardNumber -> aadharNumber
        pancardNumber: formData.pancardNumber,
        previousEmployer: formData.previousEmployer,
        qualification: formData.highestQualification, // highestQualification -> qualification
        designation: formData.designation,
        reportsTo: formData.reportingTo, // reportingTo -> reportsTo
        // Additional fields from form that need to be added to backend
        department: formData.department,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      };

      const response = await axios.post("/employees", transformedData);

      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      router.push("/dashboard/hr/employees");
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <UserPlus className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Add New Employee</h1>
          <p className="text-gray-600">
            Onboard a new team member to the organization
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
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
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Enter age"
                />
              </div>
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
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalEmail">Personal Email *</Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, personalEmail: e.target.value })
                  }
                  placeholder="Enter personal email"
                  required
                />
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadharCardNumber">Aadhar Card Number</Label>
                <Input
                  id="aadharCardNumber"
                  value={formData.aadharCardNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aadharCardNumber: e.target.value,
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

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  placeholder="Enter designation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">Human Resources</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="IT">Information Technology</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Research & Development">Research & Development</SelectItem>
                    <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highestQualification">
                  Highest Qualification
                </Label>
                <Input
                  id="highestQualification"
                  value={formData.highestQualification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      highestQualification: e.target.value,
                    })
                  }
                  placeholder="Enter qualification"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousEmployer">Previous Employer</Label>
                <Input
                  id="previousEmployer"
                  value={formData.previousEmployer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      previousEmployer: e.target.value,
                    })
                  }
                  placeholder="Enter previous employer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportingTo">Reporting To</Label>
                <Input
                  id="reportingTo"
                  value={formData.reportingTo}
                  onChange={(e) =>
                    setFormData({ ...formData, reportingTo: e.target.value })
                  }
                  placeholder="Enter reporting manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                  placeholder="Enter salary amount"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Upload employee documents</p>
              <p className="text-sm text-gray-500">
                Resume, ID proofs, certificates, etc.
              </p>
              <Button variant="outline" className="mt-4 bg-transparent">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Adding Employee..." : "Add Employee"}
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
