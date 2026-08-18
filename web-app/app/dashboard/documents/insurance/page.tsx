"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import { Search, Plus, Filter, Shield, User, Calendar, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import axios from "@/axios/axios"

const insuranceStaticData = [
  {
    id: "INS-001",
    claimId: "CLM-2024-001",
    patientName: "John Doe",
    patientId: "PT001",
    policyNumber: "HDFC-12345678",
    insuranceCompany: "HDFC Ergo",
    claimAmount: 150000,
    approvedAmount: 135000,
    hospitalName: "Kokilaben Hospital",
    treatmentType: "Cardiac Surgery",
    claimDate: "2024-01-10",
    status: "Approved",
    processingDays: 7,
    documentStatus: "Complete"
  },
  {
    id: "INS-002",
    claimId: "CLM-2024-002",
    patientName: "Jane Smith",
    patientId: "PT002",
    policyNumber: "STAR-87654321",
    insuranceCompany: "Star Health",
    claimAmount: 225000,
    approvedAmount: 0,
    hospitalName: "Lilavati Hospital",
    treatmentType: "Cancer Treatment",
    claimDate: "2024-01-12",
    status: "Under Review",
    processingDays: 8,
    documentStatus: "Pending"
  },
  {
    id: "INS-003",
    claimId: "CLM-2024-003",
    patientName: "Mike Johnson",
    patientId: "PT003",
    policyNumber: "ICICI-11223344",
    insuranceCompany: "ICICI Lombard",
    claimAmount: 85000,
    approvedAmount: 85000,
    hospitalName: "Fortis Hospital",
    treatmentType: "Orthopedic Surgery",
    claimDate: "2024-01-08",
    status: "Settled",
    processingDays: 12,
    documentStatus: "Complete"
  },
  {
    id: "INS-004",
    claimId: "CLM-2024-004",
    patientName: "Sarah Wilson",
    patientId: "PT004",
    policyNumber: "BAJAJ-55667788",
    insuranceCompany: "Bajaj Allianz",
    claimAmount: 320000,
    approvedAmount: 0,
    hospitalName: "Apollo Hospital",
    treatmentType: "Neurosurgery",
    claimDate: "2024-01-14",
    status: "Rejected",
    processingDays: 5,
    documentStatus: "Incomplete"
  },
  {
    id: "INS-005",
    claimId: "CLM-2024-005",
    patientName: "David Brown",
    patientId: "PT005",
    policyNumber: "RELIANCE-99887766",
    insuranceCompany: "Reliance General",
    claimAmount: 120000,
    approvedAmount: 108000,
    hospitalName: "Max Hospital",
    treatmentType: "Gastroenterology",
    claimDate: "2024-01-09",
    status: "Approved",
    processingDays: 9,
    documentStatus: "Complete"
  }
]

const columns = [
  {
    accessorKey: "claimId",
    header: "Claim ID",
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }: any) => (
      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.getValue("patientName")}</span>
        </div>
        <div className="text-sm text-gray-500">{row.original.patientId}</div>
      </div>
    ),
  },
  {
    accessorKey: "policyNumber",
    header: "Policy",
    cell: ({ row }: any) => (
      <div>
        <div className="font-medium">{row.getValue("policyNumber")}</div>
        <div className="text-sm text-gray-500">{row.original.insuranceCompany}</div>
      </div>
    ),
  },
  {
    accessorKey: "claimAmount",
    header: "Claim Amount",
    cell: ({ row }: any) => (
      <div className="font-medium">₹{row.getValue("claimAmount").toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "approvedAmount",
    header: "Approved Amount",
    cell: ({ row }: any) => {
      const amount = row.getValue("approvedAmount")
      return (
        <div className={`font-medium ${amount > 0 ? "text-green-600" : "text-gray-400"}`}>
          {amount > 0 ? `₹${amount.toLocaleString()}` : "Pending"}
        </div>
      )
    },
  },
  {
    accessorKey: "treatmentType",
    header: "Treatment",
  },
  {
    accessorKey: "hospitalName",
    header: "Hospital",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status")
      const variant = status === "Approved" || status === "Settled" ? "default" : 
                    status === "Under Review" ? "secondary" : 
                    status === "Rejected" ? "destructive" : "outline"
      const icon = status === "Approved" || status === "Settled" ? CheckCircle : 
                  status === "Under Review" ? Clock : AlertCircle
      const IconComponent = icon
      return (
        <div className="flex items-center space-x-2">
          <IconComponent className="h-3 w-3" />
          <Badge variant={variant}>{status}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "documentStatus",
    header: "Documents",
    cell: ({ row }: any) => {
      const status = row.getValue("documentStatus")
      return <Badge variant={status === "Complete" ? "default" : "outline"}>{status}</Badge>
    },
  },
  {
    accessorKey: "claimDate",
    header: "Claim Date",
    cell: ({ row }: any) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span>{new Date(row.getValue("claimDate")).toLocaleDateString()}</span>
      </div>
    ),
  },
]

export default function InsuranceProcessPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [insurance, setInsurance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsurance()
  }, [])

  const fetchInsurance = async () => {
    try {
      const response = await axios.get("/insurance")
      setInsurance(response.data || [])
    } catch (error) {
      console.error("Error fetching insurance:", error)
      setInsurance([])
    } finally {
      setLoading(false)
    }
  }

  // Use API data
  const insuranceProcessData = insurance

  const filteredClaims = insuranceProcessData.filter(claim =>
    claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.insuranceCompany.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getClaimsByStatus = (status: string) => {
    if (status === "all") return filteredClaims
    return filteredClaims.filter(claim => claim.status.toLowerCase().includes(status.toLowerCase()))
  }

  const totalClaimAmount = insuranceProcessData.reduce((sum, claim) => sum + claim.claimAmount, 0)
  const totalApprovedAmount = insuranceProcessData.reduce((sum, claim) => sum + claim.approvedAmount, 0)
  const approvedClaims = insuranceProcessData.filter(claim => claim.status === "Approved" || claim.status === "Settled").length
  const pendingClaims = insuranceProcessData.filter(claim => claim.status === "Under Review").length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insurance Process</h1>
          <p className="text-muted-foreground">
            Manage insurance claims, policy verification, and reimbursement processes
          </p>
        </div>
        <Link href="/dashboard/documents/insurance/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Insurance Claim
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insuranceProcessData.length}</div>
            <p className="text-xs text-muted-foreground">Insurance claims</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claim Amount</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{(totalClaimAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Total claimed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(totalApprovedAmount / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">Amount approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((approvedClaims / insuranceProcessData.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Approval rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search insurance claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter by Company
        </Button>
        <Button variant="outline" size="sm">
          <Calendar className="mr-2 h-4 w-4" />
          Date Range
        </Button>
      </div>

      {/* Insurance Claims Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Claims</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="settled">Settled</TabsTrigger>
          <TabsTrigger value="review">Under Review</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Insurance Claims</CardTitle>
              <CardDescription>Complete list of insurance claims and their processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getClaimsByStatus("all")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved Claims</CardTitle>
              <CardDescription>Claims that have been approved by insurance companies</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getClaimsByStatus("approved")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settled">
          <Card>
            <CardHeader>
              <CardTitle>Settled Claims</CardTitle>
              <CardDescription>Claims that have been fully processed and settled</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getClaimsByStatus("settled")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <CardDescription>Claims currently being reviewed by insurance companies</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getClaimsByStatus("review")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Claims</CardTitle>
              <CardDescription>Claims that were rejected by insurance companies</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={getClaimsByStatus("rejected")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insurance Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Insurance Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(new Set(insuranceProcessData.map(claim => claim.insuranceCompany))).map(company => {
                const companyClaims = insuranceProcessData.filter(claim => claim.insuranceCompany === company)
                const companyTotal = companyClaims.reduce((sum, claim) => sum + claim.claimAmount, 0)
                const companyApproved = companyClaims.reduce((sum, claim) => sum + claim.approvedAmount, 0)
                const approvalRate = companyClaims.length > 0 ? 
                  Math.round((companyClaims.filter(claim => claim.status === "Approved" || claim.status === "Settled").length / companyClaims.length) * 100) : 0
                
                return (
                  <div key={company} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{company}</span>
                      <Badge variant="outline">{approvalRate}% approval</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Claims: {companyClaims.length}</span>
                      <span>Approved: ₹{(companyApproved / 100000).toFixed(1)}L</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processing Time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Processing Time</span>
                <span className="font-medium">
                  {Math.round(insuranceProcessData.reduce((sum, claim) => sum + claim.processingDays, 0) / insuranceProcessData.length)} days
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Fastest Processing</span>
                <span className="font-medium text-green-600">
                  {Math.min(...insuranceProcessData.map(claim => claim.processingDays))} days
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Slowest Processing</span>
                <span className="font-medium text-red-600">
                  {Math.max(...insuranceProcessData.map(claim => claim.processingDays))} days
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <div className="text-sm font-medium mb-2">Document Status</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Complete Documents</span>
                    <span>{insuranceProcessData.filter(claim => claim.documentStatus === "Complete").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Documents</span>
                    <span>{insuranceProcessData.filter(claim => claim.documentStatus === "Pending").length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Incomplete Documents</span>
                    <span>{insuranceProcessData.filter(claim => claim.documentStatus === "Incomplete").length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}