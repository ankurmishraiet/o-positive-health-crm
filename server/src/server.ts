import express, { type Express } from "express";
import { json, urlencoded } from "body-parser";
import cors from "cors";
import morgan from "morgan";

import { errorHandler } from "./middlewares/error.middleware";

// Route imports
import authRoutes from "./routes/auth.routes";
import employeeRoutes from "./routes/employee.routes";
import leadRoutes from "./routes/lead.routes";
import insuranceRoutes from "./routes/insurance.routes";
import reimbursementRoutes from "./routes/reimbursement.routes";
import doctorRoutes from "./routes/doctor.routes";
import hospitalRoutes from "./routes/hospital.routes";
import appointmentRoutes from "./routes/appointment.routes";
import cabRoutes from "./routes/cab.routes";
import partnerRoutes from "./routes/partner.routes";
import loanRoutes from "./routes/loan.routes";
import loanLeadRoutes from "./routes/loanLead.routes";
import invoiceRoutes from "./routes/invoice.routes";
import documentRoutes from "./routes/document.routes";
import financeRoutes from "./routes/finance.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import hrRoutes from "./routes/hr.routes";
import roleRoutes from "./routes/role.routes";
import bulkUploadRoutes from "./routes/bulk-upload.routes";
import patientRoutes from "./routes/patient.routes";
import attendanceRoutes from "./routes/attendance.routes";
import targetRoutes from "./routes/target.routes";

export const createServer = (): Express => {
  const app = express();

  app
    .disable("x-powered-by")
    .use(
      morgan(
        "[api]: :method :url :status :res[content-length] - :response-time ms"
      )
    )
    .use(cors())
    .use(urlencoded({ extended: true }))
    .use(json());

  // Routes
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/employees", employeeRoutes);
  app.use("/api/v1/leads", leadRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/insurance", insuranceRoutes);
  app.use("/api/v1/reimbursement", reimbursementRoutes);
  app.use("/api/v1/doctors", doctorRoutes);
  app.use("/api/v1/hospitals", hospitalRoutes);
  app.use("/api/v1/appointments", appointmentRoutes);
  app.use("/api/v1/cabs", cabRoutes);
  app.use("/api/v1/partners", partnerRoutes);
  app.use("/api/v1/loans", loanRoutes);
  app.use("/api/v1/loan-leads", loanLeadRoutes);
  app.use("/api/v1/invoices", invoiceRoutes);
  app.use("/api/v1/documents", documentRoutes);
  app.use("/api/v1/finance", financeRoutes);
  app.use("/api/v1/hr", hrRoutes);
  app.use("/api/v1/roles", roleRoutes);
  app.use("/api/v1/bulk-upload", bulkUploadRoutes);
  app.use("/api/v1/patients", patientRoutes);
  app.use("/api/v1/attendance", attendanceRoutes);
  app.use("/api/v1/targets", targetRoutes);
  
  app.get("/", (_, res) => {
    res.json({
      status: "Running",
      message: "O Positive CRM API is running...",
      version: "0.5.39",
      author: [
        {
          name: "O Positive CRM",
          email: "admin@opositive.com",
        },
      ],
      date: new Date(),
    });
  });

  // Config endpoint for frontend
  app.get("/api/v1/config", (_, res) => {
    res.json({
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
    });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
