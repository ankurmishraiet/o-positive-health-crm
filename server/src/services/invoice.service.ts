import { Invoice } from "../models/invoice.model";
import { Loan } from "../models/loan.model";
import { Document } from "../models/document.model";
import fs from "fs";
import path from "path";

export const InvoiceService = {
  async create(data: any) {
    return await Invoice.create(data);
  },

  async getById(id: string) {
    return await Invoice.findById(id)
      .populate("entityId")
      .populate("generatedBy", "name email")
      .populate("approvedBy", "name email")
      .lean();
  },

  async update(id: string, updateData: any) {
    return await Invoice.findByIdAndUpdate(id, updateData, { new: true });
  },

  async delete(id: string) {
    return await Invoice.findByIdAndDelete(id);
  },

  async generateLoanInvoice(
    loanId: string,
    type: "processing_fee" | "emi" | "penalty",
    emiNumber?: string,
    userId?: string
  ) {
    const loan = await Loan.findById(loanId).lean();
    if (!loan) throw new Error("Loan not found");

    let invoiceData: any = {
      entityType: "Loan",
      entityId: loanId,
      entityName: loan.applicantDetails?.fullName || "Unknown Applicant",
      entityAddress: loan.applicantDetails?.address,
      entityContact: loan.applicantDetails?.contactNumber,
      loanId: loanId,
      generatedBy: userId,
      invoiceCategory: "Financial",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [],
    };

    switch (type) {
      case "processing_fee":
        const processingFee = loan.amount * 0.03; // 3% processing fee
        invoiceData.invoiceType = "Processing Fee";
        invoiceData.items = [
          {
            description: `Loan Processing Fee for ${
              loan.loanPurpose || "Medical Loan"
            }`,
            quantity: 1,
            unitPrice: processingFee,
            totalPrice: processingFee,
            category: "Fee",
          },
        ];
        invoiceData.description = `Processing fee for loan application ${loanId}`;
        break;

      case "emi":
        if (!emiNumber) throw new Error("EMI number required for EMI invoice");
        const emi = loan.emiDetails?.find(
          (e: any) => e.emiNumber === emiNumber
        );
        if (!emi) throw new Error("EMI not found");

        invoiceData.invoiceType = "Loan";
        invoiceData.emiNumber = emiNumber;
        invoiceData.items = [
          {
            description: `EMI Payment ${emiNumber} for Loan ${loanId}`,
            quantity: 1,
            unitPrice: emi.amount,
            totalPrice: emi.amount,
            category: "EMI",
          },
        ];
        invoiceData.dueDate = emi.dueDate;
        invoiceData.description = `EMI payment invoice for ${emiNumber}`;
        break;

      case "penalty":
        if (!emiNumber)
          throw new Error("EMI number required for penalty invoice");
        const overdueEmi = loan.emiDetails?.find(
          (e: any) => e.emiNumber === emiNumber
        );
        if (!overdueEmi || !overdueEmi.penaltyAmount)
          throw new Error("No penalty found for this EMI");

        invoiceData.invoiceType = "Penalty";
        invoiceData.emiNumber = emiNumber;
        invoiceData.items = [
          {
            description: `Late Payment Penalty for EMI ${emiNumber}`,
            quantity: 1,
            unitPrice: overdueEmi.penaltyAmount,
            totalPrice: overdueEmi.penaltyAmount,
            category: "Penalty",
          },
        ];
        invoiceData.description = `Penalty for overdue EMI ${emiNumber}`;
        break;
    }

    return await this.create(invoiceData);
  },

  async generateSalaryInvoice(documentId: string, userId: string) {
    const salarySlip = await Document.findById(documentId).lean();
    if (!salarySlip || salarySlip.category !== "Salary Slips") {
      throw new Error("Salary slip document not found");
    }

    const salaryData = salarySlip.salarySlipData;
    if (!salaryData) throw new Error("Salary data not found");

    const invoiceData = {
      entityType: "Employee",
      entityId: salaryData.employeeId,
      entityName: salaryData.employeeName,
      invoiceType: "Salary",
      invoiceCategory: "HR",
      generatedBy: userId,
      dueDate: new Date(), // Salary is due immediately
      status: "Paid", // Salary invoices are typically marked as paid
      paymentStatus: "Paid",
      paymentDate: new Date(),
      paidAmount: salaryData.netSalary,
      items: [
        {
          description: "Basic Salary",
          quantity: 1,
          unitPrice: salaryData.basicSalary,
          totalPrice: salaryData.basicSalary,
          category: "Salary",
        },
        {
          description: "Allowances",
          quantity: 1,
          unitPrice: salaryData.allowances,
          totalPrice: salaryData.allowances,
          category: "Allowance",
        },
        {
          description: "Deductions",
          quantity: 1,
          unitPrice: -salaryData.deductions,
          totalPrice: -salaryData.deductions,
          category: "Deduction",
        },
      ],
      description: `Salary invoice for ${salaryData.month} ${salaryData.year}`,
    };

    return await this.create(invoiceData);
  },

  async generateServiceInvoice(
    entityType: string,
    entityId: string,
    services: any[],
    userId: string
  ) {
    const invoiceData = {
      entityType,
      entityId,
      entityName: services[0]?.providerName || "Service Provider",
      invoiceType: "Service",
      invoiceCategory: "Medical",
      generatedBy: userId,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      items: services.map((service) => ({
        description: service.description,
        quantity: service.quantity || 1,
        unitPrice: service.amount,
        totalPrice: service.amount * (service.quantity || 1),
        category: "Service",
      })),
      description: `Service invoice for ${entityType}`,
    };

    return await this.create(invoiceData);
  },

  async updatePaymentStatus(id: string, paymentData: any) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");

    invoice.paidAmount = paymentData.amount;
    invoice.paymentMethod = paymentData.method;
    invoice.paymentDate = new Date();

    const paidAmount = Number(invoice.paidAmount || 0);
    const totalAmount = Number(invoice.totalAmount || 0);
    if (paidAmount >= totalAmount) {
      invoice.paymentStatus = "Paid";
      invoice.status = "Paid";
    } else if (paidAmount > 0) {
      invoice.paymentStatus = "Partially Paid";
    }

    return await invoice.save();
  },

  async getInvoiceStatistics() {
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({
      paymentStatus: "Paid",
    });
    const overdueInvoices = await Invoice.countDocuments({
      status: "Sent",
      dueDate: { $lt: new Date() },
      paymentStatus: { $ne: "Paid" },
    });

    const totalAmount = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const paidAmount = await Invoice.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);
    const pendingAmount = await Invoice.aggregate([
      { $match: { paymentStatus: { $ne: "Paid" } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ["$totalAmount", "$paidAmount"] } },
        },
      },
    ]);

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      pendingInvoices: totalInvoices - paidInvoices,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
      collectionRate: totalAmount[0]?.total
        ? ((paidAmount[0]?.total || 0) / totalAmount[0].total) * 100
        : 0,
    };
  },

  async generateInvoicePDF(id: string) {
    const invoice = await this.getById(id);
    if (!invoice) throw new Error("Invoice not found");

    // TODO: Implement PDF generation using libraries like puppeteer or jsPDF
    // For now, return placeholder PDF content
    const pdfContent = this.generateInvoicePDFContent(invoice);
    const fileName = `invoice_${invoice.invoiceNumber}.pdf`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, fileName);

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, pdfContent);

    // Update invoice with PDF URL
    await this.update(id, { invoiceFileUrl: `/uploads/${fileName}` });

    return filePath;
  },

  generateInvoicePDFContent(invoice: any): Buffer {
    // Generate a minimal but valid PDF document
    // This is a basic PDF structure that modern PDF readers can render
    
    const invoiceNumber = invoice.invoiceNumber || 'N/A';
    const issueDate = invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A';
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';
    const entityName = invoice.entityName || 'N/A';
    const subtotal = invoice.subtotal || 0;
    const gstRate = invoice.gstRate || 0;
    const gstAmount = invoice.gstAmount || 0;
    const totalAmount = invoice.totalAmount || 0;
    const paymentStatus = invoice.paymentStatus || 'Unpaid';
    
    // Build the content stream
    const contentStream = `BT
/F1 24 Tf
50 750 Td
(INVOICE) Tj
/F1 12 Tf
0 -30 Td
(Invoice Number: ${invoiceNumber}) Tj
0 -20 Td
(Issue Date: ${issueDate}) Tj
0 -20 Td
(Due Date: ${dueDate}) Tj
/F1 14 Tf
0 -30 Td
(Bill To:) Tj
/F1 12 Tf
0 -20 Td
(${entityName}) Tj
/F1 14 Tf
0 -30 Td
(Payment Summary:) Tj
/F1 12 Tf
0 -20 Td
(Subtotal: Rs ${subtotal.toFixed(2)}) Tj
0 -20 Td
(GST (${gstRate}%): Rs ${gstAmount.toFixed(2)}) Tj
0 -20 Td
(Total Amount: Rs ${totalAmount.toFixed(2)}) Tj
0 -20 Td
(Payment Status: ${paymentStatus}) Tj
ET`;

    const contentLength = contentStream.length;
    
    // Build the complete PDF
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>
endobj
4 0 obj
<< /Length ${contentLength} >>
stream
${contentStream}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000329 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${430 + contentLength}
%%EOF`;

    return Buffer.from(pdfContent, 'utf-8');
  },

  async list(filters: any = {}) {
    const {
      entityType,
      entityId,
      status,
      paymentStatus,
      category,
      invoiceType,
      dateFrom,
      dateTo,
      dueDateFrom,
      dueDateTo,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = filters;

    const query: any = {};

    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (category) query.category = category;
    if (invoiceType) query.invoiceType = invoiceType;

    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    if (dueDateFrom || dueDateTo) {
      query.dueDate = {};
      if (dueDateFrom) query.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) query.dueDate.$lte = new Date(dueDateTo);
    }

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate("entityId")
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(query),
    ]);

    return {
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updatePayment(
    id: string,
    paidAmount: number,
    paymentMethod: string,
    userId: string
  ) {
    const invoice = await Invoice.findById(id);
    if (!invoice) throw new Error("Invoice not found");

    invoice.paidAmount = (invoice.paidAmount || 0) + paidAmount;
    invoice.paymentMethod = paymentMethod as any;
    invoice.updatedBy = userId as any;

    return invoice.save();
  },

  async markAsSent(id: string, userId: string) {
    return Invoice.findByIdAndUpdate(
      id,
      {
        status: "Sent",
        sentDate: new Date(),
        updatedBy: userId,
      },
      { new: true }
    );
  },

  async markAsViewed(id: string) {
    return Invoice.findByIdAndUpdate(
      id,
      {
        status: "Viewed",
        viewedDate: new Date(),
      },
      { new: true }
    );
  },

  async getStats(filters: any = {}) {
    const {
      dateFrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dateTo = new Date(),
    } = filters;

    const matchStage = {
      date: { $gte: dateFrom, $lte: dateTo },
    };

    const stats = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          totalPending: { $sum: "$pendingAmount" },
          totalInvoices: { $sum: 1 },
          draftInvoices: {
            $sum: { $cond: [{ $eq: ["$status", "Draft"] }, 1, 0] },
          },
          sentInvoices: {
            $sum: { $cond: [{ $eq: ["$status", "Sent"] }, 1, 0] },
          },
          paidInvoices: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] },
          },
          overdueInvoices: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Overdue"] }, 1, 0] },
          },
          incomeAmount: {
            $sum: {
              $cond: [{ $eq: ["$category", "Income"] }, "$totalAmount", 0],
            },
          },
          expenseAmount: {
            $sum: {
              $cond: [{ $eq: ["$category", "Expense"] }, "$totalAmount", 0],
            },
          },
        },
      },
    ]);

    // Entity type breakdown
    const entityTypeStats = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$entityType",
          totalAmount: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$totalAmount" },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Payment status breakdown
    const paymentStatusStats = await Invoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$paymentStatus",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Overdue invoices
    const overdueInvoices = await Invoice.find({
      paymentStatus: { $in: ["Unpaid", "Partially Paid", "Overdue"] },
      dueDate: { $lt: new Date() },
    })
      .populate("entityId", "name")
      .sort("dueDate")
      .limit(10)
      .lean();

    // Monthly trend
    const monthlyTrend = await Invoice.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth() - 11,
              1
            ),
            $lte: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalAmount: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalInvoices: 0,
      draftInvoices: 0,
      sentInvoices: 0,
      paidInvoices: 0,
      overdueInvoices: 0,
      incomeAmount: 0,
      expenseAmount: 0,
    };

    return {
      ...result,
      collectionRate:
        result.totalAmount > 0
          ? (result.totalPaid / result.totalAmount) * 100
          : 0,
      entityTypeBreakdown: entityTypeStats,
      paymentStatusBreakdown: paymentStatusStats,
      overdueList: overdueInvoices,
      monthlyTrend,
    };
  },

  async getOverdueInvoices() {
    return Invoice.find({
      paymentStatus: { $in: ["Unpaid", "Partially Paid", "Overdue"] },
      dueDate: { $lt: new Date() },
    })
      .populate("entityId", "name phone email")
      .sort("dueDate")
      .lean();
  },

  async sendReminder(id: string, userId: string) {
    const invoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $inc: { remindersSent: 1 },
        lastReminderDate: new Date(),
        updatedBy: userId,
      },
      { new: true }
    );

    // Here you would integrate with email/SMS service
    return invoice;
  },
};
