import { Request, Response, NextFunction } from "express";

export const ConfigController = {
  async getDocumentConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = {
        documentTypes: [
          { value: "Medical Reports", label: "Medical Reports" },
          { value: "Insurance Documents", label: "Insurance Documents" },
          { value: "Lab Reports", label: "Lab Reports" },
          { value: "Prescriptions", label: "Prescriptions" },
          { value: "Discharge Documents", label: "Discharge Documents" },
          { value: "Surgery Reports", label: "Surgery Reports" },
          { value: "Salary Slips", label: "Salary Slips" },
          { value: "Loan Documents", label: "Loan Documents" },
          { value: "Reimbursement Bills", label: "Reimbursement Bills" },
          { value: "TPA Forms", label: "TPA Forms" },
          { value: "Aadhar Card", label: "Aadhar Card" },
          { value: "PAN Card", label: "PAN Card" },
          { value: "Passport Photo", label: "Passport Photo" },
          { value: "Cancel Cheque", label: "Cancel Cheque" },
          { value: "Doctor's Medical Certificate", label: "Doctor's Medical Certificate" },
          { value: "GST Certificate", label: "GST Certificate" },
          { value: "Incorporation Certificate", label: "Incorporation Certificate" },
          { value: "Other Official Documents", label: "Other Official Documents" },
          { value: "Other", label: "Other" },
        ],
        entityTypes: [
          { value: "Patient", label: "Patient" },
          { value: "Employee", label: "Employee" },
          { value: "Doctor", label: "Doctor" },
          { value: "Hospital", label: "Hospital" },
          { value: "Lead", label: "Lead" },
          { value: "Loan", label: "Loan" },
          { value: "Insurance", label: "Insurance" },
        ],
      };
      
      res.json(config);
    } catch (err) {
      next(err);
    }
  },
};
