"use client";

import { useAuth } from "./use-auth";
import {
  hasPermission,
  hasResourceAccess,
  isResourceRestricted,
  getResourceScope,
  getDashboardWidgets,
  hasDashboardAccess,
  Permission,
  Scope,
} from "@/lib/rbac-config";

export function usePermissions() {
  const { session } = useAuth();
  const userRole = session?.user?.role || "";

  return {
    // Check if user has a specific permission on a resource
    canPerform: (resource: string, permission: Permission): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, resource, permission);
    },

    // Check if user has access to a resource at all
    canAccess: (resource: string): boolean => {
      if (!userRole) return false;
      return hasResourceAccess(userRole, resource);
    },

    // Check if resource is restricted
    isRestricted: (resource: string): boolean => {
      if (!userRole) return true;
      return isResourceRestricted(userRole, resource);
    },

    // Get scope for resource
    getScope: (resource: string): Scope | Scope[] | undefined => {
      if (!userRole) return undefined;
      return getResourceScope(userRole, resource);
    },

    // Get dashboard widgets
    getDashboardWidgets: (): string[] => {
      if (!userRole) return [];
      return getDashboardWidgets(userRole);
    },

    // Check dashboard access
    hasDashboardAccess: (): boolean => {
      if (!userRole) return false;
      return hasDashboardAccess(userRole);
    },

    // Shorthand permission checks
    canView: (resource: string) => hasPermission(userRole, resource, "view"),
    canCreate: (resource: string) => hasPermission(userRole, resource, "create"),
    canUpdate: (resource: string) => hasPermission(userRole, resource, "update"),
    canDelete: (resource: string) => hasPermission(userRole, resource, "delete"),
    canManage: (resource: string) => hasPermission(userRole, resource, "manage"),

    // Get current user role
    role: userRole,

    // Check if user is admin
    isAdmin: () => userRole.toUpperCase() === "ADMIN",
  };
}
