"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Search, Plus, Eye, Edit, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";

interface Partner {
  _id: string;
  partnerId: string;
  name: string;
  type: "Corporate" | "Individual" | "Other";
  contactNumber?: string;
  email?: string;
  city?: string;
  services: string[];
  status: "Active" | "Inactive";
  contractStartDate?: string;
  contractEndDate?: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get("/partners");
      const mapped = (response.data.partners || []).map((p: any) => ({
        _id: p.id,
        partnerId: p.id,
        name: p.name,
        type:
          p.type === "Corporate"
            ? "Corporate"
            : p.type === "Individual"
            ? "Individual"
            : "Other",
        contactNumber: p.contactNumber || "N/A",
        email: p.email,
        city: p.city || "N/A",
        services: p.services || [],
        status: p.isActive ? "Active" : "Inactive",
        contractStartDate: p.contractStartDate,
        contractEndDate: p.contractEndDate,
      }));
      setPartners(mapped);
    } catch (error) {
      console.error("Error fetching partners:", error);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

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
      <Building2 className="h-4 w-4" />
    ) : (
      <Users className="h-4 w-4" />
    );
  };

  const filteredPartners = (partners || [])?.filter(
    (partner) =>
      partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner?.partnerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const corporatePartners = (filteredPartners || []).filter(
    (p) => p?.type === "Corporate"
  );
  const individualPartners = (filteredPartners || []).filter(
    (p) => p?.type === "Individual"
  );

  const handleViewPartner = (partnerId: string) => {
    router.push(`/dashboard/partners/${partnerId}`);
  };

  const handleEditPartner = (partnerId: string) => {
    router.push(`/dashboard/partners/${partnerId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Building2 className="mr-3 h-8 w-8 text-blue-600" />
            Partners Management
          </h1>
          <p className="text-gray-600">
            Manage corporate and individual partners
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/partners/upload-csv">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </Link>
          <Link href="/dashboard/partners/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Onboard New Partner
            </Button>
          </Link>
        </div>
      </div>

      {/* Partner Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Partners</p>
                <p className="text-2xl font-bold">{(partners || []).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Corporate</p>
                <p className="text-2xl font-bold">
                  {(corporatePartners || []).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Individual</p>
                <p className="text-2xl font-bold">
                  {(individualPartners || []).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-orange-50">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {
                    (partners || [])?.filter((p) => p?.status === "Active")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search partners by name, ID, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Partners Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Partners</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card
                key={partner._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      {getTypeIcon(partner.type)}
                      <span className="ml-2">{partner.name}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ID:</span>
                    <span>{partner.partnerId}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{partner.type}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contact:</span>
                    <span>{partner?.contactNumber || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">City:</span>
                    <span>{partner?.city || "N/A"}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(partner?.services || [])
                        .slice(0, 2)
                        .map((service, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      {(partner?.services || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{partner.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewPartner(partner._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditPartner(partner._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="corporate">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporatePartners.map((partner) => (
              <Card
                key={partner._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Building2 className="h-4 w-4" />
                      <span className="ml-2">{partner.name}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contract:</span>
                    <span className="text-xs">
                      {partner?.contractStartDate
                        ? new Date(
                            partner.contractStartDate
                          ).toLocaleDateString()
                        : "N/A"}{" "}
                      -
                      {partner?.contractEndDate
                        ? new Date(partner.contractEndDate).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contact:</span>
                    <span>{partner?.contactNumber || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-xs">{partner?.email || "N/A"}</span>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewPartner(partner._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditPartner(partner._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="individual">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {individualPartners.map((partner) => (
              <Card
                key={partner._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="h-4 w-4" />
                      <span className="ml-2">{partner.name}</span>
                    </CardTitle>
                    <Badge className={getStatusColor(partner.status)}>
                      {partner.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Contact:</span>
                    <span>{partner?.contactNumber || "N/A"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">City:</span>
                    <span>{partner?.city || "N/A"}</span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-600">Services:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(partner?.services || []).map((service, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleViewPartner(partner._id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditPartner(partner._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
