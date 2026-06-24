# OTP Email Authentication System

## Overview

This Cash App-like application now features an OTP (One-Time Password) email authentication system that securely handles user login and registration. The system recognizes new and returning users, routing them appropriately through the authentication flow.

## System Architecture

### 1. API Routes

#### `/api/auth/send-otp` (POST)
Sends a 6-digit OTP to the user's email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "expiresIn": 600
}
```

**Features:**
- Validates email format
- Generates a random 6-digit code
- Stores OTP in server memory with 10-minute expiration
- Sends HTML-formatted email via SMTP
- Includes error handling for invalid emails and SMTP failures

#### `/api/auth/verify-otp` (POST)
Verifies the OTP and determines if the user is new or returning.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "registeredUsers": ["existing@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "user@example.com",
  "isNewUser": true,
  "token": "user_user@example.com_1782339259857"
}
```

**Features:**
- Validates OTP against stored value
- Checks OTP expiration
- Determines user status (new vs returning) by checking registered users list
- Returns session token
- Logs verification for debugging

### 2. Authentication Context

Updated `contexts/auth-context.tsx` with new OTP-related state:

```typescript
interface AuthContextType {
  // ... existing fields
  isOtpVerified: boolean;          // OTP verification status
  setIsOtpVerified: (verified: boolean) => void;
  isNewUser: boolean;              // User type flag
  setIsNewUser: (isNew: boolean) => void;
  verifiedEmail: string;           // Email verified via OTP
  setVerifiedEmail: (email: string) => void;
}
```

### 3. Component Updates

#### AuthStartStep (`components/auth/steps/auth-start-step.tsx`)
- Added OTP sending functionality
- Shows loading state while sending OTP
- Displays error messages if OTP sending fails
- Uses SMTP to send OTP to user's email

#### CodeVerifyStep (`components/auth/steps/code-verify-step.tsx`)
- Handles OTP verification
- Stores registered users in localStorage (`bushfi_registered_users`)
- Passes user registration list to verify-otp API
- Shows loading state during verification
- Displays error messages for invalid/expired OTPs

#### AuthFlow (`components/auth/auth-flow.tsx`)
- Routes new users through full registration (debit card, name, cashtag, ZIP, invites)
- Routes returning users directly to dashboard after OTP verification
- Branches at code-verify step based on `isNewUser` flag

## User Registration Tracking

### New User Registration
1. User enters email
2. OTP is sent and verified
3. System marks user as "new"
4. User completes registration flow (all steps)
5. User is added to `bushfi_registered_users` in localStorage
6. User is added to server-side `registeredUsers` array

### Returning User Login
1. User enters email
2. OTP is sent and verified
3. System checks `bushfi_registered_users` from localStorage
4. If found, user is marked as "returning" (`isNewUser: false`)
5. After OTP verification, user goes directly to dashboard
6. No registration steps needed

## Environment Variables Required

Configure these SMTP variables in your `.env` file:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@bushfi.app
```

### For Gmail:
1. Enable 2-Factor Authentication
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the generated password as `SMTP_PASS`

### For Other Providers:
- Adjust `SMTP_HOST` and `SMTP_PORT` according to your email provider
- Example for Outlook: `SMTP_HOST=smtp-mail.outlook.com`, `SMTP_PORT=587`

## Security Considerations

1. **OTP Expiration**: 10 minutes (configurable in `/api/auth/send-otp`)
2. **OTP Format**: 6-digit code prevents brute force attacks
3. **Email Validation**: Regex pattern validates email format before sending
4. **SMTP Security**: Uses TLS for secure email transmission
5. **No Passwords**: System uses OTP-only authentication (passwordless)
6. **User Registration Tracking**: Uses localStorage to persist registered user list

## Testing the System

### Prerequisites
- Dev server running: `pnpm dev`
- SMTP credentials configured in environment variables

### Test New User Registration
1. Open app at `http://localhost:3000`
2. Click "Use Email"
3. Enter test email (e.g., `test1@example.com`)
4. Click "Next" to send OTP
5. Check email for OTP code
6. Enter OTP and complete registration
7. User is now registered and stored in localStorage

### Test Returning User Login
1. Log out from dashboard (click profile → Log Out)
2. Back at login screen, click "Use Email"
3. Enter the same email from previous registration
4. Click "Next" to send new OTP
5. Check email for OTP code
6. Enter OTP and verify
7. **Expected**: User goes directly to dashboard (no registration steps)

### Debug Information
Check registered users and OTP data at: `http://localhost:3000/api/test/otp`

**Response Format:**
```json
{
  "otpStore": [
    { "email": "user@example.com", "otp": "123456" }
  ],
  "registeredUsers": ["user@example.com"]
}
```

## Implementation Details

### OTP Storage
- **Backend**: In-memory global object `otpStore` (cleared on server restart)
- **Client**: `bushfi_registered_users` in localStorage
- **Data Structure**:
  ```typescript
  otpStore[email] = {
    email: string;
    otp: string;
    timestamp: number;
    expiresAt: number;
  }
  ```

### Authentication Flow Diagram
```
Start
  ↓
Enter Email
  ↓
Send OTP (API: /api/auth/send-otp)
  ↓
Enter OTP Code
  ↓
Verify OTP (API: /api/auth/verify-otp)
  ↓
Check isNewUser flag
  ├→ New User? → Registration Flow (Debit Card → Name → Cashtag → ZIP → Invites → Welcome → Dashboard)
  └→ Returning User? → Dashboard (direct)
```

## Future Enhancements

1. **Database Integration**: Replace in-memory OTP storage with persistent database (Neon/Supabase)
2. **Rate Limiting**: Implement rate limiting on OTP requests (max 3 per hour per email)
3. **Email Templates**: Use more sophisticated email template system
4. **Multi-Factor Auth**: Add optional 2FA with backup codes
5. **OTP Resend**: Allow users to request new OTP after timeout
6. **Admin Dashboard**: Track login attempts and user registrations
7. **Analytics**: Log authentication metrics and failures

## Troubleshooting

### "Failed to send OTP" Error
- Check SMTP environment variables are set correctly
- Verify email address is valid
- Check Gmail/email provider allows less secure app access (if applicable)
- Check server logs for detailed error message

### OTP Not Received in Email
- Check spam/junk folder
- Verify SMTP_FROM address is correct
- Check SMTP credentials are valid
- Wait 10 seconds (email delivery can be slow)

### User Not Recognized as Returning User
- Clear browser localStorage: `localStorage.clear()`
- Check `bushfi_registered_users` key exists in localStorage
- Verify same email is being used for login

### OTP Expired Error
- OTP expires after 10 minutes
- Request a new OTP by clicking "Next" again
- Enter new OTP code from email

