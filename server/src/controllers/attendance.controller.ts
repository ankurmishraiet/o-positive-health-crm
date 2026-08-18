import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "../services/attendance.service";
import { AttendanceStatus } from "../models/attendance.model";

export const AttendanceController = {
  async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, date, status, remarks } = req.body;
      const markedById = (req as any).user.id;

      if (!employeeId || !date || !status) {
        return res.status(400).json({
          message: "Employee ID, date, and status are required",
        });
      }

      const attendance = await AttendanceService.markAttendance(
        employeeId,
        new Date(date),
        status as AttendanceStatus,
        markedById,
        remarks
      );

      res.status(201).json(attendance);
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Attendance already marked for this employee on this date",
        });
      }
      next(err);
    }
  },

  async markBulkAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { attendanceData, date } = req.body;
      const markedById = (req as any).user.id;

      if (!attendanceData || !Array.isArray(attendanceData) || !date) {
        return res.status(400).json({
          message: "Invalid request. Attendance data array and date are required",
        });
      }

      const attendance = await AttendanceService.markBulkAttendance(
        attendanceData,
        new Date(date),
        markedById
      );

      res.status(201).json(attendance);
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          message: "Date is required",
        });
      }

      const attendance = await AttendanceService.getAttendanceByDate(
        new Date(date as string)
      );

      res.json(attendance);
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { startDate, endDate } = req.query;

      const attendance = await AttendanceService.getAttendanceByEmployee(
        employeeId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(attendance);
    } catch (err) {
      next(err);
    }
  },

  async getAttendanceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const stats = await AttendanceService.getAttendanceStats(
        employeeId,
        month as string,
        parseInt(year as string)
      );

      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getMonthlyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({
          message: "Month and year are required",
        });
      }

      const attendance = await AttendanceService.getMonthlyAttendance(
        month as string,
        parseInt(year as string)
      );

      res.json(attendance);
    } catch (err) {
      next(err);
    }
  },

  async updateAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const attendance = await AttendanceService.updateAttendance(id, updates);

      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      res.json(attendance);
    } catch (err) {
      next(err);
    }
  },

  async deleteAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const attendance = await AttendanceService.deleteAttendance(id);

      if (!attendance) {
        return res.status(404).json({ message: "Attendance record not found" });
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
