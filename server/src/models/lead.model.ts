import { Schema, model, Types } from "mongoose";
import { LeadStatus, OpdStatus, IpdStatus, Gender, ModeOfPayment } from "../types/lead.types";

const ContactSchema = new Schema({
  mobile: String,
  email: String,
  whatsappNumber: String,
}, { _id: false });

const EngagementSchema = new Schema({
  firstEngagement: Date,
  lastEngagement: Date,
  followUpAt: Date,
  daysToClose: Number,
}, { _id: false });

const LeadSchema = new Schema(
  {
    patientName: { type: String, required: true },
    patientId: String,
    dob: Date,
    age: Number,
    gender: { 
      type: String, 
      enum: Object.values(Gender),
      default: Gender.MALE 
    },
    contact: { 
      type: ContactSchema,
      default: () => ({})
    },
    city: String,
    address: String,
    pincode: String,
    treatment: String,
    workingProfession: String,
    leadSource: String,
    modeOfPayment: {
      type: String,
      enum: Object.values(ModeOfPayment),
      default: ModeOfPayment.CASH
    },
    leadStatus: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW
    },
    opdStatus: {
      type: String,
      enum: Object.values(OpdStatus),
      default: OpdStatus.PENDING
    },
    ipdStatus: {
      type: String,
      enum: Object.values(IpdStatus),
      default: IpdStatus.NOT_APPLICABLE
    },
    assignedTo: { type: Types.ObjectId, ref: "Employee" },
    assignedBy: { type: Types.ObjectId, ref: "User" },
    description: String,
    insuranceDetails: { type: Object, default: {} },
    documents: { type: [Object], default: [] },
    engagement: { 
      type: EngagementSchema,
      default: () => ({})
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    aadharNumber: String,
    pancardNumber: String,
  },
  { timestamps: true }
);

// Indexes for better query performance with pagination
LeadSchema.index({ createdAt: -1 }); // For default sorting
LeadSchema.index({ leadStatus: 1, createdAt: -1 }); // For filtering by status and sorting
LeadSchema.index({ createdBy: 1, createdAt: -1 }); // For filtering by creator
LeadSchema.index({ assignedTo: 1, createdAt: -1 }); // For filtering by assignee
LeadSchema.index({ assignedTo: 1, 'engagement.followUpAt': 1 }); // For follow-up queries by assigned employee
LeadSchema.index({ city: 1 }); // For filtering by city
LeadSchema.index({ 'contact.mobile': 1 }, { unique: true, sparse: true }); // For searching by mobile number and enforcing uniqueness
LeadSchema.index({ patientName: 'text', treatment: 'text' }); // For text search

export const Lead = model("Lead", LeadSchema);
