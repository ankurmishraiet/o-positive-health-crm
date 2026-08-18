import { Schema, model, Types } from "mongoose";

interface ITarget {
  employeeId: Types.ObjectId;
  month: string; // Format: YYYY-MM
  year: number;
  revenueTarget: number;
  opdTarget: number;
  ipdTarget: number;
  revenueAchievement: number;
  opdAchievement: number;
  ipdAchievement: number;
  totalIncentiveEarned: number;
  setBy: Types.ObjectId;
  remarks?: string;
}

const targetSchema = new Schema<ITarget>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    revenueTarget: {
      type: Number,
      required: true,
      default: 0,
    },
    opdTarget: {
      type: Number,
      default: 0,
    },
    ipdTarget: {
      type: Number,
      default: 0,
    },
    revenueAchievement: {
      type: Number,
      default: 0,
    },
    opdAchievement: {
      type: Number,
      default: 0,
    },
    ipdAchievement: {
      type: Number,
      default: 0,
    },
    totalIncentiveEarned: {
      type: Number,
      default: 0,
    },
    setBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remarks: String,
  },
  { timestamps: true }
);

// Compound index to ensure one target record per employee per month
targetSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export const Target = model<ITarget>("Target", targetSchema);
