"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  UserPlus,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Car,
  X,
} from "lucide-react";
import { toast } from "sonner";
import axios from "@/axios/axios";
import { Lead, LeadStatus } from "@/types/lead";
import { statusConfig } from "./lead-status-config";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface LeadCardProps {
  lead: Lead;
  isDragging?: boolean;
  onDelete?: (leadId: string) => void;
  employees?: Array<{ _id: string; name: string }>;
  onAssign?: (leadId: string, employeeId: string) => Promise<void>;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onUpdateFollowUpDate?: (leadId: string, followUpAt: string | null) => Promise<void>;
  isSelected?: boolean;
  onSelect?: (leadId: string, selected: boolean) => void;
  bulkSelectionMode?: boolean;
}

export function LeadCard({
  lead,
  isDragging,
  onDelete,
  employees = [],
  onAssign,
  onStatusChange,
  onUpdateFollowUpDate,
  isSelected = false,
  onSelect,
  bulkSelectionMode = false,
}: LeadCardProps) {
  const router = useRouter();
  const { canUpdate, canDelete } = usePermissions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [followUpPopoverOpen, setFollowUpPopoverOpen] = useState(false);
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpDateValue, setFollowUpDateValue] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: LeadStatus) => {
    const config = statusConfig[status];
    if (!config) return "bg-gray-100 text-gray-700 border-gray-200";

    return `${config.bgColor} ${config.color} ${config.borderColor}`;
  };

  const formatFollowUpDate = (engagement: Lead["engagement"]) => {
    if (engagement.followUpAt) {
      return new Date(engagement.followUpAt).toLocaleDateString();
    }
    return "Not scheduled";
  };

  const handleView = () => {
    router.push(`/dashboard/leads/${lead._id}`);
  };

  const handleEdit = () => {
    router.push(`/dashboard/leads/${lead._id}/edit`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`/leads/${lead._id}`);
      toast.success("Lead deleted successfully");
      onDelete?.(lead._id);
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAssign = async (employeeId: string) => {
    if (!onAssign) return;

    setAssigning(true);
    try {
      await onAssign(lead._id, employeeId);
    } catch (error) {
      console.error("Error assigning lead:", error);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!onStatusChange) return;

    setChangingStatus(true);
    try {
      await onStatusChange(lead._id, newStatus);
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Failed to update status");
    } finally {
      setChangingStatus(false);
    }
  };

  const handleBookCab = () => {
    router.push(
      `/dashboard/cabs/create?leadId=${
        lead._id
      }&patientName=${encodeURIComponent(lead.patientName)}`
    );
  };

  const handleFollowUpPopoverOpen = (isOpen: boolean) => {
    if (isOpen) {
      // Reset local value to current lead value when opening
      setFollowUpDateValue(
        lead.engagement.followUpAt
          ? new Date(lead.engagement.followUpAt).toISOString().split("T")[0]
          : "",
      );
    }
    setFollowUpPopoverOpen(isOpen);
  };

  const handleFollowUpDateSave = async () => {
    if (!onUpdateFollowUpDate) return;
    setSavingFollowUp(true);
    try {
      await onUpdateFollowUpDate(
        lead._id,
        followUpDateValue ? new Date(followUpDateValue).toISOString() : null,
      );
      setFollowUpPopoverOpen(false);
    } finally {
      setSavingFollowUp(false);
    }
  };

  const handleFollowUpNotAvailable = async () => {
    if (!onUpdateFollowUpDate) return;
    setSavingFollowUp(true);
    try {
      await onUpdateFollowUpDate(lead._id, null);
      setFollowUpPopoverOpen(false);
    } finally {
      setSavingFollowUp(false);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          cursor-grab active:cursor-grabbing
          ${isDragging || isSortableDragging ? "opacity-50" : ""}
        `}
      >
        <Card
          className={`
            bg-white border-l-4 border-l-gray-300
            hover:shadow-md transition-all duration-300 border
            group relative overflow-hidden
            w-full box-border
            ${isSelected ? "ring-2 ring-blue-500" : ""}
          `}
        >
          <CardContent className="p-4 relative">
            <div className="flex items-start justify-between mb-3">
              {bulkSelectionMode && (
                <div className="mr-2 pt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      onSelect?.(lead._id, checked as boolean)
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Avatar className="h-10 w-10 ring-2 ring-blue-100 flex-shrink-0">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                    {getInitials(lead.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 leading-tight truncate">
                    {lead.patientName}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {lead.age || 0}Y • {lead.gender}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3 w-3" />
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
            </div>

            {/* Status Badge and Status Change Dropdown */}
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className={`text-xs capitalize font-normal ${getStatusColor(
                  lead.leadStatus
                )}`}
              >
                {lead.leadStatus}
              </Badge>
              <div className="flex items-center text-xs">
                <RefreshCw className="w-3 h-3 mr-1 text-gray-500 flex-shrink-0" />
                <Select
                  value={lead.leadStatus}
                  onValueChange={handleStatusChange}
                  disabled={changingStatus}
                >
                  <SelectTrigger className="h-6 text-xs border-gray-300 bg-white">
                    <SelectValue>
                      {changingStatus ? "Updating..." : "Change"}
                    </SelectValue>
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
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
                <span className="font-mono truncate">
                  {lead.contact.mobile || "No phone"}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="w-3 h-3 mr-2 text-green-500 flex-shrink-0" />
                <span className="truncate">{lead.city || "No city"}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3 h-3 mr-2 text-orange-500 flex-shrink-0" />
                {onUpdateFollowUpDate ? (
                  <Popover
                    open={followUpPopoverOpen}
                    onOpenChange={handleFollowUpPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className="truncate hover:text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Next: {formatFollowUpDate(lead.engagement)}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-56 p-3"
                      align="start"
                      onInteractOutside={(e) => {
                        const target = e.target as HTMLElement;
                        if (!target || target.tagName === "INPUT")
                          e.preventDefault();
                      }}
                    >
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Update Follow-up Date
                      </p>
                      <input
                        type="date"
                        value={followUpDateValue}
                        onChange={(e) => setFollowUpDateValue(e.target.value)}
                        disabled={savingFollowUp}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2 mb-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFollowUpDateSave();
                          }}
                          disabled={savingFollowUp}
                        >
                          {savingFollowUp ? "..." : "Save"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFollowUpPopoverOpen(false);
                          }}
                          disabled={savingFollowUp}
                        >
                          Cancel
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs text-gray-500 border-dashed"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollowUpNotAvailable();
                        }}
                        disabled={savingFollowUp}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Not Available
                      </Button>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <span className="truncate">
                    Next: {formatFollowUpDate(lead.engagement)}
                  </span>
                )}
              </div>
              {employees.length > 0 && (
                <div className="flex items-center text-xs pt-1">
                  <UserPlus className="w-3 h-3 mr-2 text-purple-500 flex-shrink-0" />
                  <Select
                    value={lead.assignedTo?._id || "unassigned"}
                    onValueChange={handleAssign}
                    disabled={assigning}
                  >
                    <SelectTrigger className="h-7 text-xs border-gray-300">
                      <SelectValue>
                        {assigning
                          ? "Assigning..."
                          : lead.assignedTo?.name || "Unassigned"}
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
              )}
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-gray-800 mb-1 truncate">
                {lead.treatment || "No treatment specified"}
              </div>
              <div className="text-xs text-gray-600 truncate">
                Assigned: {lead.assignedTo?.name || "Unassigned"}
              </div>
              {lead.description && (
                <div className="flex items-start mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                  <MessageSquare className="w-3 h-3 mr-2 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-blue-700 leading-relaxed line-clamp-2 break-words">
                    {lead.description}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2 hover:bg-blue-100 border-gray-300 text-gray-700"
                  onClick={handleView}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 px-2 hover:bg-green-100 border-gray-300 text-gray-700"
                >
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
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
