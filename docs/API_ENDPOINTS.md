# New API Endpoints Documentation

This document describes the new API endpoints added as part of the admin dashboard improvements.

## Incentive Management

### Update Incentive Status
Update the payment status or approval status of an incentive.

**Endpoint:** `PATCH /api/v1/hr/incentives/:id/status`

**Authorization:** ADMIN, HR, FINANCE roles

**Parameters:**
- `id` (path) - Incentive ID

**Request Body:**
```json
{
  "paymentStatus": "Paid",  // Optional: Pending, Processing, Paid, Hold, Cancelled
  "approvalStatus": "Approved"  // Optional: Draft, Submitted, Under Review, Approved, Rejected
}
```

**Response:**
```json
{
  "message": "Incentive status updated successfully",
  "incentive": {
    "_id": "...",
    "paymentStatus": "Paid",
    "approvalStatus": "Approved",
    ...
  }
}
```

**Example:**
```bash
curl -X PATCH http://localhost:4000/api/v1/hr/incentives/123/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus": "Paid"}'
```

## Salary Management

### Delete Salary Record
Delete a salary record from the system.

**Endpoint:** `DELETE /api/v1/finance/salaries/:id`

**Authorization:** ADMIN, HR roles

**Parameters:**
- `id` (path) - Salary record ID

**Response:**
```json
{
  "message": "Salary record deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:4000/api/v1/finance/salaries/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Document Management

### Add Comment to Document
Add a comment to a document (salary slip, insurance document, etc.).

**Endpoint:** `POST /api/v1/documents/:id/comments`

**Authorization:** ADMIN, HR, FINANCE roles

**Parameters:**
- `id` (path) - Document ID

**Request Body:**
```json
{
  "comment": "Please review the deductions section"
}
```

**Response:**
```json
{
  "message": "Comment added successfully",
  "document": {
    "_id": "...",
    "comments": [
      {
        "userId": "...",
        "userName": "John Admin",
        "comment": "Please review the deductions section",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    ...
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:4000/api/v1/documents/123/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved by finance team"}'
```

### Get Document Comments
Retrieve all comments for a specific document.

**Endpoint:** `GET /api/v1/documents/:id/comments`

**Authorization:** ADMIN, HR, FINANCE roles

**Parameters:**
- `id` (path) - Document ID

**Response:**
```json
[
  {
    "userId": "...",
    "userName": "John Admin",
    "comment": "Please review the deductions section",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "userId": "...",
    "userName": "Jane HR",
    "comment": "Reviewed and approved",
    "createdAt": "2024-01-15T11:00:00Z"
  }
]
```

**Example:**
```bash
curl -X GET http://localhost:4000/api/v1/documents/123/comments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "details": { ... }
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error description"
}
```

## Usage Examples

### Frontend Integration

#### Incentive Status Update
```typescript
import axios from "@/axios/axios";

const updateIncentiveStatus = async (incentiveId: string, status: string) => {
  try {
    const response = await axios.patch(`/hr/incentives/${incentiveId}/status`, {
      paymentStatus: status
    });
    toast({
      title: "Success",
      description: "Status updated successfully"
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update status",
      variant: "destructive"
    });
  }
};
```

#### Document Comments
```typescript
import axios from "@/axios/axios";

const addComment = async (documentId: string, comment: string) => {
  try {
    await axios.post(`/documents/${documentId}/comments`, { comment });
    // Refresh comments
    const response = await axios.get(`/documents/${documentId}/comments`);
    setComments(response.data);
  } catch (error) {
    console.error("Failed to add comment:", error);
  }
};
```

#### Loan Assignment
```typescript
import axios from "@/axios/axios";

const createLoan = async (loanData: any, employeeId: string) => {
  try {
    const response = await axios.post("/loans", {
      ...loanData,
      assignedTo: employeeId,
      assignedToName: employees.find(e => e._id === employeeId)?.name
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create loan:", error);
  }
};
```

## Testing with Postman

### Collection Variables
Set these variables in your Postman environment:
- `baseUrl`: `http://localhost:4000/api/v1`
- `authToken`: Your JWT authentication token

### Sample Requests

1. **Update Incentive Status**
   - Method: PATCH
   - URL: `{{baseUrl}}/hr/incentives/:incentiveId/status`
   - Headers: `Authorization: Bearer {{authToken}}`
   - Body: `{"paymentStatus": "Paid"}`

2. **Add Document Comment**
   - Method: POST
   - URL: `{{baseUrl}}/documents/:documentId/comments`
   - Headers: `Authorization: Bearer {{authToken}}`
   - Body: `{"comment": "Test comment"}`

3. **Delete Salary**
   - Method: DELETE
   - URL: `{{baseUrl}}/finance/salaries/:salaryId`
   - Headers: `Authorization: Bearer {{authToken}}`

## Rate Limiting

All endpoints follow the application's standard rate limiting:
- 100 requests per 15 minutes per IP address
- 1000 requests per hour per authenticated user

## Versioning

All endpoints are versioned under `/api/v1/`. Future versions will maintain backward compatibility or be released under new version paths (e.g., `/api/v2/`).
