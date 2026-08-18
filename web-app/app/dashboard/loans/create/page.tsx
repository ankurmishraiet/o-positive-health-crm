"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Phone, Mail, MapPin, CreditCard, FileText, Building2, Stethoscope, Save, Send, Search } from "lucide-react"
import axios from "@/axios/axios"

interface Employee {
  _id: string;
  name: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
}

interface Patient {
  _id: string;
  patientId: string;
  patientName: string;
  age?: number;
  gender?: string;
  contact?: {
    mobile?: string;
    email?: string;
    whatsappNumber?: string;
  };
  city?: string;
  address?: string;
  pincode?: string;
  dob?: string;
  treatment?: string;
}

export default function CreateNewLoanLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchingPatients, setSearchingPatients] = useState(false)
  const [patientSearchQuery, setPatientSearchQuery] = useState("")
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
    officeBusinessAddress: "",
    officeBusinessPincode: "",
    
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
    isSalaryCreditedInBank: false,
    isPatientFilingITR: false,
    
    // Additional Details
    leadSource: "Website",
    notes: "",
    priority: "Medium",
    assignTo: ""
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await axios.get("/employees")
      setEmployees(response.data || [])
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Warning",
        description: "Could not load employees list. Using default options.",
        variant: "destructive",
      })
    } finally {
      setLoadingEmployees(false)
    }
  }

  const searchPatients = async () => {
    if (!patientSearchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient ID or name to search",
        variant: "destructive"
      })
      return
    }

    try {
      setSearchingPatients(true)
      const response = await axios.get(`/patients/search?q=${encodeURIComponent(patientSearchQuery)}&limit=10`)
      setPatients(response.data || [])
      
      if (!response.data || response.data.length === 0) {
        toast({
          title: "No results",
          description: "No patients found matching your search",
        })
      }
    } catch (error) {
      console.error("Error searching patients:", error)
      toast({
        title: "Error",
        description: "Failed to search patients",
        variant: "destructive"
      })
    } finally {
      setSearchingPatients(false)
    }
  }

  const selectPatient = (patient: Patient) => {
    // Auto-fill personal information from patient record
    setFormData({
      ...formData,
      fullName: patient.patientName || "",
      contactNumber: patient.contact?.mobile || "",
      email: patient.contact?.email || "",
      address: patient.address || "",
      city: patient.city || "",
      pincode: patient.pincode || "",
      dateOfBirth: patient.dob ? patient.dob.split('T')[0] : "",
      treatmentType: patient.treatment || "",
    })

    setShowPatientSearch(false)
    setPatientSearchQuery("")
    setPatients([])

    toast({
      title: "Patient Selected",
      description: `Information auto-filled for ${patient.patientName}`,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (action: 'save' | 'submit') => {
    setLoading(true)
    
    try {
      const loanData = {
        leadId: null,
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
          officeBusinessAddress: formData.officeBusinessAddress,
          officeBusinessPincode: formData.officeBusinessPincode,
        },
        financialDetails: {
          occupation: formData.occupation,
          monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
          employerName: formData.employerName,
          workExperience: formData.workExperience,
          isSalaryCreditedInBank: formData.isSalaryCreditedInBank,
          isPatientFilingITR: formData.isPatientFilingITR,
        },
        leadSource: formData.leadSource,
        priority: formData.priority,
        assignTo: formData.assignTo,
        assignedTo: formData.assignTo,
        assignedToName: employees.find(e => e._id === formData.assignTo)?.name,
        notes: formData.notes,
        status: action === 'save' ? 'New' : 'Processing'
      }

      const response = await axios.post("/loans", loanData)

      toast({
        title: "Success",
        description: action === 'save' 
          ? "Loan application saved as draft successfully" 
          : "Loan application submitted successfully",
      })
      router.push("/dashboard/loans");
    } catch (error: any) {
      console.error("Error creating loan:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create loan application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Loan Application</h1>
          <p className="text-muted-foreground">
            Add a new loan application and initiate the approval process
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleSubmit('save')} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save as Draft"}
          </Button>
          <Button onClick={() => handleSubmit('submit')} disabled={loading}>
            <Send className="mr-2 h-4 w-4" />
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Personal Information</CardTitle>
                </div>
                <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search Patient
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Search Patient</DialogTitle>
                      <DialogDescription>
                        Search by Patient ID or Name to auto-fill information
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter Patient ID or Name..."
                          value={patientSearchQuery}
                          onChange={(e) => setPatientSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && searchPatients()}
                        />
                        <Button onClick={searchPatients} disabled={searchingPatients}>
                          <Search className="h-4 w-4 mr-2" />
                          {searchingPatients ? "Searching..." : "Search"}
                        </Button>
                      </div>

                      {patients.length > 0 && (
                        <div className="space-y-2">
                          <Label>Select Patient:</Label>
                          <div className="border rounded-md divide-y max-h-96 overflow-y-auto">
                            {patients.map((patient) => (
                              <div
                                key={patient._id}
                                className="p-4 hover:bg-gray-50 cursor-pointer"
                                onClick={() => selectPatient(patient)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{patient.patientName}</p>
                                    <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                                    {patient.contact?.mobile && (
                                      <p className="text-sm text-gray-500">Mobile: {patient.contact.mobile}</p>
                                    )}
                                    {patient.city && (
                                      <p className="text-sm text-gray-500">City: {patient.city}</p>
                                    )}
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    Select
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="ml-2 text-sm">+91</span>
                    </div>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternateNumber">Alternate Number</Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="ml-2 text-sm">+91</span>
                    </div>
                    <Input
                      id="alternateNumber"
                      value={formData.alternateNumber}
                      onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
                      placeholder="Alternate contact"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
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

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
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
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="karnataka">Karnataka</SelectItem>
                      <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="gujarat">Gujarat</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="officeBusinessAddress">Office / Business Address</Label>
                <Textarea
                  id="officeBusinessAddress"
                  value={formData.officeBusinessAddress}
                  onChange={(e) => handleInputChange('officeBusinessAddress', e.target.value)}
                  placeholder="Enter office or business address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeBusinessPincode">Office / Business PIN Code</Label>
                <Input
                  id="officeBusinessPincode"
                  value={formData.officeBusinessPincode}
                  onChange={(e) => handleInputChange('officeBusinessPincode', e.target.value)}
                  placeholder="6-digit pincode"
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
                      <SelectItem value="Medical Treatment in our Hospital">Medical Treatment in our Hospital</SelectItem>
                      <SelectItem value="Medical Treatment in some other Hospital">Medical Treatment in some other Hospital</SelectItem>
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
                  <Label htmlFor="employerName">Employer Name/Business Name</Label>
                  <Input
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => handleInputChange('employerName', e.target.value)}
                    placeholder="Company or business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workExperience">Work Experience (Years)</Label>
                  <Input
                    id="workExperience"
                    value={formData.workExperience}
                    onChange={(e) => handleInputChange('workExperience', e.target.value)}
                    placeholder="Years of experience"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSalaryCreditedInBank"
                    checked={formData.isSalaryCreditedInBank}
                    onCheckedChange={(checked) => handleInputChange('isSalaryCreditedInBank', checked as any)}
                  />
                  <Label htmlFor="isSalaryCreditedInBank" className="cursor-pointer">
                    Is salary credited in bank?
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPatientFilingITR"
                    checked={formData.isPatientFilingITR}
                    onCheckedChange={(checked) => handleInputChange('isPatientFilingITR', checked as any)}
                  />
                  <Label htmlFor="isPatientFilingITR" className="cursor-pointer">
                    Is patient filing ITR (Income Tax Return)?
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}