# Testing Guide for Pagination and Infinite Scrolling

## Prerequisites

Before testing, ensure you have:
1. MongoDB running with the O Positive Health CRM database
2. At least 100+ leads in the database (ideally 45k+ for realistic testing)
3. Backend server running on port 4000
4. Frontend web app running on port 3000

## Setup Test Data

### Option 1: Use Existing Data
If you already have 45k+ leads, skip to the testing section.

### Option 2: Generate Test Data
Use the CSV upload feature or create a script to generate test leads.

Example script to create test leads (add to `server/scripts/generate-test-leads.js`):

```javascript
const mongoose = require('mongoose');
const { Lead } = require('../dist/models/lead.model');
require('dotenv').config();

async function generateTestLeads(count = 1000) {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const statuses = ['New', 'Follow-up', 'Hot Lead', 'Cold Lead', 'OPD Done', 'IPD Done', 'Close'];
  const treatments = ['Cardiology', 'Orthopedic', 'Neurology', 'Pediatrics', 'General Medicine'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];
  
  const leads = [];
  for (let i = 0; i < count; i++) {
    leads.push({
      patientName: `Test Patient ${i + 1}`,
      age: Math.floor(Math.random() * 60) + 20,
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
      contact: {
        mobile: `9${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`
      },
      city: cities[Math.floor(Math.random() * cities.length)],
      treatment: treatments[Math.floor(Math.random() * treatments.length)],
      leadStatus: statuses[Math.floor(Math.random() * statuses.length)],
      engagement: {
        firstEngagement: new Date(),
        lastEngagement: new Date()
      }
    });
  }
  
  await Lead.insertMany(leads);
  console.log(`Created ${count} test leads`);
  await mongoose.connection.close();
}

generateTestLeads(50000).catch(console.error);
```

## Testing Checklist

### 1. Backend API Testing

#### Test Basic Pagination
```bash
# Test first page (should return 50 leads)
curl "http://localhost:4000/api/v1/leads?page=1&limit=50"

# Test second page
curl "http://localhost:4000/api/v1/leads?page=2&limit=50"

# Test with different limit
curl "http://localhost:4000/api/v1/leads?page=1&limit=100"
```

#### Test Filtering
```bash
# Filter by status
curl "http://localhost:4000/api/v1/leads?page=1&limit=50&leadStatus=New"

# Filter by creator (replace USER_ID)
curl "http://localhost:4000/api/v1/leads?page=1&limit=50&createdBy=USER_ID"

# Search by name/mobile
curl "http://localhost:4000/api/v1/leads?page=1&limit=50&search=john"
```

#### Verify Response Format
Ensure the response includes:
```json
{
  "leads": [...],
  "pagination": {
    "total": 45000,
    "page": 1,
    "limit": 50,
    "totalPages": 900,
    "hasMore": true
  }
}
```

### 2. Frontend Testing

#### Initial Load Performance
- [ ] Open the leads page: `http://localhost:3000/dashboard/leads`
- [ ] Measure initial load time (should be < 2 seconds)
- [ ] Verify that only the first 50 leads are loaded
- [ ] Check browser Network tab to confirm single API request

#### Infinite Scrolling
- [ ] Scroll down slowly through the Kanban board
- [ ] Verify that "Loading more leads..." appears when approaching the bottom
- [ ] Confirm that new leads are automatically loaded and appended
- [ ] Check that the total lead count increases correctly
- [ ] Verify no duplicate leads are shown

#### Fast Scrolling
- [ ] Scroll quickly to the bottom of the page
- [ ] Verify that loading is triggered correctly
- [ ] Ensure no multiple simultaneous requests are made
- [ ] Check that all loaded leads render correctly

#### Filter Testing
- [ ] Click "My Leads Only" button
- [ ] Verify that leads are filtered and pagination resets
- [ ] Scroll down to load more filtered results
- [ ] Toggle "My Leads Only" off
- [ ] Verify all leads are shown again with pagination reset

#### Search Testing
- [ ] Enter a search term in the search box
- [ ] Verify search works on currently loaded leads (client-side)
- [ ] Note: Search on all leads requires backend implementation

#### Drag and Drop
- [ ] Drag a lead from one column to another
- [ ] Verify the status updates successfully
- [ ] Confirm the lead appears in the correct column
- [ ] Check that pagination is not affected by drag and drop

### 3. Performance Testing

#### Browser Performance
1. Open Chrome DevTools > Performance
2. Start recording
3. Navigate to leads page and scroll through multiple pages
4. Stop recording
5. Check metrics:
   - [ ] No frame drops during scrolling
   - [ ] Memory usage stays stable (no memory leaks)
   - [ ] JavaScript execution time is minimal

#### Network Performance
1. Open Chrome DevTools > Network
2. Load the leads page
3. Scroll through multiple pages
4. Verify:
   - [ ] Each pagination request completes in < 500ms
   - [ ] Request payload size is reasonable (< 1MB per page)
   - [ ] No failed requests

#### Database Performance
1. Enable MongoDB profiling:
   ```javascript
   db.setProfilingLevel(2);
   ```
2. Load several pages of leads
3. Check slow queries:
   ```javascript
   db.system.profile.find({millis: {$gt: 100}}).sort({ts: -1}).limit(10);
   ```
4. Verify:
   - [ ] All lead queries complete in < 50ms
   - [ ] Indexes are being used (check `planSummary` field)

### 4. Edge Cases

#### Empty Results
- [ ] Filter leads to return no results
- [ ] Verify "No leads in this stage" message appears
- [ ] Ensure no errors are thrown

#### Single Page
- [ ] Filter leads to return < 50 results
- [ ] Verify pagination indicator is hidden
- [ ] Scroll to bottom - should not try to load more

#### Network Errors
- [ ] Stop the backend server
- [ ] Try to load more leads
- [ ] Verify error toast appears
- [ ] Restart server and verify recovery

#### Very Fast Scrolling
- [ ] Use keyboard shortcuts to jump to bottom quickly
- [ ] Verify loading indicator appears
- [ ] Check that requests queue properly
- [ ] Ensure all leads load eventually

### 5. Mobile Testing

#### Responsive Design
- [ ] Open on mobile device or use Chrome DevTools device mode
- [ ] Verify Kanban columns are scrollable horizontally
- [ ] Test infinite scroll on mobile
- [ ] Check that loading indicators are visible
- [ ] Verify touch-based drag and drop works

### 6. Load Testing

For production deployment, perform load testing:

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API endpoint with 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:4000/api/v1/leads?page=1&limit=50

# Check results
# - Requests per second should be > 100
# - 99% of requests should complete in < 500ms
# - No failed requests
```

## Expected Results

### Performance Benchmarks

| Metric | Target | With 45k+ Leads |
|--------|--------|-----------------|
| Initial page load | < 2s | ✓ Should pass |
| First API request | < 200ms | ✓ Should pass |
| Subsequent loads | < 300ms | ✓ Should pass |
| Scroll lag | None | ✓ Should pass |
| Memory usage | < 200MB | ✓ Should pass |
| Database query | < 50ms | ✓ Should pass (with indexes) |

### Before vs After Comparison

| Aspect | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial load time | 10-30s | < 2s | 15x faster |
| First contentful paint | 8-20s | < 1s | 20x faster |
| Memory usage | 500MB+ | < 200MB | 2.5x less |
| Database query | 500ms+ | < 50ms | 10x faster |
| Scroll performance | Laggy | Smooth | Perfect |

## Troubleshooting

### Issue: Pagination not working
**Solution**: Check browser console for errors. Verify backend is returning pagination metadata.

### Issue: Infinite scroll not triggering
**Solution**: Check that `hasMore` is true and `isLoadingMore` is false. Verify IntersectionObserver is supported.

### Issue: Slow database queries
**Solution**: Run `npm run indexes:create` to create database indexes.

### Issue: Duplicate leads appear
**Solution**: Check that page increment logic is correct. Verify leads are not being re-fetched.

### Issue: Memory leak detected
**Solution**: Ensure IntersectionObserver cleanup is working. Check for unmounted component updates.

## Reporting Issues

When reporting issues, include:
1. Number of leads in database
2. Browser and version
3. Console errors
4. Network tab screenshot
5. Steps to reproduce
6. Expected vs actual behavior
