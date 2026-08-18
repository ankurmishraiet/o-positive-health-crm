import { Appointment } from "../models/appointment.model";

export const AppointmentService = {
  async list(filters: any = {}) {
    const query: any = {};
    
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Filter by type
    if (filters.type) {
      query.type = filters.type;
    }
    
    // Filter by priority
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    // Filter by hospital
    if (filters.hospitalId) {
      query.hospital = filters.hospitalId;
    }
    
    // Filter by doctor
    if (filters.doctorId) {
      query.doctor = filters.doctorId;
    }
    
    // Filter by today's appointments
    if (filters.today) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.appointmentDate = {
        $gte: today,
        $lt: tomorrow,
      };
    }
    
    // Filter by date range
    if (filters.startDate && filters.endDate) {
      query.appointmentDate = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }
    
    return Appointment.find(query)
      .populate(["doctor", "hospital", "bookedBy"])
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();
  },

  async getById(id: string) {
    return Appointment.findById(id)
      .populate(["doctor", "hospital", "bookedBy"])
      .lean();
  },

  async create(data: any) {
    return Appointment.create(data);
  },

  async update(id: string, data: any) {
    return Appointment.findByIdAndUpdate(id, data, { new: true });
  },

  async updateStatus(id: string, status: string) {
    return Appointment.findByIdAndUpdate(id, { status }, { new: true });
  },

  async remove(id: string) {
    return Appointment.findByIdAndDelete(id);
  },

  // Get statistics for appointments
  async getStats(filters: any = {}) {
    const query: any = {};
    
    if (filters.hospitalId) {
      query.hospital = filters.hospitalId;
    }
    
    if (filters.doctorId) {
      query.doctor = filters.doctorId;
    }

    const totalAppointments = await Appointment.countDocuments(query);
    const scheduled = await Appointment.countDocuments({ ...query, status: "Scheduled" });
    const confirmed = await Appointment.countDocuments({ ...query, status: "Confirmed" });
    const completed = await Appointment.countDocuments({ ...query, status: "Completed" });
    const cancelled = await Appointment.countDocuments({ ...query, status: "Cancelled" });
    const inProgress = await Appointment.countDocuments({ ...query, status: "In Progress" });
    
    // Today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      ...query,
      appointmentDate: { $gte: today, $lt: tomorrow },
    });
    
    // High priority appointments
    const highPriority = await Appointment.countDocuments({ ...query, priority: "High" });
    
    // IPD appointments
    const ipdAppointments = await Appointment.countDocuments({ ...query, type: "IPD" });
    
    return {
      totalAppointments,
      scheduled,
      confirmed,
      completed,
      cancelled,
      inProgress,
      todayAppointments,
      highPriority,
      ipdAppointments,
    };
  },

  // Get appointments by city (based on hospital location)
  async getByCity(city: string) {
    return Appointment.aggregate([
      {
        $lookup: {
          from: "hospitals",
          localField: "hospital",
          foreignField: "_id",
          as: "hospitalDetails",
        },
      },
      {
        $match: {
          "hospitalDetails.city": { $regex: city, $options: "i" },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      {
        $sort: { appointmentDate: 1, appointmentTime: 1 },
      },
    ]);
  },
};