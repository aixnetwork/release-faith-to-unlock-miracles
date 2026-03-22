# Token Refresh Implementation

## Overview
This document explains the automatic token refresh implementation that handles expired access tokens gracefully without logging users out unnecessarily.

## Problem
When a user's access token expires, API requests fail with a `TOKEN_EXPIRED` error. Previously, this would immediately log the user out and redirect them to the login screen, which is a poor user experience.

## Solution
We've implemented an automatic token refresh mechanism that:
1. Detects when an access token has expired
2. Automatically requests a new access token using the refresh token
3. Retries the failed request with the new access token
4. Only logs the user out if the refresh token is also invalid

## Implementation Details

### 1. User Store Updates
**File:** `store/userStore.ts`

Added `refreshToken` field to the User interface:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanType;
  isAdmin?: boolean;
  organizationId?: number;
  organizationRole?: 'admin' | 'member';\n  roleId?: string;
  accessToken?: string;
  refreshToken?: string;  // NEW
}
```

### 2. Login Updates
**File:** `app/login.tsx`

Updated login flow to capture and store the refresh token:
```typescript
const loginData = await loginResponse.json();
const accessToken = loginData.data?.access_token;
const refreshToken = loginData.data?.refresh_token;  // NEW

const userData = {
  // ... other fields
  accessToken,
  refreshToken,  // NEW
};

login(userData);
```

### 3. Auth Utilities
**File:** `utils/authUtils.ts`

Created centralized authentication utilities:

#### `refreshAccessToken()`
- Automatically refreshes the access token using the refresh token
- Updates the user store with new tokens
- Handles refresh failures by logging out the user
- Prevents multiple simultaneous refresh requests

#### `fetchWithAuth(url, options)`
- Wrapper around `fetch()` that automatically includes the access token
- Detects `TOKEN_EXPIRED` errors
- Automatically refreshes the token and retries the request
- Falls back to logout if refresh fails

#### `isTokenExpiredError(error)`
- Helper function to check if an error is a token expiration error

## Usage

### For New API Calls
Replace standard `fetch()` calls with `fetchWithAuth()`:

**Before:**
```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

**After:**
```typescript
import { fetchWithAuth, isTokenExpiredError } from '@/utils/authUtils';

const response = await fetchWithAuth(url);

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  if (isTokenExpiredError(errorData)) {
    console.log('🔄 Token expired, user will be redirected to login');
    return;
  }
  throw new Error(`Request failed: ${response.status}`);
}
```

### Example Implementation
See `app/services/listing.tsx` for a complete example of the updated pattern.

## Benefits

1. **Better User Experience**: Users are not logged out unnecessarily when their token expires
2. **Seamless**: Token refresh happens automatically in the background
3. **Secure**: Only refreshes when needed, and logs out if refresh token is invalid
4. **Centralized**: All token logic is in one place (`utils/authUtils.ts`)
5. **Consistent**: Same pattern can be used across all API calls

## Migration Guide

To update existing API calls:

1. Import the utilities:
   ```typescript
   import { fetchWithAuth, isTokenExpiredError } from '@/utils/authUtils';
   ```

2. Replace `fetch()` with `fetchWithAuth()`:
   ```typescript
   const response = await fetchWithAuth(url, options);
   ```

3. Add token expiration error handling:
   ```typescript
   if (!response.ok) {
     const errorData = await response.json().catch(() => ({}));
     if (isTokenExpiredError(errorData)) {
       return; // Token refresh already handled
     }
     // Handle other errors
   }
   ```

## Files Updated

- ✅ `store/userStore.ts` - Added refreshToken field
- ✅ `app/login.tsx` - Store refresh token on login
- ✅ `utils/authUtils.ts` - New file with token refresh logic
- ✅ `app/services/listing.tsx` - Example implementation

## Files That Need Migration

The following files make API calls and should be updated to use `fetchWithAuth()`:

- `app/services/my-listings.tsx`
- `app/services/approve-listings.tsx`
- `app/services/detail.tsx`
- `app/prayer/[id].tsx`
- `app/prayer/new.tsx`
- `app/prayer/edit/[id].tsx`
- `store/habitStore.ts`
- `store/prayerStore.ts`
- Any other files making authenticated API calls

## Testing

To test the token refresh functionality:

1. Log in to the application
2. Wait for the access token to expire (or manually expire it in the database)
3. Make an API request
4. Verify that:
   - The request fails with TOKEN_EXPIRED
   - A refresh request is automatically made
   - The original request is retried with the new token
   - The user is NOT logged out

## Error Handling

The system handles three scenarios:

1. **Valid Token**: Request proceeds normally
2. **Expired Access Token, Valid Refresh Token**: Token is refreshed automatically, request retried
3. **Expired Refresh Token**: User is logged out and redirected to login

## Security Considerations

- Refresh tokens are stored securely in AsyncStorage (encrypted on device)
- Refresh tokens are only sent to the `/auth/refresh` endpoint
- Failed refresh attempts immediately log the user out
- Multiple simultaneous refresh requests are prevented

## Future Improvements

1. Add token expiration time tracking to proactively refresh before expiration
2. Implement token refresh queue for multiple simultaneous requests
3. Add retry logic with exponential backoff
4. Implement refresh token rotation for enhanced security
