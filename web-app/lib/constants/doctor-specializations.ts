/**
 * Comprehensive list of doctor specializations organized by category
 */
export const DOCTOR_SPECIALIZATIONS = [
  // Core Medical Specialisations
  "General Medicine (Physician)",
  "General Surgery",
  "Pediatrics (Child Specialist)",
  "Obstetrics & Gynecology (OBG / Gynecologist)",
  "Orthopedics",
  "Ophthalmology (Eye Specialist)",
  "ENT (Ear, Nose & Throat)",
  "Dermatology (Skin / VD)",
  "Psychiatry",
  "Pulmonology (Chest / TB)",
  
  // Super Specialities
  "Cardiology",
  "Neurology",
  "Neurosurgery",
  "Urology",
  "Nephrology",
  "Gastroenterology",
  "Endocrinology",
  "Rheumatology",
  "Oncology (Medical / Surgical)",
  "Hematology",
  
  // Surgical Specialisations
  "Laparoscopic Surgery",
  "Plastic & Reconstructive Surgery",
  "Vascular Surgery",
  "Pediatric Surgery",
  "Thoracic Surgery",
  "Bariatric Surgery",
  "Colorectal Surgery",
  
  // Diagnostic & Support Departments
  "Radiology",
  "Pathology",
  "Anesthesiology",
  "Nuclear Medicine",
  "Emergency Medicine",
  "Critical Care / ICU",
  
  // Women & Fertility
  "Reproductive Medicine / IVF",
  "Maternal & Fetal Medicine",
  
  // Dental Specialisations
  "BDS (General Dentistry)",
  "Oral & Maxillofacial Surgery",
  "Orthodontics",
  "Prosthodontics",
  "Periodontics",
  "Endodontics",
  
  // Allied & Others
  "Physiotherapy & Rehabilitation",
  "Pain Management",
  "Palliative Care",
  "Sports Medicine",
  "Occupational Therapy",
  "Clinical Psychology",
  "Audiology & Speech Therapy",
] as const;

export type DoctorSpecialization = typeof DOCTOR_SPECIALIZATIONS[number];
