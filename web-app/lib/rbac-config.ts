// RBAC Configuration - Role-Based Access Control
// This file defines permissions for each role in the system

export type Permission = 'view' | 'create' | 'update' | 'delete' | 'manage' | 'apply' | 'upload' | 'download' | 'use';
export type Scope = 'all' | 'self' | 'team' | 'directory_only' | 'new_leads' | 'limited' | 'city_wise' | 'opd' | 'ipd';

export interface ResourcePermission {
  permissions: Permission[];
  scope?: Scope | Scope[];
  upload_csv?: boolean;
  widgets?: string[];
  visible?: boolean;
  with?: string[];
}

export interface RoleConfig {
  access?: 'full';
  dashboard?: {
    visible: boolean;
    widgets: string[];
  };
  leads?: ResourcePermission;
  patients?: ResourcePermission;
  employees?: ResourcePermission;
  cab_services?: ResourcePermission;
  hospitals?: ResourcePermission;
  loans?: ResourcePermission;
  targets?: ResourcePermission;
  hr_self?: {
    employee_profile: Permission[];
    leaves: Permission[];
    attendance: Permission[];
    salary: Permission[];
    incentives: Permission[];
  };
  salary?: ResourcePermission;
  incentives?: ResourcePermission;
  reimbursements?: ResourcePermission;
  leaves?: Permission[];
  attendance?: Permission[];
  documents?: Permission[];
  ledger?: Permission[];
  payments?: Permission[];
  invoices?: Permission[];
  appointments?: Permission[];
  partners?: ResourcePermission;
  finance?: ResourcePermission;
  restricted?: string[];
}

export const RBAC_CONFIG: Record<string, RoleConfig> = {
  ADMIN: {
    access: 'full',
  },
  
  BD: {
    dashboard: {
      visible: true,
      widgets: ['leads', 'targets'],
    },
    leads: {
      permissions: ['view', 'create', 'update'],
      upload_csv: false,
      scope: 'all',
    },
    patients: {
      permissions: ['view'],
      scope: 'directory_only',
    },
    cab_services: {
      permissions: ['view', 'use'],
    },
    hospitals: {
      permissions: ['view'],
      scope: ['all', 'city_wise'],
    },
    loans: {
      permissions: ['view', 'create'],
      scope: 'new_leads',
    },
    targets: {
      permissions: ['view'],
      scope: 'self',
    },
    hr_self: {
      employee_profile: ['view', 'update'],
      leaves: ['view', 'apply'],
      attendance: ['view'],
      salary: ['view'],
      incentives: ['view'],
    },
    restricted: [
      'partners',
      'finance',
      'documents',
      'other_employees',
      'upload_csv',
    ],
  },
  
  HR: {
    employees: {
      permissions: ['view', 'create', 'update'],
    },
    leaves: ['manage'],
    attendance: ['manage'],
    salary: {
      permissions: ['view', 'update'],
      with: ['admin', 'finance'],
    },
    documents: ['upload', 'download'],
  },
  
  DOCTOR: {
    leads: {
      permissions: ['view'],
      scope: ['opd', 'ipd'],
    },
    patients: {
      permissions: ['view'],
    },
    appointments: ['manage'],
    targets: {
      permissions: ['view'],
    },
  },
  
  FINANCE: {
    salary: ['manage'],
    incentives: ['manage'],
    reimbursements: ['manage'],
    ledger: ['manage'],
    payments: ['manage'],
    invoices: ['manage'],
    loans: ['manage'],
    documents: ['view'],
  },
  
  PARTNER: {
    cab_services: {
      permissions: ['view'],
      scope: 'limited', // Limited scope means partner can only view cab services assigned to them
    },
    targets: {
      permissions: ['view'],
      scope: 'self', // Self scope means partner can only view their own targets
    },
  },
};

// Helper function to check if a role has a specific permission on a resource
export function hasPermission(
  role: string,
  resource: string,
  permission: Permission
): boolean {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return false;
  
  // Admin has full access
  if (roleConfig.access === 'full') return true;
  
  const resourceConfig = roleConfig[resource as keyof RoleConfig];
  
  if (!resourceConfig) return false;
  
  // Check if resource config is an array (simple permission list)
  if (Array.isArray(resourceConfig)) {
    return resourceConfig.includes(permission) || resourceConfig.includes('manage');
  }
  
  // Check if resource config is an object with permissions property
  if (typeof resourceConfig === 'object' && 'permissions' in resourceConfig) {
    const permissions = resourceConfig.permissions;
    return permissions.includes(permission) || permissions.includes('manage');
  }
  
  return false;
}

// Check if a resource is restricted for a role
export function isResourceRestricted(role: string, resource: string): boolean {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return true;
  
  // Admin has no restrictions
  if (roleConfig.access === 'full') return false;
  
  // Check restricted list
  if ('restricted' in roleConfig && Array.isArray(roleConfig.restricted)) {
    return roleConfig.restricted.includes(resource);
  }
  
  return false;
}

// Check if a role has access to a resource (regardless of specific permission)
export function hasResourceAccess(role: string, resource: string): boolean {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return false;
  
  // Admin has full access
  if (roleConfig.access === 'full') return true;
  
  // Check if restricted
  if (isResourceRestricted(role, resource)) return false;
  
  // Check if resource exists in config
  return resource in roleConfig;
}

// Get scope for a resource
export function getResourceScope(role: string, resource: string): Scope | Scope[] | undefined {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return undefined;
  
  // Admin has full access
  if (roleConfig.access === 'full') return 'all';
  
  const resourceConfig = roleConfig[resource as keyof RoleConfig];
  
  if (resourceConfig && typeof resourceConfig === 'object' && 'scope' in resourceConfig) {
    return resourceConfig.scope;
  }
  
  return undefined;
}

// Check if role can see dashboard widgets
export function getDashboardWidgets(role: string): string[] {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return [];
  
  // Admin sees all widgets
  if (roleConfig.access === 'full') {
    return ['leads', 'targets', 'patients', 'employees', 'finance', 'hospitals'];
  }
  
  if ('dashboard' in roleConfig && roleConfig.dashboard) {
    return roleConfig.dashboard.widgets || [];
  }
  
  return [];
}

// Check if role has dashboard visibility
export function hasDashboardAccess(role: string): boolean {
  const roleConfig = RBAC_CONFIG[role.toUpperCase()];
  
  if (!roleConfig) return false;
  
  // Admin has full access
  if (roleConfig.access === 'full') return true;
  
  if ('dashboard' in roleConfig && roleConfig.dashboard) {
    return roleConfig.dashboard.visible;
  }
  
  return false;
}
