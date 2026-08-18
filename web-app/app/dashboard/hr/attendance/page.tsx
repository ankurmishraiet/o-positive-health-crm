"use client";

import { useState } from "react";
import AttendanceMarkingSheet from "@/components/hr/attendance-marking-sheet";
import AttendanceOverview from "@/components/hr/attendance-overview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">
          Mark and manage employee attendance
        </p>
      </div>
      
      <Tabs defaultValue="mark" className="w-full">
        <TabsList>
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="overview">Attendance Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="mark">
          <AttendanceMarkingSheet />
        </TabsContent>
        <TabsContent value="overview">
          <AttendanceOverview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
