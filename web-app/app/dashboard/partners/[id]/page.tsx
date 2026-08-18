"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  Edit,
  Clock,
  FileText,
  Award,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import axios from "@/axios/axios";

interface Partner {
  _id: string;
  partnerId: string;
  name: string;
  type: "Corporate" | "Individual";
  contactNumber: string;
  email?: string;
  city: string;
  services: string[];
  status: "Active" | "Inactive" | "Pending";
  contractStartDate: string;
  contractEndDate: string;
  contactPerson?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  documents?: {
    documentType: string;
    documentName?: string;
    documentUrl: string;
    uploadedDate?: string;
  }[];
}

export default function PartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const partnerId = params.id as string;
        const response = await axios.get(`/partners/${partnerId}`);
        setPartner(response.data);
      } catch (error) {
        console.error("Error fetching partner:", error);
        setPartner(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "Corporate" ? (
      <Building2 className="h-6 w-6" />
    ) : (
      <Users className="h-6 w-6" />
    );
  };

  const handleEdit = () => {
    router.push(`/dashboard/partners/${params.id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Partner Not Found</h2>
        <p className="text-gray-600 mt-2">
          The partner profile you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              {getTypeIcon(partner.type)}
              <span className="ml-3">Partner Profile</span>
            </h1>
            <p className="text-muted-foreground">
              Detailed information about {partner.name}
            </p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Partner
        </Button>
      </div>

      {/* Partner Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${partner.name}`}
                />
                <AvatarFallback className="text-lg">
                  {partner.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold">{partner.name}</h2>
                <p className="text-lg text-blue-600 font-medium">
                  {partner.type} Partner
                </p>
                <p className="text-gray-600">ID: {partner.partnerId}</p>
                <div className="mt-2">
                  <Badge className={getStatusColor(partner.status)}>
                    {partner.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact and Status Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{partner.city}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{partner.contactNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{partner.email || 'N/A'}</span>
                </div>
                {partner.contactPerson && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Contact Person: {partner.contactPerson}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <div>Contract Period:</div>
                    <div className="text-gray-600">
                      {partner.contractStartDate ? new Date(partner.contractStartDate).toLocaleDateString() : 'N/A'} -{' '}
                      {partner.contractEndDate ? new Date(partner.contractEndDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <div>Joined:</div>
                    <div className="text-gray-600">
                      {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="contract">Contract Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Partner Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Address</h4>
                <p className="text-gray-600">{partner.address || 'No address provided'}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Partner Type</h4>
                <Badge variant="outline" className="flex items-center w-fit">
                  {getTypeIcon(partner.type)}
                  <span className="ml-2">{partner.type}</span>
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Current Status</h4>
                <Badge className={getStatusColor(partner.status)}>
                  {partner.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {partner.services && partner.services.length > 0 ? (
                  partner.services.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{service}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 col-span-full">No services specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contract">
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Start Date</h4>
                  <p className="text-gray-600">
                    {partner.contractStartDate 
                      ? new Date(partner.contractStartDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">End Date</h4>
                  <p className="text-gray-600">
                    {partner.contractEndDate 
                      ? new Date(partner.contractEndDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Contract Duration</h4>
                <p className="text-gray-600">
                  {partner.contractStartDate && partner.contractEndDate
                    ? `${Math.ceil((new Date(partner.contractEndDate).getTime() - new Date(partner.contractStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                    : 'Duration not specified'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Partner Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-gray-600">
                      {partner.notes || 'No notes available for this partner.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bank Details */}
      {partner.bankDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="min-w-0">
                <span className="font-medium text-sm">Bank Name:</span>
                <p className="text-gray-600 break-words">{partner.bankDetails.bankName || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Account Holder Name:</span>
                <p className="text-gray-600 break-words">{partner.bankDetails.accountHolderName || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">Account Number:</span>
                <p className="text-gray-600 font-mono break-words">{partner.bankDetails.accountNumber || "N/A"}</p>
              </div>
              <div className="min-w-0">
                <span className="font-medium text-sm">IFSC Code:</span>
                <p className="text-gray-600 font-mono break-words">{partner.bankDetails.ifscCode || "N/A"}</p>
              </div>
              {partner.bankDetails.branchName && (
                <div className="md:col-span-2 min-w-0">
                  <span className="font-medium text-sm">Branch Name:</span>
                  <p className="text-gray-600 break-words">{partner.bankDetails.branchName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {partner.documents && partner.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {partner.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm break-words">{doc.documentType}</p>
                      {doc.documentName && (
                        <p className="text-xs text-gray-500 break-words">{doc.documentName}</p>
                      )}
                      {doc.uploadedDate && (
                        <p className="text-xs text-gray-400">
                          Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.documentUrl, '_blank')}
                    className="flex-shrink-0 ml-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Partner
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Partner
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}