import { Request, Response, NextFunction } from "express";
import { InvoiceService } from "../services/invoice.service";
import {
  PDFGeneratorService,
  createInvoiceData,
} from "../services/pdf-generator.service";
import path from "path";

export const InvoiceController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const fileUrl = (req as any).file?.path;
      const invoiceData = {
        ...req.body,
        invoiceFileUrl: fileUrl,
        createdBy: userId,
        generatedBy: userId,
      };
      const invoice = await InvoiceService.create(invoiceData);
      res.status(201).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await InvoiceService.list(req.query);
      res.json(invoices);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const invoice = await InvoiceService.update(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.delete(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json({ message: "Invoice deleted successfully" });
    } catch (err) {
      next(err);
    }
  },

  async updatePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { paidAmount, paymentMethod } = req.body;
      const invoice = await InvoiceService.updatePayment(
        req.params.id,
        paidAmount,
        paymentMethod,
        userId,
      );
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async markAsSent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const invoice = await InvoiceService.markAsSent(req.params.id, userId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async markAsViewed(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.markAsViewed(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async sendReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const invoice = await InvoiceService.sendReminder(req.params.id, userId);
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await InvoiceService.getStats(req.query);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Safely map invoice items to ensure they have all required properties
      const items = ((invoice as any).items || []).map((item: any) => ({
        description: item.description || item.title || "No description",
        hsnCode: item.hsnCode || undefined,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        amount: item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0),
      }));

      // Convert number to words function
      function numberToWords(num: number): string {
        if (num === 0) return "Zero Rupees Only";

        const ones = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
        ];
        const tens = [
          "",
          "",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];
        const teens = [
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ];

        function convertLessThanThousand(n: number): string {
          if (n === 0) return "";
          if (n < 10) return ones[n];
          if (n < 20) return teens[n - 10];
          if (n < 100)
            return (
              tens[Math.floor(n / 10)] +
              (n % 10 !== 0 ? " " + ones[n % 10] : "")
            );
          return (
            ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
          );
        }

        const crores = Math.floor(num / 10000000);
        const lakhs = Math.floor((num % 10000000) / 100000);
        const thousands = Math.floor((num % 100000) / 1000);
        const remainder = Math.floor(num % 1000);

        let result = "";
        if (crores > 0) result += convertLessThanThousand(crores) + " Crore ";
        if (lakhs > 0) result += convertLessThanThousand(lakhs) + " Lakh ";
        if (thousands > 0)
          result += convertLessThanThousand(thousands) + " Thousand ";
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim() + " Rupees Only";
      }

      // Prepare invoice data in the new format
      const invoiceData = {
        invoiceDetails: {
          invoiceNumber:
            (invoice as any).invoiceNumber ||
            "INV-" + (invoice as any)._id.toString().slice(-6).toUpperCase(),
          issueDate: (invoice as any).issueDate
            ? new Date((invoice as any).issueDate).toLocaleDateString("en-IN")
            : new Date().toLocaleDateString("en-IN"),
          dueDate: (invoice as any).dueDate
            ? new Date((invoice as any).dueDate).toLocaleDateString("en-IN")
            : new Date().toLocaleDateString("en-IN"),
        },
        billTo: {
          name: (invoice as any).entityName || "Unknown",
          address:
            (invoice as any).hospitalAddress ||
            (invoice as any).entityAddress ||
            "",
          gstNumber: (invoice as any).hospitalGSTNumber || undefined,
        },
        items: items,
        paymentSummary: {
          subtotal: (invoice as any).subtotal || 0,
          gstRate: (invoice as any).gstRate || 0,
          gstAmount: (invoice as any).gstAmount || 0,
          totalAmount: (invoice as any).totalAmount || 0,
          amountInWords: numberToWords((invoice as any).totalAmount || 0),
          paymentStatus: (invoice as any).paymentStatus || "Unpaid",
        },
      };

      // Use the helper function to create properly formatted invoice data
      const formattedInvoiceData = createInvoiceData(invoiceData);

      // Generate PDF stream
      const pdfStream =
        PDFGeneratorService.generateInvoicePDF(formattedInvoiceData);

      // Set response headers for PDF download
      const filename = `invoice-${formattedInvoiceData.invoiceDetails.invoiceNumber}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      // Pipe the PDF stream to response
      pdfStream.pipe(res);

      // Handle stream errors
      pdfStream.on("error", (error) => {
        console.error("PDF generation error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error generating PDF" });
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async generatePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await InvoiceService.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Safely map invoice items to ensure they have all required properties
      const items = ((invoice as any).items || []).map((item: any) => ({
        description: item.description || item.title || "No description",
        hsnCode: item.hsnCode || undefined,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        amount: item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0),
      }));

      // Convert number to words function
      function numberToWords(num: number): string {
        if (num === 0) return "Zero Rupees Only";

        const ones = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
        ];
        const tens = [
          "",
          "",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];
        const teens = [
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ];

        function convertLessThanThousand(n: number): string {
          if (n === 0) return "";
          if (n < 10) return ones[n];
          if (n < 20) return teens[n - 10];
          if (n < 100)
            return (
              tens[Math.floor(n / 10)] +
              (n % 10 !== 0 ? " " + ones[n % 10] : "")
            );
          return (
            ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 !== 0 ? " " + convertLessThanThousand(n % 100) : "")
          );
        }

        const crores = Math.floor(num / 10000000);
        const lakhs = Math.floor((num % 10000000) / 100000);
        const thousands = Math.floor((num % 100000) / 1000);
        const remainder = Math.floor(num % 1000);

        let result = "";
        if (crores > 0) result += convertLessThanThousand(crores) + " Crore ";
        if (lakhs > 0) result += convertLessThanThousand(lakhs) + " Lakh ";
        if (thousands > 0)
          result += convertLessThanThousand(thousands) + " Thousand ";
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim() + " Rupees Only";
      }

      // Prepare invoice data in the new format
      const invoiceData = {
        invoiceDetails: {
          invoiceNumber:
            (invoice as any).invoiceNumber ||
            "INV-" + (invoice as any)._id.toString().slice(-6).toUpperCase(),
          issueDate: (invoice as any).issueDate
            ? new Date((invoice as any).issueDate).toLocaleDateString("en-IN")
            : new Date().toLocaleDateString("en-IN"),
          dueDate: (invoice as any).dueDate
            ? new Date((invoice as any).dueDate).toLocaleDateString("en-IN")
            : new Date().toLocaleDateString("en-IN"),
        },
        billTo: {
          name: (invoice as any).entityName || "Unknown",
          address:
            (invoice as any).hospitalAddress ||
            (invoice as any).entityAddress ||
            "",
          gstNumber: (invoice as any).hospitalGSTNumber || undefined,
        },
        items: items,
        paymentSummary: {
          subtotal: (invoice as any).subtotal || 0,
          gstRate: (invoice as any).gstRate || 0,
          gstAmount: (invoice as any).gstAmount || 0,
          totalAmount: (invoice as any).totalAmount || 0,
          amountInWords: numberToWords((invoice as any).totalAmount || 0),
          paymentStatus: (invoice as any).paymentStatus || "Unpaid",
        },
      };

      // Use the helper function to create properly formatted invoice data
      const formattedInvoiceData = createInvoiceData(invoiceData);

      // Generate PDF stream
      const pdfStream =
        PDFGeneratorService.generateInvoicePDF(formattedInvoiceData);

      // Set response headers for inline PDF display
      const filename = `invoice-${formattedInvoiceData.invoiceDetails.invoiceNumber}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

      // Pipe the PDF stream to response
      pdfStream.pipe(res);

      // Handle stream errors
      pdfStream.on("error", (error) => {
        console.error("PDF generation error:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error generating PDF" });
        }
      });
    } catch (err) {
      next(err);
    }
  },
};
//       res.setHeader("Content-Type", "application/pdf");
//       res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

//       // Pipe the PDF stream to response
//       pdfStream.pipe(res);

//       // Handle stream errors
//       pdfStream.on("error", (error) => {
//         console.error("PDF generation error:", error);
//         if (!res.headersSent) {
//           res.status(500).json({ message: "Error generating PDF" });
//         }
//       });
//     } catch (err) {
//       next(err);
//     }
//   },
// };
