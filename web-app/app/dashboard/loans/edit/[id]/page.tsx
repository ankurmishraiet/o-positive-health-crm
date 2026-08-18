"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Phone, Mail, MapPin, CreditCard, FileText, Building2, Stethoscope, Save } from "lucide-react"
import axios from "@/axios/axios"

interface Employee {
  _id: string;
  name: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
}

export default function EditLoanApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const loanId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingLoan, setLoadingLoan] = useState(true)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    contactNumber: "",
    alternateNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dateOfBirth: "",
    
    // Loan Details
    loanAmount: "",
    loanPurpose: "",
    treatmentType: "",
    urgency: "Medium",
    hospital: "",
    doctorName: "",
    estimatedTreatmentCost: "",
    
    // Employment & Financial
    occupation: "",
    monthlyIncome: "",
    employerName: "",
    workExperience: "",
    
    // Additional Details
    leadSource: "Website",
    notes: "",
    priority: "Medium",
    assignTo: ""
  })

  useEffect(() => {
    fetchEmployees()
    fetchLoan()
  }, [loanId])

  const fetchLoan = async () => {
    try {
      setLoadingLoan(true)
      const response = await axios.get(`/loans/${loanId}`)
      const loan = response.data
      
      setFormData({
        fullName: loan.applicantDetails?.fullName || "",
        contactNumber: loan.applicantDetails?.contactNumber || "",
        alternateNumber: loan.applicantDetails?.alternateNumber || "",
        email: loan.applicantDetails?.email || "",
        address: loan.applicantDetails?.address || "",
        city: loan.applicantDetails?.city || "",
        state: loan.applicantDetails?.state || "",
        pincode: loan.applicantDetails?.pincode || "",
        dateOfBirth: loan.applicantDetails?.dateOfBirth ? new Date(loan.applicantDetails.dateOfBirth).toISOString().split('T')[0] : "",
        loanAmount: loan.amount?.toString() || "",
        loanPurpose: loan.loanPurpose || "",
        treatmentType: loan.treatmentType || "",
        urgency: loan.urgency || "Medium",
        hospital: loan.hospital || "",
        doctorName: loan.doctorName || "",
        estimatedTreatmentCost: loan.estimatedTreatmentCost?.toString() || "",
        occupation: loan.financialDetails?.occupation || "",
        monthlyIncome: loan.financialDetails?.monthlyIncome?.toString() || "",
        employerName: loan.financialDetails?.employerName || "",
        workExperience: loan.financialDetails?.workExperience || "",
        leadSource: loan.leadSource || "Website",
        notes: loan.notes || "",
        priority: loan.priority || "Medium",
        assignTo: loan.assignedTo?._id || loan.assignedTo || loan.assignTo || ""
      })
    } catch (error) {
      console.error("Error fetching loan:", error)
      toast({
        title: "Error",
        description: "Failed to load loan application",
        variant: "destructive",
      })
      router.push("/dashboard/loans")
    } finally {
      setLoadingLoan(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await axios.get("/employees")
      setEmployees(response.data || [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Warning",
        description: "Could not load employees list.",
        variant: "destructive",
      })
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const loanData = {
        amount: parseFloat(formData.loanAmount) || 0,
        loanPurpose: formData.loanPurpose,
        treatmentType: formData.treatmentType,
        urgency: formData.urgency,
        hospital: formData.hospital,
        doctorName: formData.doctorName,
        estimatedTreatmentCost: parseFloat(formData.estimatedTreatmentCost) || 0,
        applicantDetails: {
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          alternateNumber: formData.alternateNumber,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          dateOfBirth: formData.dateOfBirth,
        },
        financialDetails: {
          occupation: formData.occupation,
          monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
          employerName: formData.employerName,
          workExperience: formData.workExperience,
        },
        leadSource: formData.leadSource,
        priority: formData.priority,
        assignTo: formData.assignTo,
        assignedTo: formData.assignTo,
        assignedToName: employees.find(e => e._id === formData.assignTo)?.name,
        notes: formData.notes,
      }

      await axios.put(`/loans/${loanId}`, loanData)

      toast({
        title: "Success",
        description: "Loan application updated successfully",
      })
      router.push("/dashboard/loans")
    } catch (error: any) {
      console.error("Error updating loan:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update loan application",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingLoan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Loan Application</h1>
          <p className="text-muted-foreground">
            Update loan application details
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Form */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="loan">Loan Details</TabsTrigger>
          <TabsTrigger value="financial">Financial Info</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Basic personal details of the loan applicant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="Mobile number"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="alternateNumber">Alternate Contact</Label>
                  <Input
                    id="alternateNumber"
                    value={formData.alternateNumber}
                    onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
                    placeholder="Optional alternate number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Full address"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loan">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Loan Requirements</CardTitle>
              </div>
              <CardDescription>Details about the loan requirement and medical treatment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount Required *</Label>
                  <Input
                    id="loanAmount"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    placeholder="Amount in ₹"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedTreatmentCost">Estimated Treatment Cost</Label>
                  <Input
                    id="estimatedTreatmentCost"
                    value={formData.estimatedTreatmentCost}
                    onChange={(e) => handleInputChange('estimatedTreatmentCost', e.target.value)}
                    placeholder="Total treatment cost"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                  <Select value={formData.loanPurpose} onValueChange={(value) => handleInputChange('loanPurpose', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="treatment">Medical Treatment</SelectItem>
                      <SelectItem value="emergency">Medical Emergency</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="equipment">Medical Equipment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentType">Treatment Type/Condition</Label>
                <Input
                  id="treatmentType"
                  value={formData.treatmentType}
                  onChange={(e) => handleInputChange('treatmentType', e.target.value)}
                  placeholder="e.g., Cardiac Surgery, Cancer Treatment"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hospital">Preferred/Referred Hospital</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Building2 className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="hospital"
                      value={formData.hospital}
                      onChange={(e) => handleInputChange('hospital', e.target.value)}
                      placeholder="Hospital name"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctorName">Doctor Name</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Stethoscope className="h-4 w-4 text-gray-500" />
                    </div>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => handleInputChange('doctorName', e.target.value)}
                      placeholder="Treating doctor"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <Select value={formData.leadSource} onValueChange={(value) => handleInputChange('leadSource', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Website Inquiry</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Partner">Partner Referral</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assignTo">Assign To</Label>
                  <Select 
                    value={formData.assignTo} 
                    onValueChange={(value) => handleInputChange('assignTo', value)}
                    disabled={loadingEmployees}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select team member"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.length > 0 ? (
                        employees.map((employee) => (
                          <SelectItem key={employee._id} value={employee._id}>
                            {employee.name} {employee.employeeCode ? `(${employee.employeeCode})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="rajesh">Rajesh Sales</SelectItem>
                          <SelectItem value="priya">Priya Sales</SelectItem>
                          <SelectItem value="vikash">Vikash Sales</SelectItem>
                          <SelectItem value="neha">Neha Sales</SelectItem>
                          <SelectItem value="amit">Amit Sales</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information, special requirements, or notes..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Financial Information</CardTitle>
              </div>
              <CardDescription>Employment and income details for loan assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Select value={formData.occupation} onValueChange={(value) => handleInputChange('occupation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salaried">Salaried Employee</SelectItem>
                      <SelectItem value="business">Business Owner</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                    placeholder="Monthly income in ₹"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="employerName">Employer Name</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    placeholder="Company/organization name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience</Label>
                  <Input
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    placeholder="Years of experience"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
