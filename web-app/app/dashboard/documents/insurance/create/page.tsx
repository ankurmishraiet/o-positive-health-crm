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
import { toast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import axios from "@/axios/axios";

export default function CreateInsurancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    claimId: "",
    patientName: "",
    patientId: "",
    policyNumber: "",
    insuranceCompany: "",
    claimAmount: "",
    treatmentType: "",
    hospitalName: "",
    claimDate: "",
    status: "Under Review",
    documentStatus: "Pending",
    approvedAmount: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/insurance", {
        ...formData,
        claimAmount: parseFloat(formData.claimAmount) || 0,
        approvedAmount: parseFloat(formData.approvedAmount) || 0,
        processingDays: 0,
      });

      toast({
        title: "Success",
        description: "Insurance claim created successfully",
      });
      router.push("/dashboard/documents/insurance");
    } catch (error: any) {
      console.error("Error creating insurance claim:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create insurance claim",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">New Insurance Claim</h1>
          <p className="text-gray-600">
            Create a new insurance claim for processing
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
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
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) =>
                    setFormData({ ...formData, patientId: e.target.value })
                  }
                  placeholder="PT001"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={formData.policyNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, policyNumber: e.target.value })
                  }
                  placeholder="HDFC-12345678"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceCompany">Insurance Company *</Label>
                <Select
                  value={formData.insuranceCompany}
                  onValueChange={(value) =>
                    setFormData({ ...formData, insuranceCompany: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDFC Ergo">HDFC Ergo</SelectItem>
                    <SelectItem value="Star Health">Star Health</SelectItem>
                    <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                    <SelectItem value="Bajaj Allianz">Bajaj Allianz</SelectItem>
                    <SelectItem value="Care Health">Care Health</SelectItem>
                    <SelectItem value="Max Bupa">Max Bupa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Claim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimId">Claim ID</Label>
                <Input
                  id="claimId"
                  value={formData.claimId}
                  onChange={(e) =>
                    setFormData({ ...formData, claimId: e.target.value })
                  }
                  placeholder="CLM-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="claimDate">Claim Date *</Label>
                <Input
                  id="claimDate"
                  type="date"
                  value={formData.claimDate}
                  onChange={(e) =>
                    setFormData({ ...formData, claimDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claimAmount">Claim Amount *</Label>
                <Input
                  id="claimAmount"
                  type="number"
                  value={formData.claimAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, claimAmount: e.target.value })
                  }
                  placeholder="150000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvedAmount">Approved Amount</Label>
                <Input
                  id="approvedAmount"
                  type="number"
                  value={formData.approvedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, approvedAmount: e.target.value })
                  }
                  placeholder="135000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="treatmentType">Treatment Type</Label>
                <Input
                  id="treatmentType"
                  value={formData.treatmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, treatmentType: e.target.value })
                  }
                  placeholder="Cardiac Surgery"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) =>
                    setFormData({ ...formData, hospitalName: e.target.value })
                  }
                  placeholder="Kokilaben Hospital"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Settled">Settled</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentStatus">Document Status</Label>
                <Select
                  value={formData.documentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, documentStatus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Complete">Complete</SelectItem>
                    <SelectItem value="Incomplete">Incomplete</SelectItem>
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
                placeholder="Additional details about the claim"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Claim"}
          </Button>
        </div>
      </form>
    </div>
  );
}
