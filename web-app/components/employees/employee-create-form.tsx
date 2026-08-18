"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "@/hooks/use-toast";
import {
  UserPlus,
  ArrowLeft,
  User,
  Key,
  Plus,
  Trash2,
  EyeOff,
  Eye,
} from "lucide-react";
import axios from "@/axios/axios";
import {
  DocumentUploadSection,
  Document,
} from "@/components/ui/document-upload-section";

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
}

interface Increment {
  date: string;
  amount: number;
  reason: string;
  previousSalary: number;
  newSalary: number;
}

export default function CreateEmployeePageEnhanced() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [showPassword, setShowPassword] = useState(false);
  const [createCredentials, setCreateCredentials] = useState(false);
  const [increments, setIncrements] = useState<Increment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    alternateNumber: "",
    dateOfBirth: "",
    gender: "",
    fatherName: "",

    // Job Information
    designation: "",
    department: "",
    employeeId: "",
    joiningDate: "",
    dateOfEnding: "", // Previous job ending date
    experience: "",

    // Salary Information
    startingSalary: "",
    salary: "", // Current salary

    // Address Information
    addressPresent: "",
    addressPermanent: "",

    // Documents
    aadharNumber: "",
    pancardNumber: "",
    qualification: "",

    // Bank Details
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    notes: "",

    // Other
    status: "Active",
    reportsTo: "",

    // User credentials fields
    userId: "",
    password: "",
    role: "bd",
    customRole: "",
    isVerified: false,
  });

  useEffect(() => {
    fetchRoles();
    fetchEmployees();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/roles?includeSystem=true");
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      const employeeList = response.data.employees || response.data || [];
      setEmployees(
        employeeList.map((emp: any) => ({
          _id: emp._id,
          name: emp.name,
        })),
      );
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

  const addIncrement = () => {
    const currentSalary =
      parseFloat(formData.salary) || parseFloat(formData.startingSalary) || 0;
    setIncrements([
      ...increments,
      {
        date: "",
        amount: 0,
        reason: "",
        previousSalary: currentSalary,
        newSalary: currentSalary,
      },
    ]);
  };

  const removeIncrement = (index: number) => {
    setIncrements(increments.filter((_, i) => i !== index));
  };

  const updateIncrement = (
    index: number,
    field: keyof Increment,
    value: any,
  ) => {
    const updated = [...increments];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate newSalary if amount changes
    if (field === "amount" || field === "previousSalary") {
      updated[index].newSalary =
        updated[index].previousSalary + parseFloat(value || "0");
    }

    setIncrements(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.designation ||
      !formData.department
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Additional validation for credentials
    if (createCredentials) {
      if (!formData.userId || !formData.password) {
        toast({
          title: "Error",
          description: "Please fill in user credentials (User ID and Password)",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const employeeData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        alternateNumber: formData.alternateNumber,
        designation: formData.designation,
        department: formData.department,
        employeeId: formData.employeeId,
        joiningDate: formData.joiningDate,
        dateOfBirth: formData.dateOfBirth,
        dateOfEnding: formData.dateOfEnding,
        gender: formData.gender,
        fatherName: formData.fatherName,
        startingSalary: parseFloat(formData.startingSalary) || 0,
        salary:
          parseFloat(formData.salary) ||
          parseFloat(formData.startingSalary) ||
          0,
        addressPresent: formData.addressPresent,
        addressPermanent: formData.addressPermanent,
        aadharNumber: formData.aadharNumber,
        pancardNumber: formData.pancardNumber,
        qualification: formData.qualification,
        experience: formData.experience,
        status: formData.status,
        reportsTo: formData.reportsTo || null,
        increments: increments,
        createCredentials: createCredentials,
        bankDetails: {
          bankName: formData.bankName,
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          notes: formData.notes,
        },
        documents: documents.filter((doc) => doc.documentUrl), // Only include uploaded documents
      };

      if (createCredentials) {
        (employeeData as any).userData = {
          userId: formData.userId,
          password: formData.password,
          role: formData.role,
          customRole: formData.customRole || null,
          isVerified: formData.isVerified,
        };
      }

      const response = await axios.post("/employees", employeeData);

      toast({
        title: "Success",
        description: createCredentials
          ? "Employee and user credentials created successfully"
          : "Employee created successfully",
      });

      router.push("/dashboard/hr/employees");
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6 pb-10">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <UserPlus className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Create New Employee</h1>
          <p className="text-gray-600">Add a new employee to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
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
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father Name</Label>
              <Input
                id="fatherName"
                value={formData.fatherName}
                onChange={(e) =>
                  handleInputChange("fatherName", e.target.value)
                }
                placeholder="Enter father's name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Enter phone number"
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
                placeholder="Enter alternate number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressPresent">Present Address</Label>
              <Textarea
                id="addressPresent"
                value={formData.addressPresent}
                onChange={(e) =>
                  handleInputChange("addressPresent", e.target.value)
                }
                placeholder="Enter present address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressPermanent">Permanent Address</Label>
              <Textarea
                id="addressPermanent"
                value={formData.addressPermanent}
                onChange={(e) =>
                  handleInputChange("addressPermanent", e.target.value)
                }
                placeholder="Enter permanent address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) =>
                  handleInputChange("employeeId", e.target.value)
                }
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                placeholder="Enter job designation"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
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
                  <SelectItem value="Customer Service">
                    Customer Service
                  </SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Date of Joining</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) =>
                  handleInputChange("joiningDate", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfEnding">
                Date of Ending (Previous Job)
              </Label>
              <Input
                id="dateOfEnding"
                type="date"
                value={formData.dateOfEnding}
                onChange={(e) =>
                  handleInputChange("dateOfEnding", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) =>
                  handleInputChange("experience", e.target.value)
                }
                placeholder="e.g., 5 years in Sales"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
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
            <div className="space-y-2">
              <Label htmlFor="reportsTo">Reports To</Label>
              <Select
                value={formData.reportsTo}
                onValueChange={(value) => handleInputChange("reportsTo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents & Qualification */}
        <Card>
          <CardHeader>
            <CardTitle>Documents & Qualification</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qualification">Highest Qualification</Label>
              <Input
                id="qualification"
                value={formData.qualification}
                onChange={(e) =>
                  handleInputChange("qualification", e.target.value)
                }
                placeholder="e.g., MBA, B.Tech"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhar Card Number</Label>
              <Input
                id="aadharNumber"
                value={formData.aadharNumber}
                onChange={(e) =>
                  handleInputChange("aadharNumber", e.target.value)
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
                  handleInputChange("pancardNumber", e.target.value)
                }
                placeholder="Enter PAN number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingSalary">Starting Salary</Label>
              <Input
                id="startingSalary"
                type="number"
                value={formData.startingSalary}
                onChange={(e) =>
                  handleInputChange("startingSalary", e.target.value)
                }
                placeholder="Enter starting salary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Current Salary</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                placeholder="Enter current salary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Increments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Salary Increments</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIncrement}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Increment
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {increments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No increments added yet. Click "Add Increment" to add salary
                increments.
              </p>
            ) : (
              increments.map((increment, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Increment {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIncrement(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={increment.date}
                        onChange={(e) =>
                          updateIncrement(index, "date", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Previous Salary</Label>
                      <Input
                        type="number"
                        value={increment.previousSalary}
                        onChange={(e) =>
                          updateIncrement(
                            index,
                            "previousSalary",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Increment Amount</Label>
                      <Input
                        type="number"
                        value={increment.amount}
                        onChange={(e) =>
                          updateIncrement(index, "amount", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>New Salary</Label>
                      <Input
                        type="number"
                        value={increment.newSalary}
                        onChange={(e) =>
                          updateIncrement(index, "newSalary", e.target.value)
                        }
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label>Reason</Label>
                      <Input
                        value={increment.reason}
                        onChange={(e) =>
                          updateIncrement(index, "reason", e.target.value)
                        }
                        placeholder="Reason for increment"
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* User Credentials Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              User Credentials
            </CardTitle>
            <p className="text-sm text-gray-600">
              Create login credentials for this employee (optional)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="createCredentials"
                checked={createCredentials}
                onCheckedChange={(checked) =>
                  setCreateCredentials(checked as boolean)
                }
              />
              <Label
                htmlFor="createCredentials"
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Create user account for this employee
              </Label>
            </div>

            {createCredentials && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID *</Label>
                  <Input
                    id="userId"
                    value={formData.userId}
                    onChange={(e) =>
                      handleInputChange("userId", e.target.value)
                    }
                    placeholder="Enter unique user ID"
                    required={createCredentials}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter password (min 6 characters)"
                      required={createCredentials}
                      minLength={6}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role.name}>
                          {role.displayName}
                          {role.isSystemRole && (
                            <span className="text-xs text-gray-500 ml-2">
                              (System)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={formData.isVerified}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isVerified: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="isVerified">
                    Account verified (can login immediately)
                  </Label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  placeholder="Enter bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                  placeholder="Enter account name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ifscCode">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({ ...formData, ifscCode: e.target.value })
                  }
                  placeholder="Enter IFSC code"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Enter any additional notes"
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
                {
                  value: "Last Company Salary Slip",
                  label: "Last Company Salary Slip",
                },
                {
                  value: "Last Company Offer Letter",
                  label: "Last Company Offer Letter",
                },
                {
                  value: "Experience Certificate",
                  label: "Experience Certificate",
                },
                { value: "Passport Size Photo", label: "Passport Size Photo" },
                { value: "Resume", label: "Resume" },
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
            {loading ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </div>
  );
}
