export interface Contact {
  mobile?: string;
  email?: string;
  whatsappNumber?: string;
}

export interface Engagement {
  firstEngagement?: string;
  lastEngagement?: string;
  followUpAt?: string | null;
  daysToClose?: number;
}

export enum LeadStatus {
  NEW = "New",
  DNP = "DNP",
  FOLLOW_UP = "Follow-up",
  CLOSE = "Close",
  OPD_SCHEDULE = "OPD Schedule",
  OPD_DONE = "OPD Done",
  IPD_SCHEDULE = "IPD Schedule",
  IPD_DONE = "IPD Done",
  IPD_LOSE = "IPD Lose",
  HOT_LEAD = "Hot Lead",
  COLD_LEAD = "Cold Lead",
  WARM_LEAD = "Warm Lead",
  IRREVERENT = "Irreverent",
  FUND_ISSUE = "Fund Issue",
  OUTSIDE_OUR_REACH = "Outside our Reach",
  SURGERY_NOT_SUGGESTED = "Surgery Not Suggested",
  ENQUIRED_FOR_OTHER_PERSON = "Enquired for Other Person"
}

export enum OpdStatus {
  PENDING = "Pending",
  SCHEDULED = "Scheduled", 
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
  ONLINE_OPD = "Online OPD",
  OFFLINE_OPD = "Offline OPD"
}

export enum IpdStatus {
  NOT_APPLICABLE = "Not Applicable",
  PENDING = "Pending",
  SCHEDULED = "Scheduled",
  ADMITTED = "Admitted", 
  DISCHARGED = "Discharged",
  CANCELLED = "Cancelled"
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female", 
  OTHER = "Other"
}

export enum ModeOfPayment {
  CASH = "Cash",
  INSURANCE = "Insurance", 
  EMI = "EMI",
  OTHER = "Other"
}

export interface Lead {
  _id: string;
  patientName: string;
  patientId?: string;
  dob?: string;
  age?: number;
  gender?: Gender;
  contact: Contact;
  city?: string;
  address?: string;
  pincode?: string;
  treatment?: string;
  workingProfession?: string;
  leadSource?: string;
  modeOfPayment?: ModeOfPayment;
  leadStatus: LeadStatus;
  opdStatus: OpdStatus;
  ipdStatus: IpdStatus;
  assignedTo?: {
    _id: string;
    name: string;
  };
  description?: string;
  insuranceDetails?: Record<string, any>;
  documents?: Record<string, any>[];
  engagement: Engagement;
  createdBy?: {
    _id: string;
    name: string;
  };
  aadharNumber?: string;
  pancardNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLeadFormData {
  patientName: string;
  age?: number;
  gender?: Gender;
  dob?: Date;
  contact: Contact;
  city?: string;
  address?: string;
  pincode?: string;
  treatment?: string;
  workingProfession?: string;
  leadSource?: string;
  modeOfPayment?: ModeOfPayment;
  assignedTo?: string;
  description?: string;
  aadharNumber?: string;
  pancardNumber?: string;
}

export interface FollowUpLead {
  _id: string;
  patientName: string;
  contact: Contact;
  treatment?: string;
  leadStatus: LeadStatus;
  engagement: Engagement;
  assignedTo?: {
    _id: string;
    name: string;
  };
}

export interface AppointmentData {
  _id: string;
  appointmentId: string;
  patientName: string;
  patientPhone?: string;
  treatment?: string;
  doctorName: string;
  hospitalName: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: "Scheduled" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";
  duration?: number;
}

export interface OPDTodayResponse {
  appointments: AppointmentData[];
  leads: Lead[];
}

export interface IPDTodayResponse {
  appointments: AppointmentData[];
  leads: Lead[];
}