"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import axios from "@/axios/axios";

function EditInvoiceForm() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    entityType: "General",
    entityName: "",
    invoiceType: "Service",
    invoiceCategory: "Medical",
    category: "Income",
    description: "",
    totalAmount: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    gstRate: "",
    discountAmount: "",
    notes: "",
    hospitalGSTNumber: "",
    hospitalAddress: "",
    items: [{ description: "", quantity: 1, unitPrice: "", hsnCode: "" }],
  });

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        toast({
          title: "Error",
          description: "Invalid invoice ID",
          variant: "destructive",
        });
        router.back();
        return;
      }

      try {
        setFetching(true);
        const response = await axios.get(`/invoices/${invoiceId}`);
        const invoice = response.data;

        // Format dates
        const issueDate = invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : "";
        const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "";

        setFormData({
          entityType: invoice.entityType || "General",
          entityName: invoice.entityName || "",
          invoiceType: invoice.invoiceType || "Service",
          invoiceCategory: invoice.invoiceCategory || "Medical",
          category: invoice.category || "Income",
          description: invoice.description || "",
          totalAmount: invoice.totalAmount?.toString() || "",
          issueDate: issueDate,
          dueDate: dueDate,
          gstRate: invoice.gstRate?.toString() || "",
          discountAmount: invoice.discountAmount?.toString() || "",
          notes: invoice.notes || "",
          hospitalGSTNumber: invoice.hospitalGSTNumber || "",
          hospitalAddress: invoice.hospitalAddress || "",
          items: invoice.items && invoice.items.length > 0 
            ? invoice.items.map((item: any) => ({
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice?.toString() || "",
                hsnCode: item.hsnCode || "",
              }))
            : [{ description: "", quantity: 1, unitPrice: "", hsnCode: "" }],
        });
      } catch (error: any) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load invoice",
          variant: "destructive",
        });
        router.back();
      } finally {
        setFetching(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: "", hsnCode: "" }],
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.unitPrice) || 0) * (item.quantity || 1);
    }, 0);
    return subtotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate totals
      const subtotal = calculateTotal();
      const discount = parseFloat(formData.discountAmount) || 0;
      const taxableAmount = subtotal - discount;
      const gstRate = parseFloat(formData.gstRate) || 0;
      const gstAmount = (taxableAmount * gstRate) / 100;
      const totalAmount = taxableAmount + gstAmount;

      const invoiceData = {
        entityType: formData.entityType,
        entityName: formData.entityName,
        invoiceType: formData.invoiceType,
        invoiceCategory: formData.invoiceCategory,
        category: formData.category,
        description: formData.description,
        hospitalGSTNumber: formData.hospitalGSTNumber,
        hospitalAddress: formData.hospitalAddress,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity.toString()) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: (parseFloat(item.unitPrice) || 0) * (parseInt(item.quantity.toString()) || 1),
          hsnCode: item.hsnCode || undefined,
        })),
        subtotal: subtotal,
        taxableAmount: taxableAmount,
        discountAmount: discount,
        gstRate: gstRate,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: formData.notes,
      };

      const response = await axios.put(`/invoices/${invoiceId}`, invoiceData);

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      
      // Navigate back to the appropriate invoice page
      if (formData.entityType === "Doctor") {
        router.push("/dashboard/finance/doctors-invoice");
      } else if (formData.entityType === "Hospital") {
        router.push("/dashboard/finance/hospital-invoice");
      } else {
        router.push("/dashboard/finance");
      }
    } catch (error: any) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <div className="flex items-center justify-center space-x-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <FileText className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Edit {formData.entityType} Invoice</h1>
          <p className="text-gray-600">
            Update invoice details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entityName">{formData.entityType} Name *</Label>
                <Input
                  id="entityName"
                  value={formData.entityName}
                  onChange={(e) =>
                    setFormData({ ...formData, entityName: e.target.value })
                  }
                  placeholder={`Enter ${formData.entityType.toLowerCase()} name`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceType">Invoice Type *</Label>
                <Select
                  value={formData.invoiceType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, invoiceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Commission">Commission</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hospital specific fields */}
            {formData.entityType === "Hospital" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalGSTNumber">Hospital GST Number</Label>
                  <Input
                    id="hospitalGSTNumber"
                    value={formData.hospitalGSTNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalGSTNumber: e.target.value })
                    }
                    placeholder="Enter GST number (e.g., 27XXXXX1234X1ZX)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalAddress">Hospital Address</Label>
                  <Input
                    id="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalAddress: e.target.value })
                    }
                    placeholder="Enter hospital address"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, issueDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Invoice description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end border-b pb-4">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label htmlFor={`item-desc-${index}`}>Description *</Label>
                  <Input
                    id={`item-desc-${index}`}
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label htmlFor={`item-hsn-${index}`}>HSN Code</Label>
                  <Input
                    id={`item-hsn-${index}`}
                    value={item.hsnCode}
                    onChange={(e) =>
                      handleItemChange(index, "hsnCode", e.target.value)
                    }
                    placeholder="HSN Code"
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                  <Input
                    id={`item-qty-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label htmlFor={`item-price-${index}`}>Unit Price *</Label>
                  <Input
                    id={`item-price-${index}`}
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="w-full"
            >
              Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountAmount">Discount Amount</Label>
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, discountAmount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstRate">GST Rate (%)</Label>
                <Input
                  id="gstRate"
                  type="number"
                  step="0.01"
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData({ ...formData, gstRate: e.target.value })
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="text-2xl font-bold text-blue-600">
                  ₹{(
                    calculateTotal() -
                    (parseFloat(formData.discountAmount) || 0) +
                    ((calculateTotal() - (parseFloat(formData.discountAmount) || 0)) *
                      (parseFloat(formData.gstRate) || 0)) /
                      100
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes or terms"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function EditInvoicePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto space-y-6 py-6">
        <div className="flex items-center justify-center space-x-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EditInvoiceForm />
    </Suspense>
  );
}
