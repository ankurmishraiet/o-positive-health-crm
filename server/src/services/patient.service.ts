import { Lead } from "../models/lead.model";
import { Appointment } from "../models/appointment.model";
import { Cab } from "../models/cab.model";
import { Hospital } from "../models/hospital.model";
import { Doctor } from "../models/doctor.model";
import { Employee } from "../models/employee.model";
import { UserRole } from "../constants/roles.enum";
import mongoose from "mongoose";
import { findEmployeeForUser } from "../utils/employee-lookup";

export const PatientService = {
  /**
   * Search patients by name or phone
   */
  async search(searchTerm: string, limit: number = 20, user?: any) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const query: any = {
      $or: [
        { patientName: new RegExp(searchTerm, "i") },
        { "contact.mobile": new RegExp(searchTerm, "i") },
        { patientId: new RegExp(searchTerm, "i") },
      ],
    };

    // Filter for non-admin users
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        query.assignedTo = employee._id;
      } else {
        // No employee record found for this user, return empty results
        return [];
      }
    }

    const patients = await Lead.find(query)
      .select("_id patientName patientId contact age gender city treatment")
      .limit(limit)
      .lean();

    return patients;
  },

  /**
   * List all patients (from leads) with pagination
   */
  async list(filters: any = {}, user?: any) {
    const {
      page = 1,
      limit = 50,
      sortBy = "createdAt",
      sortOrder = "desc",
      ...queryFilters
    } = filters;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the query
    const query: any = {};
    
    // Handle filters
    if (queryFilters.city) {
      query.city = queryFilters.city;
    }
    if (queryFilters.treatment) {
      query.treatment = new RegExp(queryFilters.treatment, "i");
    }
    if (queryFilters.search) {
      query.$or = [
        { patientName: new RegExp(queryFilters.search, "i") },
        { "contact.mobile": new RegExp(queryFilters.search, "i") },
        { "contact.email": new RegExp(queryFilters.search, "i") },
      ];
    }

    // Filter for non-admin users
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      if (employee) {
        query.assignedTo = employee._id;
      } else {
        // No employee record found for this user, return empty results
        return {
          patients: [],
          pagination: {
            total: 0,
            page: pageNum,
            limit: limitNum,
            totalPages: 0,
            hasMore: false,
          },
        };
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [patients, total] = await Promise.all([
      Lead.find(query)
        .populate("assignedTo", "name")
        .select("patientName patientId age gender contact city treatment leadStatus opdStatus ipdStatus createdAt")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(query),
    ]);

    return {
      patients,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  },

  /**
   * Get patient details with full history
   */
  async getPatientHistory(patientId: string, user?: any) {
    // Get patient (lead) information
    const patient = await Lead.findById(patientId)
      .populate("assignedTo", "name email phone")
      .populate("createdBy", "name")
      .lean();

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Filter for non-admin users - check if this patient is assigned to them
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      const assignedToId = (patient.assignedTo as any)?._id?.toString() || patient.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        throw new Error("Patient not found");
      }
    }

    // Get appointments by patient name and phone
    const appointments = await Appointment.find({
      $or: [
        { patientName: patient.patientName },
        { patientPhone: patient.contact?.mobile }
      ]
    })
      .populate("doctor", "name specialization")
      .populate("hospital", "name address location")
      .sort({ appointmentDate: -1 })
      .lean();

    // Get cab bookings by patient name and phone
    const cabBookings = await Cab.find({
      $or: [
        { patientName: patient.patientName },
        { phone: patient.contact?.mobile }
      ]
    })
      .populate("driver", "name phone")
      .sort({ pickupTime: -1 })
      .lean();

    // Extract unique hospitals from appointments
    const hospitalIds = [...new Set(appointments.map(apt => {
      if (apt.hospital && typeof apt.hospital === 'object' && '_id' in apt.hospital) {
        return apt.hospital._id;
      }
      return null;
    }).filter(Boolean))];
    
    // Extract unique doctors from appointments
    const doctorIds = [...new Set(appointments.map(apt => {
      if (apt.doctor && typeof apt.doctor === 'object' && '_id' in apt.doctor) {
        return apt.doctor._id;
      }
      return null;
    }).filter(Boolean))];

    return {
      patient,
      history: {
        appointments,
        cabBookings,
        summary: {
          totalAppointments: appointments.length,
          totalCabBookings: cabBookings.length,
          uniqueHospitals: hospitalIds.length,
          uniqueDoctors: doctorIds.length,
          lastAppointment: appointments[0]?.appointmentDate || null,
          lastCabBooking: cabBookings[0]?.pickupTime || null,
        }
      }
    };
  },

  /**
   * Get patient appointments
   */
  async getPatientAppointments(patientId: string, filters: any = {}, user?: any) {
    const patient = await Lead.findById(patientId).lean();
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Filter for non-admin users - check if this patient is assigned to them
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      const assignedToId = patient.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        throw new Error("Patient not found");
      }
    }

    const {
      page = 1,
      limit = 20,
      status,
      type,
    } = filters;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      $or: [
        { patientName: patient.patientName },
        { patientPhone: patient.contact?.mobile }
      ]
    };

    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate("doctor", "name specialization")
        .populate("hospital", "name address")
        .sort({ appointmentDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return {
      appointments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  },

  /**
   * Get patient cab bookings
   */
  async getPatientCabBookings(patientId: string, filters: any = {}, user?: any) {
    const patient = await Lead.findById(patientId).lean();
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Filter for non-admin users - check if this patient is assigned to them
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      const assignedToId = patient.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        throw new Error("Patient not found");
      }
    }

    const {
      page = 1,
      limit = 20,
      status,
      serviceType,
    } = filters;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      $or: [
        { patientName: patient.patientName },
        { phone: patient.contact?.mobile }
      ]
    };

    if (status) {
      query.status = status;
    }
    if (serviceType) {
      query.serviceType = serviceType;
    }

    const [cabs, total] = await Promise.all([
      Cab.find(query)
        .populate("driver", "name phone")
        .sort({ pickupTime: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Cab.countDocuments(query),
    ]);

    return {
      cabs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    };
  },

  /**
   * Get hospitals visited by patient
   */
  async getPatientHospitals(patientId: string, user?: any) {
    const patient = await Lead.findById(patientId).lean();
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Filter for non-admin users - check if this patient is assigned to them
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      const assignedToId = patient.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        throw new Error("Patient not found");
      }
    }

    // Get all appointments for this patient
    const appointments = await Appointment.find({
      $or: [
        { patientName: patient.patientName },
        { patientPhone: patient.contact?.mobile }
      ]
    })
      .populate("hospital", "name address location type rating")
      .sort({ appointmentDate: -1 })
      .lean();

    // Extract unique hospitals with visit count
    const hospitalMap = new Map();
    
    appointments.forEach(apt => {
      if (apt.hospital && typeof apt.hospital === 'object' && '_id' in apt.hospital) {
        const hospitalId = String(apt.hospital._id);
        if (!hospitalMap.has(hospitalId)) {
          hospitalMap.set(hospitalId, {
            hospital: apt.hospital,
            visitCount: 1,
            lastVisit: apt.appointmentDate,
            appointments: [apt]
          });
        } else {
          const existing = hospitalMap.get(hospitalId);
          existing.visitCount++;
          if (new Date(apt.appointmentDate) > new Date(existing.lastVisit)) {
            existing.lastVisit = apt.appointmentDate;
          }
          existing.appointments.push(apt);
        }
      }
    });

    const hospitals = Array.from(hospitalMap.values()).sort((a, b) => 
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );

    return {
      hospitals,
      summary: {
        totalHospitals: hospitals.length,
        totalVisits: appointments.length,
      }
    };
  },

  /**
   * Get current patient status
   */
  async getPatientStatus(patientId: string, user?: any) {
    const patient = await Lead.findById(patientId)
      .populate("assignedTo", "name email phone")
      .lean();

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Filter for non-admin users - check if this patient is assigned to them
    if (user && user.role !== UserRole.ADMIN) {
      const employee = await findEmployeeForUser(user.id);
      const assignedToId = (patient.assignedTo as any)?._id?.toString() || patient.assignedTo?.toString();
      const employeeId = employee?._id.toString();
      if (!employee || assignedToId !== employeeId) {
        throw new Error("Patient not found");
      }
    }

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      $or: [
        { patientName: patient.patientName },
        { patientPhone: patient.contact?.mobile }
      ],
      appointmentDate: { $gte: new Date() },
      status: { $in: ["Scheduled", "Confirmed"] }
    })
      .populate("doctor", "name specialization")
      .populate("hospital", "name")
      .sort({ appointmentDate: 1 })
      .limit(5)
      .lean();

    // Get upcoming cab bookings
    const upcomingCabs = await Cab.find({
      $or: [
        { patientName: patient.patientName },
        { phone: patient.contact?.mobile }
      ],
      pickupTime: { $gte: new Date() },
      status: { $in: ["Scheduled", "Pending", "Confirmed"] }
    })
      .sort({ pickupTime: 1 })
      .limit(5)
      .lean();

    return {
      patientInfo: {
        id: patient._id,
        name: patient.patientName,
        patientId: patient.patientId,
        age: patient.age,
        gender: patient.gender,
        contact: patient.contact,
        city: patient.city,
      },
      currentStatus: {
        leadStatus: patient.leadStatus,
        opdStatus: patient.opdStatus,
        ipdStatus: patient.ipdStatus,
        assignedTo: patient.assignedTo,
        treatment: patient.treatment,
        followUpAt: patient.engagement?.followUpAt,
      },
      upcoming: {
        appointments: upcomingAppointments,
        cabs: upcomingCabs,
      }
    };
  }
};
