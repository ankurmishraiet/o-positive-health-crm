export interface Employee {
  _id: string;
  name?: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  photo?: string;
  aadharNumber?: string;
  pancardNumber?: string;
  previousEmployer?: string;
  qualification?: string;
  designation?: string;
  address?: string; // Legacy field
  reportsTo?: string;
  resume?: string;
  loans?: string[];
  incentives?: {
    month: string;
    amount: number;
  }[];
  department?: string;
  salary?: number; // Current salary
  employeeId?: string;
  status?: string;
  joiningDate?: Date | string;
  hasAccount?: boolean;
  userId?: string;
  // New enhanced fields
  dateOfBirth?: Date | string;
  dateOfEnding?: Date | string; // Date of ending previous job
  startingSalary?: number;
  increments?: {
    date: Date | string;
    amount: number;
    reason?: string;
    previousSalary?: number;
    newSalary?: number;
  }[];
  alternateNumber?: string;
  fatherName?: string;
  experience?: string;
  addressPresent?: string;
  addressPermanent?: string;
  systemAgeMonths?: number; // Calculated field
  createdAt?: Date;
  updatedAt?: Date;
}