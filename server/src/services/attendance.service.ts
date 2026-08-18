import { Attendance, AttendanceStatus } from "../models/attendance.model";
import { Employee } from "../models/employee.model";
import { Types } from "mongoose";

export const AttendanceService = {
  async markAttendance(
    employeeId: string,
    date: Date,
    status: AttendanceStatus,
    markedById: string,
    remarks?: string
  ) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOneAndUpdate(
      {
        employeeId: new Types.ObjectId(employeeId),
        date: dateOnly,
      },
      {
        status,
        markedBy: new Types.ObjectId(markedById),
        remarks,
      },
      {
        upsert: true,
        new: true,
      }
    ).populate("employeeId", "name employeeId designation");

    return attendance;
  },

  async markBulkAttendance(
    attendanceData: Array<{
      employeeId: string;
      status: AttendanceStatus;
    }>,
    date: Date,
    markedById: string
  ) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    const operations = attendanceData.map((item) => ({
      updateOne: {
        filter: {
          employeeId: new Types.ObjectId(item.employeeId),
          date: dateOnly,
        },
        update: {
          status: item.status,
          markedBy: new Types.ObjectId(markedById),
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    return this.getAttendanceByDate(date);
  },

  async getAttendanceByDate(date: Date) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    return await Attendance.find({ date: dateOnly })
      .populate("employeeId", "name employeeId designation photo")
      .populate("markedBy", "name")
      .sort({ createdAt: -1 });
  },

  async getAttendanceByEmployee(
    employeeId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const query: any = { employeeId: new Types.ObjectId(employeeId) };

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    return await Attendance.find(query)
      .populate("markedBy", "name")
      .sort({ date: -1 });
  },

  async getAttendanceStats(employeeId: string, month: string, year: number) {
    const monthNum = parseInt(month, 10);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employeeId: new Types.ObjectId(employeeId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const stats = {
      present: 0,
      absent: 0,
      halfDay: 0,
      leave: 0,
      holiday: 0,
      totalDays: attendance.length,
    };

    attendance.forEach((record) => {
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          stats.present++;
          break;
        case AttendanceStatus.ABSENT:
          stats.absent++;
          break;
        case AttendanceStatus.HALF_DAY:
          stats.halfDay++;
          break;
        case AttendanceStatus.LEAVE:
          stats.leave++;
          break;
        case AttendanceStatus.HOLIDAY:
          stats.holiday++;
          break;
      }
    });

    return stats;
  },

  async getMonthlyAttendance(month: string, year: number) {
    const monthNum = parseInt(month, 10);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    endDate.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("employeeId", "name employeeId designation photo")
      .populate("markedBy", "name")
      .sort({ date: -1 });

    return attendance;
  },

  async updateAttendance(id: string, updates: Partial<{
    status: AttendanceStatus;
    remarks: string;
  }>) {
    return await Attendance.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    ).populate("employeeId", "name employeeId designation");
  },

  async deleteAttendance(id: string) {
    return await Attendance.findByIdAndDelete(id);
  },
};
