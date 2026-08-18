# New Features Implementation - February 2024

This document describes the implementation of new features requested:
1. Session Timeout (2 Hours)
2. Admin OTP Login via Email
3. Follow-up Notifications on Login
4. Invoice Logo, Stamp, and Signature

## 1. Session Timeout (2 Hours)

### Implementation
- JWT token expiration updated from 14 days to 2 hours in `auth.service.ts`
- Users will be automatically logged out after 2 hours of inactivity
- No additional changes needed as the existing authentication middleware handles token validation

### Files Modified
- `server/src/services/auth.service.ts`

### Code Change
```typescript
const access = jwt.sign(payload, process.env.JWT_SECRET!, {
  expiresIn: "2h", // Changed from "14d"
});
```

## 2. Admin OTP Login via Email

### Implementation
Admin users can now only login using OTP sent to their email address. Attempting to login with username/password will show an error directing them to use OTP.

### New API Endpoints
- `POST /auth/admin/request-otp` - Request OTP for admin login
- `POST /auth/admin/verify-otp` - Verify OTP and complete login

### Files Modified
- `server/src/services/auth.service.ts` - Added `generateAdminOtp()` and `verifyAdminOtp()` methods
- `server/src/controllers/auth.controller.ts` - Added `requestAdminOtp()` and `verifyAdminOtp()` controllers
- `server/src/routes/auth.routes.ts` - Added new routes with rate limiting
- `server/src/services/communication/email.service.ts` - Added `sendOtpEmail()` method with professional template
- `server/src/middlewares/rate-limiter.middleware.ts` - New in-memory rate limiter

### Environment Variables Required
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Security Features
- Rate limiting: 5 OTP requests per 15 minutes
- Rate limiting: 10 authentication attempts per 15 minutes
- OTP expires after 10 minutes
- Professional email template with clear instructions

### API Usage

#### Request Admin OTP
```bash
POST /auth/admin/request-otp
Content-Type: application/json

{
  "credentials": "admin@example.com"
}
```

Response:
```json
{
  "email": "ad***@example.com",
  "message": "OTP sent to your email"
}
```

#### Verify Admin OTP
```bash
POST /auth/admin/verify-otp
Content-Type: application/json

{
  "credentials": "admin@example.com",
  "otp": "123456"
}
```

Response:
```json
{
  "user": { ... },
  "access": "jwt-token-valid-for-2-hours"
}
```

## 3. Follow-up Notifications on Login

### Implementation
When employees login, they receive today's follow-up notifications via the `/auth/me` endpoint.

### Response Format
The `/auth/me` endpoint now includes:
- `followUpsToday`: Array of leads with follow-ups scheduled for today
- `followUpsCount`: Count of today's follow-ups

### Files Modified
- `server/src/services/auth.service.ts` - Added `getUserWithFollowUps()` method
- `server/src/models/lead.model.ts` - Added database index for performance

### Database Index
Added compound index for optimized queries:
```typescript
LeadSchema.index({ assignedTo: 1, 'engagement.followUpAt': 1 });
```

### Response Example
```json
{
  "_id": "user-id",
  "name": "Employee Name",
  "email": "employee@example.com",
  "role": "bd",
  "followUpsToday": [
    {
      "_id": "lead-id",
      "patientName": "Patient Name",
      "contact": {
        "mobile": "9876543210"
      },
      "treatment": "Surgery",
      "engagement": {
        "followUpAt": "2024-02-09T10:00:00.000Z"
      },
      "leadStatus": "Follow-up"
    }
  ],
  "followUpsCount": 1
}
```

## 4. Invoice Logo, Stamp, and Signature

### Implementation
PDF generator now supports adding company logo, stamp, and signature images to invoices.

### Image Requirements
1. **Logo**: Displayed at the top of the invoice
   - Recommended size: 200x60px
   - Format: PNG with transparent background
   - Width in PDF: 150px

2. **Stamp**: Displayed at the bottom left
   - Recommended size: 150x150px
   - Format: PNG with transparent background
   - Width in PDF: 100px

3. **Signature**: Displayed at the bottom right
   - Recommended size: 200x80px
   - Format: PNG with transparent background
   - Width in PDF: 120px

### Setup Instructions
1. Place images in: `server/src/assets/invoice/`
   - `logo.png`
   - `stamp.png`
   - `signature.png`

2. Images will be automatically included in generated invoices

3. If images are not present, invoice generates normally without them (graceful degradation)

### Files Modified
- `server/src/services/pdf-generator.service.ts` - Added image loading and positioning logic
- `server/src/assets/invoice/README.md` - Created with setup instructions

### Technical Details
- Uses `fs.existsSync()` to check image availability
- Graceful degradation if images are missing
- Error handling for image loading failures
- Named constants for consistent positioning:
  - `CONTENT_WIDTH = 515`
  - `SIGNATURE_VERTICAL_OFFSET = 80`
  - `DEFAULT_VERTICAL_OFFSET = 10`

## Security Enhancements

### Rate Limiting
In-memory rate limiter implemented for authentication endpoints:
- **OTP endpoints**: 5 requests per 15 minutes
- **Auth endpoints**: 10 requests per 15 minutes
- Automatic cleanup of expired records
- Returns 429 status with `Retry-After` header

### Best Practices
- Static imports instead of dynamic imports for better performance
- Database indexes for optimized queries
- Named constants with JSDoc comments for maintainability
- Proper error handling and logging
- TypeScript strict mode compliance

## Testing Guide

### 1. Session Timeout Test
```bash
# Login as any user
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credentials": "user@example.com", "password": "password"}'

# Save the token from response
# Wait for 2 hours (or temporarily change expiresIn to "10s" for testing)

# Try to access protected endpoint
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <expired-token>"

# Expected: 403 Unauthorized error
```

### 2. Admin OTP Login Test
```bash
# Try to login as admin with password (should fail)
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credentials": "admin@example.com", "password": "password"}'

# Expected: Error message directing to use OTP

# Request OTP
curl -X POST http://localhost:8000/auth/admin/request-otp \
  -H "Content-Type: application/json" \
  -d '{"credentials": "admin@example.com"}'

# Check email for OTP

# Verify OTP
curl -X POST http://localhost:8000/auth/admin/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"credentials": "admin@example.com", "otp": "123456"}'

# Expected: JWT token in response
```

### 3. Follow-up Notifications Test
```bash
# Create a lead with today's follow-up (as admin)
curl -X POST http://localhost:8000/leads \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "Test Patient",
    "contact": {"mobile": "9876543210"},
    "treatment": "Surgery",
    "assignedTo": "<employee-id>",
    "engagement": {
      "followUpAt": "2024-02-09T10:00:00.000Z"
    }
  }'

# Login as the assigned employee
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"credentials": "employee@example.com", "password": "password"}'

# Get user info with follow-ups
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer <employee-token>"

# Expected: followUpsToday array with the lead
```

### 4. Invoice Images Test
```bash
# Place images in server/src/assets/invoice/
# logo.png, stamp.png, signature.png

# Generate an invoice
curl -X GET http://localhost:8000/invoices/<invoice-id>/download \
  -H "Authorization: Bearer <token>" \
  -o invoice.pdf

# Open invoice.pdf and verify:
# - Logo appears at the top
# - Stamp appears at bottom left
# - Signature appears at bottom right

# Test graceful degradation: Remove one image and regenerate
# Expected: Invoice generates successfully without the missing image
```

### 5. Rate Limiting Test
```bash
# Make multiple OTP requests rapidly
for i in {1..6}; do
  curl -X POST http://localhost:8000/auth/admin/request-otp \
    -H "Content-Type: application/json" \
    -d '{"credentials": "admin@example.com"}'
  echo "Request $i"
done

# Expected: First 5 succeed, 6th returns 429 Too Many Requests
```

## Migration Notes

### Database
- New index will be automatically created on application startup
- No manual migration required
- Index name: `assignedTo_1_engagement.followUpAt_1`

### Environment Variables
Add to `.env` file:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Breaking Changes
- **Admin users can no longer login with password**
- Admins must use OTP login flow
- Inform all admin users about the new login process

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Enable "Less secure app access" for Gmail (or use App Password)
3. Check server logs for error messages
4. Verify network connectivity to SMTP server

### Follow-ups Not Showing
1. Verify employee has `userId` field populated
2. Check that leads have `engagement.followUpAt` set
3. Ensure follow-up date is for today
4. Check database index creation in logs

### Images Not Appearing in Invoice
1. Verify images are in `server/src/assets/invoice/`
2. Check image filenames: `logo.png`, `stamp.png`, `signature.png`
3. Verify images are valid PNG/JPEG format
4. Check server logs for image loading errors

### Rate Limiting Issues
1. Rate limits are per IP address
2. Limits reset after 15 minutes
3. Use different IP or wait for reset
4. For testing, temporarily increase limits in `rate-limiter.middleware.ts`

## Performance Considerations

### Database Indexes
- New index improves follow-up query performance
- Index is created automatically on startup
- No performance impact expected

### Rate Limiter Memory
- In-memory storage, not persisted
- Automatic cleanup every 10 minutes
- For high-traffic systems, consider Redis-based rate limiter

### Image Loading
- Images loaded once per invoice generation
- No caching implemented (file system reads each time)
- For high-volume systems, consider caching images in memory

## Future Enhancements

1. **Multi-factor Authentication**
   - SMS OTP in addition to email
   - Authenticator app support

2. **Follow-up Reminders**
   - Push notifications
   - SMS reminders
   - Email reminders

3. **Invoice Customization**
   - Dynamic templates
   - Custom branding per client
   - Multiple language support

4. **Rate Limiting**
   - Redis-based distributed rate limiter
   - Configurable limits per endpoint
   - User-specific rate limits

## Support

For issues or questions:
1. Check server logs: `server/logs/`
2. Review API documentation: `docs/API_ENDPOINTS.md`
3. Contact development team
4. Create GitHub issue with details
