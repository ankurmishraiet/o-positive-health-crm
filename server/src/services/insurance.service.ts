import { Insurance } from "../models/insurance.model";

export const InsuranceService = {
  async create(data: any) {
    return Insurance.create(data);
  },

  async getByLead(leadId: string) {
    return Insurance.findOne({ leadId }).lean();
  },
};
