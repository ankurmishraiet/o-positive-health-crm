import { Schema, model, Types, Document, Model } from "mongoose";

// Invoice Item Interface
export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
  hsnCode?: string;
  gstRate?: number;
}

// Invoice Interface
export interface IInvoice extends Document {
  invoiceNumber: string;
  subtotal: number;
  taxableAmount: number;
  discountAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;

  issueDate: Date;
  dueDate: Date;

  entityType:
    | "Doctor"
    | "Hospital"
    | "Cab"
    | "Employee"
    | "Patient"
    | "Loan"
    | "Partner";
  entityId: Types.ObjectId;
  entityName: string;

  // Hospital specific fields
  hospitalGSTNumber?: string;
  hospitalAddress?: string;

  invoiceType:
    | "Service"
    | "Product"
    | "Commission"
    | "Salary"
    | "Reimbursement"
    | "Other";
  invoiceCategory: "Medical" | "Administrative" | "Financial" | "HR" | "Other";
  category: "Income" | "Expense";

  items: Types.DocumentArray<IInvoiceItem & Document>;

  status: "Draft" | "Sent" | "Viewed" | "Paid" | "Overdue" | "Cancelled";
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid" | "Overdue" | "Refunded";
  paymentMethod:
    | "Cash"
    | "Bank Transfer"
    | "UPI"
    | "Credit Card"
    | "Debit Card"
    | "Cheque"
    | "Other";
  paymentDate?: Date;

  generatedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

// Invoice Item Schema
const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    category: String,
    hsnCode: String,
    gstRate: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// Invoice Schema
const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: false, unique: true },
    subtotal: { type: Number, required: true, min: 0 },
    taxableAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    gstRate: { type: Number, default: 0, min: 0, max: 100 },
    gstAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    pendingAmount: { type: Number, default: 0, min: 0 },

    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },

    entityType: {
      type: String,
      enum: [
        "Doctor",
        "Hospital",
        "Cab",
        "Employee",
        "Patient",
        "Loan",
        "Partner",
      ],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      refPath: "entityType",
      required: false,
    }, // Made optional for flexibility
    entityName: { type: String, required: true },

    // Hospital specific fields
    hospitalGSTNumber: String,
    hospitalAddress: String,

    invoiceType: {
      type: String,
      enum: [
        "Service",
        "Product",
        "Commission",
        "Salary",
        "Reimbursement",
        "Other",
      ],
      default: "Service",
    },
    invoiceCategory: {
      type: String,
      enum: ["Medical", "Administrative", "Financial", "HR", "Other"],
      default: "Medical",
    },
    category: { type: String, enum: ["Income", "Expense"], required: true },

    items: { type: [invoiceItemSchema], default: [] },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Viewed", "Paid", "Overdue", "Cancelled"],
      default: "Draft",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid", "Overdue", "Refunded"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Bank Transfer",
        "UPI",
        "Credit Card",
        "Debit Card",
        "Cheque",
        "Other",
      ],
      default: "Other",
    },
    paymentDate: Date,

    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fixed
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Fixed
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Fixed
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Fixed
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save middleware: generate invoiceNumber and compute totals
 */
invoiceSchema.pre("save", async function (this: IInvoice, next) {
  try {
    // Generate invoiceNumber if missing
    if (!this.invoiceNumber) {
      const now = this.issueDate || new Date();
      const year = now.getFullYear();
      const monthIndex = now.getMonth();
      const startOfMonth = new Date(year, monthIndex, 1);
      const startOfNextMonth = new Date(year, monthIndex + 1, 1);

      const Model = this.constructor as Model<IInvoice>;
      const count = await Model.countDocuments({
        createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
      });

      const month = String(monthIndex + 1).padStart(2, "0");
      this.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(
        4,
        "0"
      )}`;
    }

    // Compute item totals and subtotal
    let subtotal = 0;
    this.items.forEach((item) => {
      item.totalPrice = item.unitPrice * item.quantity;
      subtotal += item.totalPrice;
    });
    this.subtotal = subtotal;
    this.taxableAmount = Math.max(0, subtotal - (this.discountAmount || 0));
    this.gstAmount = (this.taxableAmount * (this.gstRate || 0)) / 100;
    this.totalAmount = this.taxableAmount + this.gstAmount;
    this.pendingAmount = Math.max(0, this.totalAmount - (this.paidAmount || 0));

    // Payment status
    if (!this.paidAmount || this.paidAmount <= 0) this.paymentStatus = "Unpaid";
    else if (this.paidAmount >= this.totalAmount) {
      this.paymentStatus = "Paid";
      if (!this.paymentDate) this.paymentDate = new Date();
      this.status = "Paid";
    } else this.paymentStatus = "Partially Paid";

    // Overdue
    if (this.paymentStatus !== "Paid" && new Date() > this.dueDate)
      this.paymentStatus = "Overdue";

    next();
  } catch (err) {
    next(err);
  }
});

export const Invoice = model<IInvoice>("Invoice", invoiceSchema);
