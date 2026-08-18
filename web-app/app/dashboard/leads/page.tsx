"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Upload,
  User,
  Filter,
  Loader2,
  UserPlus,
  X,
  Check,
  LayoutGrid,
  Table as TableIcon,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import Link from "next/link";
import { toast } from "sonner";
import axios from "@/axios/axios";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Lead, LeadStatus } from "@/types/lead";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LeadCard } from "@/components/leads/lead-card";
import { KanbanColumn } from "@/components/leads/kanban-column";
import { LeadsTableView } from "@/components/leads/leads-table-view";
import { statusConfig } from "@/components/leads/lead-status-config";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showMyLeadsOnly, setShowMyLeadsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [employees, setEmployees] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [leadsLimit, setLeadsLimit] = useState<number>(50);
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [treatmentFilter, setTreatmentFilter] = useState<string>("all");
  const [followUpFilter, setFollowUpFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [treatments, setTreatments] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"kanban" | "table">("table");

  const [tablePageSize, setTablePageSize] = useState<number>(20);
  const [tableTotalPages, setTableTotalPages] = useState<number>(1);
  const { session } = useAuth();
  const { canCreate, isAdmin } = usePermissions();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const fetchLeads = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const params = new URLSearchParams();
        params.append("page", pageNum.toString());

        const limit = viewMode === "table" ? tablePageSize : leadsLimit;
        params.append("limit", limit.toString());

        // Server-side search
        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }
        // Server-side status filter
        if (statusFilter && statusFilter !== "all") {
          params.append("leadStatus", statusFilter);
        }
        // Server-side treatment filter
        if (treatmentFilter && treatmentFilter !== "all") {
          params.append("treatment", treatmentFilter);
        }
        // Server-side city filter
        if (cityFilter && cityFilter !== "all") {
          params.append("city", cityFilter);
        }
        // Server-side follow-up filter
        if (followUpFilter && followUpFilter !== "all") {
          params.append("followUpStatus", followUpFilter);
        }
        // Server-side assignment filter
        if (assignmentFilter === "unassigned") {
          params.append("unassigned", "true");
        } else if (assignmentFilter === "assigned") {
          params.append("assigned", "true");
        } else if (assignmentFilter !== "all") {
          params.append("assignedTo", assignmentFilter);
        }
        // Sorting
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);

        const url = `/leads?${params.toString()}`;

        const response = await axios.get(url);
        const responseData = response.data;

        const leadsData = responseData.leads || responseData || [];
        const paginationData = responseData.pagination || {
          hasMore: false,
          page: pageNum,
          total: leadsData.length,
        };

        const transformedLeads: Lead[] = leadsData.map((lead: any) => ({
          _id: lead._id,
          patientName: lead.patientName,
          age: lead.age || 0,
          gender: lead.gender || "Male",
          contact: {
            mobile: lead.contact?.mobile || "",
            email: lead.contact?.email || "",
            whatsappNumber: lead.contact?.whatsappNumber || "",
          },
          treatment: lead.treatment || "",
          city: lead.city || "",
          leadStatus: lead.leadStatus || LeadStatus.NEW,
          opdStatus: lead.opdStatus || "Pending",
          ipdStatus: lead.ipdStatus || "Not Applicable",
          engagement: {
            firstEngagement: lead.engagement?.firstEngagement,
            lastEngagement: lead.engagement?.lastEngagement,
            followUpAt: lead.engagement?.followUpAt,
            daysToClose: lead.engagement?.daysToClose,
          },
          assignedTo: lead.assignedTo
            ? {
                _id: lead.assignedTo._id || lead.assignedTo,
                name: lead.assignedTo.name || "Unknown",
              }
            : undefined,
          description: lead.description || "",
          createdBy: lead.createdBy
            ? typeof lead.createdBy === "string"
              ? { _id: lead.createdBy, name: "Unknown" }
              : {
                  _id: lead.createdBy._id || lead.createdBy,
                  name: lead.createdBy.name || "Unknown",
                }
            : undefined,
          aadharNumber: lead.aadharNumber,
          pancardNumber: lead.pancardNumber,
          createdAt: lead.createdAt,
          updatedAt: lead.updatedAt,
          address: lead.address,
          pincode: lead.pincode,
          workingProfession: lead.workingProfession,
          leadSource: lead.leadSource,
          modeOfPayment: lead.modeOfPayment,
          insuranceDetails: lead.insuranceDetails,
          documents: lead.documents,
          dob: lead.dob,
        }));

        if (append) {
          setLeads((prev) => [...prev, ...transformedLeads]);
        } else {
          setLeads(transformedLeads);
          const total = paginationData.total || transformedLeads.length;
          setTotalLeadsCount(total);
          if (viewMode === "table") {
            setTableTotalPages(Math.ceil(total / tablePageSize));
          }
        }

        setHasMore(paginationData.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching leads:", error);
        if (!append) {
          setLeads([]);
        }
        toast.error("Failed to fetch leads");
      } finally {
        if (!append) {
          setLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [
      showMyLeadsOnly,
      session?.user?._id,
      leadsLimit,
      viewMode,
      tablePageSize,
      debouncedSearch,
      statusFilter,
      treatmentFilter,
      followUpFilter,
      cityFilter,
      assignmentFilter,
      sortBy,
      sortOrder,
    ],
  );

  useEffect(() => {
    setPage(1);
    setLeads([]);
    fetchLeads(1, false);
  }, [
    showMyLeadsOnly,
    session?.user?._id,
    leadsLimit,
    viewMode,
    tablePageSize,
    debouncedSearch,
    statusFilter,
    treatmentFilter,
    followUpFilter,
    cityFilter,
    assignmentFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchEmployees();
    fetchTreatments();
    fetchCities();
  }, []);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const fetchTreatments = async () => {
    try {
      const response = await axios.get("/leads/config/form");
      setTreatments(response.data.treatments || []);
    } catch (error) {
      console.error("Error fetching treatments:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await axios.get("/leads/config/cities");
      setCities(response.data.cities || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const handleUpdateFollowUpDate = async (
    leadId: string,
    followUpAt: string | null,
  ) => {
    try {
      await axios.patch(`/leads/${leadId}`, {
        "engagement.followUpAt": followUpAt,
      });
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId
            ? {
                ...lead,
                engagement: { ...lead.engagement, followUpAt: followUpAt },
              }
            : lead,
        ),
      );
      toast.success(
        followUpAt ? "Follow-up date updated" : "Follow-up date cleared",
      );
    } catch (error) {
      console.error("Error updating follow-up date:", error);
      toast.error("Failed to update follow-up date");
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchLeads(page + 1, true);
    }
  };

  const handleAssignLead = async (leadId: string, employeeId: string) => {
    try {
      const assignToId = employeeId === "unassigned" ? null : employeeId;

      await axios.post(`/leads/${leadId}/assign`, {
        employeeId: assignToId,
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId
            ? {
                ...lead,
                assignedTo: assignToId
                  ? employees.find((emp) => emp._id === assignToId)
                  : undefined,
              }
            : lead,
        ),
      );

      toast.success(
        assignToId
          ? "Lead assigned successfully"
          : "Lead unassigned successfully",
      );
    } catch (error: any) {
      console.error("Error assigning lead:", error);
      toast.error(error.response?.data?.message || "Failed to assign lead");
    }
  };

  const handleChangeLeadStatus = async (
    leadId: string,
    newStatus: LeadStatus,
  ) => {
    const oldLead = leads.find((lead) => lead._id === leadId);
    if (!oldLead) return;

    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId ? { ...lead, leadStatus: newStatus } : lead,
      ),
    );

    try {
      await axios.patch(`/leads/${leadId}/status`, {
        leadStatus: newStatus,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId
            ? { ...lead, leadStatus: oldLead.leadStatus }
            : lead,
        ),
      );

      throw error;
    }
  };

  // Filters are now applied server-side; only "My Leads Only" is applied client-side
  // since it requires mapping the current user to their employee record
  const filteredLeads = showMyLeadsOnly
    ? leads.filter((lead) => {
        if (!session?.user?.name) return true;
        return (
          lead.assignedTo &&
          typeof lead.assignedTo === "object" &&
          lead.assignedTo.name?.toLowerCase() ===
            session.user.name.toLowerCase()
        );
      })
    : leads;

  const getLeadsForStatus = (status: LeadStatus) => {
    return filteredLeads.filter((lead) => lead.leadStatus === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
    toast.info("Dragging lead to update status...");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragging(false);

    if (!over) {
      toast.warning("Lead dropped outside any column - no changes made");
      return;
    }

    const activeId = active.id as string;
    const leadToUpdate = leads.find((lead) => lead._id === activeId);

    if (!leadToUpdate) return;

    let targetStatus: LeadStatus | null = null;

    if (Object.values(LeadStatus).includes(over.id as LeadStatus)) {
      targetStatus = over.id as LeadStatus;
    } else {
      const overCard = leads.find((lead) => lead._id === over.id);
      if (overCard && overCard.leadStatus !== leadToUpdate.leadStatus) {
        targetStatus = overCard.leadStatus;
      }
    }

    if (!targetStatus || targetStatus === leadToUpdate.leadStatus) {
      toast.info("No status change needed");
      return;
    }

    toast.loading("Updating lead status...", { id: `update-${activeId}` });

    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === activeId
          ? { ...lead, leadStatus: targetStatus as LeadStatus }
          : lead,
      ),
    );

    try {
      await axios.patch(`/leads/${activeId}/status`, {
        leadStatus: targetStatus,
      });

      toast.success("Lead status updated successfully", {
        id: `update-${activeId}`,
      });
    } catch (error) {
      console.error("Error updating lead status:", error);

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === activeId
            ? { ...lead, leadStatus: leadToUpdate.leadStatus }
            : lead,
        ),
      );

      toast.error("Failed to update lead status. Please try again.", {
        id: `update-${activeId}`,
      });
    }
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
  };

  const handleSelectLead = (leadId: string, selected: boolean) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(leadId);
      } else {
        newSet.delete(leadId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead._id)));
    }
  };

  const handleBulkAssign = async (employeeId: string) => {
    const leadIds = Array.from(selectedLeads);
    if (leadIds.length === 0) {
      toast.error("No leads selected");
      return;
    }

    try {
      toast.loading(`Assigning ${leadIds.length} leads...`, {
        id: "bulk-assign",
      });

      await Promise.all(
        leadIds.map((leadId) => handleAssignLead(leadId, employeeId)),
      );

      toast.success(`Successfully assigned ${leadIds.length} leads`, {
        id: "bulk-assign",
      });
      setSelectedLeads(new Set());
      setBulkSelectionMode(false);
    } catch (error) {
      console.error("Error bulk assigning leads:", error);
      toast.error("Failed to assign some leads", { id: "bulk-assign" });
    }
  };

  const handleCancelBulkSelection = () => {
    setSelectedLeads(new Set());
    setBulkSelectionMode(false);
  };

  const handleTablePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLeads(newPage, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTablePageSizeChange = (newPageSize: number) => {
    setTablePageSize(newPageSize);
    setPage(1);
    // fetchLeads will be called by the useEffect when tablePageSize changes
  };

  const activeLead = activeId
    ? leads.find((lead) => lead._id === activeId)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="mx-auto space-y-6 container max-w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Leads
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your healthcare leads through their journey
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(value) => {
                  if (value === "kanban" || value === "table") {
                    setViewMode(value);
                  }
                }}
              >
                <ToggleGroupItem
                  value="kanban"
                  aria-label="Kanban view"
                  className="text-xs sm:text-sm"
                >
                  <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Kanban
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="table"
                  aria-label="Table view"
                  className="text-xs sm:text-sm"
                >
                  <TableIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Table
                </ToggleGroupItem>
              </ToggleGroup>
              {isAdmin() && (
                <Link href="/dashboard/leads/upload-csv">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Upload className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Upload CSV</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                </Link>
              )}
              {canCreate("leads") && (
                <Link href="/dashboard/leads/create">
                  <Button size="sm" className="text-xs sm:text-sm">
                    <Plus className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">New Lead</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col gap-3 p-4 bg-white rounded-lg border shadow-sm">
            {/* Row 1: Search + limit + assignment + my leads + bulk */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap flex-1">
                <div className="relative w-full sm:w-auto sm:min-w-[280px]">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search leads by name, mobile, or treatment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full border-gray-300 focus:border-blue-400 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Show:
                  </span>
                  <Select
                    value={leadsLimit.toString()}
                    onValueChange={(value) => setLeadsLimit(parseInt(value))}
                  >
                    <SelectTrigger className="h-9 w-20 text-sm border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="200">200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {session?.user?.role?.toLowerCase() === "admin" && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <Select
                      value={assignmentFilter}
                      onValueChange={setAssignmentFilter}
                    >
                      <SelectTrigger className="h-9 w-full sm:w-40 text-sm border-gray-300">
                        <SelectValue placeholder="Filter by assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Leads</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp._id} value={emp._id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  variant={showMyLeadsOnly ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowMyLeadsOnly(!showMyLeadsOnly)}
                  className="h-9 border-gray-300 text-gray-700 text-xs sm:text-sm whitespace-nowrap"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Leads Only
                </Button>
                <Button
                  variant={bulkSelectionMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setBulkSelectionMode(!bulkSelectionMode)}
                  className="h-9 border-gray-300 text-gray-700 text-xs sm:text-sm whitespace-nowrap"
                >
                  <Check className="mr-2 h-4 w-4" />
                  {bulkSelectionMode ? "Exit Bulk" : "Bulk Select"}
                </Button>
              </div>
              <div className="text-sm text-gray-600 whitespace-nowrap">
                <span className="font-medium">{totalLeadsCount}</span> total
                leads
                {showMyLeadsOnly && session?.user && (
                  <span className="ml-2 text-blue-600">
                    (Assigned To: {session.user.name})
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: Status filter + Treatment filter + Follow-up filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Filters:
              </span>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-full sm:w-44 text-xs border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.values(LeadStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Treatment Filter */}
              <Select
                value={treatmentFilter}
                onValueChange={setTreatmentFilter}
              >
                <SelectTrigger className="h-8 w-full sm:w-44 text-xs border-gray-300">
                  <SelectValue placeholder="Treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Treatments</SelectItem>
                  {treatments.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* City Filter */}
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="h-8 w-full sm:w-44 text-xs border-gray-300">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Follow-up Filter */}
              <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
                <SelectTrigger className="h-8 w-full sm:w-48 text-xs border-gray-300">
                  <SelectValue placeholder="Follow-up" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Follow-ups</SelectItem>
                  <SelectItem value="pending">Pending (upcoming)</SelectItem>
                  <SelectItem value="overdue">Overdue (past due)</SelectItem>
                  <SelectItem value="no_followup">No Follow-up Set</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear all filters */}
              {(statusFilter !== "all" ||
                treatmentFilter !== "all" ||
                cityFilter !== "all" ||
                followUpFilter !== "all" ||
                assignmentFilter !== "all" ||
                debouncedSearch) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setTreatmentFilter("all");
                    setCityFilter("all");
                    setFollowUpFilter("all");
                    setAssignmentFilter("all");
                    setSearchTerm("");
                  }}
                  className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Selection Info */}
          {bulkSelectionMode && selectedLeads.size === 0 && (
            <Card className="p-3 bg-gray-50 border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-sm text-gray-600">
                  Bulk selection mode is active. Click on lead cards or use the
                  button to select all.
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8 border-gray-300 whitespace-nowrap"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Select All ({filteredLeads.length} leads)
                </Button>
              </div>
            </Card>
          )}

          {bulkSelectionMode && selectedLeads.size > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="font-medium text-blue-900">
                    {selectedLeads.size} lead{selectedLeads.size > 1 ? "s" : ""}{" "}
                    selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="h-8 border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    {selectedLeads.size === filteredLeads.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center text-sm">
                    <UserPlus className="w-4 h-4 mr-2 text-blue-600" />
                    <Select onValueChange={handleBulkAssign}>
                      <SelectTrigger className="h-8 w-full sm:w-48 text-sm border-blue-300 bg-white">
                        <SelectValue placeholder="Assign to employee" />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelBulkSelection}
                    className="h-8 text-blue-700 hover:bg-blue-100"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="overflow-x-auto min-h-[calc(100vh-24rem)]">
              <div className="flex gap-4 sm:gap-6 pb-4 min-w-max">
                {Object.entries(statusConfig).map(([status, config]) => (
                  <KanbanColumn
                    key={status}
                    status={status}
                    leads={getLeadsForStatus(status as LeadStatus)}
                    config={config}
                    onDelete={handleDeleteLead}
                    employees={employees}
                    onAssign={handleAssignLead}
                    onStatusChange={handleChangeLeadStatus}
                    onUpdateFollowUpDate={handleUpdateFollowUpDate}
                    selectedLeads={selectedLeads}
                    onSelect={handleSelectLead}
                    bulkSelectionMode={bulkSelectionMode}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="py-8 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading more leads...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <LeadsTableView
              leads={filteredLeads}
              employees={employees}
              selectedLeads={selectedLeads}
              onSelectLead={handleSelectLead}
              onSelectAll={handleSelectAll}
              onAssignLead={handleAssignLead}
              onChangeLeadStatus={handleChangeLeadStatus}
              onUpdateFollowUpDate={handleUpdateFollowUpDate}
              onDeleteLead={handleDeleteLead}
              loading={loading}
              currentPage={page}
              totalPages={tableTotalPages}
              pageSize={tablePageSize}
              totalItems={totalLeadsCount}
              onPageChange={handleTablePageChange}
              onPageSizeChange={handleTablePageSizeChange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field) => {
                if (sortBy === field) {
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                } else {
                  setSortBy(field);
                  setSortOrder("asc");
                }
              }}
            />
          )}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
