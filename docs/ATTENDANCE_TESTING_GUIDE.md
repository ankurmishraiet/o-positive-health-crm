# Quick Start Guide: Testing Attendance and Target Features

This guide will help you test the newly implemented attendance and target management features.

## Prerequisites

1. Server is running on port 5000 (or configured port)
2. Web-app is running on port 3000 (or configured port)
3. You have an admin or HR user account
4. Database is connected and populated with some employees

## Testing Attendance Features

### 1. Test Attendance Marking (Admin/HR Only)

**Steps:**
1. Login as Admin or HR user
2. Navigate to `Dashboard > Human Resource > Attendance`
3. Verify the attendance marking interface loads
4. Check that:
   - Today's date is pre-selected
   - Employee list is displayed with columns: S.No, Employee ID, Name, Designation, Status
   - Status dropdown has options: Present, Absent, Half Day, Leave, Holiday

**Test Case 1: Mark Individual Attendance**
1. Select a status for one employee
2. Click "Save Attendance"
3. Verify success message appears
4. Refresh the page and verify the status persists

**Test Case 2: Mark All Present**
1. Click "Mark All Present" button
2. Verify all dropdowns are set to "Present"
3. Click "Save Attendance"
4. Verify success message

**Test Case 3: Change Date**
1. Click on the date picker (calendar icon)
2. Select a different date
3. Verify attendance for that date loads (or shows empty if no records)
4. Mark attendance for the selected date
5. Save and verify

**Test Case 4: Update Existing Attendance**
1. Navigate to a date with existing attendance
2. Change status for an employee
3. Save changes
4. Verify the update was successful

### 2. Test Attendance API Endpoints

**Using curl or Postman:**

```bash
# Mark single attendance
curl -X POST http://localhost:5000/api/v1/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "date": "2024-01-15",
    "status": "Present"
  }'

# Get attendance by date
curl -X GET "http://localhost:5000/api/v1/attendance/date?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get monthly attendance
curl -X GET "http://localhost:5000/api/v1/attendance/monthly?month=01&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Target Features

### 1. Test Target Setting (Admin/HR Only)

**Steps:**
1. Login as Admin or HR user
2. Navigate to `Dashboard > Human Resource > Targets`
3. Verify the target management interface loads
4. Check that:
   - Current month is pre-selected
   - Mode selector shows "View Achievements" and "Set Targets"
   - Employee list is displayed

**Test Case 1: Set Targets for Current Month**
1. Select current month from month picker
2. Switch to "Set Targets" mode
3. Enter targets for each employee:
   - Lead Target: e.g., 50
   - OPD Target: e.g., 30
   - IPD Target: e.g., 10
4. Click "Save Targets"
5. Verify success message

**Test Case 2: View Target vs Achievement**
1. Ensure targets are set for current month (from Test Case 1)
2. Switch to "View Achievements" mode
3. Verify the table shows:
   - Employee details
   - Target numbers for Leads, OPD, IPD
   - Achievement numbers
   - Progress bars with percentages
4. Check that progress percentages are calculated correctly

**Test Case 3: Update Existing Targets**
1. Navigate to a month with existing targets
2. Switch to "Set Targets" mode
3. Modify some target values
4. Save changes
5. Switch to "View Achievements" and verify updated targets

**Test Case 4: View Different Months**
1. Use month picker to select previous month
2. Switch to "View Achievements"
3. Verify data loads correctly (or shows "No targets set")
4. Try future months as well

### 2. Test Employee Target View (All Users)

**Steps:**
1. Login as any user (BD, Employee, etc.)
2. Navigate to `My Targets` from main menu
3. Verify the personal target view loads
4. Check that:
   - Current month is pre-selected
   - Three cards are displayed: Lead Target, OPD Target, IPD Target
   - Each card shows:
     - Achievement / Target numbers
     - Progress bar
     - Percentage complete
     - Color-coded status (red < 50%, yellow 50-75%, blue 75-100%, green 100%+)

**Test Case 1: View Current Month Targets**
1. Verify your targets are displayed correctly
2. Check that achievement numbers match your lead assignments
3. Verify progress percentages are accurate

**Test Case 2: View Different Months**
1. Change month using month picker
2. Verify targets for selected month load
3. If no targets set, verify "No targets set for this month" message appears

**Test Case 3: Verify Achievement Calculations**
1. Note current achievement numbers
2. Create/update some leads assigned to you
3. Mark some as OPD Done or IPD Discharged
4. Refresh the target page
5. Verify achievement numbers increased correctly

### 3. Test Target API Endpoints

**Using curl or Postman:**

```bash
# Set target for employee
curl -X POST http://localhost:5000/api/v1/targets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMPLOYEE_ID",
    "month": "01",
    "year": 2024,
    "leadTarget": 50,
    "opdTarget": 30,
    "ipdTarget": 10
  }'

# Get targets by month
curl -X GET "http://localhost:5000/api/v1/targets/monthly?month=01&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get target vs achievement for employee
curl -X GET "http://localhost:5000/api/v1/targets/employee/EMPLOYEE_ID/vs-achievement?month=01&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all targets vs achievements
curl -X GET "http://localhost:5000/api/v1/targets/vs-achievements?month=01&year=2024" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Role-Based Access Control

### Test Access Permissions

**Test Case 1: Admin Access**
1. Login as Admin
2. Verify access to:
   - HR > Attendance (can view and mark)
   - HR > Targets (can set and view)
   - My Targets (can view own)

**Test Case 2: HR Access**
1. Login as HR user
2. Verify access to:
   - HR > Attendance (can view and mark)
   - HR > Targets (can set and view)
   - My Targets (can view own)

**Test Case 3: Regular Employee Access**
1. Login as BD/Employee user
2. Verify:
   - Cannot access HR > Attendance (not visible in menu)
   - Cannot access HR > Targets (not visible in menu)
   - Can access My Targets (visible in menu)
   - Can only view their own data in My Targets

**Test Case 4: Direct URL Access**
1. Login as regular employee
2. Try accessing `/dashboard/hr/attendance` directly
3. Should be redirected or show access denied
4. Same for `/dashboard/hr/targets`

## Common Issues and Troubleshooting

### Issue: Attendance not saving
- Check network console for API errors
- Verify employee IDs are valid
- Check date format is correct

### Issue: Targets not showing achievements
- Verify leads are assigned to the employee
- Check lead status (OPD Done, IPD Discharged)
- Ensure date ranges match (created/updated within month)

### Issue: Progress percentage incorrect
- Check achievement calculation logic
- Verify lead statuses in database
- Check if OPD status is "Completed" and IPD status is "Discharged"

### Issue: Employee cannot see their targets
- Verify employeeId matches in user and employee collections
- Check if targets are set for the selected month
- Verify API response in network console

## Success Criteria

The features are working correctly if:

✅ Admin/HR can mark attendance for any date
✅ Attendance is saved and persists on page reload
✅ Admin/HR can set targets for employees
✅ Targets are saved and can be updated
✅ Target vs Achievement table shows correct data
✅ Progress percentages are calculated accurately
✅ All employees can view their own targets
✅ Role-based access control works correctly
✅ Navigation menu shows correct items based on role
✅ UI is responsive and user-friendly
✅ Error messages are clear and helpful
✅ API responses are fast and reliable

## Reporting Issues

If you encounter any issues during testing:

1. Check browser console for JavaScript errors
2. Check network tab for API response errors
3. Verify database has correct data
4. Check server logs for backend errors
5. Document steps to reproduce the issue
6. Take screenshots if applicable
7. Report with detailed information

## Next Steps

After successful testing:
- Deploy to staging environment
- Conduct user acceptance testing
- Gather feedback from HR team
- Plan for production deployment
- Consider implementing suggested enhancements
