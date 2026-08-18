# Testing Guide for CRM Updates

## Quick Testing Checklist

### 1. Lead Status & Kanban Board ⭐ PRIORITY
**Steps:**
1. Navigate to `/dashboard/leads`
2. Verify all 17 status columns are visible on Kanban board
3. Create a new lead
4. Confirm default status is "New"
5. Drag lead between different status columns
6. Verify status updates correctly

**Expected Result:** All statuses visible, drag-and-drop works smoothly

---

### 2. Leave Creation 🔧 CRITICAL FIX
**Steps:**
1. Navigate to `/dashboard/hr/leaves`
2. Click "Apply Leave" or create button
3. Fill in: Leave Type, Start Date, End Date, Reason
4. Submit the form

**Expected Result:** 
- Leave created successfully
- No "Failed to create leave" error
- Employee name auto-populated
- Total days calculated automatically

**What Was Fixed:** 
- Employee info now auto-fetched from authenticated user
- Total days calculated from date range
- All required fields populated

---

### 3. Payroll Generation 💰 CRITICAL FIX
**Steps:**
1. Navigate to `/dashboard/finance/salary` or `/dashboard/hr/salary`
2. Click "Process Payroll" button
3. Select Month, Year, and Department (or "All")
4. Click "Generate"

**Expected Result:**
- Payroll processes successfully
- Success message appears
- Salary records created for active employees
- No errors about "no employees found"

**What Was Fixed:**
- Query changed from `isActive: true` to `status: 'Active'`

---

### 4. Create Incentive Plan ⭐ NEW FEATURE
**Steps:**
1. Navigate to `/dashboard/hr/incentive`
2. Click "Create Incentive Plan" button
3. Dialog should open (not redirect to 404 page)
4. Select employee from dropdown
5. Select incentive type
6. Fill in title, description, amount
7. Select month and year
8. Click "Create Incentive"

**Expected Result:**
- Dialog opens successfully
- Employees loaded in dropdown
- All fields validate properly
- Incentive created successfully
- Success toast notification appears
- List refreshes with new incentive

**What Was Fixed:**
- Created inline dialog (was redirecting to non-existent page)
- Added employee dropdown with API integration
- Complete form validation

---

### 5. Reimbursement Request with Employee Dropdown 🔧 UX IMPROVEMENT
**Steps:**
1. Navigate to `/dashboard/hr/reimbursement/create`
2. Check "Employee Information" section
3. Click on "Select Employee" dropdown
4. Select an employee
5. Verify Employee ID auto-fills
6. Complete other fields and submit

**Expected Result:**
- Dropdown shows list of employees
- Employee name and ID auto-populate
- Can search/filter employees
- Submission works with selected employee

**What Was Fixed:**
- Changed text input to dropdown
- Added employee fetching from API
- Auto-populate employee details

---

### 6. Document Upload with Better Errors 📄 ERROR HANDLING
**Steps:**
1. Navigate to `/dashboard/documents/upload`
2. Try uploading WITHOUT selecting entity type/ID
3. Select entity type and ID
4. Upload a valid file
5. Try uploading an invalid file (if possible)

**Expected Result:**
- Clear error message if entity type/ID missing
- Progress bar during upload
- Success message with file name on success
- Specific error message on failure (not generic "upload failed")

**What Was Fixed:**
- Backend validates required fields
- Structured error responses
- Frontend parses and displays specific errors
- Better user feedback

---

## Manual Testing Priority

### High Priority (Must Test)
1. ✅ Leave Creation
2. ✅ Payroll Generation
3. ✅ Create Incentive Plan

### Medium Priority (Should Test)
4. ✅ Lead Status & Kanban Board
5. ✅ Reimbursement Employee Dropdown

### Low Priority (Nice to Test)
6. ✅ Document Upload Errors

---

## API Endpoints to Test

```bash
# Leave Creation
POST /api/v1/hr/leaves
Body: { leaveType, startDate, endDate, reason }

# Payroll Generation
POST /api/v1/hr/payroll/process
Body: { month, year, department? }

# Incentive Creation
POST /api/v1/hr/incentives
Body: { employeeId, incentiveType, title, description, amount, month, year }

# Reimbursement Creation
POST /api/v1/reimbursement
Body: { employeeId, employeeName, category, amount, description, receiptDate }

# Document Upload
POST /api/v1/documents/upload
FormData: file, entityType, entityId, documentType

# Employee List (for dropdowns)
GET /api/v1/employees
```

---

## Common Issues to Watch For

### Issue: "Failed to create leave"
**Fix Applied:** Employee info auto-populated from authenticated user
**Test:** Ensure user account is linked to employee profile

### Issue: "No employees found" during payroll
**Fix Applied:** Query changed to `status: 'Active'`
**Test:** Ensure some employees have status = 'Active'

### Issue: "Create Incentive Plan" redirects to 404
**Fix Applied:** Dialog added instead of page redirect
**Test:** Button should open dialog, not navigate

### Issue: Document upload errors not clear
**Fix Applied:** Enhanced error messages
**Test:** Upload without entity type/ID to see error

---

## Database Prerequisites

### Required Data
1. **Users** with linked employee profiles
2. **Employees** with `status: 'Active'`
3. **Employees** with salary field set

### Optional Test Data
```javascript
// Sample Employee
{
  name: "John Doe",
  employeeId: "EMP001",
  status: "Active",
  department: "Sales",
  designation: "Sales Manager",
  salary: 50000
}
```

---

## Troubleshooting

### If Leave Creation Still Fails
- Check user is linked to employee
- Verify employee has required fields (name, department, employeeId)
- Check browser console for errors
- Verify API endpoint is accessible

### If Payroll Generation Fails
- Ensure employees exist with `status: 'Active'`
- Check employee salary field is set
- Verify MongoDB connection
- Check server logs for errors

### If Incentive Dialog Doesn't Open
- Check browser console for errors
- Verify Dialog component is rendering
- Clear browser cache
- Check if employees API is returning data

---

## Success Criteria

✅ All 6 features tested successfully
✅ No critical errors in browser console
✅ No API errors in network tab
✅ User receives clear feedback for all actions
✅ Data persists correctly in database

