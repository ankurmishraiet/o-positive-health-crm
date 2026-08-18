# Bulk Upload & Enhanced Lead Management Features

## Overview

This document describes the new features added for bulk upload, lead assignment tracking, employee account management, and new role management.

## Features Added

### 1. New User Roles

The following roles have been added to the system:
- **Business Development Manager** (`bd_manager`)
- **Sales Manager** (`sales_manager`)
- **Assistant Manager** (`assistant_manager`)
- **Operation Manager** (`operation_manager`)
- **Business Development Associate** (`bd_associate`)
- **Director** (`director`)

These roles have specific permissions configured in the role service.

### 2. Lead Assignment Tracking

- Added `assignedBy` field to Lead model to track who (reporting manager) assigned the lead
- Updated lead assignment endpoint to capture the user who made the assignment
- Leads now show both `assignedTo` (employee) and `assignedBy` (assigning user/manager)

### 3. Phone Number Uniqueness

- **System-wide phone number uniqueness**: Each phone number can only have ONE lead in the entire system
- Unique sparse index created on `contact.mobile` field
- Duplicate phone numbers are rejected during:
  - Manual lead creation
  - CSV bulk upload
  - API submissions

### 4. Bulk Upload Endpoints

Three new endpoints for bulk uploading entities via CSV:

#### Upload Employees
```
POST /api/v1/bulk-upload/employees
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- csvFile: <employees.csv>
```

**Required CSV Columns:**
- Name (required)
- Email (required)
- Phone (required)
- Age
- Gender
- Designation
- Department
- Salary
- Address
- Qualification
- Joining Date (format: YYYY-MM-DD)
- Status (Active/On Leave/Inactive)

**Template:** See `docs/csv-templates/employees_template.csv`

#### Upload Hospitals
```
POST /api/v1/bulk-upload/hospitals
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- csvFile: <hospitals.csv>
```

**Required CSV Columns:**
- Name (required)
- Address
- Phone
- Email
- City
- State
- PIN
- Type (Multi-specialty/Specialty/General/Super Specialty/Teaching)
- Beds
- Emergency Services (Yes/No)
- Status (Active/Inactive/Suspended)

**Template:** See `docs/csv-templates/hospitals_template.csv`

#### Upload Doctors
```
POST /api/v1/bulk-upload/doctors
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- csvFile: <doctors.csv>
```

**Required CSV Columns:**
- Name (required)
- Specialization
- Email
- Phone (required)
- Qualifications
- Experience Years
- Location
- Consultation Fee
- Availability

**Template:** See `docs/csv-templates/doctors_template.csv`

### 5. Employee-Specific Lead Filtering

New endpoint to fetch leads assigned to a specific employee:

```
GET /api/v1/leads/employee/:employeeId/leads?page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)
- `leadStatus` - Filter by lead status
- `city` - Filter by city
- `treatment` - Filter by treatment
- `search` - Search in patient name, phone, treatment

**Response:**
```json
{
  "leads": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### 6. Employee Account Management

Admins and HR can now create/remove user credentials for employees directly:

#### Create Account
```
POST /api/v1/employees/:id/create-account
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john.doe",  // Optional: auto-generated if not provided
  "password": "SecurePass123",  // Optional: auto-generated if not provided
  "role": "bd"  // Optional: defaults to 'bd'
}
```

**Response:**
```json
{
  "user": {...},
  "username": "john.doe",
  "passwordPlain": "SecurePass123",  // Only shown once
  "message": "User account created successfully"
}
```

#### Remove Account
```
DELETE /api/v1/employees/:id/remove-account
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User account removed successfully"
}
```

## Migration

Before using the new features, run the migration script to update existing data:

```bash
cd server
node scripts/migrate-new-fields.js
```

This script will:
1. Add `assignedBy` field to all existing leads
2. Add `hasAccount` and `userId` fields to all existing employees
3. Create unique sparse index on `contact.mobile` in leads collection
4. Report any duplicate phone numbers found (requires manual resolution)

## Permissions

### Role Permissions Summary

| Role | Leads | Employees | Hospitals | Doctors | Finance |
|------|-------|-----------|-----------|---------|---------|
| Admin | Full | Full | Full | Full | Full |
| BD Manager | Full | Read | Read | - | - |
| Sales Manager | Create, Read, Update | Read | Read | - | - |
| Assistant Manager | Read, Update | Read | Read | - | - |
| Operation Manager | Read | Read | Create, Read, Update | Create, Read, Update | - |
| BD Associate | Read, Update | - | Read | - | - |
| Director | Read | Read | Read | - | Read |

## Error Handling

### Bulk Upload Errors

The bulk upload endpoints return detailed error reports:

```json
{
  "message": "CSV processing completed",
  "totalRows": 100,
  "successfulImports": 95,
  "failures": 5,
  "errors": [
    "Row 15: Name, Email, and Phone are required",
    "Row 23: Hospital with phone 9123456789 already exists",
    "Row 47: A lead with phone number 9876543210 already exists (Lead ID: 507f1f77bcf86cd799439011)"
  ]
}
```

### Phone Number Duplicates

When attempting to create a lead with a duplicate phone number:

```json
{
  "message": "A lead with phone number 9876543210 already exists (Lead ID: 507f1f77bcf86cd799439011)"
}
```

## Best Practices

1. **Before Bulk Upload:**
   - Download the CSV template for the entity type
   - Ensure all required fields are filled
   - Validate phone numbers and emails locally
   - Remove any test/dummy data

2. **Handling Duplicates:**
   - Run the migration script to identify existing duplicates
   - Merge or delete duplicate leads before enforcing uniqueness
   - During CSV upload, fix reported duplicates and re-upload

3. **Account Management:**
   - Create accounts only for employees who need system access
   - Use strong auto-generated passwords
   - Share credentials securely with employees
   - Remove accounts promptly when employees leave

4. **Lead Assignment:**
   - Always use the assignment endpoint to track who assigned leads
   - The `assignedBy` field helps in accountability and audit trails
   - Use employee-specific lead endpoints to show filtered views

## Testing

To test the new features:

1. **Initialize new roles:**
```bash
cd server
node scripts/init-roles.js
```

2. **Run migration:**
```bash
node scripts/migrate-new-fields.js
```

3. **Test bulk upload:**
   - Use Postman or similar tool
   - Upload sample CSV files from `docs/csv-templates/`
   - Verify success/error responses

4. **Test account creation:**
   - Create an account for an employee
   - Verify credentials work for login
   - Remove the account and verify login fails

5. **Test lead assignment:**
   - Assign a lead to an employee
   - Check that `assignedBy` field is populated
   - Fetch employee's leads using the new endpoint

## Troubleshooting

### Issue: "Duplicate key error on contact.mobile"

**Solution:** This means you're trying to create a lead with a phone number that already exists. Run the migration script to find duplicates, then merge or delete them.

### Issue: "Employee already has a user account"

**Solution:** Remove the existing account first using the remove-account endpoint, then create a new one.

### Issue: "CSV parsing errors"

**Solution:** 
- Ensure CSV file is UTF-8 encoded
- Check that column names match the template exactly
- Remove any special characters or extra spaces
- Ensure dates are in YYYY-MM-DD format

## Future Enhancements

- Web UI for bulk upload with drag-and-drop
- CSV validation before upload
- Bulk lead assignment
- Email notifications for account creation
- Audit logs for all sensitive operations
- Export functionality for leads and employees
