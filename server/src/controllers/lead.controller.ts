import { Request, Response, NextFunction } from "express";
import { LeadService } from "../services/lead.service";
import { EmployeeService } from "../services/employee.service";
import {
  CreateLeadDto,
  UpdateLeadStatusDto,
  LeadStatus,
  Gender,
  ModeOfPayment,
} from "../types/lead.types";
import csv from "csv-parser";
import fs from "fs";

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const LeadController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await LeadService.list(req.query, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const lead = await LeadService.getById(req.params.id, user);
      if (!lead) return res.status(404).json({ message: "Not found" });
      res.json(lead);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const leadData: CreateLeadDto = {
        patientName: req.body.patientName,
        age: req.body.age,
        gender: req.body.gender,
        dob: req.body.dob,
        contact: {
          mobile: req.body.contact?.mobile,
          email: req.body.contact?.email,
          whatsappNumber: req.body.contact?.whatsappNumber,
        },
        city: req.body.city,
        address: req.body.address,
        pincode: req.body.pincode,
        treatment: req.body.treatment,
        workingProfession: req.body.workingProfession,
        leadSource: req.body.leadSource,
        modeOfPayment: req.body.modeOfPayment,
        assignedTo: req.body.assignedTo,
        description: req.body.description,
        aadharNumber: req.body.aadharNumber,
        pancardNumber: req.body.pancardNumber,
      };

      const lead = await LeadService.create(leadData, (req as any).user.id);
      res.status(201).json(lead);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await LeadService.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadStatus }: UpdateLeadStatusDto = req.body;

      // Validate leadStatus
      if (!Object.values(LeadStatus).includes(leadStatus)) {
        return res.status(400).json({
          message: "Invalid lead status",
          validStatuses: Object.values(LeadStatus),
        });
      }

      const updated = await LeadService.updateStatus(req.params.id, leadStatus);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await LeadService.assignLead(
        req.params.id,
        req.body.employeeId,
        (req as any).user.id,
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await LeadService.remove(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async getFollowUpToday(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const user = (req as any).user;
      const followUps = await LeadService.getFollowUpToday(page, limit, user);
      res.json(followUps);
    } catch (err) {
      next(err);
    }
  },

  async getOPD(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.params.filter || "today";
      const user = (req as any).user;
      const opdData = await LeadService.getOPD(filter, user);
      res.json(opdData);
    } catch (err) {
      next(err);
    }
  },

  async getTodayOPD(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const opdData = await LeadService.getTodayOPD(user);
      res.json(opdData);
    } catch (err) {
      next(err);
    }
  },

  async getIPD(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.params.filter || "today";
      const user = (req as any).user;
      const ipdData = await LeadService.getIPD(filter, user);
      res.json(ipdData);
    } catch (err) {
      next(err);
    }
  },

  async getTodayIPD(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const ipdData = await LeadService.getTodayIPD(user);
      res.json(ipdData);
    } catch (err) {
      next(err);
    }
  },

  async getFormConfig(req: Request, res: Response, next: NextFunction) {
    try {
      // Fetch employees for assignment
      const employees = await EmployeeService.list({});

      // Predefined options
      const leadSources = [
        "Website",
        "Referral",
        "Social Media",
        "Walk-in",
        "Phone Call",
        "Email Campaign",
        "Google Ads",
        "Facebook Ads",
      ];

      const treatments = [
        "Consultation",
        "Follow-up",
        "Surgery",
        "Emergency",
        "Preventive Care",
        "Diagnostic Testing",
        "Rehabilitation",
        "Specialist Referral",
      ];

      res.json({
        employees: employees.employees || employees,
        leadSources,
        treatments,
        genders: Object.values(Gender),
        paymentModes: Object.values(ModeOfPayment),
      });
    } catch (err) {
      console.error("Error fetching form config:", err);
      // Return fallback data if database is unavailable
      res.json({
        employees: [],
        leadSources: [
          "Website",
          "Referral",
          "Social Media",
          "Walk-in",
          "Phone Call",
        ],
        treatments: [
          "Consultation",
          "Follow-up",
          "Surgery",
          "Emergency",
          "Preventive Care",
        ],
        genders: Object.values(Gender),
        paymentModes: Object.values(ModeOfPayment),
      });
    }
  },

  async uploadCsv(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const filePath = req.file.path;
      const results: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let successCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      // Set headers for Server-Sent Events
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Helper function to send SSE messages
      const sendProgress = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Parse CSV file
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          results.push(data);
        })
        .on("end", async () => {
          try {
            const totalRows = results.length;

            // Send initial status
            sendProgress({
              type: "start",
              totalRows,
              message: "Starting CSV processing...",
            });

            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                // Map CSV columns to your expected structure
                const leadData: CreateLeadDto = {
                  patientName: row["Patient Name"] || row["patientName"] || "",
                  contact: {
                    mobile:
                      row["Contact Number"] ||
                      row["Contact number"] ||
                      row["contactNumber"] ||
                      row["mobile"] ||
                      "",
                    email: "",
                    whatsappNumber: "",
                  },
                  city: row["City"] || row["city"] || "",
                  treatment: row["Treatment"] || row["treatment"] || "",
                  leadSource: "CSV Upload",
                  leadStatus: LeadStatus.NEW,
                };

                // Validation
                if (!leadData.patientName || !leadData.contact.mobile) {
                  skippedCount++;
                  errors.push(
                    `Row ${
                      i + 1
                    }: Skipped — Missing required fields (Patient Name or Contact Number)`,
                  );

                  // Send progress update
                  sendProgress({
                    type: "progress",
                    processedCount,
                    successCount,
                    skippedCount,
                    failedCount,
                    totalRows,
                    currentRow: i + 1,
                    status: "skipped",
                  });
                  continue;
                }

                // Try creating the lead
                await LeadService.create(leadData, (req as any).user.id);
                successCount++;

                // Send progress update
                sendProgress({
                  type: "progress",
                  processedCount,
                  successCount,
                  skippedCount,
                  failedCount,
                  totalRows,
                  currentRow: i + 1,
                  status: "success",
                });
              } catch (error: any) {
                failedCount++;
                errors.push(`Row ${i + 1}: Failed — ${error.message}`);

                // Send progress update
                sendProgress({
                  type: "progress",
                  processedCount,
                  successCount,
                  skippedCount,
                  failedCount,
                  totalRows,
                  currentRow: i + 1,
                  status: "failed",
                });
              }
            }

            // Clean up uploaded file
            fs.unlinkSync(filePath);

            // Final Summary
            const summary = {
              type: "complete",
              message: "CSV processing completed",
              totalRows: processedCount,
              successfulImports: successCount,
              skippedRows: skippedCount,
              failedRows: failedCount,
              summary: {
                successPercentage:
                  processedCount > 0
                    ? ((successCount / processedCount) * 100).toFixed(2) + "%"
                    : "0%",
                failurePercentage:
                  processedCount > 0
                    ? ((failedCount / processedCount) * 100).toFixed(2) + "%"
                    : "0%",
                skippedPercentage:
                  processedCount > 0
                    ? ((skippedCount / processedCount) * 100).toFixed(2) + "%"
                    : "0%",
              },
              errors: errors,
            };

            console.log("CSV Upload Summary:", summary);
            sendProgress(summary);
            res.end();
          } catch (error) {
            console.error("Error processing CSV:", error);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            sendProgress({
              type: "error",
              message: "Error processing CSV file",
            });
            res.end();
          }
        })
        .on("error", (error) => {
          console.error("Error reading CSV:", error);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          sendProgress({
            type: "error",
            message: "Error reading CSV file",
          });
          res.end();
        });
    } catch (err: any) {
      console.error("CSV upload error:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: err.message || "Error uploading CSV" });
    }
  },

  async getCities(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const cities = await LeadService.getCities(user);
      res.json({ cities });
    } catch (err) {
      next(err);
    }
  },

  async getLeadsByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.params.employeeId;
      const result = await LeadService.getLeadsByEmployee(
        employeeId,
        req.query,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
