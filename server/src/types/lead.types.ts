export interface Contact {
  mobile?: string;
  email?: string;
  whatsappNumber?: string;
}

export interface Engagement {
  firstEngagement?: Date;
  lastEngagement?: Date;
  followUpAt?: Date;
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

export interface ILead {
  patientName: string;
  patientId?: string;
  dob?: Date;
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
  assignedTo?: string; // ObjectId as string
  description?: string;
  insuranceDetails?: Record<string, any>;
  documents?: Record<string, any>[];
  engagement: Engagement;
  createdBy?: string; // ObjectId as string
  aadharNumber?: string;
  pancardNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLeadDto {
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
  leadStatus?: LeadStatus;
  modeOfPayment?: ModeOfPayment;
  assignedTo?: string;
  description?: string;
  aadharNumber?: string;
  pancardNumber?: string;
}

export interface UpdateLeadStatusDto {
  leadStatus: LeadStatus;
}

export interface FollowUpLeadResponse {
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