// import PDFDocument from 'pdfkit';
// import { PassThrough } from 'stream';

// interface InvoiceItem {
//   description: string;
//   hsnCode?: string;
//   quantity: number;
//   unitPrice: number;
//   totalPrice: number;
// }

// interface InvoiceData {
//   invoiceNumber: string;
//   entityType: string;
//   entityName: string;
//   entityAddress?: string;
//   entityContact?: string;
//   hospitalGSTNumber?: string;
//   hospitalAddress?: string;
//   issueDate: string;
//   dueDate: string;
//   items: InvoiceItem[];
//   subtotal: number;
//   gstRate?: number;
//   gstAmount?: number;
//   discount?: number;
//   totalAmount: number;
//   paymentStatus: string;
//   description?: string;
//   notes?: string;
// }

// export class PDFGeneratorService {
//   static generateInvoicePDF(invoiceData: InvoiceData): PassThrough {
//     const doc = new PDFDocument({ margin: 50 });
//     const stream = new PassThrough();

//     doc.pipe(stream);

//     // Header
//     doc
//       .fontSize(24)
//       .fillColor('#1e40af')
//       .text('INVOICE', 50, 50);

//     // Company/Hospital Info (if applicable)
//     if (invoiceData.entityType === 'Hospital' && invoiceData.hospitalGSTNumber) {
//       doc
//         .fontSize(10)
//         .fillColor('#666')
//         .text(`GST: ${invoiceData.hospitalGSTNumber}`, 400, 55, { align: 'right' });
//     }

//     doc
//       .fontSize(10)
//       .fillColor('#333')
//       .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 70, { align: 'right' })
//       .text(`Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 400, 85, { align: 'right' })
//       .text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 400, 100, { align: 'right' });

//     // Bill To Section
//     doc
//       .fontSize(12)
//       .fillColor('#1e40af')
//       .text('Bill To:', 50, 140);

//     let yPosition = 160;
//     doc
//       .fontSize(11)
//       .fillColor('#333')
//       .text(invoiceData.entityName, 50, yPosition);

//     yPosition += 15;
//     if (invoiceData.entityType === 'Hospital' && invoiceData.hospitalAddress) {
//       doc.text(invoiceData.hospitalAddress, 50, yPosition);
//       yPosition += 15;
//     } else if (invoiceData.entityAddress) {
//       doc.text(invoiceData.entityAddress, 50, yPosition);
//       yPosition += 15;
//     }

//     if (invoiceData.entityContact) {
//       doc.text(`Contact: ${invoiceData.entityContact}`, 50, yPosition);
//       yPosition += 15;
//     }

//     // Add some spacing
//     yPosition += 20;

//     // Items Table Header
//     const tableTop = yPosition;
//     doc
//       .fontSize(10)
//       .fillColor('#fff')
//       .rect(50, tableTop, 495, 25)
//       .fillAndStroke('#1e40af', '#1e40af');

//     doc
//       .fillColor('#fff')
//       .text('Description', 55, tableTop + 8, { width: 200 });

//     if (invoiceData.items.some(item => item.hsnCode)) {
//       doc.text('HSN', 260, tableTop + 8, { width: 60 });
//       doc.text('Qty', 325, tableTop + 8, { width: 40 });
//       doc.text('Price', 370, tableTop + 8, { width: 70, align: 'right' });
//       doc.text('Amount', 445, tableTop + 8, { width: 90, align: 'right' });
//     } else {
//       doc.text('Qty', 300, tableTop + 8, { width: 50 });
//       doc.text('Price', 360, tableTop + 8, { width: 80, align: 'right' });
//       doc.text('Amount', 450, tableTop + 8, { width: 85, align: 'right' });
//     }

//     // Items
//     yPosition = tableTop + 25;
//     doc.fillColor('#333');

//     invoiceData.items.forEach((item, index) => {
//       if (yPosition > 700) {
//         doc.addPage();
//         yPosition = 50;
//       }

//       const rowColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
//       doc
//         .rect(50, yPosition, 495, 25)
//         .fillAndStroke(rowColor, rowColor);

//       doc
//         .fillColor('#333')
//         .fontSize(9)
//         .text(item.description, 55, yPosition + 8, { width: 195, ellipsis: true });

//       if (invoiceData.items.some(i => i.hsnCode)) {
//         if (item.hsnCode) {
//           doc.text(item.hsnCode, 260, yPosition + 8, { width: 60 });
//         }
//         doc.text(item.quantity.toString(), 325, yPosition + 8, { width: 40 });
//         doc.text(`₹${item.unitPrice.toFixed(2)}`, 370, yPosition + 8, { width: 70, align: 'right' });
//         doc.text(`₹${item.totalPrice.toFixed(2)}`, 445, yPosition + 8, { width: 90, align: 'right' });
//       } else {
//         doc.text(item.quantity.toString(), 300, yPosition + 8, { width: 50 });
//         doc.text(`₹${item.unitPrice.toFixed(2)}`, 360, yPosition + 8, { width: 80, align: 'right' });
//         doc.text(`₹${item.totalPrice.toFixed(2)}`, 450, yPosition + 8, { width: 85, align: 'right' });
//       }

//       yPosition += 25;
//     });

//     // Add some spacing before summary
//     yPosition += 20;

//     // Summary Section
//     const summaryX = 370;
//     doc
//       .fontSize(10)
//       .fillColor('#333');

//     doc.text('Subtotal:', summaryX, yPosition, { width: 100, align: 'left' });
//     doc.text(`₹${invoiceData.subtotal.toFixed(2)}`, summaryX + 100, yPosition, { width: 85, align: 'right' });
//     yPosition += 20;

//     if (invoiceData.discount && invoiceData.discount > 0) {
//       doc.text('Discount:', summaryX, yPosition, { width: 100, align: 'left' });
//       doc.text(`-₹${invoiceData.discount.toFixed(2)}`, summaryX + 100, yPosition, { width: 85, align: 'right' });
//       yPosition += 20;
//     }

//     if (invoiceData.gstRate && invoiceData.gstAmount) {
//       doc.text(`GST (${invoiceData.gstRate}%):`, summaryX, yPosition, { width: 100, align: 'left' });
//       doc.text(`₹${invoiceData.gstAmount.toFixed(2)}`, summaryX + 100, yPosition, { width: 85, align: 'right' });
//       yPosition += 20;
//     }

//     // Total
//     doc
//       .fontSize(12)
//       .fillColor('#1e40af')
//       .rect(summaryX, yPosition, 185, 30)
//       .fillAndStroke('#e0e7ff', '#e0e7ff');

//     doc
//       .fillColor('#1e40af')
//       .text('Total Amount:', summaryX + 5, yPosition + 8, { width: 100, align: 'left' });
//     doc
//       .fontSize(14)
//       .text(`₹${invoiceData.totalAmount.toFixed(2)}`, summaryX + 100, yPosition + 8, { width: 80, align: 'right' });

//     yPosition += 50;

//     // Payment Status
//     const statusColor = invoiceData.paymentStatus === 'Paid' ? '#10b981' :
//                         invoiceData.paymentStatus === 'Pending' ? '#f59e0b' : '#ef4444';

//     doc
//       .fontSize(10)
//       .fillColor(statusColor)
//       .text(`Status: ${invoiceData.paymentStatus}`, summaryX, yPosition);

//     // Notes Section
//     if (invoiceData.notes || invoiceData.description) {
//       yPosition += 40;
//       doc
//         .fontSize(10)
//         .fillColor('#666')
//         .text('Notes:', 50, yPosition);

//       yPosition += 15;
//       doc
//         .fontSize(9)
//         .fillColor('#333')
//         .text(invoiceData.notes || invoiceData.description || '', 50, yPosition, { width: 495 });
//     }

//     // Footer
//     const pageHeight = doc.page.height;
//     doc
//       .fontSize(8)
//       .fillColor('#999')
//       .text('Thank you for your business!', 50, pageHeight - 50, { align: 'center', width: 495 })
//       .text('O-Positive Health CRM', 50, pageHeight - 35, { align: 'center', width: 495 });

//     doc.end();
//     return stream;
//   }
// }

import PDFDocument from "pdfkit";
import { PassThrough } from "stream";
import path from "path";
import fs from "fs";

interface InvoiceItem {
  description: string;
  hsnCode?: string;
  quantity: number;
  unitPrice?: number;
  amount: number;
}

interface InvoiceData {
  // Header Information
  header: {
    title: string;
    companyName: string;
    brandName: string;
    address: string;
    gstNumber: string;
    panNumber: string;
    cinNumber: string;
    corporateOffice: string;
  };

  // Invoice Details
  invoiceDetails: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
  };

  // Bill To Information
  billTo: {
    name: string;
    address: string;
    gstNumber?: string;
  };

  // Services/Items Table
  items: InvoiceItem[];

  // Payment Summary
  paymentSummary: {
    subtotal: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    amountInWords: string;
    paymentStatus: "Paid" | "Unpaid" | "Partial";
  };

  // Remittance Details (Bank Information)
  remittanceDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };

  // Footer
  footer: {
    note: string;
    authorizedSignatureText: string;
  };
}

export class PDFGeneratorService {
  // Constants for invoice layout
  private static readonly CONTENT_WIDTH = 515;

  // Constants for image positioning
  /** Vertical offset when signature image is present */
  private static readonly SIGNATURE_VERTICAL_OFFSET = 80;
  /** Vertical offset when no signature image is available */
  private static readonly DEFAULT_VERTICAL_OFFSET = 10;

  static generateInvoicePDF(invoiceData: InvoiceData): PassThrough {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      layout: "portrait",
    });
    const stream = new PassThrough();
    doc.pipe(stream);

    // Colors
    const primaryColor = "#333333";
    const secondaryColor = "#666666";
    const accentColor = "#000000";
    const lightGray = "#f5f5f5";

    // Font Sizes
    const titleFontSize = 16;
    const headerFontSize = 10;
    const bodyFontSize = 9;
    const smallFontSize = 8;

    // Check for logo image
    const assetsPath = path.join(__dirname, "..", "assets", "invoice");
    const logoPath = path.join(assetsPath, "logo.png");
    const hasLogo = fs.existsSync(logoPath);

    // Current Y position
    let yPos = 40;

    // Add Logo if available
    if (hasLogo) {
      try {
        doc.image(logoPath, (doc.page.width - 120) / 2, yPos, { width: 100 });
        yPos += 80; // Add space after logo
      } catch (error) {
        console.error("Failed to add logo to invoice:", error);
      }
    }

    // Header Section
    doc
      .fontSize(titleFontSize)
      .font("Helvetica-Bold")
      .fillColor(accentColor)
      .text(invoiceData.header.title, 40, yPos, { align: "center" });

    yPos += 25;

    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(invoiceData.header.companyName, 40, yPos, { align: "center" });

    yPos += 15;

    doc
      .fontSize(headerFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(invoiceData.header.brandName, 40, yPos, { align: "center" });

    yPos += 15;

    doc
      .fontSize(smallFontSize)
      .text(invoiceData.header.address, 40, yPos, { align: "center" });

    yPos += 10;

    doc
      .fontSize(smallFontSize)
      .text(`GST: ${invoiceData.header.gstNumber}`, 40, yPos, {
        align: "center",
      });

    yPos += 25;

    // Horizontal line
    this.drawHorizontalLine(doc, yPos, PDFGeneratorService.CONTENT_WIDTH);
    yPos += 15;

    // Invoice Details and Bill To Section side by side
    const leftColumnX = 40;
    const rightColumnX = 300;
    const columnWidth = 230;

    // Invoice Details (Right Side)
    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(
        `Invoice Number: ${invoiceData.invoiceDetails.invoiceNumber}`,
        rightColumnX,
        yPos,
      );

    yPos += 15;

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .text(
        `Issue Date: ${invoiceData.invoiceDetails.issueDate}`,
        rightColumnX,
        yPos,
      );

    yPos += 15;

    doc
      .fontSize(bodyFontSize)
      .text(
        `Due Date: ${invoiceData.invoiceDetails.dueDate}`,
        rightColumnX,
        yPos,
      );

    yPos += 30;

    // Bill To Section (Left Side)
    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Bill To:", leftColumnX, yPos - 60); // Adjusted to align with invoice details

    const billToY = yPos - 45;
    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text(invoiceData.billTo.name, leftColumnX, billToY, {
        width: columnWidth,
      });

    doc
      .fontSize(smallFontSize)
      .fillColor(secondaryColor)
      .text(invoiceData.billTo.address, leftColumnX, billToY + 15, {
        width: columnWidth,
      });

    if (invoiceData.billTo.gstNumber) {
      doc.text(
        `GST No: ${invoiceData.billTo.gstNumber}`,
        leftColumnX,
        billToY + 30,
      );
    }

    // Reset Y position for table
    yPos += 10;

    // Items Table Header
    this.drawHorizontalLine(doc, yPos, PDFGeneratorService.CONTENT_WIDTH);
    yPos += 10;

    // Table Headers
    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Description of Service", leftColumnX, yPos, { width: 200 });

    doc.text("HSN CODE", 250, yPos, { width: 60 });
    doc.text("QTY", 320, yPos, { width: 50 });
    doc.text("Amount (In INR)", 380, yPos, { width: 80, align: "right" });

    yPos += 20;
    this.drawHorizontalLine(doc, yPos - 5, PDFGeneratorService.CONTENT_WIDTH);

    // Items Rows
    invoiceData.items.forEach((item, index) => {
      // Check if we need a new page (unlikely for single page)
      if (yPos > 650) {
        doc.addPage();
        yPos = 40;
      }

      doc
        .fontSize(bodyFontSize)
        .font("Helvetica")
        .fillColor(primaryColor)
        .text(item.description, leftColumnX, yPos, { width: 200 });

      doc.text(item.hsnCode || "-", 250, yPos, { width: 60 });
      doc.text(item.quantity.toString(), 320, yPos, { width: 50 });
      doc.text(`₹${item.amount.toFixed(2)}`, 380, yPos, {
        width: 80,
        align: "right",
      });

      yPos += 20;

      // Draw separator line between items
      if (index < invoiceData.items.length - 1) {
        this.drawDashedLine(doc, yPos - 5, PDFGeneratorService.CONTENT_WIDTH);
        yPos += 5;
      }
    });

    yPos += 10;
    this.drawHorizontalLine(doc, yPos, PDFGeneratorService.CONTENT_WIDTH);
    yPos += 20;

    // Total Amount
    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Total", 320, yPos, { width: 60 });

    doc.text(
      `₹${invoiceData.paymentSummary.totalAmount.toFixed(2)}`,
      380,
      yPos,
      { width: 80, align: "right" },
    );

    yPos += 25;

    // Amount in Words
    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Amount Chargeable (In Words):", leftColumnX, yPos);

    yPos += 15;

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(primaryColor)
      .text(invoiceData.paymentSummary.amountInWords, leftColumnX, yPos, {
        width: 400,
      });

    yPos += 25;

    // Company PAN and CIN
    doc
      .fontSize(smallFontSize)
      .fillColor(secondaryColor)
      .text(
        `Company's PAN: ${invoiceData.header.panNumber}`,
        leftColumnX,
        yPos,
      );

    doc.text(`Company's CIN No.: ${invoiceData.header.cinNumber}`, 300, yPos);

    yPos += 30;

    // Remittance Details Section
    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Remittance Details:", leftColumnX, yPos);

    yPos += 20;

    // Create a box for remittance details
    const remittanceBoxY = yPos;
    const boxHeight = 90;

    doc
      .rect(
        leftColumnX,
        remittanceBoxY,
        PDFGeneratorService.CONTENT_WIDTH,
        boxHeight,
      )
      .strokeColor("#e0e0e0")
      .stroke();

    // Grid lines inside the box
    doc
      .moveTo(leftColumnX + 200, remittanceBoxY)
      .lineTo(leftColumnX + 200, remittanceBoxY + boxHeight)
      .stroke();

    // Labels and values
    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("A/C Name", leftColumnX + 10, remittanceBoxY + 10);

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        invoiceData.remittanceDetails.accountName,
        leftColumnX + 10,
        remittanceBoxY + 25,
        { width: 180 },
      );

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("A/C No.", leftColumnX + 210, remittanceBoxY + 10);

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        invoiceData.remittanceDetails.accountNumber,
        leftColumnX + 210,
        remittanceBoxY + 25,
      );

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("IFSC Code", leftColumnX + 10, remittanceBoxY + 45);

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        invoiceData.remittanceDetails.ifscCode,
        leftColumnX + 10,
        remittanceBoxY + 60,
      );

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Bank Name", leftColumnX + 210, remittanceBoxY + 45);

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        invoiceData.remittanceDetails.bankName,
        leftColumnX + 210,
        remittanceBoxY + 60,
      );

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Branch", leftColumnX + 370, remittanceBoxY + 45);

    doc
      .fontSize(bodyFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        invoiceData.remittanceDetails.branch,
        leftColumnX + 370,
        remittanceBoxY + 60,
        { width: 130 },
      );

    yPos += boxHeight + 30;

    // Corporate Office
    doc
      .fontSize(smallFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(
        `Corporate Office: ${invoiceData.header.corporateOffice}`,
        leftColumnX,
        yPos,
      );

    yPos += 25;

    // Footer with Signature and Stamp
    const footerY = 750;

    // Horizontal line above footer
    this.drawHorizontalLine(
      doc,
      footerY + 40,
      PDFGeneratorService.CONTENT_WIDTH,
    );

    doc
      .fontSize(smallFontSize)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text(invoiceData.footer.note, leftColumnX, footerY + 30, {
        align: "center",
        width: PDFGeneratorService.CONTENT_WIDTH,
      });

    // Check for stamp and signature images
    const stampPath = path.join(assetsPath, "stamp.png");
    const signaturePath = path.join(assetsPath, "signature.png");
    const hasStamp = fs.existsSync(stampPath);
    const hasSignature = fs.existsSync(signaturePath);

    // Add stamp on the left side if available
    if (hasStamp) {
      try {
        doc.image(stampPath, leftColumnX + 380, footerY - 110, { width: 120 });
      } catch (error) {
        console.error("Failed to add stamp to invoice:", error);
      }
    }

    // Add signature on the right side if available
    if (hasSignature) {
      try {
        doc.image(signaturePath, leftColumnX + 350, footerY + 10, {
          width: 120,
        });
      } catch (error) {
        console.error("Failed to add signature to invoice:", error);
      }
    }

    // Authorized signature text
    doc
      .fontSize(headerFontSize)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(
        invoiceData.footer.authorizedSignatureText,
        leftColumnX,
        footerY - 10,
        { align: "right", width: PDFGeneratorService.CONTENT_WIDTH },
      );

    doc.end();
    return stream;
  }

  private static drawHorizontalLine(
    doc: PDFKit.PDFDocument,
    yPos: number,
    width: number,
  ): void {
    doc
      .moveTo(40, yPos)
      .lineTo(40 + width, yPos)
      .strokeColor("#e0e0e0")
      .lineWidth(1)
      .stroke();
  }

  private static drawDashedLine(
    doc: PDFKit.PDFDocument,
    yPos: number,
    width: number,
  ): void {
    doc
      .moveTo(40, yPos)
      .lineTo(40 + width, yPos)
      .strokeColor("#e0e0e0")
      .lineWidth(0.5)
      .dash(2, { space: 2 })
      .stroke()
      .undash();
  }
}

// Helper function to create invoice data in the new format
export function createInvoiceData(data: any): InvoiceData {
  return {
    header: {
      title: data.header?.title || "BILL OF SUPPLY",
      companyName:
        data.header?.companyName || "AVYJNR HEALTH TECHNOLOGIES INDIA PVT LTD",
      brandName: data.header?.brandName || "O POSITIVE HEALTH",
      address:
        data.header?.address ||
        "69/08, U block, DLF Phase 3, Sector 24, Gurgaon, Haryana, India - 122002",
      gstNumber: data.header?.gstNumber || "06AAXCA9682L12M",
      panNumber: data.header?.panNumber || "AAXCA9682L",
      cinNumber: data.header?.cinNumber || "U85110HR2022PTC108032",
      corporateOffice:
        data.header?.corporateOffice ||
        "69/08, U block, DLF Phase 3, Sector 24, Gurgaon, Haryana - 122002",
    },
    invoiceDetails: {
      invoiceNumber: data.invoiceDetails?.invoiceNumber || "INV-0001",
      issueDate:
        data.invoiceDetails?.issueDate ||
        new Date().toLocaleDateString("en-IN"),
      dueDate:
        data.invoiceDetails?.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
          "en-IN",
        ),
    },
    billTo: {
      name: data.billTo?.name || "",
      address: data.billTo?.address || "",
      gstNumber: data.billTo?.gstNumber || "",
    },
    items:
      data.items?.map((item: any) => ({
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: item.quantity || 1,
        amount: item.amount || 0,
      })) || [],
    paymentSummary: {
      subtotal: data.paymentSummary?.subtotal || 0,
      gstRate: data.paymentSummary?.gstRate || 0,
      gstAmount: data.paymentSummary?.gstAmount || 0,
      totalAmount: data.paymentSummary?.totalAmount || 0,
      amountInWords: data.paymentSummary?.amountInWords || "Zero Rupees Only",
      paymentStatus: data.paymentSummary?.paymentStatus || "Unpaid",
    },
    remittanceDetails: {
      accountName:
        data.remittanceDetails?.accountName ||
        "AVYJNR Health Technologies India Private Limited",
      accountNumber: data.remittanceDetails?.accountNumber || "258448534103",
      ifscCode: data.remittanceDetails?.ifscCode || "INDB0000514",
      bankName: data.remittanceDetails?.bankName || "Indusind Bank",
      branch:
        data.remittanceDetails?.branch ||
        "Old Judiciary Complex (Sec 15), Gurgaon",
    },
    footer: {
      note:
        data.footer?.note ||
        "This is a Computer Generated Invoice Note Signature Not Required",
      authorizedSignatureText:
        data.footer?.authorizedSignatureText ||
        "For AVYJNR Health Technologies Pvt Ltd\nAuthorized Signature",
    },
  };
}
