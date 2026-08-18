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

export interface Lead {
  _id: string;
  patientName?: string;
  patientId?: string;
  dob?: Date;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  contact?: Contact;
  city?: string;
  address?: string;
  pincode?: string;
  treatment?: string;
  workingProfession?: string;
  leadSource?: string;
  modeOfPayment?: "Cash" | "Insurance" | "EMI" | "Other";
  leadStatus?: string;
  opdStatus?: string;
  ipdStatus?: string;
  assignedTo?: string;
  description?: string;
  insuranceDetails?: any;
  documents?: any[];
  engagement?: Engagement;
  createdBy?: string;
  aadharNumber?: string;
  pancardNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Legacy fields for backward compatibility
  mobile?: string;
  email?: string;
}