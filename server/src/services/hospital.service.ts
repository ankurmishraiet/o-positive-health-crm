import { Hospital } from "../models/hospital.model";

export const HospitalService = {
  async list(filters: any = {}) {
    const query: any = {};
    
    // Filter by city
    if (filters.city) {
      query["location.city"] = { $regex: filters.city, $options: "i" };
    }
    
    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }
    
    // Filter by type
    if (filters.type) {
      query.type = filters.type;
    }
    
    return Hospital.find(query).populate("associatedDoctors").lean();
  },

  async getById(id: string) {
    return Hospital.findById(id).populate("associatedDoctors").lean();
  },

  async create(data: any) {
    return Hospital.create(data);
  },

  async update(id: string, data: any) {
    return Hospital.findByIdAndUpdate(id, data, { new: true });
  },

  async remove(id: string) {
    return Hospital.findByIdAndDelete(id);
  },

  // Get hospitals grouped by city
  async getByCity() {
    return Hospital.aggregate([
      {
        $group: {
          _id: "$location.city",
          hospitalCount: { $sum: 1 },
          totalBeds: { $sum: "$beds" },
          specialtyHospitals: {
            $sum: {
              $cond: [{ $ne: ["$type", "General"] }, 1, 0],
            },
          },
          emergencyServices: {
            $sum: {
              $cond: [{ $eq: ["$emergencyServices", "Yes"] }, 1, 0],
            },
          },
          hospitals: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          city: "$_id",
          hospitalCount: 1,
          totalBeds: 1,
          specialtyHospitals: 1,
          emergencyServices: 1,
          topHospitals: { $slice: ["$hospitals.name", 3] },
          status: "Active",
          partneredSince: { $min: "$hospitals.partnerSince" },
          _id: 0,
        },
      },
      {
        $sort: { hospitalCount: -1 },
      },
    ]);
  },

  // Get hospital statistics
  async getStats() {
    const totalHospitals = await Hospital.countDocuments({ isActive: true });
    
    const totalBeds = await Hospital.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalBeds: { $sum: "$beds" } } },
    ]);
    
    const emergencyServices = await Hospital.countDocuments({
      isActive: true,
      emergencyServices: "Yes",
    });
    
    const activePartners = await Hospital.countDocuments({ 
      status: "Active",
      isActive: true 
    });
    
    // Get average rating
    const avgRating = await Hospital.aggregate([
      { $match: { isActive: true, rating: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    
    return {
      totalHospitals,
      totalBeds: totalBeds[0]?.totalBeds || 0,
      emergencyServices,
      activePartners,
      avgRating: avgRating[0]?.avgRating || 0,
    };
  },

  // Get hospitals in a specific city with detailed info
  async getCityDetails(city: string) {
    return Hospital.find({
      "location.city": { $regex: city, $options: "i" },
      isActive: true,
    })
      .populate("associatedDoctors")
      .sort({ name: 1 })
      .lean();
  },
};
