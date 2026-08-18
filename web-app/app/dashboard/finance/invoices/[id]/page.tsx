"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Download,
  Calendar,
  User,
  Building2,
  FileText,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceType: string;
  invoiceCategory: string;
  category: string;
  entityType: string;
  entityId: any;
  entityName: string;
  subtotal: number;
  taxableAmount: number;
  discountAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  issueDate: string;
  dueDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category?: string;
    hsnCode?: string;
    gstRate?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInvoiceDetails();
    }
  }, [params.id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/invoices/${params.id}`);
      if (response.data) {
        setInvoice(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching invoice details:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to load invoice details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/invoices/${params.id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice?.invoiceNumber || params.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error: any) {
      console.error("Error downloading invoice:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to download invoice";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variant =
      status === "Paid"
        ? "default"
        : ["Processing", "Pending", "Draft", "Sent"].includes(status)
        ? "secondary"
        : status === "Overdue"
        ? "destructive"
        : "outline";

    const icon =
      status === "Paid"
        ? CheckCircle
        : status === "Overdue"
        ? AlertTriangle
        : Clock;

    const IconComponent = icon;

    return (
      <div className="flex items-center gap-2">
        <IconComponent className="h-4 w-4" />
        <Badge variant={variant}>{status}</Badge>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Invoice Details</h1>
            <p className="text-gray-600">Loading invoice details...</p>
          </div>
        </div>
        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
              <p className="text-muted-foreground">
                The invoice you're looking for doesn't exist or has been deleted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
            <p className="text-muted-foreground">
              Invoice #{invoice.invoiceNumber}
            </p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Invoice Information Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-medium">{invoice.invoiceNumber}</p>
              </div>
              {getStatusBadge(invoice.paymentStatus || invoice.status)}
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Invoice Type</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline">{invoice.invoiceType}</Badge>
                <Badge variant="outline">{invoice.invoiceCategory}</Badge>
                <Badge variant="outline">{invoice.category}</Badge>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">
                  {new Date(invoice.issueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {invoice.paymentDate && (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="font-medium">
                    {new Date(invoice.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {invoice.entityType === "Doctor" ? "Doctor" : 
               invoice.entityType === "Hospital" ? "Hospital" :
               "Entity"} Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {invoice.entityType === "Doctor" ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{invoice.entityName}</p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Entity Type</p>
              <Badge variant="secondary" className="mt-1">
                {invoice.entityType}
              </Badge>
            </div>

            {invoice.paymentMethod && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{invoice.paymentMethod}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      {invoice.items && invoice.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>
              List of services or products included in this invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-center py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Unit Price</th>
                    <th className="text-right py-3 px-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.category && (
                            <p className="text-sm text-muted-foreground">
                              {item.category}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">{item.quantity}</td>
                      <td className="text-right py-3 px-4">
                        ₹{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        ₹{item.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">
                ₹{invoice.subtotal.toLocaleString()}
              </span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span className="font-medium">
                  -₹{invoice.discountAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxable Amount</span>
              <span className="font-medium">
                ₹{invoice.taxableAmount.toLocaleString()}
              </span>
            </div>

            {invoice.gstRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  GST ({invoice.gstRate}%)
                </span>
                <span className="font-medium">
                  ₹{invoice.gstAmount.toLocaleString()}
                </span>
              </div>
            )}

            <Separator />

            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total Amount</span>
              <span className="font-bold text-blue-600">
                ₹{invoice.totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between text-green-600">
              <span className="font-medium">Paid Amount</span>
              <span className="font-semibold">
                ₹{invoice.paidAmount.toLocaleString()}
              </span>
            </div>

            {invoice.pendingAmount > 0 && (
              <div className="flex justify-between text-orange-600">
                <span className="font-medium">Pending Amount</span>
                <span className="font-semibold">
                  ₹{invoice.pendingAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created At</span>
            <span>{new Date(invoice.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{new Date(invoice.updatedAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
