"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  MapPin,
  Calendar,
  UserPlus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Car,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/axios/axios";
import { Lead, LeadStatus } from "@/types/lead";
import { statusConfig } from "./lead-status-config";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LeadsTableViewProps {
  leads: Lead[];
  employees: Array<{ _id: string; name: string }>;
  selectedLeads: Set<string>;
  onSelectLead: (leadId: string, selected: boolean) => void;
  onSelectAll: () => void;
  onAssignLead: (leadId: string, employeeId: string) => Promise<void>;
  onChangeLeadStatus: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onUpdateFollowUpDate: (leadId: string, followUpAt: string | null) => Promise<void>;
  onDeleteLead: (leadId: string) => void;
  loading?: boolean;
  // Pagination props
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  // Sorting props
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

function ActionsCell({
  lead,
  onDelete,
}: {
  lead: Lead;
  onDelete: (leadId: string) => void;
}) {
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleView = () => {
    router.push(`/dashboard/leads/${lead._id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/leads/${lead._id}/edit`);
  };

  const handleBookCab = () => {
    router.push(
      `/dashboard/cabs/create?leadId=${lead._id}&patientName=${encodeURIComponent(
        lead.patientName
      )}`
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/leads/${lead._id}`);
      toast.success("Lead deleted successfully");
      onDelete(lead._id);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          {canUpdate("leads") && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleBookCab}>
            <Car className="h-4 w-4 mr-2" />
            Book Cab
          </DropdownMenuItem>
          {canDelete("leads") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Lead
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {lead.patientName}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function FollowUpDateCell({
  lead,
  onUpdateFollowUpDate,
}: {
  lead: Lead;
  onUpdateFollowUpDate: (leadId: string, followUpAt: string | null) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateValue, setDateValue] = useState("");

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Reset to the lead's current follow-up date each time the popover opens
      setDateValue(
        lead.engagement.followUpAt
          ? new Date(lead.engagement.followUpAt).toISOString().split("T")[0]
          : "",
      );
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateFollowUpDate(
        lead._id,
        dateValue ? new Date(dateValue).toISOString() : null,
      );
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleNotAvailable = async () => {
    setSaving(true);
    try {
      await onUpdateFollowUpDate(lead._id, null);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center space-x-1 hover:text-blue-600 group">
          <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
          <span className="text-sm whitespace-nowrap group-hover:underline">
            {lead.engagement.followUpAt
              ? new Date(lead.engagement.followUpAt).toLocaleDateString()
              : "Not scheduled"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
        align="start"
        onInteractOutside={(e) => {
          // Prevent the native date picker from closing the popover
          const target = e.target as HTMLElement;
          if (!target || target.tagName === "INPUT") e.preventDefault();
        }}
      >
        <p className="text-xs font-medium text-gray-700 mb-2">
          Update Follow-up Date
        </p>
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          disabled={saving}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
        />
        <div className="flex gap-2 mb-2">
          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs text-gray-500 border-dashed"
          onClick={handleNotAvailable}
          disabled={saving}
        >
          <X className="h-3 w-3 mr-1" />
          Not Available (clear date)
        </Button>
      </PopoverContent>
    </Popover>
  );
}

export function LeadsTableView({
  leads,
  employees,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  onAssignLead,
  onChangeLeadStatus,
  onUpdateFollowUpDate,
  onDeleteLead,
  loading = false,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortOrder,
  onSort,
}: LeadsTableViewProps) {
  const TABLE_COLUMNS_COUNT = 10; // Total number of table columns (increased from 9 to 10 with Description column)

  // Sortable column header helper
  function SortableHeader({ field, label }: { field: string; label: string }) {
    if (!onSort) return <>{label}</>;
    const isActive = sortBy === field;
    return (
      <button
        className="flex items-center gap-1 hover:text-gray-900 focus:outline-none group"
        onClick={() => onSort(field)}
      >
        {label}
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3 text-blue-600" />
          ) : (
            <ArrowDown className="h-3 w-3 text-blue-600" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40 group-hover:opacity-70" />
        )}
      </button>
    );
  }
  const tableColumns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            onSelectAll();
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedLeads.has(row.original._id)}
          onCheckedChange={(value) => {
            onSelectLead(row.original._id, !!value);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "patientName",
      header: "Patient Name",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 min-w-[150px]">
          <Avatar className="h-8 w-8 ring-2 ring-blue-100 flex-shrink-0">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
              {row.original.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{row.original.patientName}</div>
            <div className="text-xs text-gray-500">
              {row.original.age || 0}Y • {row.original.gender}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact.mobile",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Phone className="h-3 w-3 text-blue-500 flex-shrink-0" />
          <span className="font-mono text-sm">
            {row.original.contact.mobile || "No phone"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
          <span className="text-sm truncate">{row.original.city || "N/A"}</span>
        </div>
      ),
    },
    {
      accessorKey: "treatment",
      header: "Treatment",
      cell: ({ row }) => (
        <span className="text-sm truncate block max-w-[150px]">
          {row.original.treatment || "Not specified"}
        </span>
      ),
    },
    {
      accessorKey: "leadStatus",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.original.leadStatus];
        return (
          <div className="flex items-center gap-2 flex-wrap min-w-[200px]">
            <Badge
              variant="secondary"
              className={`text-xs capitalize whitespace-nowrap ${
                config
                  ? `${config.bgColor} ${config.color} ${config.borderColor}`
                  : ""
              }`}
            >
              {row.original.leadStatus}
            </Badge>
            <Select
              value={row.original.leadStatus}
              onValueChange={(newStatus) =>
                onChangeLeadStatus(row.original._id, newStatus as LeadStatus)
              }
            >
              <SelectTrigger className="h-7 text-xs border-gray-300 w-24">
                <SelectValue>Change</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.values(LeadStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 min-w-[150px]">
          <UserPlus className="h-3 w-3 text-purple-500 flex-shrink-0" />
          <Select
            value={row.original.assignedTo?._id || "unassigned"}
            onValueChange={(employeeId) =>
              onAssignLead(row.original._id, employeeId)
            }
          >
            <SelectTrigger className="h-7 text-xs border-gray-300 flex-1">
              <SelectValue>
                {row.original.assignedTo?.name || "Unassigned"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      accessorKey: "engagement.followUpAt",
      header: "Follow-up Date",
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
          <span className="text-sm whitespace-nowrap">
            {row.original.engagement.followUpAt
              ? new Date(row.original.engagement.followUpAt).toLocaleDateString()
              : "Not scheduled"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionsCell lead={row.original} onDelete={onDeleteLead} />
      ),
    },
  ];

  const exportToCSV = () => {
    if (!leads || leads.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Patient Name', 'Age', 'Gender', 'Contact', 'City', 'Treatment', 'Status', 'Description', 'Assigned To', 'Follow-up Date'];
    const csvHeaders = headers.join(',');
    
    const csvRows = leads.map(lead => {
      return [
        lead.patientName,
        lead.age || 0,
        lead.gender || '',
        lead.contact.mobile || '',
        lead.city || '',
        lead.treatment || '',
        lead.leadStatus,
        lead.description || '',
        lead.assignedTo?.name || 'Unassigned',
        lead.engagement.followUpAt ? new Date(lead.engagement.followUpAt).toLocaleDateString() : 'Not scheduled'
      ].map(value => {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    });
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Export button */}
      <div className="flex justify-between items-center p-4 border-b">
        <div></div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportToCSV}
          disabled={!leads || leads.length === 0}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedLeads.size > 0 && selectedLeads.size === leads.length}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="patientName" label="Patient" />
              </TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Treatment</TableHead>
              <TableHead>
                <SortableHeader field="leadStatus" label="Status" />
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <SortableHeader field="assignedTo" label="Assigned To" />
              </TableHead>
              <TableHead>
                <SortableHeader field="engagement.followUpAt" label="Follow-up" />
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length > 0 ? (
              leads.map((lead) => (
                <TableRow key={lead._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.has(lead._id)}
                      onCheckedChange={(value) => onSelectLead(lead._id, !!value)}
                      aria-label="Select row"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2 min-w-[150px]">
                      <Avatar className="h-8 w-8 ring-2 ring-blue-100 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                          {lead.patientName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{lead.patientName}</div>
                        <div className="text-xs text-gray-500">
                          {lead.age || 0}Y • {lead.gender}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="font-mono text-sm">
                        {lead.contact.mobile || "No phone"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-sm truncate">{lead.city || "N/A"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate block max-w-[150px]">
                      {lead.treatment || "Not specified"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap min-w-[200px]">
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize whitespace-nowrap ${
                          statusConfig[lead.leadStatus]
                            ? `${statusConfig[lead.leadStatus].bgColor} ${statusConfig[lead.leadStatus].color} ${statusConfig[lead.leadStatus].borderColor}`
                            : ""
                        }`}
                      >
                        {lead.leadStatus}
                      </Badge>
                      <Select
                        value={lead.leadStatus}
                        onValueChange={(newStatus) =>
                          onChangeLeadStatus(lead._id, newStatus as LeadStatus)
                        }
                      >
                        <SelectTrigger className="h-7 text-xs border-gray-300 w-24">
                          <SelectValue>Change</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(LeadStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  {/* Description column */}
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-gray-600 truncate block max-w-[140px] cursor-default">
                            {lead.description || "—"}
                          </span>
                        </TooltipTrigger>
                        {lead.description && (
                          <TooltipContent className="max-w-xs break-words">
                            {lead.description}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[150px]">
                      <UserPlus className="h-3 w-3 text-purple-500 flex-shrink-0" />
                      <Select
                        value={lead.assignedTo?._id || "unassigned"}
                        onValueChange={(employeeId) => onAssignLead(lead._id, employeeId)}
                      >
                        <SelectTrigger className="h-7 text-xs border-gray-300 flex-1">
                          <SelectValue>
                            {lead.assignedTo?.name || "Unassigned"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {employees.map((emp) => (
                            <SelectItem key={emp._id} value={emp._id}>
                              {emp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <FollowUpDateCell
                      lead={lead}
                      onUpdateFollowUpDate={onUpdateFollowUpDate}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <ActionsCell lead={lead} onDelete={onDeleteLead} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMNS_COUNT} className="h-24 text-center">
                  No leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isLoading={loading}
      />
    </div>
  );
}
