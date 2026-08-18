# Patient Section Testing Guide

## Manual Testing Steps

### Prerequisites
1. Ensure the server is running: `cd server && npm run dev`
2. Ensure the web-app is running: `cd web-app && npm run dev`
3. Have a valid user authentication token
4. Have some test data (leads, appointments, cabs) in the database

### Backend API Testing

#### 1. Test Patient List Endpoint
```bash
# Get list of patients
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients?limit=10"

# Expected: 200 OK with list of patients and pagination info
```

#### 2. Test Patient History Endpoint
```bash
# Get patient history (replace PATIENT_ID with actual ID)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients/PATIENT_ID/history"

# Expected: 200 OK with patient details, appointments, and cab bookings
```

#### 3. Test Patient Status Endpoint
```bash
# Get patient current status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients/PATIENT_ID/status"

# Expected: 200 OK with current status and upcoming activities
```

#### 4. Test Patient Appointments Endpoint
```bash
# Get patient appointments
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients/PATIENT_ID/appointments"

# Expected: 200 OK with list of appointments
```

#### 5. Test Patient Cabs Endpoint
```bash
# Get patient cab bookings
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients/PATIENT_ID/cabs"

# Expected: 200 OK with list of cab bookings
```

#### 6. Test Patient Hospitals Endpoint
```bash
# Get hospitals visited by patient
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:4000/api/v1/patients/PATIENT_ID/hospitals"

# Expected: 200 OK with list of hospitals and visit counts
```

### Frontend UI Testing

#### 1. Test Navigation
1. Log in to the web-app
2. Look for "Patients" in the sidebar navigation
3. Click on "Patient Directory"
4. Verify you're redirected to `/dashboard/patients`

#### 2. Test Patient Directory Page
1. Navigate to `/dashboard/patients`
2. Verify the following elements are visible:
   - Page title "Patient Directory"
   - Summary statistics cards (Total Patients, Active Cases, New Patients, Completed Cases)
   - Search bar
   - Data table with patient records
3. Test search functionality:
   - Type a patient name in the search bar
   - Verify the table filters results
4. Test table sorting:
   - Click on column headers
   - Verify the table sorts accordingly
5. Click on a patient name link
   - Verify navigation to patient detail page

#### 3. Test Patient Detail Page
1. Navigate to a patient detail page (`/dashboard/patients/[id]`)
2. Verify the following sections are visible:
   - **Left Sidebar:**
     - Patient Information card
     - Current Status card
     - History Summary card
   - **Main Content:**
     - Tabs: Overview, Appointments, Cab Bookings
3. Test Overview Tab:
   - Verify recent activity is displayed
   - Verify quick action buttons work
4. Test Appointments Tab:
   - Click on "Appointments" tab
   - Verify list of appointments is displayed
   - Verify each appointment shows:
     - Doctor name and specialization
     - Hospital name
     - Appointment date and time
     - Type and status badges
   - If no appointments, verify empty state message
5. Test Cab Bookings Tab:
   - Click on "Cab Bookings" tab
   - Verify list of cab bookings is displayed
   - Verify each booking shows:
     - Booking ID and service type
     - Pickup and destination addresses
     - Pickup time
     - Driver details (if assigned)
     - Status and fare
   - If no bookings, verify empty state message

#### 4. Test Responsive Design
1. Resize browser window to mobile size
2. Verify layout adapts appropriately
3. Verify all content is accessible
4. Test navigation on mobile

### Edge Cases to Test

#### Backend
1. **Patient with no appointments:**
   - Should return empty array for appointments
   - History summary should show 0 appointments
2. **Patient with no cab bookings:**
   - Should return empty array for cabs
   - History summary should show 0 cab bookings
3. **Patient not found:**
   - Should return 404 error
   - Error message should be clear
4. **Invalid patient ID:**
   - Should handle gracefully with error message
5. **Pagination edge cases:**
   - First page, last page, page beyond total pages
   - Different limit values

#### Frontend
1. **Loading state:**
   - Verify loading spinner appears while fetching data
2. **Error handling:**
   - Test with invalid patient ID
   - Verify error message is displayed
   - Verify "Back to Patients" button works
3. **Empty states:**
   - Patient with no history
   - Verify empty state messages in all tabs
4. **Long data:**
   - Patient with many appointments/cabs
   - Verify scrolling works properly
   - Verify performance is acceptable

### Performance Testing

1. **Large dataset:**
   - Test with 100+ patients in directory
   - Verify pagination works smoothly
   - Check page load time
2. **Patient with extensive history:**
   - Test patient with 50+ appointments
   - Verify detail page loads in reasonable time
   - Check tab switching performance

### Security Testing

1. **Authentication:**
   - Try accessing endpoints without token
   - Verify 401 Unauthorized response
2. **Authorization:**
   - Test with different user roles (ADMIN, BD, DOCTOR)
   - Verify appropriate access
3. **Input validation:**
   - Test with invalid query parameters
   - Test with malformed patient IDs

### Data Integrity Testing

1. **Patient-Appointment linking:**
   - Create an appointment for a patient
   - Verify it appears in patient's appointment history
   - Verify it uses correct patient name/phone matching
2. **Patient-Cab linking:**
   - Create a cab booking for a patient
   - Verify it appears in patient's cab history
   - Verify correct linking by name/phone
3. **Hospital visit counting:**
   - Create multiple appointments at same hospital
   - Verify hospital appears once with correct visit count
4. **Summary statistics:**
   - Verify counts are accurate
   - Verify unique counts (hospitals, doctors) are correct

### Regression Testing

1. **Existing functionality:**
   - Verify leads page still works
   - Verify appointments page still works
   - Verify cabs page still works
   - Verify other sections are not affected
2. **Sidebar navigation:**
   - Verify all existing menu items still work
   - Verify new Patients menu integrates properly

## Automated Testing Checklist

If implementing automated tests in the future, consider:

- [ ] Unit tests for PatientService methods
- [ ] Unit tests for PatientController handlers
- [ ] Integration tests for patient API endpoints
- [ ] Component tests for patient directory page
- [ ] Component tests for patient detail page
- [ ] E2E tests for complete patient journey
- [ ] API contract tests
- [ ] Performance tests for large datasets
- [ ] Load tests for concurrent users

## Test Data Setup

For comprehensive testing, set up test data with:
1. Multiple patients with varying data completeness
2. Patients with different statuses (New, Follow-up, Close, etc.)
3. Appointments spanning different dates and statuses
4. Cab bookings with various service types
5. Multiple hospitals and doctors for relationship testing

## Known Limitations

1. Patient linking is based on name and phone matching, not foreign keys
2. No direct Patient model - using Lead model as source
3. Search is case-sensitive for some fields
4. Pagination is simple offset-based (not cursor-based)

## Success Criteria

✅ All backend endpoints return expected data format
✅ Frontend pages load without errors
✅ Search and filtering work correctly
✅ Patient history displays complete information
✅ Navigation between pages works smoothly
✅ Empty states and error states are handled gracefully
✅ Data linking (appointments, cabs) works correctly
✅ Performance is acceptable for expected data volumes
✅ Security measures (authentication) are in place
