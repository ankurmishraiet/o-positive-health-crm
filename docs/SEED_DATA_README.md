# 🌱 Comprehensive Database Seed Script

## Overview

This enhanced seed script populates **ALL 12 modules** of the O Positive Health CRM with realistic sample data to enable comprehensive integration testing. The script has been upgraded from the original 8 modules to include all backend modules.

## 🎯 Purpose

**Problem Statement**: "Script to Populate Data in all to check all the integrations"

**Solution**: A comprehensive seeding system that creates interconnected sample data across all CRM modules, enabling thorough testing of:
- ✅ Frontend-Backend API integrations
- ✅ Data relationships and referential integrity  
- ✅ CRUD operations across all modules
- ✅ Dashboard statistics and analytics
- ✅ Business logic and workflows

## 📋 Modules Covered

### Original Modules (Enhanced)
1. **Users** - Authentication and user management
2. **Leads** - Patient leads and prospects  
3. **Employees** - Staff and employee records
4. **Doctors** - Doctor profiles and specializations
5. **Hospitals** - Hospital and medical facility data
6. **Cabs** - Transportation and cab booking
7. **Partners** - Business partners and associations
8. **Loans** - Medical loan applications

### NEW Modules Added
9. **Insurance** - Insurance policies and claims ✨
10. **Reimbursement** - Employee medical reimbursements ✨  
11. **Appointments** - Medical appointment scheduling ✨
12. **Invoices** - Financial invoices and billing ✨

## 🚀 Usage

### Basic Usage
```bash
# Seed all modules
cd server
node scripts/seed-data.js

# Using the runner utility
node scripts/seed-runner.js
```

### Advanced Options
```bash
# Clear existing data and reseed everything
node scripts/seed-data.js --clear

# Seed only a specific module
node scripts/seed-data.js --module=insurance

# Clear and seed with verbose logging
node scripts/seed-data.js --clear --verbose

# Show help
node scripts/seed-runner.js --help

# List all available modules
node scripts/seed-runner.js --list-modules
```

### NPM Scripts (Recommended)
Add to your `package.json`:
```json
{
  "scripts": {
    "seed": "node scripts/seed-runner.js",
    "seed:clear": "node scripts/seed-data.js --clear",
    "seed:help": "node scripts/seed-runner.js --help"
  }
}
```

Then use:
```bash
npm run seed
npm run seed -- --clear
npm run seed -- --module=appointments
```

## 📊 Sample Data Summary

The script creates realistic, interconnected data:

| Module | Records | Key Features |
|--------|---------|--------------|
| Users | 5 | Admin, BD, HR, Doctor, Finance roles |
| Leads | 3 | Different stages: New, Follow-up, Converted |
| Employees | 4 | Various departments with proper hierarchy |
| Doctors | 4 | Multiple specializations across cities |
| Hospitals | 3 | Partner and Network hospitals |
| Cabs | 4 | Different vehicle types and statuses |
| Partners | 3 | Corporate and Individual partners |
| Loans | 4 | Various loan types and statuses |
| Insurance | 3 | Corporate and Individual policies |
| Reimbursement | 5 | Medical expenses for employees |
| Appointments | 4 | OPD, Emergency with different statuses |
| Invoices | 5 | Various entity types and payment statuses |

**Total Records**: ~43 interconnected records

## 🔗 Data Relationships

The script creates realistic relationships between entities:

- **Insurance** → Links to **Leads** (patients)
- **Reimbursement** → Links to **Employees** 
- **Appointments** → Links to **Doctors**, **Hospitals**, and **Employees**
- **Invoices** → Links to **Doctors**, **Employees**, **Hospitals** (multi-entity)
- **Users** → Links to **Employees** and **Doctors**

## 🔧 Configuration

The script supports several configuration options via command line:

```javascript
const config = {
  clearDatabase: process.argv.includes("--clear"),
  specificModule: process.argv.find(arg => arg.startsWith("--module="))?.split("=")[1],
  verbose: process.argv.includes("--verbose")
};
```

## 📈 Integration Testing Benefits

With this comprehensive seed data, you can test:

### Frontend Integration
- All dashboard widgets populate with real data
- CRUD operations work across all modules
- Search and filtering functions properly
- Statistics and analytics display correctly

### Backend Integration  
- All API endpoints return data
- Database relationships are maintained
- Business logic functions correctly
- Performance under realistic data loads

### End-to-End Workflows
- Lead → Appointment → Invoice flow
- Employee → Reimbursement → Invoice flow  
- Insurance claim processing
- Complete patient journey

## 🛠️ Technical Details

### Database Collections
- `users` - User authentication and profiles
- `leads` - Patient leads and contact information
- `employees` - Staff records and HR data
- `doctors` - Medical professional profiles  
- `hospitals` - Healthcare facility information
- `cabs` - Transportation and logistics
- `partners` - Business relationship data
- `loans` - Financial loan applications
- `insurances` - Insurance policy data ✨
- `reimbursements` - Medical expense claims ✨
- `appointments` - Medical appointment scheduling ✨  
- `invoices` - Financial billing and payments ✨

### Error Handling
- Graceful fallbacks for missing related records
- Comprehensive logging with timestamps
- Clear success/error messaging
- Safe execution with connection cleanup

### Performance
- Efficient bulk insert operations
- Conditional execution by module
- Minimal database connections
- Optimized for large datasets

## 🧪 Testing Verification

After running the script, verify the integration by:

1. **Dashboard Stats**: Check that all widgets show non-zero counts
2. **Module Pages**: Navigate to each module and verify data displays
3. **CRUD Operations**: Test Create, Read, Update, Delete on each module
4. **Search/Filter**: Test filtering and search functionality
5. **Relationships**: Verify data relationships (e.g., appointments link to doctors)

## 🚨 Important Notes

- **Database URI**: Update the MongoDB connection string for your environment
- **Production Safety**: Never run with `--clear` on production databases  
- **Relationships**: Script automatically handles entity relationships
- **Idempotency**: Safe to run multiple times (will create duplicates unless `--clear` is used)

## 📝 Maintenance

To add new modules or modify existing data:

1. Add collection reference in the database setup
2. Create sample data following existing patterns
3. Add module to the configuration check
4. Update documentation and module list
5. Test relationships with existing data

## ✅ Success Criteria

After running this script, you should be able to:
- [ ] View populated dashboard with real statistics
- [ ] Navigate all 12 module pages with sample data
- [ ] Test all CRUD operations successfully
- [ ] Verify API integrations work end-to-end
- [ ] Confirm data relationships are intact
- [ ] Use the system for realistic integration testing

---

**Last Updated**: December 2024  
**Integration Status**: 100% Complete ✅  
**All 12 modules have comprehensive sample data for integration testing**