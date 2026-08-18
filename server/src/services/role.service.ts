import { Role, IRole, IPermission } from "../models/role.model";
import { UserRole } from "../models/user.model";

export const RoleService = {
  async createRole(roleData: Partial<IRole>, userId: string): Promise<IRole> {
    const role = new Role({
      ...roleData,
      createdBy: userId,
      updatedBy: userId
    });
    return await role.save();
  },

  async getAllRoles(includeSystem: boolean = true): Promise<IRole[]> {
    const filter = includeSystem ? {} : { isSystemRole: false };
    return await Role.find({ ...filter, isActive: true })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ isSystemRole: -1, createdAt: -1 });
  },

  async getRoleById(id: string): Promise<IRole | null> {
    return await Role.findById(id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
  },

  async getRoleByName(name: string): Promise<IRole | null> {
    return await Role.findOne({ name: name.toLowerCase(), isActive: true });
  },

  async updateRole(id: string, updateData: Partial<IRole>, userId: string): Promise<IRole | null> {
    return await Role.findByIdAndUpdate(
      id,
      { ...updateData, updatedBy: userId },
      { new: true }
    );
  },

  async deleteRole(id: string): Promise<boolean> {
    const result = await Role.findOneAndUpdate(
      { _id: id, isSystemRole: false },
      { isActive: false },
      { new: true }
    );
    return !!result;
  },

  async checkPermission(userRole: string, customRoleId: string | null, resource: string, action: string): Promise<boolean> {
    // Check if it's a system role first (legacy support)
    if (Object.values(UserRole).includes(userRole as UserRole)) {
      return this.checkSystemRolePermission(userRole as UserRole, resource, action);
    }

    // Check custom role permissions
    if (customRoleId) {
      const role = await Role.findById(customRoleId);
      if (!role || !role.isActive) return false;

      const permission = role.permissions.find(p => p.resource === resource);
      return permission ? permission.actions.includes(action) : false;
    }

    return false;
  },

  // Legacy system role permission check
  checkSystemRolePermission(role: UserRole, resource: string, action: string): boolean {
    // Define system role permissions (updated with new RBAC structure)
    const systemPermissions: Record<UserRole, Record<string, string[]>> = {
      [UserRole.ADMIN]: {
        '*': ['create', 'read', 'update', 'delete'] // Admin has all permissions
      },
      [UserRole.BD]: {
        'dashboard': ['read'],
        'leads': ['create', 'read', 'update'], // NO delete, NO upload_csv
        'patients': ['read'], // directory_only scope
        'cab_services': ['read'], // can use
        'hospitals': ['read'], // all and city_wise scope
        'loans': ['create', 'read'], // new_leads scope only
        'targets': ['read'], // self scope
        'hr_self': ['read', 'update'], // employee_profile, leaves, attendance, salary, incentives
      },
      [UserRole.HR]: {
        'employees': ['create', 'read', 'update'], // NO delete
        'leaves': ['create', 'read', 'update', 'delete'],
        'attendance': ['create', 'read', 'update', 'delete'],
        'salary': ['read', 'update'], // with admin, finance
        'documents': ['create', 'read', 'update'], // upload, download
      },
      [UserRole.DOCTOR]: {
        'leads': ['read'], // opd, ipd scope
        'patients': ['read'],
        'appointments': ['create', 'read', 'update', 'delete'],
        'targets': ['read'],
      },
      [UserRole.FINANCE]: {
        'salary': ['create', 'read', 'update', 'delete'],
        'incentives': ['create', 'read', 'update', 'delete'],
        'reimbursements': ['create', 'read', 'update', 'delete'],
        'ledger': ['create', 'read', 'update', 'delete'],
        'payments': ['create', 'read', 'update', 'delete'],
        'invoices': ['create', 'read', 'update', 'delete'],
        'loans': ['create', 'read', 'update', 'delete'],
        'documents': ['read'], // view only
      },
      [UserRole.PARTNER]: {
        'cab_services': ['read'], // limited scope
        'targets': ['read'], // self scope
        'hospitals': ['read'], // view only
      },
      [UserRole.BD_MANAGER]: {
        'leads': ['create', 'read', 'update', 'delete'],
        'employees': ['read'],
        'hospitals': ['read'],
        'partners': ['read']
      },
      [UserRole.SALES_MANAGER]: {
        'leads': ['create', 'read', 'update'],
        'employees': ['read'],
        'hospitals': ['read']
      },
      [UserRole.ASSISTANT_MANAGER]: {
        'leads': ['read', 'update'],
        'employees': ['read'],
        'hospitals': ['read']
      },
      [UserRole.OPERATION_MANAGER]: {
        'leads': ['read'],
        'employees': ['read'],
        'hospitals': ['create', 'read', 'update'],
        'doctors': ['create', 'read', 'update'],
        'appointments': ['create', 'read', 'update']
      },
      [UserRole.BD_ASSOCIATE]: {
        'leads': ['read', 'update'],
        'hospitals': ['read']
      },
      [UserRole.DIRECTOR]: {
        'dashboard': ['read'],
        'leads': ['read'],
        'employees': ['read'],
        'hospitals': ['read'],
        'finance': ['read'],
        'salary': ['read']
      }
    };

    const rolePermissions = systemPermissions[role];
    if (!rolePermissions) return false;

    // Check wildcard permission (admin)
    if (rolePermissions['*'] && rolePermissions['*'].includes(action)) {
      return true;
    }

    // Check specific resource permission
    const resourcePermissions = rolePermissions[resource];
    return resourcePermissions ? resourcePermissions.includes(action) : false;
  },

  async initializeSystemRoles(): Promise<void> {
    const systemRoles = [
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access with all permissions',
        permissions: [{ resource: '*', actions: ['create', 'read', 'update', 'delete'] }],
        isSystemRole: true
      },
      {
        name: 'bd',
        displayName: 'Business Development',
        description: 'Manage leads and business operations',
        permissions: [
          { resource: 'dashboard', actions: ['read'] },
          { resource: 'leads', actions: ['create', 'read', 'update'] },
          { resource: 'patients', actions: ['read'] },
          { resource: 'cab_services', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] },
          { resource: 'loans', actions: ['create', 'read'] },
          { resource: 'targets', actions: ['read'] },
          { resource: 'hr_self', actions: ['read', 'update'] },
        ],
        isSystemRole: true
      },
      {
        name: 'hr',
        displayName: 'Human Resources',
        description: 'Manage employees and HR operations',
        permissions: [
          { resource: 'employees', actions: ['create', 'read', 'update'] },
          { resource: 'leaves', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'attendance', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'salary', actions: ['read', 'update'] },
          { resource: 'documents', actions: ['create', 'read', 'update'] },
        ],
        isSystemRole: true
      },
      {
        name: 'doctor',
        displayName: 'Doctor',
        description: 'Medical professional access',
        permissions: [
          { resource: 'leads', actions: ['read'] },
          { resource: 'patients', actions: ['read'] },
          { resource: 'appointments', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'targets', actions: ['read'] },
        ],
        isSystemRole: true
      },
      {
        name: 'finance',
        displayName: 'Finance',
        description: 'Financial operations and management',
        permissions: [
          { resource: 'salary', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'incentives', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'reimbursements', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'ledger', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'payments', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'invoices', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'loans', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'documents', actions: ['read'] },
        ],
        isSystemRole: true
      },
      {
        name: 'partner',
        displayName: 'Partner',
        description: 'External partner access',
        permissions: [
          { resource: 'cab_services', actions: ['read'] },
          { resource: 'targets', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] },
        ],
        isSystemRole: true
      },
      {
        name: 'bd_manager',
        displayName: 'Business Development Manager',
        description: 'Manage business development team and leads',
        permissions: [
          { resource: 'leads', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] },
          { resource: 'partners', actions: ['read'] }
        ],
        isSystemRole: true
      },
      {
        name: 'sales_manager',
        displayName: 'Sales Manager',
        description: 'Manage sales operations and team',
        permissions: [
          { resource: 'leads', actions: ['create', 'read', 'update'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] }
        ],
        isSystemRole: true
      },
      {
        name: 'assistant_manager',
        displayName: 'Assistant Manager',
        description: 'Assist in managing operations',
        permissions: [
          { resource: 'leads', actions: ['read', 'update'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] }
        ],
        isSystemRole: true
      },
      {
        name: 'operation_manager',
        displayName: 'Operation Manager',
        description: 'Manage day-to-day operations',
        permissions: [
          { resource: 'leads', actions: ['read'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'hospitals', actions: ['create', 'read', 'update'] },
          { resource: 'doctors', actions: ['create', 'read', 'update'] },
          { resource: 'appointments', actions: ['create', 'read', 'update'] }
        ],
        isSystemRole: true
      },
      {
        name: 'bd_associate',
        displayName: 'Business Development Associate',
        description: 'Handle assigned leads and business development',
        permissions: [
          { resource: 'leads', actions: ['read', 'update'] },
          { resource: 'hospitals', actions: ['read'] }
        ],
        isSystemRole: true
      },
      {
        name: 'director',
        displayName: 'Director',
        description: 'Executive level access',
        permissions: [
          { resource: 'dashboard', actions: ['read'] },
          { resource: 'leads', actions: ['read'] },
          { resource: 'employees', actions: ['read'] },
          { resource: 'hospitals', actions: ['read'] },
          { resource: 'finance', actions: ['read'] },
          { resource: 'salary', actions: ['read'] }
        ],
        isSystemRole: true
      }
    ];

    for (const roleData of systemRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
      }
    }
  },

  async getAvailableResources(): Promise<string[]> {
    return [
      'dashboard',
      'leads',
      'employees',
      'hospitals',
      'partners',
      'doctors',
      'documents',
      'salary',
      'payments',
      'loans',
      'invoices',
      'reimbursement',
      'incentive',
      'leaves',
      'appointments',
      'insurance',
      'gst'
    ];
  },

  async getAvailableActions(): Promise<string[]> {
    return ['create', 'read', 'update', 'delete'];
  }
};