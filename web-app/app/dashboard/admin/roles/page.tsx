"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Settings,
  Lock,
  Unlock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("/roles?includeSystem=true");
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      return;
    }

    try {
      await axios.delete(`/roles/${roleId}`);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPermissionCount = (role: Role) => {
    return role.permissions.reduce((total, perm) => total + perm.actions.length, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Role Management</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading roles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Role Management</h1>
            <p className="text-gray-600">Manage system roles and permissions</p>
          </div>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/roles/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-50">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-green-50">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.isSystemRole).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-purple-50">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Custom Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => !r.isSystemRole).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-orange-50">
                <Unlock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <Card key={role._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{role.displayName}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {role.isSystemRole ? (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      System
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Custom
                    </Badge>
                  )}
                  {!role.isActive && (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">Role ID</p>
                <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">{role.name}</p>
              </div>
              
              {role.description && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Description</p>
                  <p className="text-sm text-gray-800">{role.description}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-600 font-medium">Permissions</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{getPermissionCount(role)} actions</Badge>
                  <Badge variant="outline">{role.permissions.length} resources</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/admin/roles/${role._id}`)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!role.isSystemRole && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRole(role._id, role.displayName)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "No roles match your search criteria." 
                : "No roles have been created yet."
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push("/dashboard/admin/roles/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Role
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}