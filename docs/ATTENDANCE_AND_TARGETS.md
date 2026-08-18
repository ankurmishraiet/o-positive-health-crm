# Attendance and Target Management Features

This document describes the new attendance tracking and target vs achievement management features added to the O Positive Health CRM.

## Features Overview

### 1. Attendance Management
Admins and HR personnel can now mark and track employee attendance with the following capabilities:

#### For Admins/HR:
- **Mark Daily Attendance**: Select a date and mark attendance status for all employees
- **Bulk Operations**: Mark all employees as present with a single click
- **Status Options**: Present, Absent, Half Day, Leave, Holiday
- **View Historical Data**: View attendance records for any past date
- **Update Records**: Modify attendance records if needed

#### Attendance Page Location:
- Admin/HR: `/dashboard/hr/attendance`

### 2. Target vs Achievement Tracking
Admins can set monthly targets for employees and track their performance against leads, OPD, and IPD metrics.

#### For Admins/HR:
- **Set Monthly Targets**: Set lead, OPD, and IPD targets for each employee
- **Bulk Target Setting**: Set targets for multiple employees at once
- **View Achievements**: See real-time progress of employees against their targets
- **Progress Visualization**: Visual progress bars showing completion percentages

#### For All Employees:
- **View Own Targets**: Employees can view their personal monthly targets
- **Track Progress**: See achievement progress with visual indicators
- **Monthly Overview**: View targets and achievements for any month

#### Target Pages:
- Admin/HR (Set & View): `/dashboard/hr/targets`
- Employee (View Only): `/dashboard/my-targets`

## API Endpoints

### Attendance Endpoints

#### Mark Attendance
```
POST /api/v1/attendance
Body: {
  "employeeId": "string",
  "date": "2024-01-15",
  "status": "Present|Absent|Half Day|Leave|Holiday",
  "remarks": "string (optional)"
}
```

#### Mark Bulk Attendance
```
POST /api/v1/attendance/bulk
Body: {
  "attendanceData": [
    { "employeeId": "string", "status": "Present" }
  ],
  "date": "2024-01-15"
}
```

#### Get Attendance by Date
```
GET /api/v1/attendance/date?date=2024-01-15
```

#### Get Monthly Attendance
```
GET /api/v1/attendance/monthly?month=01&year=2024
```

#### Get Employee Attendance
```
GET /api/v1/attendance/employee/:employeeId?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Attendance Stats
```
GET /api/v1/attendance/employee/:employeeId/stats?month=01&year=2024
```

### Target Endpoints

#### Set Target
```
POST /api/v1/targets
Body: {
  "employeeId": "string",
  "month": "01",
  "year": 2024,
  "leadTarget": 50,
  "opdTarget": 30,
  "ipdTarget": 10,
  "remarks": "string (optional)"
}
```

#### Set Bulk Targets
```
POST /api/v1/targets/bulk
Body: {
  "targets": [
    {
      "employeeId": "string",
      "leadTarget": 50,
      "opdTarget": 30,
      "ipdTarget": 10
    }
  ],
  "month": "01",
  "year": 2024
}
```

#### Get Targets by Month
```
GET /api/v1/targets/monthly?month=01&year=2024
```

#### Get Target by Employee
```
GET /api/v1/targets/employee/:employeeId?month=01&year=2024
```

#### Get Target vs Achievement
```
GET /api/v1/targets/employee/:employeeId/vs-achievement?month=01&year=2024
```

#### Get All Targets vs Achievements
```
GET /api/v1/targets/vs-achievements?month=01&year=2024
```

## Database Schema

### Attendance Model
```typescript
{
  employeeId: ObjectId (ref: Employee),
  date: Date,
  status: "Present" | "Absent" | "Half Day" | "Leave" | "Holiday",
  markedBy: ObjectId (ref: User),
  remarks?: string,
  timestamps: true
}
```

### Target Model
```typescript
{
  employeeId: ObjectId (ref: Employee),
  month: string, // Format: "01" to "12"
  year: number,
  leadTarget: number,
  opdTarget: number,
  ipdTarget: number,
  setBy: ObjectId (ref: User),
  remarks?: string,
  timestamps: true
}
```

## Access Control

### Attendance Management
- **View/Mark Attendance**: Admin, HR
- **View Own Attendance**: All authenticated users

### Target Management
- **Set/View All Targets**: Admin, HR
- **View Own Targets**: All authenticated users

## Navigation

The following navigation items have been added:

### HR Menu
- Attendance
- Targets

### Main Menu (All Users)
- My Targets

## Implementation Details

### Frontend Components
- `attendance-marking-sheet.tsx`: Attendance marking interface
- `target-vs-achievement-sheet.tsx`: Target setting and viewing interface
- `my-targets-view.tsx`: Personal target view for employees

### Backend Services
- `attendance.service.ts`: Attendance business logic
- `target.service.ts`: Target and achievement calculation logic

### Controllers
- `attendance.controller.ts`: Attendance API endpoints
- `target.controller.ts`: Target API endpoints

## Usage Examples

### 1. Marking Attendance for Today
1. Navigate to HR > Attendance
2. Today's date is selected by default
3. Select status for each employee from dropdown
4. Click "Mark All Present" to quickly mark everyone present
5. Click "Save Attendance" to submit

### 2. Setting Monthly Targets
1. Navigate to HR > Targets
2. Select the month using the month picker
3. Switch to "Set Targets" mode
4. Enter lead, OPD, and IPD targets for each employee
5. Click "Save Targets"

### 3. Viewing Target Progress
1. Navigate to HR > Targets
2. Select the month
3. Switch to "View Achievements" mode
4. View the progress table with:
   - Employee details
   - Target vs actual numbers
   - Progress bars with percentages

### 4. Employee Viewing Own Targets
1. Navigate to My Targets from main menu
2. Select the month to view
3. See cards showing:
   - Lead achievement progress
   - OPD achievement progress
   - IPD achievement progress

## Future Enhancements

Potential improvements for future versions:
- Export attendance reports to Excel/PDF
- Automated attendance notifications
- Attendance patterns and analytics
- Target achievement rewards system
- Email notifications for target milestones
- Comparative analytics across teams
- Mobile app integration for attendance marking
- Geolocation-based attendance marking
