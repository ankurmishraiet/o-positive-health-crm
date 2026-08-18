import { Schema, model, Types } from "mongoose";

const cabSchema = new Schema(
  {
    bookingId: {
      type: String,
      unique: true,
    },
    requestedBy: { type: Types.ObjectId, refPath: "requestedByModel" },
    requestedByModel: {
      type: String,
      enum: ["Employee", "Doctor", "User"],
      required: true,
    },

    // Patient/User Information
    patientName: { type: String, required: true },
    phone: { type: String, required: true },

    // Location Information
    pickupLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    destination: {
      address: String,
      lat: Number,
      lng: Number,
    },

    // Service Details
    serviceType: {
      type: String,
      enum: ["OPD", "IPD", "Employee", "Doctor"],
      required: true,
    },
    department: String, // For OPD cabs
    appointmentTime: String, // For OPD cabs
    admissionType: String, // For IPD cabs
    roomNumber: String, // For IPD cabs
    urgency: {
      type: String,
      enum: ["Low", "Normal", "High", "Emergency"],
      default: "Normal",
    },

    // Scheduling
    pickupTime: { type: Date, required: true },
    isScheduled: { type: Boolean, default: false },
    scheduledDate: Date,
    scheduledTime: String,

    // Driver & Vehicle
    driver: { type: Types.ObjectId, ref: "Employee" },
    driverName: String,
    vehicleNumber: String,

    // Status & Pricing
    status: {
      type: String,
      enum: [
        "Scheduled",
        "Pending",
        "Confirmed",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
    fare: String,
    estimatedFare: String,
    distance: String,

    // Additional Options
    returnTrip: {
      type: String,
      enum: ["Yes", "No"],
      default: "No",
    },
    notes: String,
  },
  { timestamps: true }
);

// Pre-save hook to generate booking ID
cabSchema.pre("save", function (next) {
  if (!this.bookingId) {
    const prefix =
      this.serviceType === "OPD"
        ? "OPD"
        : this.serviceType === "IPD"
        ? "IPD"
        : this.isScheduled
        ? "SCH"
        : "CAB";
    const timestamp = Date.now().toString().slice(-6);
    this.bookingId = `${prefix}${timestamp}`;
  }
  next();
});

export const Cab = model("Cab", cabSchema);
