"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ChevronLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  MapPin,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  FileText,
  CreditCard,
  ExternalLink
} from "lucide-react"
import { format, differenceInMonths } from "date-fns"
import axios from "@/axios/axios"
import { usePermissions } from "@/hooks/use-permissions"

interface Employee {
  _id: string
  employeeId: string
  name: string
  designation: string
  department: string
  phone: string
  email?: string
  status: string
  joiningDate?: string
  reportingTo?: string
  address?: string
  salary?: number
  hasAccount?: boolean
  userId?: {
    _id: string
    userId: string
    role: string
  }
  // New fields
  dateOfBirth?: string
  dateOfEnding?: string
  gender?: string
  fatherName?: string
  alternateNumber?: string
  addressPresent?: string
  addressPermanent?: string
  startingSalary?: number
  increments?: {
    date: string
    amount: number
    reason?: string
    previousSalary?: number
    newSalary?: number
  }[]
  aadharNumber?: string
  pancardNumber?: string
  qualification?: string
  experience?: string
  systemAgeMonths?: number
  bankDetails?: {
    bankName?: string
    accountName?: string
    accountNumber?: string
    ifscCode?: string
    notes?: string
  }
  documents?: {
    documentType: string
    documentName?: string
    documentUrl: string
    uploadedDate?: string
  }[]
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canUpdate, canDelete } = usePermissions()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployee()
  }, [params.id])

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`/employees/${params.id}`)
      setEmployee(response.data)
    } catch (error) {
      console.error("Error fetching employee:", error)
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/hr/employees/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/employees/${params.id}`)
        router.push("/dashboard/hr/employees")
      } catch (error) {
        console.error("Error deleting employee:", error)
        alert("Failed to delete employee")
      }
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd MMM yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const calculateSystemAge = (joiningDate?: string, systemAgeMonths?: number) => {
    if (systemAgeMonths !== undefined) {
      const years = Math.floor(systemAgeMonths / 12);
      const months = systemAgeMonths % 12;
      return years > 0 ? `${years} years ${months} months` : `${months} months`;
    }
    if (!joiningDate) return "N/A";
    try {
      const months = differenceInMonths(new Date(), new Date(joiningDate));
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return years > 0 ? `${years} years ${remainingMonths} months` : `${remainingMonths} months`;
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Employee Not Found</h2>
        <p className="text-gray-600 mt-2">The employee profile you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "On Leave":
        return "bg-yellow-100 text-yellow-800"
      case "Inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Employee Profile</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Detailed information about {employee.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {canUpdate("employees") && (
            <Button onClick={handleEdit} size="sm" className="sm:size-default">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete("employees") && (
            <Button variant="destructive" onClick={handleDelete} size="sm" className="sm:size-default">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Employee Profile Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarFallback className="text-xl sm:text-2xl">{employee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold break-words">{employee.name}</h2>
                <Badge className={getStatusColor(employee.status)}>{employee.status}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-2 min-w-0">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium flex-shrink-0">Employee ID:</span>
                  <span className="truncate">{employee.employeeId}</span>
                </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium flex-shrink-0">Designation:</span>
                  <span className="truncate">{employee.designation}</span>
                </div>
                <div className="flex items-center space-x-2 min-w-0">
                  <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium flex-shrink-0">Department:</span>
                  <span className="truncate">{employee.department}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <span className="font-medium text-sm">Date of Birth:</span>
              <p className="text-gray-600 break-words">{formatDate(employee.dateOfBirth)}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Gender:</span>
              <p className="text-gray-600 break-words">{employee.gender || "N/A"}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Father's Name:</span>
              <p className="text-gray-600 break-words">{employee.fatherName || "N/A"}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Qualification:</span>
              <p className="text-gray-600 break-words">{employee.qualification || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <span className="font-medium text-sm">Phone:</span>
              <p className="text-gray-600 break-words">{employee.phone}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Alternate Number:</span>
              <p className="text-gray-600 break-words">{employee.alternateNumber || "N/A"}</p>
            </div>
            {employee.email && (
              <div className="min-w-0">
                <span className="font-medium text-sm">Email:</span>
                <p className="text-gray-600 break-words break-all">{employee.email}</p>
              </div>
            )}
            {employee.addressPresent && (
              <div className="md:col-span-2 min-w-0">
                <span className="font-medium text-sm">Present Address:</span>
                <p className="text-gray-600 break-words">{employee.addressPresent}</p>
              </div>
            )}
            {employee.addressPermanent && (
              <div className="md:col-span-2 min-w-0">
                <span className="font-medium text-sm">Permanent Address:</span>
                <p className="text-gray-600 break-words">{employee.addressPermanent}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-w-0">
              <span className="font-medium text-sm">Date of Joining:</span>
              <p className="text-gray-600 break-words">{formatDate(employee.joiningDate)}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">System Age:</span>
              <p className="text-gray-600 break-words">
                {calculateSystemAge(employee.joiningDate, employee.systemAgeMonths)}
              </p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Date of Ending (Previous Job):</span>
              <p className="text-gray-600 break-words">{formatDate(employee.dateOfEnding)}</p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Experience:</span>
              <p className="text-gray-600 break-words">{employee.experience || "N/A"}</p>
            </div>
            {employee.reportingTo && (
              <div className="min-w-0">
                <span className="font-medium text-sm">Reporting To:</span>
                <p className="text-gray-600 break-words">{employee.reportingTo}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Salary Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="min-w-0">
              <span className="font-medium text-sm">Starting Salary:</span>
              <p className="text-gray-600 text-lg font-semibold break-words">
                {formatCurrency(employee.startingSalary)}
              </p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Current Salary:</span>
              <p className="text-gray-600 text-lg font-semibold break-words">
                {formatCurrency(employee.salary)}
              </p>
            </div>
            <div className="min-w-0">
              <span className="font-medium text-sm">Total Increments:</span>
              <p className="text-gray-600 text-lg font-semibold break-words">
                {employee.increments?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Increment History */}
      {employee.increments && employee.increments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Increment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employee.increments.map((increment, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="min-w-0">
                      <span className="font-medium text-sm">Date:</span>
                      <p className="text-gray-600 break-words">{formatDate(increment.date)}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">Previous Salary:</span>
                      <p className="text-gray-600 break-words">{formatCurrency(increment.previousSalary)}</p>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">Increment Amount:</span>
                      <p className="text-green-600 font-semibold break-words">
                        +{formatCurrency(increment.amount)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">New Salary:</span>
                      <p className="text-gray-600 font-semibold break-words">
                        {formatCurrency(increment.newSalary)}
                      </p>
                    </div>
                    {increment.reason && (
                      <div className="sm:col-span-2 lg:col-span-4 min-w-0">
                        <span className="font-medium text-sm">Reason:</span>
                        <p className="text-gray-600 break-words">{increment.reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Details */}
      {employee.bankDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <span className="font-medium text-sm">Bank Name:</span>
                <p className="text-gray-600 break-words">{employee.bankDetails.bankName || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Account Name:</span>
                <p className="text-gray-600 break-words">{employee.bankDetails.accountName || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Account Number:</span>
                <p className="text-gray-600 font-mono break-words">{employee.bankDetails.accountNumber || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">IFSC Code:</span>
                <p className="text-gray-600 font-mono break-words">{employee.bankDetails.ifscCode || "N/A"}</p>
              </div>
              {employee.bankDetails.notes && (
                <div className="md:col-span-2 min-w-0">
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-gray-600 break-words">{employee.bankDetails.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <span className="font-medium text-sm">Aadhar Card Number:</span>
                <p className="text-gray-600 font-mono break-words">{employee.aadharNumber || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">PAN Card Number:</span>
                <p className="text-gray-600 font-mono break-words">{employee.pancardNumber || "N/A"}</p>
              </div>
            </div>

            {employee.documents && employee.documents.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-sm mb-3">Uploaded Documents</h4>
                <div className="space-y-2">
                  {employee.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm break-words">{doc.documentType}</p>
                          {doc.documentName && (
                            <p className="text-xs text-gray-500 break-words">{doc.documentName}</p>
                          )}
                          {doc.uploadedDate && (
                            <p className="text-xs text-gray-400">
                              Uploaded: {format(new Date(doc.uploadedDate), "dd MMM yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                        className="flex-shrink-0 ml-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!employee.documents || employee.documents.length === 0) && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information - Always show this section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employee.hasAccount && employee.userId ? (
            <div className="space-y-4">
              <div className="min-w-0">
                <span className="font-medium text-sm">User ID:</span>
                <p className="text-gray-600 font-mono break-words">{employee.userId.userId}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Role:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="capitalize">
                    {employee.userId.role}
                  </Badge>
                </div>
              </div>
              <div className="pt-2 min-w-0">
                <p className="text-sm text-muted-foreground break-words">
                  ✓ This employee has an active account and can log in to the system.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800 break-words">
                  ⚠️ This employee does not have a user account. Create an account to give them system access.
                </p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Account Status:</span>
                <div className="mt-1">
                  <Badge variant="outline" className="bg-gray-100">
                    No Account
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}