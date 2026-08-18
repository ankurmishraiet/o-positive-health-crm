import { Doctor } from "../models/doctor.model";
import { Appointment } from "../models/appointment.model";

export const DoctorService = {
  async list(filters?: {
    type?: string;
    city?: string;
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      type,
      city,
      department,
      status,
      page = 1,
      limit = 10
    } = filters || {};

    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (city) {
      query.location = new RegExp(city, 'i');
    }
    
    if (department) {
      query.specialization = new RegExp(department, 'i');
    }
    
    if (status) {
      query.isActive = status === 'Active';
    }
    
    const skip = (page - 1) * limit;
    
    const [doctorsData, total] = await Promise.all([
      Doctor.find(query)
        .populate("hospitalIds", "name city")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments(query)
    ]);

    // Transform data to match frontend expectations
    const doctors = doctorsData.map((doctor: any) => ({
      id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone: doctor.phone,
      qualifications: doctor.qualifications,
      experienceYears: doctor.experienceYears,
      languages: doctor.languages,
      rating: doctor.rating,
      consultationFee: doctor.consultationFee,
      type: doctor.type,
      location: doctor.location,
      address: doctor.address,
      availability: doctor.availability,
      isActive: doctor.isActive,
      status: doctor.isActive ? 'Active' : 'Inactive',
      hospitalIds: doctor.hospitalIds,
      tags: doctor.tags,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    }));

    return {
      doctors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  },

  async getById(id: string) {
    const doctor = await Doctor.findById(id).populate("hospitalIds").lean();
    if (!doctor) return null;
    
    // Ensure documents are included in the response
    return {
      ...doctor,
      documents: doctor.documents || [],
      registrationNumber: doctor.registrationNumber || null,
    };
  },

  async create(data: any) {
    try {
      return await Doctor.create(data);
    } catch (error: any) {
      // Log the error for debugging
      console.error("Error creating doctor:", error);
      
      // Re-throw with more specific error messages
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        throw new Error(`${field} already exists. Please use a different value.`);
      }
      
      throw error;
    }
  },

  async update(id: string, data: any) {
    return Doctor.findByIdAndUpdate(id, data, { new: true });
  },

  async remove(id: string) {
    return Doctor.findByIdAndDelete(id);
  },

  async getStats() {
    try {
      const [
        totalDoctors,
        withUsDoctors,
        selfClinicDoctors,
        availableDoctors,
        busyDoctors,
        offlineDoctors,
      ] = await Promise.all([
        Doctor.countDocuments({ isActive: true }),
        Doctor.countDocuments({ type: "With Us", isActive: true }),
        Doctor.countDocuments({ type: "Self Clinic", isActive: true }),
        Doctor.countDocuments({ isActive: true, availability: "Available" }),
        Doctor.countDocuments({ isActive: true, availability: "Busy" }),
        Doctor.countDocuments({ isActive: true, availability: "Offline" }),
      ]);

      // Get department-wise count
      const departmentStats = await Doctor.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$specialization", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      // Get city-wise count (using location field from schema)
      const cityStats = await Doctor.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      return {
        total: totalDoctors,
        withUs: withUsDoctors,
        selfClinic: selfClinicDoctors,
        activeToday: availableDoctors,
        available: availableDoctors,
        busy: busyDoctors,
        offline: offlineDoctors,
        departmentStats,
        cityStats,
      };
    } catch (error) {
      console.error("Error fetching doctor stats:", error);
      throw new Error("Failed to fetch doctor statistics");
    }
  },

  async getWithUsStats() {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Get all "With Us" doctors for stats calculation
      const withUsDoctors = await Doctor.find({ type: "With Us", isActive: true }).select('_id rating').lean();
      const withUsDoctorIds = withUsDoctors.map(doc => doc._id);

      const [
        totalWithUs,
        availableNow,
        consultationsToday,
      ] = await Promise.all([
        Doctor.countDocuments({ type: "With Us", isActive: true }),
        Doctor.countDocuments({ type: "With Us", isActive: true, availability: "Available" }),
        // Calculate real consultations today for "With Us" doctors
        Appointment.countDocuments({ 
          doctor: { $in: withUsDoctorIds },
          appointmentDate: { $gte: todayStart, $lt: todayEnd },
          status: { $in: ["Completed", "In Progress"] }
        }),
      ]);

      // Calculate average rating from actual doctor ratings
      const averageRating = withUsDoctors.length > 0 
        ? (withUsDoctors.reduce((sum, doc) => sum + ((doc as any).rating || 0), 0) / withUsDoctors.length).toFixed(1)
        : "0.0";

      return {
        totalWithUs,
        availableNow,
        consultationsToday,
        averageRating,
      };
    } catch (error) {
      console.error("Error fetching with-us doctor stats:", error);
      throw new Error("Failed to fetch with-us doctor statistics");
    }
  },

  async getDoctorsByType(type: string) {
    return Doctor.find({ type, isActive: true }).populate("hospitalIds").lean();
  },

  async getDoctorsByCity(city: string) {
    return Doctor.find({ 
      location: new RegExp(city, 'i'), 
      isActive: true 
    }).populate("hospitalIds").lean();
  },

  async getDoctorsByDepartment(department: string) {
    return Doctor.find({ 
      specialization: new RegExp(department, 'i'), 
      isActive: true 
    }).populate("hospitalIds").lean();
  },

  async getDoctorAppointments(doctorId: string) {
    try {
      const appointments = await Appointment.find({ doctor: doctorId })
        .populate("hospital", "name city")
        .sort({ appointmentDate: -1 })
        .lean();

      return {
        appointments: appointments || [],
        total: appointments?.length || 0
      };
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      throw new Error("Failed to fetch doctor appointments");
    }
  },
};
