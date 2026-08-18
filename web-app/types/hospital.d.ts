export interface Hospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  location: Location;
  type: string;
  beds: number;
  rating: number;
  emergencyServices: string;
  ambulanceService: boolean;
  laboratoryService: boolean;
  pharmacyService: boolean;
  status: string;
  facilities: string[];
  specializations: string[];
  contactPerson: ContactPerson;
  website: string;
  description: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface ContactPerson {
  name: string;
  phone: string;
  email: string;
  designation: string;
}

export interface Location {
  city: string;
  state: string;
  pin: string;
  lat: number;
  lng: number;
}
