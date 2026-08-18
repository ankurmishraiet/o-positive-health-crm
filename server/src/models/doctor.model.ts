import { Schema, model, Types } from "mongoose";

const doctorSchema = new Schema(
  {
    name: { type: String, required: true },
    specialization: String,
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true },
    qualifications: String,
    hospitalIds: [{ type: Types.ObjectId, ref: "Hospital" }],
    experienceYears: Number,
    languages: [String],
    rating: { type: Number, default: 0 },
    tags: [String],
    notes: String,
    isActive: { type: Boolean, default: true },
    // Added missing fields from frontend form
    location: String,
    consultationFee: Number,
    type: String,
    address: String,
    availability: String,
    // Registration and documents
    registrationNumber: String,
    documents: [{
      documentType: {
        type: String,
        enum: ["Aadhar Card", "Pan Card", "Bank Account Details", "Registration Certificate", "Other"]
      },
      documentName: String,
      documentUrl: String,
      uploadedDate: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export const Doctor = model("Doctor", doctorSchema);
