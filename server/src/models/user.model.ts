import { Schema, model, Document } from "mongoose";

// Keep legacy enum for backward compatibility
export enum UserRole {
  ADMIN = "admin",
  BD = "bd",
  HR = "hr",
  DOCTOR = "doctor",
  FINANCE = "finance",
  PARTNER = "partner",
  BD_MANAGER = "bd_manager",
  SALES_MANAGER = "sales_manager",
  ASSISTANT_MANAGER = "assistant_manager",
  OPERATION_MANAGER = "operation_manager",
  BD_ASSOCIATE = "bd_associate",
  DIRECTOR = "director",
}

interface IUser extends Document {
  name: string;
  image: string;
  userId: string;
  employeeId: string;
  email: string;
  phone: string;
  password?: string;
  otp?: string;
  otpExpiresAt?: Date;
  role: UserRole | string; // Support both enum and custom role names
  customRole?: Schema.Types.ObjectId; // Reference to custom role
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    image: String,
    email: { type: String, unique: true },
    userId: { type: String, unique: true },
    employeeId: { type: String, unique: true },
    phone: { type: String, unique: true },
    password: String,
    otp: String,
    otpExpiresAt: Date,
    role: {
      type: String,
      default: UserRole.BD,
    },
    customRole: {
      type: Schema.Types.ObjectId,
      ref: "Role"
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
