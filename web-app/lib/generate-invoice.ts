// Type Definitions
interface InvoiceItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice?: number;
  amount: number;
}

interface InvoiceHeader {
  title: string;
  companyName: string;
  brandName: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  corporateOffice: string;
}

interface InvoiceDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
}

interface BillToInfo {
  name: string;
  address: string;
  gstNumber?: string;
  hospitalGSTNumber?: string; // For Hospital invoices
  hospitalAddress?: string; // For Hospital invoices
}

interface PaymentSummary {
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  amountInWords: string;
  paymentStatus: "Paid" | "Unpaid" | "Partial";
}

interface RemittanceDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

interface FooterInfo {
  note: string;
  authorizedSignatureText: string;
}

interface InvoiceData {
  header: InvoiceHeader;
  invoiceDetails: InvoiceDetails;
  billTo: BillToInfo;
  items: InvoiceItem[];
  paymentSummary: PaymentSummary;
  remittanceDetails: RemittanceDetails;
  footer: FooterInfo;
}

interface RenderedInvoice {
  html: string;
  data: InvoiceData;
}

// Type for partial invoice data (all properties optional)
type PartialInvoiceData = {
  [K in keyof InvoiceData]?: Partial<InvoiceData[K]>;
};

// Main Invoice Template Class
class InvoiceTemplate {
  // Default template data
  private defaultTemplate: InvoiceData = {
    header: {
      title: "BILL OF SUPPLY",
      companyName: "AVYJNR HEALTH TECHNOLOGIES INDIA PVT LTD",
      brandName: "O POSITIVE HEALTH",
      address:
        "69/08, U block, DLF Phase 3, Sector 24, Gurgaon, Haryana, India - 122002",
      gstNumber: "06AAXCA9682L12M",
      panNumber: "AAXCA9682L",
      cinNumber: "U85110HR2022PTC108032",
      corporateOffice:
        "69/08, U block, DLF Phase 3, Sector 24, Gurgaon, Haryana - 122002",
    },

    invoiceDetails: {
      invoiceNumber: "INV-202601-0001",
      issueDate: new Date().toLocaleDateString("en-IN"),
      dueDate: this.calculateDueDate(),
    },

    billTo: {
      name: "Eye-Q Vision Private Limited",
      address:
        "Nursing Home 1, Near Madalsa Hospital, Behind HUDA Market, Sector-46, Gurugram, Haryana - 122003",
    },

    items: [
      {
        description: "Professional fees",
        hsnCode: "9993",
        quantity: 7,
        unitPrice: 14960.37,
        amount: 104722.6,
      },
    ],

    paymentSummary: {
      subtotal: 142110.0,
      gstRate: 0,
      gstAmount: 0.0,
      totalAmount: 142110.0,
      amountInWords:
        "Rupees One Lakh Fourteen Thousand Two Hundred Eleven Only",
      paymentStatus: "Unpaid",
    },

    remittanceDetails: {
      accountName: "AVYJNR Health Technologies India Private Limited",
      accountNumber: "258448534103",
      ifscCode: "INDB0000514",
      bankName: "Indusind Bank",
      branch: "Old Judiciary Complex (Sec 15), Gurgaon",
    },

    footer: {
      note: "This is a Computer Generated Invoice Note Signature Not Required",
      authorizedSignatureText:
        "For AVYJNR Health Technologies Pvt Ltd\nAuthorized Signature",
    },
  };

  // Calculate due date (30 days from current date)
  private calculateDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString("en-IN");
  }

  // Generate invoice number
  generateInvoiceNumber(
    prefix: string = "INV",
    sequence: number,
    year?: number,
    month?: number,
  ): string {
    const currentDate = new Date();
    const yearPart = year || currentDate.getFullYear();
    const monthPart = String(month || currentDate.getMonth() + 1).padStart(
      2,
      "0",
    );
    const seqPart = String(sequence).padStart(4, "0");
    return `${prefix}-${yearPart}${monthPart}-${seqPart}`;
  }

  // Convert number to Indian Rupees words
  convertToIndianWords(num: number): string {
    if (num === 0) return "Zero Rupees Only";

    const units = [
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

    const crore = 10000000;
    const lakh = 100000;
    const thousand = 1000;
    const hundred = 100;

    let result = "";

    // Handle crores
    if (num >= crore) {
      const crores = Math.floor(num / crore);
      result += this.convertToIndianWords(crores) + " Crore ";
      num %= crore;
    }

    // Handle lakhs
    if (num >= lakh) {
      const lakhs = Math.floor(num / lakh);
      if (lakhs >= 100) {
        result += this.convertToIndianWords(lakhs) + " Lakh ";
      } else if (lakhs >= 20) {
        result +=
          tens[Math.floor(lakhs / 10)] + " " + units[lakhs % 10] + " Lakh ";
      } else if (lakhs >= 10) {
        result += teens[lakhs - 10] + " Lakh ";
      } else if (lakhs > 0) {
        result += units[lakhs] + " Lakh ";
      }
      num %= lakh;
    }

    // Handle thousands
    if (num >= thousand) {
      const thousands = Math.floor(num / thousand);
      if (thousands >= 100) {
        result += this.convertToIndianWords(thousands) + " Thousand ";
      } else if (thousands >= 20) {
        result +=
          tens[Math.floor(thousands / 10)] +
          " " +
          units[thousands % 10] +
          " Thousand ";
      } else if (thousands >= 10) {
        result += teens[thousands - 10] + " Thousand ";
      } else if (thousands > 0) {
        result += units[thousands] + " Thousand ";
      }
      num %= thousand;
    }

    // Handle hundreds
    if (num >= hundred) {
      const hundreds = Math.floor(num / hundred);
      result += units[hundreds] + " Hundred ";
      num %= hundred;
    }

    // Handle tens and units
    if (num > 0) {
      if (num >= 20) {
        result += tens[Math.floor(num / 10)];
        if (num % 10 > 0) {
          result += " " + units[num % 10];
        }
      } else if (num >= 10) {
        result += teens[num - 10];
      } else {
        result += units[num];
      }
    }

    // Handle decimal part (paise)
    const decimalPart = Math.round((num % 1) * 100);
    if (decimalPart > 0) {
      result += ` and ${decimalPart}/100`;
    }

    return `Rupees ${result.trim()} Only`;
  }

  // Calculate totals from items
  calculateTotals(items: InvoiceItem[], gstRate: number = 0) {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = (subtotal * gstRate) / 100;
    const totalAmount = subtotal + gstAmount;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      gstRate,
      gstAmount: Number(gstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }

  // Helper function to merge nested objects safely
  private mergeNestedObject<T extends object>(
    defaultObj: T,
    customObj?: Partial<T>,
  ): T {
    if (!customObj) return defaultObj;

    return {
      ...defaultObj,
      ...customObj,
    };
  }

  // Helper function to ensure all required fields are present
  private ensureInvoiceDetails(
    details?: Partial<InvoiceDetails>,
  ): InvoiceDetails {
    const defaultDetails = this.defaultTemplate.invoiceDetails;

    return {
      invoiceNumber: details?.invoiceNumber || defaultDetails.invoiceNumber,
      issueDate: details?.issueDate || new Date().toLocaleDateString("en-IN"),
      dueDate: details?.dueDate || this.calculateDueDate(),
    };
  }

  // Render invoice template
  renderTemplate(customData?: PartialInvoiceData): RenderedInvoice {
    // Build the final invoice data with proper type safety
    const invoiceData: InvoiceData = {
      header: this.mergeNestedObject(
        this.defaultTemplate.header,
        customData?.header,
      ),

      invoiceDetails: this.ensureInvoiceDetails(customData?.invoiceDetails),

      billTo: this.mergeNestedObject(
        this.defaultTemplate.billTo,
        customData?.billTo,
      ),

      items:
        customData?.items?.filter(
          (item): item is InvoiceItem => item !== undefined,
        ) || this.defaultTemplate.items,

      paymentSummary: (() => {
        const defaultSummary = this.defaultTemplate.paymentSummary;
        const customSummary = customData?.paymentSummary;

        // If custom items are provided, recalculate totals
        if (customData?.items) {
          const gstRate = customSummary?.gstRate ?? defaultSummary.gstRate;
          const totals = this.calculateTotals(
            customData.items.filter(
              (item): item is InvoiceItem => item !== undefined,
            ),
            gstRate,
          );
          const amountInWords =
            customSummary?.amountInWords ||
            this.convertToIndianWords(totals.totalAmount);

          return {
            ...defaultSummary,
            ...customSummary,
            ...totals,
            amountInWords,
            paymentStatus:
              customSummary?.paymentStatus || defaultSummary.paymentStatus,
          };
        }

        // Otherwise, merge with custom data
        return {
          ...defaultSummary,
          ...customSummary,
        };
      })(),

      remittanceDetails: this.mergeNestedObject(
        this.defaultTemplate.remittanceDetails,
        customData?.remittanceDetails,
      ),

      footer: this.mergeNestedObject(
        this.defaultTemplate.footer,
        customData?.footer,
      ),
    };

    // Generate HTML
    const html = this.generateHTML(invoiceData);

    return {
      html,
      data: invoiceData,
    };
  }

  // Generate HTML from invoice data
  private generateHTML(data: InvoiceData): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${data.invoiceDetails.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 18px;
          }
          .header h3 {
            margin: 5px 0;
            font-size: 16px;
            color: #666;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .bill-to {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .payment-summary {
            margin: 20px 0;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .remittance-details {
            margin: 20px 0;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .amount-in-words {
            font-style: italic;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>${data.header.title}</h1>
            <h2>${data.header.companyName}</h2>
            <h3>${data.header.brandName}</h3>
            <p>${data.header.address}</p>
            <p><strong>GST:</strong> ${data.header.gstNumber}</p>
            <p><strong>PAN:</strong> ${data.header.panNumber} | <strong>CIN:</strong> ${data.header.cinNumber}</p>
          </div>
          
          <div class="invoice-details">
            <div>
              <p><strong>Invoice Number:</strong> ${data.invoiceDetails.invoiceNumber}</p>
              <p><strong>Issue Date:</strong> ${data.invoiceDetails.issueDate}</p>
            </div>
            <div>
              <p><strong>Due Date:</strong> ${data.invoiceDetails.dueDate}</p>
            </div>
          </div>
          
          <div class="bill-to">
            <h4>Bill To</h4>
            <p><strong>${data.billTo.name}</strong></p>
            <p>${data.billTo.address}</p>
            ${data.billTo.gstNumber ? `<p><strong>GST No:</strong> ${data.billTo.gstNumber}</p>` : ""}
            ${data.billTo.hospitalGSTNumber ? `<p><strong>Hospital GST No:</strong> ${data.billTo.hospitalGSTNumber}</p>` : ""}
            ${data.billTo.hospitalAddress ? `<p><strong>Hospital Address:</strong> ${data.billTo.hospitalAddress}</p>` : ""}
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description of Service</th>
                <th>HSN CODE</th>
                <th>QTY</th>
                <th>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.hsnCode}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.amount.toFixed(2)}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="payment-summary">
            <h4>Payment Summary</h4>
            <p><strong>Subtotal:</strong> ₹${data.paymentSummary.subtotal.toFixed(2)}</p>
            <p><strong>GST (${data.paymentSummary.gstRate}%):</strong> ₹${data.paymentSummary.gstAmount.toFixed(2)}</p>
            <p><strong>Total Amount:</strong> ₹${data.paymentSummary.totalAmount.toFixed(2)}</p>
            <p class="amount-in-words"><strong>Amount in Words:</strong> ${data.paymentSummary.amountInWords}</p>
            <p><strong>Payment Status:</strong> ${data.paymentSummary.paymentStatus}</p>
          </div>
          
          <div class="remittance-details">
            <h4>Remittance Details:</h4>
            <p><strong>A/C Name:</strong> ${data.remittanceDetails.accountName}</p>
            <p><strong>A/C No:</strong> ${data.remittanceDetails.accountNumber}</p>
            <p><strong>IFSC Code:</strong> ${data.remittanceDetails.ifscCode}</p>
            <p><strong>Bank Name:</strong> ${data.remittanceDetails.bankName}</p>
            <p><strong>Branch:</strong> ${data.remittanceDetails.branch}</p>
          </div>
          
          <div class="footer">
            <p>${data.footer.note}</p>
            <p style="white-space: pre-line;">${data.footer.authorizedSignatureText}</p>
            <p><strong>Corporate Office:</strong> ${data.header.corporateOffice}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export function to generate invoice
export function generateInvoice(
  customData?: PartialInvoiceData,
  sequenceNumber: number = 1,
): RenderedInvoice {
  const template = new InvoiceTemplate();

  // Generate invoice number if not provided
  if (!customData?.invoiceDetails?.invoiceNumber) {
    const invoiceNumber = template.generateInvoiceNumber("INV", sequenceNumber);

    // Create a properly typed invoiceDetails object
    const invoiceDetails: Partial<InvoiceDetails> = {
      ...customData?.invoiceDetails,
      invoiceNumber,
    };

    customData = {
      ...customData,
      invoiceDetails,
    };
  }

  return template.renderTemplate(customData);
}

// Export types for external use
export type {
  InvoiceData,
  InvoiceItem,
  InvoiceHeader,
  InvoiceDetails,
  BillToInfo,
  PaymentSummary,
  RemittanceDetails,
  FooterInfo,
  RenderedInvoice,
  PartialInvoiceData,
};

// Export the template class
export { InvoiceTemplate };

// Helper function to convert API invoice data to InvoiceData format
export function convertInvoiceDataForPDF(apiInvoice: any): PartialInvoiceData {
  const isHospital = apiInvoice.entityType === "Hospital";
  const isDoctor = apiInvoice.entityType === "Doctor";

  return {
    invoiceDetails: {
      invoiceNumber: apiInvoice.invoiceNumber || apiInvoice.id,
      issueDate: apiInvoice.issueDate
        ? new Date(apiInvoice.issueDate).toLocaleDateString("en-IN")
        : new Date().toLocaleDateString("en-IN"),
      dueDate: apiInvoice.dueDate
        ? new Date(apiInvoice.dueDate).toLocaleDateString("en-IN")
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
            "en-IN",
          ),
    },

    billTo: {
      name: apiInvoice.entityName || apiInvoice.hospitalName || apiInvoice.doctorName || "N/A",
      address: apiInvoice.address || apiInvoice.location || "N/A",
      gstNumber: apiInvoice.gstNumber,
      ...(isHospital && {
        hospitalGSTNumber: apiInvoice.hospitalGSTNumber,
        hospitalAddress: apiInvoice.hospitalAddress,
      }),
    },

    items: apiInvoice.items?.map((item: any) => ({
      description:
        item.description ||
        item.name ||
        (isHospital ? "Hospital Services" : "Consultation Services"),
      hsnCode: item.hsnCode || item.hsn || "9993",
      quantity: item.quantity || item.qty || 1,
      unitPrice: item.unitPrice || item.price || item.amount,
      amount: item.amount || item.total || item.quantity * item.unitPrice || 0,
    })) || [
      {
        description: isHospital
          ? "Hospital Services"
          : "Professional Consultation Fees",
        hsnCode: "9993",
        quantity: apiInvoice.quantity || apiInvoice.consultations || 1,
        amount:
          apiInvoice.totalAmount ||
          apiInvoice.amount ||
          apiInvoice.totalRevenue ||
          0,
      },
    ],

    paymentSummary: {
      subtotal: apiInvoice.subtotal || apiInvoice.amount || 0,
      gstRate: apiInvoice.gstRate || apiInvoice.taxRate || 0,
      gstAmount: apiInvoice.gstAmount || apiInvoice.taxAmount || 0,
      totalAmount: apiInvoice.totalAmount || apiInvoice.amount || 0,
      paymentStatus:
        apiInvoice.status || apiInvoice.paymentStatus || "Unpaid",
    } as Partial<PaymentSummary>,

    header: isHospital
      ? {
          title: "HOSPITAL INVOICE",
        }
      : isDoctor
        ? {
            title: "DOCTOR INVOICE",
          }
        : undefined,

    footer: {
      note: apiInvoice.notes || apiInvoice.description || undefined,
    },
  };
}

// Example usage
/*
// For Hospital Invoice:
const hospitalInvoiceData = {
  entityType: "Hospital",
  entityName: "Eye-Q Vision Private Limited",
  hospitalGSTNumber: "07XXXXX1234X1ZX",
  hospitalAddress: "Sector-46, Gurugram, Haryana",
  invoiceNumber: "INV-202601-0001",
  issueDate: new Date(),
  items: [
    {
      description: "Professional fees",
      hsnCode: "9993",
      quantity: 7,
      unitPrice: 14960.37,
      amount: 104722.60,
    },
  ],
  totalAmount: 104722.60,
  gstRate: 0,
};

const hospitalInvoice = generateInvoice(
  convertInvoiceDataForPDF(hospitalInvoiceData), 
  1
);

// For Doctor Invoice:
const doctorInvoiceData = {
  entityType: "Doctor",
  entityName: "Dr. John Smith",
  doctorName: "Dr. John Smith",
  address: "Medical Center, Sector-21, Gurgaon",
  invoiceNumber: "INV-202601-0002",
  consultations: 15,
  totalAmount: 75000,
  gstRate: 18,
};

const doctorInvoice = generateInvoice(
  convertInvoiceDataForPDF(doctorInvoiceData),
  2
);

// Use the HTML to generate PDF
console.log(hospitalInvoice.html);
console.log(doctorInvoice.html);
*/
