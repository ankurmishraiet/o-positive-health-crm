# Integration Testing Guide

## Overview

This guide helps verify that the comprehensive seed script successfully enables testing of all CRM integrations.

## Pre-Testing Setup

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```

2. **Run Seed Script** 
   ```bash
   # Full seed (all modules)
   npm run seed

   # Or clear and reseed
   npm run seed:clear
   ```

3. **Start Frontend**
   ```bash
   cd web-app
   npm run dev
   ```

## Integration Test Checklist

### ✅ Dashboard Verification
After seeding, the dashboard should show:
- [ ] Total Leads: 3+
- [ ] New Leads: 1+  
- [ ] Total Doctors: 4+
- [ ] Total Hospitals: 3+
- [ ] Total Cabs: 4+
- [ ] Total Loans: ₹1.5L+ (from 4 loan records)
- [ ] Non-zero statistics in all widgets

### ✅ Module-by-Module Testing

#### 1. Users/Authentication
- [ ] Login with: `admin@opositivehealth.com` / `admin123`
- [ ] Verify role-based access works
- [ ] Check user profile displays correctly

#### 2. Leads Module (`/dashboard/leads`)
- [ ] List shows 3 lead records
- [ ] Leads show different statuses (New, Follow-up, Converted)
- [ ] Search and filter functions work
- [ ] Create new lead works
- [ ] Edit existing lead works
- [ ] Drag-and-drop status update works

#### 3. Employees Module (`/dashboard/hr/employees`)
- [ ] List shows 4 employee records
- [ ] Different departments displayed (IT, Sales, HR, Finance)
- [ ] Employee hierarchy visible (reporting structure)
- [ ] Create/Edit employee forms work

#### 4. Doctors Module (`/dashboard/doctors`)
- [ ] List shows 4 doctor records  
- [ ] Different specializations displayed
- [ ] City-wise grouping works
- [ ] Doctor availability schedules visible

#### 5. Hospitals Module (`/dashboard/hospitals`)
- [ ] List shows 3 hospital records
- [ ] Partnership types displayed (Partner, Network)
- [ ] Departments and facilities listed
- [ ] City-wise statistics work

#### 6. Cabs Module (`/dashboard/transport/cabs`)
- [ ] List shows 4 cab records
- [ ] Different statuses (Available, Booked, Maintenance)
- [ ] Vehicle types displayed
- [ ] Today/Scheduled views work

#### 7. Partners Module (`/dashboard/partners`)
- [ ] List shows 3 partner records
- [ ] Corporate and Individual types
- [ ] Contract dates and services displayed
- [ ] Partner status filtering works

#### 8. Loans Module (`/dashboard/loans`)
- [ ] List shows 4 loan records
- [ ] Different statuses (Approved, Under Review, Rejected)
- [ ] Loan amounts and types displayed
- [ ] Application workflow visible

#### 9. Insurance Module (`/dashboard/documents/insurance`)
- [ ] List shows 3 insurance records
- [ ] Corporate and Individual policies
- [ ] Policy validity periods displayed
- [ ] Sum insured amounts visible
- [ ] Related lead information shown

#### 10. Reimbursement Module (`/dashboard/documents/reimbursement`)
- [ ] List shows 5 reimbursement records
- [ ] Different medical expense types
- [ ] Employee associations visible
- [ ] Receipt file references shown
- [ ] Amount calculations correct

#### 11. Appointments Module (`/dashboard/appointments`)
- [ ] List shows 4 appointment records
- [ ] Different types (OPD, Emergency)
- [ ] Various statuses (Scheduled, Confirmed, In Progress)
- [ ] Doctor and hospital associations work
- [ ] Date/time scheduling displays correctly
- [ ] Patient details linked properly

#### 12. Invoices/Finance Module (`/dashboard/finance/invoices`)
- [ ] List shows 5 invoice records
- [ ] Different entity types (Doctor, Employee, Hospital)
- [ ] Various payment statuses (Paid, Unpaid, Partially Paid)
- [ ] Invoice calculations correct (GST, totals)
- [ ] Due dates and payment methods displayed

### ✅ Data Relationships Testing

#### Cross-Module Links
- [ ] **Appointments → Doctors**: Appointments show correct doctor names
- [ ] **Appointments → Hospitals**: Hospital information matches
- [ ] **Insurance → Leads**: Insurance policies link to patient leads
- [ ] **Reimbursement → Employees**: Claims associate with correct employees
- [ ] **Invoices → Multiple Entities**: Invoices link to doctors, employees, hospitals
- [ ] **Users → Employees**: User accounts link to employee records

#### Business Logic Flows
- [ ] **Lead → Appointment Flow**: Create appointment from lead
- [ ] **Appointment → Invoice Flow**: Generate invoice from appointment
- [ ] **Employee → Reimbursement Flow**: Submit reimbursement claim
- [ ] **Reimbursement → Invoice Flow**: Process reimbursement payment

### ✅ API Integration Testing

#### REST API Endpoints
For each module, verify these work:
- [ ] `GET /api/v1/{module}` - List records
- [ ] `POST /api/v1/{module}` - Create record  
- [ ] `PUT /api/v1/{module}/{id}` - Update record
- [ ] `DELETE /api/v1/{module}/{id}` - Delete record

#### Dashboard API
- [ ] `GET /api/v1/dashboard/stats` - Returns populated statistics
- [ ] All counts are non-zero
- [ ] Calculations include data from seed script

### ✅ Search and Filter Testing

For each module with search/filter:
- [ ] Text search returns relevant results
- [ ] Status filters work correctly
- [ ] Date range filters function properly
- [ ] Multi-criteria filtering works
- [ ] Clear filters resets view

### ✅ Performance Testing

- [ ] Page load times are reasonable with sample data
- [ ] List views handle record pagination
- [ ] Search operations complete quickly
- [ ] Dashboard statistics load promptly

## Troubleshooting

### No Data Showing
1. Check if seed script ran successfully
2. Verify MongoDB connection
3. Check browser console for API errors
4. Confirm backend server is running

### Incorrect Counts
1. Re-run seed script with `--clear` option
2. Check for duplicate data
3. Verify all collections were seeded

### API Errors
1. Check server logs for errors
2. Verify API endpoints exist
3. Confirm authentication tokens
4. Check CORS configuration

### Missing Relationships
1. Verify ObjectId references in seed data
2. Check if related records exist
3. Test relationship queries manually

## Success Criteria

✅ **Complete Success**: All 12 modules display data and function correctly  
✅ **API Integration**: All CRUD operations work across modules  
✅ **Data Relationships**: Cross-module references work properly  
✅ **Dashboard**: All statistics populate with realistic data  
✅ **Business Logic**: End-to-end workflows function correctly

## Reporting Issues

If any integration test fails:

1. **Note the specific module/feature**
2. **Record error messages from browser console**
3. **Check server logs for backend errors**
4. **Verify seed data exists in database**
5. **Test API endpoints directly (Postman/curl)**

---

**Remember**: This seed script provides a foundation for integration testing. Real production data will have different patterns and volumes, but this sample data should enable comprehensive testing of all system integrations.