export interface PartnerLocation {
  city?: string;
  state?: string;
  pin?: string;
}

export interface Partner {
  _id: string;
  name: string;
  type: "Lab" | "Insurance" | "Diagnostic" | "Pharmacy" | "Other";
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  location?: PartnerLocation;
  isActive?: boolean;
  notes?: string;
  services?: string[];
  contractStartDate?: Date;
  contractEndDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}