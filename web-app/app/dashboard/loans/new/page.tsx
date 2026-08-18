"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Search,
  Plus,
  Filter,
  User,
  Calendar,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Upload,
  Edit,
  Trash2,
  UserPlus,
  MoreVertical,
} from "lucide-react";
import axios from "@/axios/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface Employee {
  _id: string;
  name: string;
  employeeCode?: string;
}

interface LoanLead {
  id?: string;
  _id?: string;
  leadName?: string;
  name?: string;
  contactNumber?: string;
  phone?: string;
  loanAmount?: number;
  estimatedValue?: number;
  purpose?: string;
  requirement?: string;
  hospital?: string;
  company?: string;
  status?: string;
  priority?: string;
  assignedTo?: string | Employee;
  assignedToName?: string;
  followUpDate?: string;
  leadSource?: string;
}

export default function NewLoanLeadsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<LoanLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LoanLead | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const columns = [
    {
      accessorKey: "id",
      header: "Lead ID",
    },
    {
      accessorKey: "leadName",
      header: "Lead Name",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        return (
          <div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">
                {lead.leadName || lead.name || "--"}
              </span>
            </div>
            <div className="text-sm text-gray-500 flex items-center space-x-1">
              <Phone className="h-3 w-3" />
              <span>{lead.contactNumber || lead.phone || "--"}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "loanAmount",
      header: "Loan Amount",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        const amount = lead.loanAmount || lead.estimatedValue;
        return (
          <div className="font-medium">
            {amount ? `₹${amount.toLocaleString()}` : "--"}
          </div>
        );
      },
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        return <span>{lead.purpose || lead.requirement || "--"}</span>;
      },
    },
    {
      accessorKey: "hospital",
      header: "Hospital",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        return (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{lead.hospital || lead.company || "--"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "Interested"
            ? "default"
            : status === "Contacted"
            ? "secondary"
            : status === "Not Interested"
            ? "destructive"
            : "outline";
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }: any) => {
        const priority = row.getValue("priority") as string;
        const variant =
          priority === "High"
            ? "destructive"
            : priority === "Medium"
            ? "secondary"
            : "outline";
        return <Badge variant={variant}>{priority}</Badge>;
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        const assignedTo = lead.assignedTo;
        let assignedName = "--";

        if (typeof assignedTo === "string") {
          assignedName = assignedTo;
        } else if (assignedTo && typeof assignedTo === "object") {
          assignedName = (assignedTo as Employee).name || "--";
        } else if (lead.assignedToName) {
          assignedName = lead.assignedToName;
        }

        return <span>{assignedName}</span>;
      },
    },
    {
      accessorKey: "followUpDate",
      header: "Follow Up",
      cell: ({ row }: any) => {
        const date = row.getValue("followUpDate") as string;
        return date ? (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{new Date(date).toLocaleDateString()}</span>
          </div>
        ) : (
          <span className="text-gray-400">No follow up</span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const lead = row.original as LoanLead;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAssignLead(lead)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Lead
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateLead(lead)}>
                <Edit className="mr-2 h-4 w-4" />
                Update Lead
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteLead(lead)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  useEffect(() => {
    fetchLoanLeads();
    fetchEmployees();
  }, [statusFilter]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/employees");
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    }
  };

  const fetchLoanLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/loan-leads", {
        params: {
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });
      setLeads(response.data?.loanLeads || []);
    } catch (error) {
      console.error("Error fetching loan leads:", error);
      setError("Failed to load loan leads from API. Please check connection.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLead = (lead: LoanLead) => {
    setSelectedLead(lead);

    // Extract employee ID from assignedTo field
    let currentEmployeeId = "";
    if (typeof lead.assignedTo === "string") {
      currentEmployeeId = lead.assignedTo;
    } else if (lead.assignedTo && typeof lead.assignedTo === "object") {
      currentEmployeeId = (lead.assignedTo as Employee)._id;
    }

    setSelectedEmployee(currentEmployeeId);
    setAssignDialogOpen(true);
  };

  const handleUpdateLead = (lead: LoanLead) => {
    const leadId = lead.id || lead._id;
    if (leadId) {
      router.push(`/dashboard/loans/new/create-lead?id=${leadId}`);
    } else {
      toast({
        title: "Error",
        description: "Cannot update lead: missing ID",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = (lead: LoanLead) => {
    setSelectedLead(lead);
    setDeleteDialogOpen(true);
  };

  const confirmAssign = async () => {
    if (!selectedLead || !selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select both a lead and an employee",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedEmployeeObj = employees.find(
        (e) => e._id === selectedEmployee
      );
      await axios.put(`/loan-leads/${selectedLead.id || selectedLead._id}`, {
        assignedTo: selectedEmployee,
        assignedToName: selectedEmployeeObj?.name,
      });

      toast({
        title: "Success",
        description: "Lead assigned successfully",
      });

      setAssignDialogOpen(false);
      setSelectedLead(null);
      setSelectedEmployee("");
      fetchLoanLeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign lead",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedLead) return;

    try {
      await axios.delete(`/loan-leads/${selectedLead.id || selectedLead._id}`);

      toast({
        title: "Success",
        description: "Lead deleted successfully",
      });

      setDeleteDialogOpen(false);
      setSelectedLead(null);
      fetchLoanLeads();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete lead",
        variant: "destructive",
      });
    }
  };

  const filteredLeads = leads.filter((lead: LoanLead) => {
    const searchLower = searchTerm.toLowerCase();
    const name = (lead.leadName || lead.name || "").toLowerCase();
    const phone = lead.contactNumber || lead.phone || "";
    const hospital = (lead.hospital || lead.company || "").toLowerCase();
    const purpose = (lead.purpose || lead.requirement || "").toLowerCase();

    return (
      name.includes(searchLower) ||
      phone.includes(searchTerm) ||
      hospital.includes(searchLower) ||
      purpose.includes(searchLower)
    );
  });

  const totalLeads = leads.length;
  const freshLeads = leads.filter(
    (lead: LoanLead) => (lead.status || "").toLowerCase() === "fresh"
  ).length;
  const highPriorityLeads = leads.filter(
    (lead: LoanLead) => (lead.priority || "").toLowerCase() === "high"
  ).length;
  const totalLoanAmount = leads.reduce(
    (sum: number, lead: LoanLead) =>
      sum + (lead.loanAmount || lead.estimatedValue || 0),
    0
  );

  const todayFollowUps = leads.filter(
    (lead: LoanLead) =>
      lead.followUpDate &&
      new Date(lead.followUpDate).toDateString() === new Date().toDateString()
  ).length;

  const leadSources = Array.from(
    new Set(leads.map((lead) => lead.leadSource).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">New Loan Leads</h1>
            <p className="text-gray-600">Loading loan leads...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Loan Leads</h1>
          <p className="text-muted-foreground">
            Fresh loan inquiries and lead management
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/leads/upload-csv")}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/loans/new/create-lead")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Loan Lead
          </Button>
          <Button onClick={() => router.push("/dashboard/loans/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Loan Application
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <div className="text-orange-800">
              <p className="font-medium">API Connection Issue</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLoanLeads}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Active leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fresh Leads</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {freshLeads}
            </div>
            <p className="text-xs text-muted-foreground">New inquiries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {highPriorityLeads}
            </div>
            <p className="text-xs text-muted-foreground">Urgent follow-ups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Potential Value
            </CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ₹
              {totalLoanAmount >= 1000000
                ? `${(totalLoanAmount / 1000000).toFixed(1)}M`
                : `${(totalLoanAmount / 100000).toFixed(1)}L`}
            </div>
            <p className="text-xs text-muted-foreground">Total loan amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "fresh" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("fresh")}
        >
          <Filter className="mr-2 h-4 w-4" />
          Fresh
        </Button>
        <Button
          variant={statusFilter === "contacted" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("contacted")}
        >
          Contacted
        </Button>
        <Button
          variant={statusFilter === "interested" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("interested")}
        >
          Interested
        </Button>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Loan Lead Pipeline</CardTitle>
          <CardDescription>Track and manage new loan inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredLeads} />
        </CardContent>
      </Card>

      {/* Quick Actions & Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leadSources.length > 0 ? (
                leadSources.map((source) => {
                  const sourceLeads = leads.filter(
                    (lead) => lead.leadSource === source
                  );
                  const sourceValue = sourceLeads.reduce(
                    (sum, lead) =>
                      sum + (lead.loanAmount || lead.estimatedValue || 0),
                    0
                  );

                  return (
                    <div
                      key={source}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <span className="text-sm font-medium">{source}</span>
                        <div className="text-xs text-gray-500">
                          {sourceLeads.length} leads
                        </div>
                      </div>
                      <span className="font-medium">
                        ₹
                        {sourceValue >= 100000
                          ? `${(sourceValue / 100000).toFixed(1)}L`
                          : sourceValue.toLocaleString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No lead source data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Fresh leads to contact</span>
                <Badge variant="default">{freshLeads}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Follow-ups scheduled</span>
                <Badge variant="secondary">{todayFollowUps}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">High priority leads</span>
                <Badge variant="destructive">{highPriorityLeads}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead</DialogTitle>
            <DialogDescription>
              Assign{" "}
              {selectedLead?.leadName || selectedLead?.name || "this lead"} to
              an employee
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id}>
                      {emp.name}{" "}
                      {emp.employeeCode ? `(${emp.employeeCode})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAssign} disabled={!selectedEmployee}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              {selectedLead?.leadName || selectedLead?.name || "this lead"}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
