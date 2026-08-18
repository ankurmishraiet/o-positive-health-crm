import { Partner } from "../models/partner.model";

export const PartnerService = {
  async list(filters: any = {}) {
    try {
      const {
        type,
        businessType,
        status,
        city,
        state,
        page = 1,
        limit = 10,
        sort = '-createdAt'
      } = filters;

      const query: any = {};

      if (type) query.type = type;
      if (businessType) query.businessType = businessType;
      if (status) query.status = status;
      if (city) query.city = new RegExp(city, 'i');
      if (state) query.state = new RegExp(state, 'i');

      const skip = (page - 1) * limit;
      
      const [partnersData, total] = await Promise.all([
        Partner.find(query)
          .populate('createdBy', 'name email')
          .populate('updatedBy', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Partner.countDocuments(query)
      ]);

      // Transform data to match frontend expectations
      const partners = partnersData.map((partner: any) => ({
        id: partner._id,
        partnerId: partner.partnerId,
        name: partner.name,
        type: partner.type,
        businessType: partner.businessType,
        contactNumber: partner.contactNumber,
        email: partner.email,
        city: partner.city,
        state: partner.state,
        status: partner.status,
        contractStatus: partner.contractStatus,
        fullName: partner.fullName,
        conversionRate: partner.conversionRate,
        // Corporate specific fields
        companyName: partner.companyName,
        gstNumber: partner.gstNumber,
        panNumber: partner.panNumber,
        companyType: partner.companyType,
        // Individual specific fields
        firstName: partner.firstName,
        lastName: partner.lastName,
        aadharNumber: partner.aadharNumber,
        individualPanNumber: partner.individualPanNumber,
        // Contract details
        contractStartDate: partner.contractStartDate,
        contractEndDate: partner.contractEndDate,
        contractValue: partner.contractValue,
        commissionRate: partner.commissionRate,
        paymentTerms: partner.paymentTerms,
        // Performance metrics
        performanceMetrics: partner.performanceMetrics,
        isActive: partner.isActive,
        createdAt: partner.createdAt,
        updatedAt: partner.updatedAt
      }));

      return {
        partners,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  async getById(id: string) {
    const partner = await Partner.findById(id).lean();
    if (!partner) return null;
    
    // Ensure documents and bank details are included in the response
    return {
      ...partner,
      documents: partner.documents || [],
      bankDetails: partner.bankDetails || null,
    };
  },

  async create(data: any) {
    try {
      // Ensure required fields are present
      if (!data.name) {
        throw new Error('Partner name is required');
      }
      if (!data.type) {
        throw new Error('Partner type is required');
      }
      if (!data.contactNumber) {
        throw new Error('Contact number is required');
      }
      if (!data.city) {
        throw new Error('City is required');
      }

      // Add createdBy if not present (for now, use a default)
      const partnerData = {
        ...data,
        createdBy: data.createdBy || null,
        updatedBy: data.updatedBy || null
      };

      return await Partner.create(partnerData);
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  async update(id: string, data: any) {
    return Partner.findByIdAndUpdate(id, data, { new: true });
  },

  async remove(id: string) {
    return Partner.findByIdAndDelete(id);
  },

  async getStats() {
    try {
      const [
        totalPartners,
        corporatePartners,
        individualPartners,
        activePartners,
        pendingPartners,
        inactivePartners,
      ] = await Promise.all([
        Partner.countDocuments(),
        Partner.countDocuments({ type: "Corporate" }),
        Partner.countDocuments({ type: "Individual" }),
        Partner.countDocuments({ status: "Active" }),
        Partner.countDocuments({ status: "Pending" }),
        Partner.countDocuments({ status: "Inactive" }),
      ]);

      return {
        totalPartners,
        corporatePartners,
        individualPartners,
        activePartners,
        pendingPartners,
        inactivePartners,
      };
    } catch (error) {
      console.error("Error fetching partner stats:", error);
      throw new Error("Failed to fetch partner statistics");
    }
  },

  async getCorporateStats() {
    try {
      const [
        totalCorporate,
        activeContracts,
        pendingContracts,
        expiringSoon
      ] = await Promise.all([
        Partner.countDocuments({ type: "Corporate" }),
        Partner.countDocuments({ type: "Corporate", status: "Active" }),
        Partner.countDocuments({ type: "Corporate", status: "Pending" }),
        Partner.countDocuments({ 
          type: "Corporate", 
          status: "Active",
          contractEndDate: { 
            $gte: new Date(), 
            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          }
        })
      ]);

      return {
        totalCorporate,
        activeContracts,
        pendingContracts,
        expiringSoon,
        // Revenue would come from a separate calculation based on business logic
        revenue: "₹45L", // Placeholder for now
        growth: "+22%" // Placeholder for now
      };
    } catch (error) {
      console.error("Error fetching corporate partner stats:", error);
      throw new Error("Failed to fetch corporate partner statistics");
    }
  },

  async getIndividualStats() {
    try {
      const [
        totalIndividual,
        activeAgents,
        pendingAgents,
        topPerformers
      ] = await Promise.all([
        Partner.countDocuments({ type: "Individual" }),
        Partner.countDocuments({ type: "Individual", status: "Active" }),
        Partner.countDocuments({ type: "Individual", status: "Pending" }),
        Partner.countDocuments({ 
          type: "Individual", 
          status: "Active"
        })
      ]);

      return {
        totalIndividual,
        activeAgents,
        pendingAgents,
        topPerformers,
        // These would come from referral/commission calculations
        referrals: "1,234", // Placeholder
        commission: "₹2.5L" // Placeholder
      };
    } catch (error) {
      console.error("Error fetching individual partner stats:", error);
      throw new Error("Failed to fetch individual partner statistics");
    }
  }
};
