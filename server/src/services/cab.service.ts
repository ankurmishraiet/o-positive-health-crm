import { Cab } from "../models/cab.model";

export const CabService = {
  async list(filters: any = {}) {
    const query: any = {};
    
    // Filter by service type
    if (filters.serviceType) {
      query.serviceType = filters.serviceType;
    }
    
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Filter by today's bookings
    if (filters.today) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      query.pickupTime = {
        $gte: today,
        $lt: tomorrow,
      };
    }
    
    // Filter by scheduled bookings
    if (filters.scheduled) {
      query.isScheduled = true;
    }
    
    // Search functionality
    if (filters.search) {
      query.$or = [
        { patientName: { $regex: filters.search, $options: 'i' } },
        { bookingId: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { 'destination.address': { $regex: filters.search, $options: 'i' } },
        { 'pickupLocation.address': { $regex: filters.search, $options: 'i' } },
        { vehicleNumber: { $regex: filters.search, $options: 'i' } },
        { driverName: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    return Cab.find(query)
      .populate(["requestedBy", "driver"])
      .sort({ createdAt: -1 })
      .lean();
  },

  async getById(id: string) {
    return Cab.findById(id).populate(["requestedBy", "driver"]).lean();
  },

  async create(data: any) {
    return Cab.create(data);
  },

  async update(id: string, data: any) {
    return Cab.findByIdAndUpdate(id, data, { new: true }).populate([
      "requestedBy",
      "driver",
    ]);
  },

  async assignDriver(id: string, driverId: string, vehicleNumber: string, driverName?: string) {
    return Cab.findByIdAndUpdate(
      id,
      {
        driver: driverId,
        vehicleNumber,
        driverName,
        status: "Confirmed",
      },
      { new: true }
    );
  },

  async updateStatus(id: string, status: string) {
    return Cab.findByIdAndUpdate(id, { status }, { new: true });
  },

  async remove(id: string) {
    return Cab.findByIdAndDelete(id);
  },

  // Get statistics for different service types
  async getStats(serviceType?: string) {
    const query: any = serviceType ? { serviceType } : {};
    
    const totalBookings = await Cab.countDocuments(query);
    const completed = await Cab.countDocuments({ ...query, status: "Completed" });
    const inProgress = await Cab.countDocuments({ ...query, status: "In Progress" });
    const scheduled = await Cab.countDocuments({ ...query, status: "Scheduled" });
    const confirmed = await Cab.countDocuments({ ...query, status: "Confirmed" });
    const pending = await Cab.countDocuments({ ...query, status: "Pending Assignment" });
    
    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Cab.countDocuments({
      ...query,
      pickupTime: { $gte: today, $lt: tomorrow },
    });
    
    return {
      totalBookings,
      completed,
      inProgress,
      scheduled,
      confirmed,
      pending,
      todayBookings,
    };
  },
};
