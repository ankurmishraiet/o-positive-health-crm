import { Request, Response, NextFunction } from "express";
import { EmployeeService } from "../services/employee.service";
import { HospitalService } from "../services/hospital.service";
import { DoctorService } from "../services/doctor.service";
import { PartnerService } from "../services/partner.service";
import csv from "csv-parser";
import fs from "fs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const BulkUploadController = {
  async uploadEmployees(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const filePath = req.file.path;
      const results: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let successCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                const employeeData = {
                  name: row['Name'] || row['name'] || '',
                  email: row['Email'] || row['email'] || '',
                  phone: row['Phone'] || row['phone'] || '',
                  age: row['Age'] || row['age'] ? parseInt(row['Age'] || row['age']) : undefined,
                  gender: row['Gender'] || row['gender'] || '',
                  designation: row['Designation'] || row['designation'] || '',
                  department: row['Department'] || row['department'] || '',
                  salary: row['Salary'] || row['salary'] ? parseFloat(row['Salary'] || row['salary']) : undefined,
                  address: row['Address'] || row['address'] || '',
                  qualification: row['Qualification'] || row['qualification'] || '',
                  joiningDate: row['Joining Date'] || row['joiningDate'] ? new Date(row['Joining Date'] || row['joiningDate']) : new Date(),
                  status: row['Status'] || row['status'] || 'Active',
                };

                if (!employeeData.name || !employeeData.email || !employeeData.phone) {
                  errors.push(`Row ${i + 1}: Name, Email, and Phone are required`);
                  continue;
                }

                await EmployeeService.create(employeeData);
                successCount++;
              } catch (error: any) {
                errors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            fs.unlinkSync(filePath);

            res.json({
              message: "Employee CSV processing completed",
              totalRows: processedCount,
              successfulImports: successCount,
              failures: processedCount - successCount,
              errors: errors
            });
          } catch (error) {
            console.error("Error processing employee CSV:", error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: "Error processing CSV file" });
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ message: "Error reading CSV file" });
        });
    } catch (err: any) {
      console.error("CSV upload error:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: err.message || "Error uploading CSV" });
    }
  },

  async uploadHospitals(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const filePath = req.file.path;
      const results: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let successCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                const hospitalData = {
                  name: row['Name'] || row['name'] || '',
                  address: row['Address'] || row['address'] || '',
                  phone: row['Phone'] || row['phone'] || '',
                  email: row['Email'] || row['email'] || '',
                  location: {
                    city: row['City'] || row['city'] || '',
                    state: row['State'] || row['state'] || '',
                    pin: row['PIN'] || row['pin'] || '',
                  },
                  type: row['Type'] || row['type'] || 'General',
                  beds: row['Beds'] || row['beds'] ? parseInt(row['Beds'] || row['beds']) : 0,
                  emergencyServices: row['Emergency Services'] || row['emergencyServices'] || 'No',
                  status: row['Status'] || row['status'] || 'Active',
                };

                if (!hospitalData.name) {
                  errors.push(`Row ${i + 1}: Hospital Name is required`);
                  continue;
                }

                // Check for duplicate phone number
                if (hospitalData.phone) {
                  const existingHospitals = await HospitalService.list({ phone: hospitalData.phone });
                  const hospitalsArray = Array.isArray(existingHospitals) ? existingHospitals : [];
                  if (hospitalsArray.length > 0) {
                    errors.push(`Row ${i + 1}: Hospital with phone ${hospitalData.phone} already exists`);
                    continue;
                  }
                }

                await HospitalService.create(hospitalData);
                successCount++;
              } catch (error: any) {
                errors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            fs.unlinkSync(filePath);

            res.json({
              message: "Hospital CSV processing completed",
              totalRows: processedCount,
              successfulImports: successCount,
              failures: processedCount - successCount,
              errors: errors
            });
          } catch (error) {
            console.error("Error processing hospital CSV:", error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: "Error processing CSV file" });
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ message: "Error reading CSV file" });
        });
    } catch (err: any) {
      console.error("CSV upload error:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: err.message || "Error uploading CSV" });
    }
  },

  async uploadDoctors(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const filePath = req.file.path;
      const results: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let successCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                const doctorData = {
                  name: row['Name'] || row['name'] || '',
                  specialization: row['Specialization'] || row['specialization'] || '',
                  email: row['Email'] || row['email'] || '',
                  phone: row['Phone'] || row['phone'] || '',
                  qualifications: row['Qualifications'] || row['qualifications'] || '',
                  experienceYears: row['Experience Years'] || row['experienceYears'] ? parseInt(row['Experience Years'] || row['experienceYears']) : 0,
                  location: row['Location'] || row['location'] || '',
                  consultationFee: row['Consultation Fee'] || row['consultationFee'] ? parseFloat(row['Consultation Fee'] || row['consultationFee']) : undefined,
                  availability: row['Availability'] || row['availability'] || '',
                  isActive: true,
                };

                if (!doctorData.name || !doctorData.phone) {
                  errors.push(`Row ${i + 1}: Name and Phone are required`);
                  continue;
                }

                // Check for duplicate phone number
                if (doctorData.phone) {
                  const existingDoctors = await DoctorService.list({ phone: doctorData.phone } as any);
                  const doctorsArray = existingDoctors?.doctors || [];
                  if (doctorsArray.length > 0) {
                    errors.push(`Row ${i + 1}: Doctor with phone ${doctorData.phone} already exists`);
                    continue;
                  }
                }

                await DoctorService.create(doctorData);
                successCount++;
              } catch (error: any) {
                errors.push(`Row ${i + 1}: ${error.message}`);
              }
            }

            fs.unlinkSync(filePath);

            res.json({
              message: "Doctor CSV processing completed",
              totalRows: processedCount,
              successfulImports: successCount,
              failures: processedCount - successCount,
              errors: errors
            });
          } catch (error) {
            console.error("Error processing doctor CSV:", error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: "Error processing CSV file" });
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ message: "Error reading CSV file" });
        });
    } catch (err: any) {
      console.error("CSV upload error:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: err.message || "Error uploading CSV" });
    }
  },

  async uploadPartners(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const filePath = req.file.path;
      const results: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let successCount = 0;

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', async () => {
          try {
            for (let i = 0; i < results.length; i++) {
              const row = results[i];
              processedCount++;

              try {
                const partnerData = {
                  name: row['Name'] || row['name'] || '',
                  contactPerson: row['Contact Person'] || row['contactPerson'] || '',
                  phone: row['Phone'] || row['phone'] || '',
                  email: row['Email'] || row['email'] || '',
                  address: row['Address'] || row['address'] || '',
                  city: row['City'] || row['city'] || '',
                  type: row['Type'] || row['type'] || 'individual',
                };

                await PartnerService.create(partnerData);
                successCount++;
              } catch (error: any) {
                errors.push(`Row ${processedCount}: ${error.message}`);
              }
            }

            // Clean up the uploaded file
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }

            res.json({
              totalRows: processedCount,
              successfulImports: successCount,
              failures: processedCount - successCount,
              errors,
            });
          } catch (error: any) {
            console.error("Error processing CSV:", error);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            res.status(500).json({ message: "Error processing CSV file" });
          }
        })
        .on('error', (error) => {
          console.error("Error reading CSV:", error);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({ message: "Error reading CSV file" });
        });
    } catch (err: any) {
      console.error("CSV upload error:", err);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: err.message || "Error uploading CSV" });
    }
  }
};
