import { Schema, model, Types } from "mongoose";

const InsuranceSchema = new Schema(
  {
    leadId: { type: Types.ObjectId, ref: "Lead", required: true },
    type: { type: String, enum: ["Corporate", "Individual"], required: true },
    companyName: String,
    policyNumber: String,
    tpaName: String,
    validity: {
      from: Date,
      to: Date,
    },
    sumInsured: Number,
    dependents: [String],
    holderDetails: {
      name: String,
      dob: Date,
      officialEmail: String,
      contactNumber: String,
    },
    uploadedDocs: [String],
  },
  { timestamps: true }
);

export const Insurance = model("Insurance", InsuranceSchema);
