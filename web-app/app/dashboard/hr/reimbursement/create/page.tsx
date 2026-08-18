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
import { Receipt } from "lucide-react";
import axios from "@/axios/axios";

interface Employee {
  _id: string;
  name: string;
  employeeId?: string;
  department?: string;
  designation?: string;
}

export default function CreateReimbursementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    category: "",
    amount: "",
    description: "",
    receiptDate: "",
    submissionDate: "",
    status: "pending",
    approverName: "",
    notes: "",
    receiptNumber: "",
    vendorName: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Warning",
        description: "Could not load employees list",
        variant: "destructive",
      });
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find((e) => e._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        ...formData,
        employeeName: employee.name,
        employeeId: employeeId,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employeeId) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Error",
        description: "Please select a category",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description) {
      toast({
        title: "Error",
        description: "Please provide a description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Map the category values to match backend enum
      const categoryMap: { [key: string]: string } = {
        'medical': 'Medical',
        'ipd': 'Medical',
        'medicine': 'Medical',
        'transport': 'Travel',
        'emi': 'Other',
        'certificate': 'Medical'
      };

      const response = await axios.post("/reimbursement", {
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        title: `${formData.category} Reimbursement`,
        category: categoryMap[formData.category] || 'Other',
        purpose: formData.description,
        description: formData.notes || formData.description,
        amount: parseFloat(formData.amount) || 0,
        receiptDate: formData.receiptDate || new Date().toISOString().split("T")[0],
        submissionDate:
          formData.submissionDate || new Date().toISOString().split("T")[0],
        status: formData.status,
      });

      toast({
        title: "Success",
        description: "Reimbursement request submitted successfully",
      });
      router.push("/dashboard/hr/reimbursement");
    } catch (error: any) {
      console.error("Error submitting reimbursement request:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to submit reimbursement request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Receipt className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Submit Reimbursement Request</h1>
          <p className="text-gray-600">
            Submit a new reimbursement request for approval
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeSelect">Select Employee *</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={handleEmployeeChange}
                  disabled={loadingEmployees}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingEmployees
                          ? "Loading employees..."
                          : "Select an employee"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee._id} value={employee._id}>
                        {employee.name}{" "}
                        {employee.employeeId ? `(${employee.employeeId})` : ""}
                        {employee.department ? ` - ${employee.department}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={selectedEmployee?.employeeId || formData.employeeId}
                  disabled
                  placeholder="Auto-filled"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reimbursement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">Medical/OPD</SelectItem>
                    <SelectItem value="ipd">IPD Bills</SelectItem>
                    <SelectItem value="medicine">Medicine Bills</SelectItem>
                    <SelectItem value="transport">Cab/Transport</SelectItem>
                    <SelectItem value="emi">EMI Assistance</SelectItem>
                    <SelectItem value="certificate">
                      Medical Certificate
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="5000.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiptDate">Receipt Date *</Label>
                <Input
                  id="receiptDate"
                  type="date"
                  value={formData.receiptDate}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptNumber">Receipt Number</Label>
                <Input
                  id="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, receiptNumber: e.target.value })
                  }
                  placeholder="REC-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendorName">Vendor/Hospital Name</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorName: e.target.value })
                  }
                  placeholder="ABC Hospital"
                />
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the expense"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional information"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
}
