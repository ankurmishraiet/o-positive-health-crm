import { Schema, model, Types } from "mongoose";

const hospitalSchema = new Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String,
    email: String,
    location: {
      city: String,
      state: String,
      pin: String,
      lat: Number,
      lng: Number,
    },
    type: {
      type: String,
    },
    beds: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    emergencyServices: { type: String },
    ambulanceService: { type: Boolean, default: false },
    laboratoryService: { type: Boolean, default: false },
    pharmacyService: { type: Boolean, default: false },
    partnerSince: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    associatedDoctors: [{ type: Types.ObjectId, ref: "Doctor" }],
    website: String,
    description: String,
    facilities: [String],
    specializations: [String],
    contactPerson: {
      name: String,
      phone: String,
      email: String,
      designation: String,
    },
    isActive: { type: Boolean, default: true },
    notes: String,
  },
  { timestamps: true },
);

export const Hospital = model("Hospital", hospitalSchema);
