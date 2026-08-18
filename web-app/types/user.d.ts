import { Document } from "mongoose";

export enum UserRole {
  ADMIN = "admin",
  BD = "bd",
  HR = "hr",
  DOCTOR = "doctor",
  FINANCE = "finance",
  PARTNER = "partner",
}

export interface UserType {
  _id: string;
  name: string;
  image: string;
  email: string;
  userId: string;
  employeeId: string;
  phone: string;
  password: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
