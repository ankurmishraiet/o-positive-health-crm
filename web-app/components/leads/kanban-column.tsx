"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead, LeadStatus } from "@/types/lead";
import { LeadCard } from "./lead-card";
import { statusConfig } from "./lead-status-config";

interface KanbanColumnProps {
  status: string;
  leads: Lead[];
  config: (typeof statusConfig)[keyof typeof statusConfig];
  onDelete?: (leadId: string) => void;
  employees?: Array<{ _id: string; name: string }>;
  onAssign?: (leadId: string, employeeId: string) => Promise<void>;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onUpdateFollowUpDate?: (leadId: string, followUpAt: string | null) => Promise<void>;
  selectedLeads?: Set<string>;
  onSelect?: (leadId: string, selected: boolean) => void;
  bulkSelectionMode?: boolean;
}

export function KanbanColumn({
  status,
  leads,
  config,
  onDelete,
  employees,
  onAssign,
  onStatusChange,
  onUpdateFollowUpDate,
  selectedLeads,
  onSelect,
  bulkSelectionMode,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const { title, color, bgColor, borderColor, icon: Icon } = config;

  return (
    <div className="flex flex-col h-full w-[320px] flex-shrink-0">
      <Card
        ref={setNodeRef}
        className={`${bgColor} border ${borderColor} shadow-sm h-full`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-600">{leads.length} leads</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-white/80 backdrop-blur-sm text-gray-700 border-gray-200"
            >
              {leads.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 pt-0">
          <SortableContext
            items={leads.map((lead) => lead._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              {leads.map((lead) => (
                <div key={lead._id} className="animate-fade-in">
                  <LeadCard
                    lead={lead}
                    onDelete={onDelete}
                    employees={employees}
                    onAssign={onAssign}
                    onStatusChange={onStatusChange}
                    onUpdateFollowUpDate={onUpdateFollowUpDate}
                    isSelected={selectedLeads?.has(lead._id)}
                    onSelect={onSelect}
                    bulkSelectionMode={bulkSelectionMode}
                  />
                </div>
              ))}
              {leads.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    No leads in this stage
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag leads here to update their status
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}
