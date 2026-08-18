"use client";

import { useState, useEffect } from "react";
import axios from "@/axios/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { extractMonthFromYYYYMM, extractYearFromYYYYMM, getCurrentMonthYYYYMM } from "@/lib/date-utils";

type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Holiday";

interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    employeeId: string;
    designation: string;
  };
  date: Date;
  status: AttendanceStatus;
  markedBy: {
    name: string;
  };
}

interface AttendanceStats {
  present: number;
  absent: number;
  halfDay: number;
  leave: number;
  holiday: number;
  totalDays: number;
}

export default function AttendanceOverview() {
  const [month, setMonth] = useState<string>(getCurrentMonthYYYYMM());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (month) {
      fetchMonthlyAttendance();
    }
  }, [month]);

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true);
      const monthStr = extractMonthFromYYYYMM(month);
      const year = extractYearFromYYYYMM(month);

      const response = await axios.get(`/attendance/monthly`, {
        params: { month: monthStr, year },
      });

      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching monthly attendance:", error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const variants: Record<AttendanceStatus, "default" | "destructive" | "secondary" | "outline"> = {
      Present: "default",
      Absent: "destructive",
      "Half Day": "secondary",
      Leave: "outline",
      Holiday: "secondary",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  const groupByEmployee = () => {
    const grouped: Record<string, AttendanceRecord[]> = {};
    
    attendance.forEach((record) => {
      const empId = record.employeeId._id;
      if (!grouped[empId]) {
        grouped[empId] = [];
      }
      grouped[empId].push(record);
    });

    return grouped;
  };

  const calculateStats = (records: AttendanceRecord[]): AttendanceStats => {
    const stats: AttendanceStats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      holiday: 0,
      totalDays: records.length,
    };

    records.forEach((record) => {
      switch (record.status) {
        case "Present":
          stats.present++;
          break;
        case "Absent":
          stats.absent++;
          break;
        case "Half Day":
          stats.halfDay++;
          break;
        case "Leave":
          stats.leave++;
          break;
        case "Holiday":
          stats.holiday++;
          break;
      }
    });

    return stats;
  };

  const groupedAttendance = groupByEmployee();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
          <CardDescription>
            View attendance records for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-[200px]"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading attendance data...</div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records for this month
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Half Day</TableHead>
                    <TableHead>Leave</TableHead>
                    <TableHead>Holiday</TableHead>
                    <TableHead>Total Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(groupedAttendance).map(([empId, records], index) => {
                    const stats = calculateStats(records);
                    const employee = records[0].employeeId;

                    return (
                      <TableRow key={empId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{employee.employeeId}</TableCell>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.designation}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {stats.present}
                        </TableCell>
                        <TableCell className="text-red-600 font-medium">
                          {stats.absent}
                        </TableCell>
                        <TableCell className="text-yellow-600 font-medium">
                          {stats.halfDay}
                        </TableCell>
                        <TableCell className="text-blue-600 font-medium">
                          {stats.leave}
                        </TableCell>
                        <TableCell className="text-gray-600 font-medium">
                          {stats.holiday}
                        </TableCell>
                        <TableCell className="font-medium">
                          {stats.totalDays}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
