import { Schema, model, Types } from "mongoose";

const appointmentSchema = new Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      required: true,
    },
    
    // Patient Information
    patientName: { type: String, required: true },
    patientPhone: String,
    patientEmail: String,
    
    // Doctor & Hospital Information
    doctor: { type: Types.ObjectId, ref: "Doctor" },
    doctorName: { type: String, required: true },
    hospital: { type: Types.ObjectId, ref: "Hospital" },
    hospitalName: { type: String, required: true },
    department: { type: String, required: true },
    
    // Appointment Details
    appointmentDate: { type: Date, required: true },
    appointmentTime: { type: String, required: true },
    duration: { type: Number, default: 30 }, // in minutes
    
    // Appointment Type & Status
    type: {
      type: String,
      enum: ["OPD", "IPD", "Emergency", "Consultation"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Confirmed", "In Progress", "Completed", "Cancelled", "No Show"],
      default: "Scheduled",
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Emergency"],
      default: "Normal",
    },
    
    // Medical Information
    symptoms: String,
    medicalHistory: String,
    allergies: String,
    currentMedications: String,
    
    // Appointment Management
    bookedBy: { type: Types.ObjectId, refPath: "bookedByModel" },
    bookedByModel: {
      type: String,
      enum: ["Employee", "Doctor", "User"],
      default: "Employee",
    },
    
    // Payment & Billing
    consultationFee: Number,
    isPaid: { type: Boolean, default: false },
    paymentMethod: String,
    
    // Follow-up & Notes
    followUpRequired: { type: Boolean, default: false },
    followUpDate: Date,
    notes: String,
    
    // Reminders
    reminderSent: { type: Boolean, default: false },
    reminderDate: Date,
  },
  { timestamps: true }
);

// Pre-save hook to generate appointment ID
appointmentSchema.pre("save", function (next) {
  if (!this.appointmentId) {
    const prefix = this.type === "Emergency" ? "EMR" : "APT";
    const timestamp = Date.now().toString().slice(-6);
    this.appointmentId = `${prefix}${timestamp}`;
  }
  next();
});

export const Appointment = model("Appointment", appointmentSchema);