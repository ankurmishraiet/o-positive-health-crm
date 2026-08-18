"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  Filter,
  User,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  Edit,
  FileText,
  TrendingUp,
  Users,
  Building2,
  Phone,
  MapPin,
} from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "sonner";

interface Payment {
  _id: string;
  paymentId: string;
  patientName: string;
  patientPhone: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: string;
  paymentType: string;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentReceivedDate?: string;
  totalPaymentReceivable?: number;
  pendingPayment?: number;
  receivedPayment?: number;
  description: string;
  hospitalName?: string;
  doctorName?: string;
  serviceType: string;
  completionPercentage: number;
  isOverdue: boolean;
  createdAt: string;
}

interface PaymentStats {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  collectionRate: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  overduePayments: number;
  partialPayments: number;
  serviceTypeBreakdown: any[];
  paymentMethodBreakdown: any[];
  overdueList: Payment[];
}

interface PaymentFormData {
  patientName: string;
  patientPhone: string;
  amount: string;
  paymentType: string;
  paymentMethod: string;
  serviceType: string;
  description: string;
  hospitalName: string;
  doctorName: string;
  dueDate: string;
  totalPaymentReceivable: string;
  pendingPayment: string;
  receivedPayment: string;
  paymentReceivedDate: string;
}

interface Patient {
  _id: string;
  patientId: string;
  patientName: string;
  age?: number;
  gender?: string;
  contact?: {
    mobile?: string;
    email?: string;
    whatsappNumber?: string;
  };
  city?: string;
  address?: string;
  pincode?: string;
  dob?: string;
  treatment?: string;
}

const PAYMENT_TYPES = [
  "Subscription",
  "EMI Payment",
  "Surgery Amount",
  "Consultation",
  "Treatment",
  "Surgery",
  "Diagnostic",
  "Pharmacy",
  "Room Charges",
  "Other",
];

const SERVICE_TYPES = ["OPD", "IPD", "Emergency", "Consultation", "Other"];

const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cheque",
  "Insurance",
  "Other",
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterServiceType, setFilterServiceType] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [processingPayment, setProcessingPayment] = useState<Payment | null>(
    null
  );
  const [processAmount, setProcessAmount] = useState("");
  const [processPaymentMethod, setProcessPaymentMethod] = useState("Cash");
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchingPatients, setSearchingPatients] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [formData, setFormData] = useState<PaymentFormData>({
    patientName: "",
    patientPhone: "",
    amount: "",
    paymentType: "",
    paymentMethod: "Cash",
    serviceType: "OPD",
    description: "",
    hospitalName: "",
    doctorName: "",
    dueDate: "",
    totalPaymentReceivable: "",
    pendingPayment: "",
    receivedPayment: "",
    paymentReceivedDate: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filterStatus, filterServiceType]);

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") params.append("status", filterStatus);
      if (filterServiceType && filterServiceType !== "all") params.append("serviceType", filterServiceType);

      const response = await axios.get(
        `/finance/payments?${params.toString()}`
      );
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/finance/payments/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching payment stats:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName || !formData.amount || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        netAmount: parseFloat(formData.amount),
        totalPaymentReceivable: formData.totalPaymentReceivable ? parseFloat(formData.totalPaymentReceivable) : undefined,
        pendingPayment: formData.pendingPayment ? parseFloat(formData.pendingPayment) : undefined,
        receivedPayment: formData.receivedPayment ? parseFloat(formData.receivedPayment) : undefined,
        paymentReceivedDate: formData.paymentReceivedDate || undefined,
      };

      if (editingPayment) {
        await axios.put(`/finance/payments/${editingPayment._id}`, submitData);
        toast.success("Payment updated successfully");
      } else {
        await axios.post("/finance/payments", submitData);
        toast.success("Payment record created successfully");
      }

      setIsAddDialogOpen(false);
      setEditingPayment(null);
      resetForm();
      fetchPayments();
      fetchStats();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment");
    }
  };

  const handleProcessPayment = async () => {
    if (!processingPayment || !processAmount) {
      toast.error("Please enter payment amount");
      return;
    }

    try {
      await axios.post(`/finance/payments/${processingPayment._id}/process`, {
        paidAmount: parseFloat(processAmount),
        paymentMethod: processPaymentMethod,
      });

      toast.success("Payment processed successfully");
      setProcessingPayment(null);
      setProcessAmount("");
      fetchPayments();
      fetchStats();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    }
  };

  const searchPatients = async () => {
    if (!patientSearchQuery.trim()) {
      toast.error("Please enter a patient ID or name to search");
      return;
    }

    try {
      setSearchingPatients(true);
      const response = await axios.get(
        `/patients/search?q=${encodeURIComponent(patientSearchQuery)}&limit=10`
      );
      setPatients(response.data || []);

      if (!response.data || response.data.length === 0) {
        toast.error("No patients found matching your search");
      }
    } catch (error) {
      console.error("Error searching patients:", error);
      toast.error("Failed to search patients");
    } finally {
      setSearchingPatients(false);
    }
  };

  const selectPatient = (patient: Patient) => {
    // Auto-fill patient information
    setFormData({
      ...formData,
      patientName: patient.patientName || "",
      patientPhone: patient.contact?.mobile || "",
    });

    setShowPatientSearch(false);
    setPatientSearchQuery("");
    setPatients([]);

    toast.success(`Information auto-filled for ${patient.patientName}`);
  };

  const resetForm = () => {
    setFormData({
      patientName: "",
      patientPhone: "",
      amount: "",
      paymentType: "",
      paymentMethod: "Cash",
      serviceType: "OPD",
      description: "",
      hospitalName: "",
      doctorName: "",
      dueDate: "",
      totalPaymentReceivable: "",
      pendingPayment: "",
      receivedPayment: "",
      paymentReceivedDate: "",
    });
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50";
      case "Pending":
        return "text-orange-600 bg-orange-50";
      case "Partial":
        return "text-blue-600 bg-blue-50";
      case "Overdue":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const columns = [
    {
      accessorKey: "paymentId",
      header: "Payment ID",
    },
    {
      accessorKey: "patientName",
      header: "Patient",
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <div>
            <p className="font-medium">{payment.patientName}</p>
            <p className="text-sm text-gray-500">{payment.patientPhone}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <div>
            <p className="font-medium">{formatCurrency(payment.amount)}</p>
            <p className="text-sm text-gray-500">
              Paid: {formatCurrency(payment.paidAmount)}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <div>
            <Badge className={getStatusColor(payment.status)}>
              {payment.status}
            </Badge>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${payment.completionPercentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "serviceType",
      header: "Service",
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <div>
            <Badge variant="outline">{payment.serviceType}</Badge>
            <p className="text-sm text-gray-500 mt-1">{payment.paymentType}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }: any) => {
        const payment = row.original;
        const isOverdue = payment.isOverdue;
        return (
          <div className={isOverdue ? "text-red-600" : ""}>
            <p>{new Date(payment.dueDate).toLocaleDateString()}</p>
            {isOverdue && <p className="text-sm">Overdue</p>}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const payment = row.original;
        return (
          <div className="flex space-x-2">
            {payment.status !== "Completed" && (
              <Button
                size="sm"
                onClick={() => {
                  setProcessingPayment(payment);
                  setProcessAmount(payment.pendingAmount.toString());
                }}
              >
                Process
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingPayment(payment);
                setFormData({
                  patientName: payment.patientName,
                  patientPhone: payment.patientPhone,
                  amount: payment.amount.toString(),
                  paymentType: payment.paymentType,
                  paymentMethod: payment.paymentMethod,
                  serviceType: payment.serviceType,
                  description: payment.description,
                  hospitalName: payment.hospitalName || "",
                  doctorName: payment.doctorName || "",
                  dueDate: payment.dueDate.split("T")[0],
                  totalPaymentReceivable: payment.totalPaymentReceivable?.toString() || "",
                  pendingPayment: payment.pendingPayment?.toString() || "",
                  receivedPayment: payment.receivedPayment?.toString() || "",
                  paymentReceivedDate: payment.paymentReceivedDate?.split("T")[0] || "",
                });
                setIsAddDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Patient Payments</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Patient Payments
          </h1>
          <p className="text-muted-foreground">
            Manage patient payment tracking and collection
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchPayments();
              fetchStats();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>
                    {editingPayment ? "Edit Payment" : "Add New Payment"}
                  </DialogTitle>
                  {!editingPayment && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPatientSearch(true)}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search Patient
                    </Button>
                  )}
                </div>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      placeholder="Patient name"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          patientName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientPhone">Phone Number *</Label>
                    <Input
                      id="patientPhone"
                      placeholder="Phone number"
                      value={formData.patientPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          patientPhone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentType">Payment Type *</Label>
                    <Select
                      value={formData.paymentType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, paymentType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, paymentMethod: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, serviceType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Payment description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* New Payment Tracking Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalPaymentReceivable">Total Payment Receivable</Label>
                    <Input
                      id="totalPaymentReceivable"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.totalPaymentReceivable}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          totalPaymentReceivable: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="receivedPayment">Received Payment</Label>
                    <Input
                      id="receivedPayment"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.receivedPayment}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          receivedPayment: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pendingPayment">Pending Payment</Label>
                    <Input
                      id="pendingPayment"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.pendingPayment}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pendingPayment: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentReceivedDate">Payment Received Date</Label>
                    <Input
                      id="paymentReceivedDate"
                      type="date"
                      value={formData.paymentReceivedDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentReceivedDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospitalName">Hospital</Label>
                    <Input
                      id="hospitalName"
                      placeholder="Hospital name"
                      value={formData.hospitalName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hospitalName: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="doctorName">Doctor</Label>
                    <Input
                      id="doctorName"
                      placeholder="Doctor name"
                      value={formData.doctorName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          doctorName: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingPayment(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPayment ? "Update" : "Create"} Payment
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalPayments} payment records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collected Amount
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedPayments} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Amount
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(stats.totalPending)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingPayments} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collection Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.collectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Payment collection efficiency
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Process Payment Dialog */}
      <Dialog
        open={!!processingPayment}
        onOpenChange={() => setProcessingPayment(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          {processingPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium">{processingPayment.patientName}</h3>
                <p className="text-sm text-gray-600">
                  {processingPayment.description}
                </p>
                <p className="text-sm">
                  Total: {formatCurrency(processingPayment.amount)} | Pending:{" "}
                  {formatCurrency(processingPayment.pendingAmount)}
                </p>
              </div>

              <div>
                <Label htmlFor="processAmount">Payment Amount</Label>
                <Input
                  id="processAmount"
                  type="number"
                  step="0.01"
                  value={processAmount}
                  onChange={(e) => setProcessAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="processPaymentMethod">Payment Method</Label>
                <Select
                  value={processPaymentMethod}
                  onValueChange={setProcessPaymentMethod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setProcessingPayment(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleProcessPayment}>Process Payment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterServiceType}
              onValueChange={setFilterServiceType}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {SERVICE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            View and manage patient payment tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredPayments} />
        </CardContent>
      </Card>

      {/* Overdue Payments Alert */}
      {stats && stats.overdueList.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Overdue Payments ({stats.overdueList.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.overdueList.slice(0, 5).map((payment) => (
                <div
                  key={payment._id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{payment.patientName}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(payment.pendingAmount)}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => {
                        setProcessingPayment(payment);
                        setProcessAmount(payment.pendingAmount.toString());
                      }}
                    >
                      Follow Up
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Search Dialog */}
      <Dialog open={showPatientSearch} onOpenChange={setShowPatientSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter Patient ID or Name"
                value={patientSearchQuery}
                onChange={(e) => setPatientSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    searchPatients();
                  }
                }}
              />
              <Button
                onClick={searchPatients}
                disabled={searchingPatients}
              >
                {searchingPatients ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {patients.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                <p className="text-sm text-muted-foreground">
                  Found {patients.length} patient(s)
                </p>
                {patients.map((patient) => (
                  <Card
                    key={patient._id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => selectPatient(patient)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">
                            {patient.patientName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {patient.patientId}
                          </p>
                          {patient.contact?.mobile && (
                            <p className="text-sm text-gray-600">
                              <Phone className="inline h-3 w-3 mr-1" />
                              {patient.contact.mobile}
                            </p>
                          )}
                          {patient.city && (
                            <p className="text-sm text-gray-600">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {patient.city}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">
                          {patient.age ? `${patient.age} yrs` : "N/A"} /{" "}
                          {patient.gender || "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
