"use client";

import { useState, useEffect } from "react";
import axios from "@/axios/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

type AttendanceStatus = "Present" | "Absent" | "Half Day" | "Leave" | "Holiday";

interface Employee {
  _id: string;
  name: string;
  employeeId: string;
  designation: string;
  photo?: string;
}

interface AttendanceRecord {
  employeeId: string;
  status: AttendanceStatus;
}

export default function AttendanceMarkingSheet() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [existingAttendance, setExistingAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (date) {
      fetchAttendanceForDate();
    }
  }, [date, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/employees");
      // API returns { employees, total, page, totalPages }
      const employeesList = Array.isArray(response.data) 
        ? response.data 
        : response.data.employees || [];
      setEmployees(employeesList);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceForDate = async () => {
    try {
      const response = await axios.get(`/attendance/date`, {
        params: { date: format(date, "yyyy-MM-dd") },
      });
      
      const attendanceMap: Record<string, AttendanceStatus> = {};
      response.data.forEach((record: any) => {
        attendanceMap[record.employeeId._id] = record.status;
      });
      
      setExistingAttendance(attendanceMap);
      setAttendance(attendanceMap);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setExistingAttendance({});
      setAttendance({});
    }
  };

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, AttendanceStatus> = {};
    employees.forEach((emp) => {
      allPresent[emp._id] = "Present";
    });
    setAttendance(allPresent);
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceData: AttendanceRecord[] = Object.entries(attendance).map(
        ([employeeId, status]) => ({
          employeeId,
          status,
        })
      );

      if (attendanceData.length === 0) {
        toast({
          title: "Warning",
          description: "Please mark attendance for at least one employee",
          variant: "destructive",
        });
        return;
      }

      await axios.post("/attendance/bulk", {
        attendanceData,
        date: format(date, "yyyy-MM-dd"),
      });

      toast({
        title: "Success",
        description: `Attendance marked for ${attendanceData.length} employees`,
      });

      fetchAttendanceForDate();
    } catch (error: any) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>
            Mark attendance for all employees for the selected date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={handleMarkAllPresent} variant="outline">
              Mark All Present
            </Button>

            <Button onClick={handleSaveAttendance} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">S.No</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                    <TableRow key={employee._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.designation}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance[employee._id] || ""}
                          onValueChange={(value) =>
                            handleStatusChange(employee._id, value as AttendanceStatus)
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Half Day">Half Day</SelectItem>
                            <SelectItem value="Leave">Leave</SelectItem>
                            <SelectItem value="Holiday">Holiday</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
