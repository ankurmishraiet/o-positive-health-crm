"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, ArrowLeft, Plus, Trash2 } from "lucide-react";
import axios from "@/axios/axios";
import { toast } from "@/hooks/use-toast";

interface Permission {
  resource: string;
  actions: string[];
}

export default function CreateRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    permissions: [] as Permission[],
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [resourcesRes, actionsRes] = await Promise.all([
        axios.get("/roles/resources"),
        axios.get("/roles/actions"),
      ]);
      setResources(resourcesRes.data.resources || []);
      setActions(actionsRes.data.actions || []);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast({
        title: "Error",
        description: "Failed to fetch role metadata",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-generate name from displayName
    if (field === "displayName") {
      setFormData(prev => ({
        ...prev,
        name: value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
      }));
    }
  };

  const addPermission = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [...prev.permissions, { resource: resources[0] || "", actions: [] }]
    }));
  };

  const removePermission = (index: number) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter((_, i) => i !== index)
    }));
  };

  const updatePermissionResource = (index: number, resource: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, i) => 
        i === index ? { ...perm, resource, actions: [] } : perm
      )
    }));
  };

  const updatePermissionActions = (index: number, action: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map((perm, i) => 
        i === index ? {
          ...perm,
          actions: checked 
            ? [...perm.actions, action]
            : perm.actions.filter(a => a !== action)
        } : perm
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.displayName.trim()) {
      toast({
        title: "Error",
        description: "Role display name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "Error",
        description: "At least one permission is required",
        variant: "destructive",
      });
      return;
    }

    // Validate permissions
    for (const perm of formData.permissions) {
      if (!perm.resource || perm.actions.length === 0) {
        toast({
          title: "Error",
          description: "All permissions must have a resource and at least one action",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      await axios.post("/roles", formData);
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      router.push("/dashboard/admin/roles");
    } catch (error: any) {
      console.error("Error creating role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Create New Role</h1>
          <p className="text-gray-600">Define a new role with custom permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange("displayName", e.target.value)}
                  placeholder="e.g., Content Manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Role ID</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., content_manager"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Auto-generated from display name</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this role can do..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Permissions</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPermission}>
              <Plus className="h-4 w-4 mr-1" />
              Add Permission
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.permissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No permissions defined yet.</p>
                <p className="text-sm">Click "Add Permission" to get started.</p>
              </div>
            ) : (
              formData.permissions.map((permission, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold">Permission {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePermission(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Resource</Label>
                        <select
                          value={permission.resource}
                          onChange={(e) => updatePermissionResource(index, e.target.value)}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          required
                        >
                          <option value="">Select a resource</option>
                          {resources.map((resource) => (
                            <option key={resource} value={resource}>
                              {resource.charAt(0).toUpperCase() + resource.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Actions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {actions.map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${index}-${action}`}
                                checked={permission.actions.includes(action)}
                                onCheckedChange={(checked) => 
                                  updatePermissionActions(index, action, checked as boolean)
                                }
                              />
                              <Label 
                                htmlFor={`${index}-${action}`}
                                className="text-sm font-normal"
                              >
                                {action.charAt(0).toUpperCase() + action.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}