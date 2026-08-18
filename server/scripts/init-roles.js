const mongoose = require('mongoose');
require('dotenv').config();

// Since we're in JavaScript, we need to define the schema here
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  resource: { type: String, required: true },
  actions: [{ type: String, required: true }]
}, { _id: false });

const roleSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  permissions: [permissionSchema],
  isSystemRole: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User"
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User"
  }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

async function initializeSystemRoles() {
  try {
    await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/opositive');
    console.log('Connected to MongoDB');

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
        console.log(`✅ Created system role: ${roleData.displayName}`);
      } else {
        console.log(`⚠️  System role already exists: ${roleData.displayName}`);
      }
    }

    console.log('✅ System roles initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing system roles:', error);
    process.exit(1);
  }
}

initializeSystemRoles();