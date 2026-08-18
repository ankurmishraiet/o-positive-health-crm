import { Schema, model, Types } from "mongoose";

export enum AttendanceStatus {
  PRESENT = "Present",
  ABSENT = "Absent",
  HALF_DAY = "Half Day",
  LEAVE = "Leave",
  HOLIDAY = "Holiday",
}

interface IAttendance {
  employeeId: Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: Types.ObjectId;
  remarks?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(AttendanceStatus),
      required: true,
      default: AttendanceStatus.PRESENT,
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: String,
  },
  { timestamps: true }
);

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
