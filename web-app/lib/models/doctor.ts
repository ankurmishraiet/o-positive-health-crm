export interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  qualifications?: string;
  hospitalIds?: string[];
  experienceYears?: number;
  languages?: string[];
  rating?: number;
  tags?: string[];
  notes?: string;
  isActive?: boolean;
  location?: string;
  consultationFee?: number;
  type?: string;
  address?: string;
  availability?: string;
  createdAt?: Date;
  updatedAt?: Date;
}